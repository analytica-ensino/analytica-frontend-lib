import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotebookIcon } from '@phosphor-icons/react/dist/csr/Notebook';
import {
  ActivityCardQuestionBanks,
  Button,
  EmptyState,
  Input,
  Modal,
  Search,
  Text,
  useTheme,
  SkeletonText,
  BaseApiClient,
} from '../..';
import {
  useQuestionFiltersStore,
  type QuestionFiltersState,
  createUseQuestionsList,
  type QuestionActivity as Question,
} from '../..';
import { convertActivityFiltersToQuestionsFilter } from '../../utils/questionFiltersConverter';
import { mapQuestionTypeToEnumRequired } from '../../utils/questionTypeUtils';
import { areFiltersEqual } from '../../utils/activityFilters';
import { normalizeText, highlightSearchTerm } from '../../utils/stringUtils';
import Activities from '../../assets/icons/Activities';

interface ActivityListQuestionsProps {
  apiClient: BaseApiClient;
  onAddQuestion?: (question: Question) => void;
  addedQuestionIds?: string[];
  className?: string;
  /** Enable exam mode - changes text labels from 'atividade' to 'prova' */
  enableExamMode?: boolean;
}

/**
 * Component that displays the list of questions from the API
 * Fetches and displays questions based on applied filters
 * Uses ActivityCardQuestionBanks for displaying questions from the bank
 */
export const ActivityListQuestions = ({
  apiClient,
  onAddQuestion,
  addedQuestionIds = [],
  className,
  enableExamMode = false,
}: ActivityListQuestionsProps) => {
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrefetchingAll, setIsPrefetchingAll] = useState(false);
  const prefetchDoneRef = useRef(false);
  const appliedFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.appliedFilters
  );
  const cachedQuestions = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.cachedQuestions
  );
  const cachedPagination = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.cachedPagination
  );
  const cachedFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.cachedFilters
  );
  const setCachedQuestions = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.setCachedQuestions
  );
  const clearCachedQuestions = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.clearCachedQuestions
  );
  const addedQuestionIdsRef = useRef(addedQuestionIds);

  // Update ref when addedQuestionIds changes to capture latest value
  useEffect(() => {
    addedQuestionIdsRef.current = addedQuestionIds;
  }, [addedQuestionIds]);

  // Memoize the hook factory to prevent recreation on every render
  const useQuestionsList = useMemo(
    () => createUseQuestionsList(apiClient),
    [apiClient]
  );

  const {
    questions: allQuestions,
    pagination,
    loading,
    loadingMore,
    error,
    fetchQuestions,
    fetchRandomQuestions,
    loadMore,
    reset,
  } = useQuestionsList();

  /**
   * Check if we already have a valid cache result for current filters
   * This is true even if the result is empty (0 questions)
   */
  const hasValidCacheResult = useMemo(() => {
    if (!appliedFilters || !cachedFilters) return false;
    return areFiltersEqual(appliedFilters, cachedFilters);
  }, [appliedFilters, cachedFilters]); // cachedPagination removed: only used as null guard, cachedFilters already guards

  /**
   * Check if cached questions match current filters AND have data
   * Used for displaying cached data while loading or for pagination
   */
  const filtersMatchCache = useMemo(() => {
    if (!hasValidCacheResult) return false;
    return cachedQuestions.length > 0;
  }, [hasValidCacheResult, cachedQuestions]);

  const questions = useMemo(() => {
    let sourceQuestions: typeof allQuestions;

    const hasFreshData = !loading && pagination !== null;

    if (hasFreshData) {
      const shouldUseCacheForPagination =
        filtersMatchCache &&
        cachedQuestions.length > allQuestions.length &&
        pagination.page === 1 &&
        allQuestions.length > 0;

      sourceQuestions = shouldUseCacheForPagination
        ? cachedQuestions
        : allQuestions;
    } else if (loading && filtersMatchCache && cachedQuestions.length > 0) {
      // While loading, show cached data only if filters match
      sourceQuestions = cachedQuestions;
    } else if (filtersMatchCache && cachedQuestions.length > 0) {
      sourceQuestions = cachedQuestions;
    } else {
      sourceQuestions = allQuestions;
    }

    return sourceQuestions.filter(
      (question) => !addedQuestionIds.includes(question.id)
    );
  }, [
    allQuestions,
    cachedQuestions,
    filtersMatchCache,
    addedQuestionIds,
    loading,
    pagination,
  ]);

  // Use hook's pagination if it has more pages loaded, otherwise use cached
  // This ensures we track progress when loading more pages via infinite scroll
  const effectivePagination = useMemo(() => {
    if (filtersMatchCache && pagination && cachedPagination) {
      // Only compare pages when cache is valid for current filters
      // Prefer hook's pagination if it has loaded more pages
      return pagination.page >= cachedPagination.page
        ? pagination
        : cachedPagination;
    }
    if (filtersMatchCache && cachedPagination) {
      return cachedPagination;
    }
    return pagination;
  }, [pagination, cachedPagination, filtersMatchCache]);

  const effectivePaginationRef = useRef(effectivePagination);
  useEffect(() => {
    effectivePaginationRef.current = effectivePagination;
  }, [effectivePagination]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastLoadedPageRef = useRef<number>(1);

  /**
   * Convert question options to the format expected by ActivityCardQuestionBanks
   */
  const formatQuestionOptions = (
    questionOptions: {
      id: string;
      option: string;
      isCorrect?: boolean;
      correctValue?: string | null;
    }[]
  ) => {
    return questionOptions.map((opt) => ({
      id: opt.id,
      option: opt.option,
      isCorrect: opt.isCorrect,
      correctValue: opt.correctValue,
    }));
  };

  /**
   * Get subject info from knowledge matrix
   */
  const getSubjectInfo = (question: Question) => {
    if (!question.knowledgeMatrix || question.knowledgeMatrix.length === 0) {
      return { content: 'Sem assunto', color: '#6B7280', icon: 'BookOpen' };
    }

    const matrix = question.knowledgeMatrix[0];
    const subject = matrix.subject;
    const topic = matrix.topic;
    const subtopic = matrix.subtopic;
    if (!subject) {
      return { content: 'Sem assunto', color: '#6B7280', icon: 'BookOpen' };
    }

    const parts = [subject.name];
    if (topic?.name) parts.push(topic.name);
    if (subtopic?.name) parts.push(subtopic.name);

    return {
      content: parts.join(' - '),
      color: subject.color || '#6B7280',
      icon: subject.icon || 'BookOpen',
    };
  };

  /**
   * Filtered questions based on in-memory search term
   */
  const displayedQuestions = useMemo(() => {
    if (!searchTerm) return questions;
    const term = normalizeText(searchTerm);
    return questions.filter((q) => {
      const subjectText = getSubjectInfo(q).content;
      const bankName = q.questionBankYear?.questionBank?.name ?? '';
      const year = String(q.questionBankYear?.year ?? '');
      return (
        normalizeText(subjectText).includes(term) ||
        normalizeText(q.statement ?? '').includes(term) ||
        normalizeText(bankName).includes(term) ||
        normalizeText(year).includes(term)
      );
    });
  }, [questions, searchTerm]);

  /**
   * Initialize from cache if available and filters match
   * Only fetch if cache is invalid or filters changed
   */
  useEffect(() => {
    // Reset page tracking when filters change
    lastLoadedPageRef.current = 1;
    // Reset search state when filters change
    setSearchTerm('');
    prefetchDoneRef.current = false;

    if (appliedFilters) {
      if (hasValidCacheResult) {
        // Update page ref to match cached pagination
        if (cachedPagination?.page) {
          lastLoadedPageRef.current = cachedPagination.page;
        }
        return;
      }

      const apiFilters = {
        ...convertActivityFiltersToQuestionsFilter(appliedFilters),
        ...(addedQuestionIdsRef.current.length > 0 && {
          selectedQuestionsIds: addedQuestionIdsRef.current,
        }),
      };
      fetchQuestions(apiFilters, false);
    } else {
      reset();
      clearCachedQuestions();
    }
  }, [
    appliedFilters,
    fetchQuestions,
    reset,
    hasValidCacheResult,
    clearCachedQuestions,
  ]); // cachedPagination intentionally excluded: it changes every page load and would wipe searchTerm on each scroll

  useEffect(() => {
    if (appliedFilters && pagination) {
      setCachedQuestions(allQuestions, pagination, appliedFilters);
      lastLoadedPageRef.current = pagination.page;
    }
  }, [allQuestions, pagination, appliedFilters, setCachedQuestions]);

  /**
   * Update lastLoadedPageRef when pagination page changes (confirms successful load)
   * This allows retry if a load fails, since we only update the ref on success
   */
  useEffect(() => {
    if (effectivePagination?.page) {
      lastLoadedPageRef.current = effectivePagination.page;
    }
  }, [effectivePagination?.page]);

  /**
   * Pre-fetch all remaining pages when user starts typing a search term.
   * Only triggers once per set of applied filters (tracked by prefetchDoneRef).
   * If all pages are already loaded (single page), marks done immediately.
   */
  useEffect(() => {
    if (!searchTerm || !appliedFilters || prefetchDoneRef.current) return;

    const pag = effectivePaginationRef.current;
    const total = pag?.total ?? 0;
    const pageSize = pag?.pageSize ?? 10;

    // Only prefetch if there are multiple pages
    if (total <= pageSize || !pag?.hasNext) {
      prefetchDoneRef.current = true;
      return;
    }

    let cancelled = false;

    const prefetchAll = async () => {
      setIsPrefetchingAll(true);
      prefetchDoneRef.current = true; // mark immediately to avoid re-entry

      try {
        const apiFilters = appliedFilters
          ? convertActivityFiltersToQuestionsFilter(appliedFilters)
          : undefined;

        const totalPages = pag?.totalPages ?? 1;
        const currentPage = pag?.page ?? 1;

        for (let page = currentPage + 1; page <= totalPages; page++) {
          if (cancelled) break;
          await fetchQuestions({ ...apiFilters, page }, true);
        }
      } finally {
        if (!cancelled) setIsPrefetchingAll(false);
      }
    };

    prefetchAll();
    return () => {
      // Reset so a cancelled prefetch never freezes the UI or blocks the next search
      cancelled = true;
      prefetchDoneRef.current = false;
      setIsPrefetchingAll(false);
    };
  }, [searchTerm, appliedFilters, fetchQuestions]); // effectivePagination intentionally excluded: read via ref to avoid cancelling the loop on each page load

  /**
   * Calculate progressive scroll threshold based on current page
   * - Pages 1-4: 80%, 85%, 90%, 95% (increase by 5%)
   * - Pages 5-8: 96%, 97%, 98%, 99% (increase by 1%)
   * - Pages 9+: 99.1%, 99.2%, ... (increase by 0.1%, max 99.9%)
   */
  const calculateScrollThreshold = useCallback((page: number): number => {
    if (page <= 4) {
      // Pages 1-4: 80%, 85%, 90%, 95%
      return 0.8 + (page - 1) * 0.05;
    } else if (page <= 8) {
      // Pages 5-8: 96%, 97%, 98%, 99%
      return 0.95 + (page - 4) * 0.01;
    } else {
      // Pages 9+: 99.1%, 99.2%, ... max 99.9%
      return Math.min(0.99 + (page - 8) * 0.001, 0.999);
    }
  }, []);

  /**
   * Scroll event listener for infinite scroll
   * Loads more questions when user scrolls close to the end
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      const currentPage = effectivePagination?.page ?? 1;
      const nextPage = currentPage + 1;

      const scrollThreshold = calculateScrollThreshold(currentPage);

      if (
        scrollPercentage >= scrollThreshold &&
        !loading &&
        !loadingMore &&
        effectivePagination?.hasNext &&
        lastLoadedPageRef.current < nextPage
      ) {
        const apiFilters = appliedFilters
          ? convertActivityFiltersToQuestionsFilter(appliedFilters)
          : undefined;
        loadMore(apiFilters, effectivePagination ?? undefined);
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loading, loadingMore, effectivePagination, loadMore, appliedFilters]);

  const totalQuestions = effectivePagination?.total || 0;
  const displayedCount = searchTerm
    ? displayedQuestions.length
    : totalQuestions;
  const uniqueQuestion = (count = displayedCount) =>
    count === 1 ? 'questão' : 'questões';

  /**
   * Handle adding questions automatically using random search
   */
  const handleAddAutomatically = async () => {
    if (questionCount <= 0) return;

    try {
      // Get current filters or empty filters
      const baseFilters = appliedFilters
        ? convertActivityFiltersToQuestionsFilter(appliedFilters)
        : {};

      // Fetch random questions excluding already added ones
      const randomQuestions = await fetchRandomQuestions(questionCount, {
        ...baseFilters,
        ...(addedQuestionIds.length > 0 && {
          selectedQuestionsIds: addedQuestionIds,
        }),
      });

      // Add each question to the activity
      randomQuestions.forEach((question) => {
        if (onAddQuestion) {
          onAddQuestion(question);
        }
      });

      setIsModalOpen(false);
      setQuestionCount(1);
    } catch (error) {
      console.error('Erro ao adicionar questões automaticamente:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQuestionCount(1);
  };

  /**
   * Renders the appropriate content based on loading, error, and questions state
   */
  const renderQuestionsContent = () => {
    // During prefetch, if no matches found yet in loaded pages, show skeleton instead of blank
    if (isPrefetchingAll && displayedQuestions.length === 0) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded">
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );
    }

    if (loading && displayedQuestions.length === 0 && !searchTerm) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded">
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Erro ao carregar questões: {error}
          </Text>
        </div>
      );
    }

    if (displayedQuestions.length === 0 && !isPrefetchingAll) {
      if (searchTerm) {
        return (
          <div className="flex items-center justify-center h-full">
            <Text size="md" className="text-text-600">
              Nenhuma questão encontrada para &quot;{searchTerm}&quot;.
            </Text>
          </div>
        );
      }
      return (
        <EmptyState
          image={<Activities />}
          title="Nenhum resultado encontrado"
          description="Utilize o filtro ao lado para encontrar questões."
          size="compact"
        />
      );
    }

    return (
      <>
        {displayedQuestions.map((question) => {
          const subjectInfo = getSubjectInfo(question);
          const questionType = mapQuestionTypeToEnumRequired(
            question.questionType
          );

          return (
            <ActivityCardQuestionBanks
              key={question.id}
              question={
                question.options
                  ? {
                      options: formatQuestionOptions(
                        question.options as {
                          id: string;
                          option: string;
                          isCorrect?: boolean;
                          correctValue?: string | null;
                        }[]
                      ),
                      correctOptionIds: [],
                    }
                  : undefined
              }
              questionType={questionType}
              iconName={subjectInfo.icon}
              subjectColor={subjectInfo.color}
              isDark={isDark}
              content={subjectInfo.content}
              bank={question.questionBankYear?.questionBank?.name}
              year={question.questionBankYear?.year}
              statement={
                searchTerm
                  ? highlightSearchTerm(question.statement ?? '', searchTerm)
                  : question.statement
              }
              additionalContent={question.additionalContent}
              onAddToActivity={() => {
                if (onAddQuestion) {
                  onAddQuestion(question);
                }
              }}
              enableExamMode={enableExamMode}
            />
          );
        })}
        {loadingMore && (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border rounded">
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`w-full flex flex-col p-4 gap-2 overflow-hidden h-full min-h-0 ${className || ''}`}
    >
      <div className="flex flex-col gap-2 flex-shrink-0">
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-text-950">
          <div className="flex items-center gap-2 flex-shrink-0">
            <NotebookIcon size={24} />
            <Text size="lg" weight="bold">
              Banco de questões
            </Text>
          </div>
          {appliedFilters && (
            <Search
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(val) => setSearchTerm(val)}
              onClear={() => setSearchTerm('')}
              options={[]}
              showDropdown={false}
              placeholder="Buscar questão"
              debounceMs={300}
              containerClassName="w-full sm:w-64 sm:max-w-xs max-w-full"
            />
          )}
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-800">
            {loading && !isPrefetchingAll && displayedQuestions.length === 0
              ? 'Carregando...'
              : isPrefetchingAll
                ? `Buscando... (${displayedCount} ${uniqueQuestion(displayedCount)} ${displayedCount === 1 ? 'encontrada' : 'encontradas'})`
                : `${displayedCount} ${uniqueQuestion(displayedCount)} total`}
          </Text>

          <Button
            size="small"
            onClick={() => setIsModalOpen(true)}
            disabled={totalQuestions === 0}
          >
            Adicionar automaticamente
          </Button>
        </section>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-col gap-3 overflow-auto flex-1 min-h-0"
      >
        {renderQuestionsContent()}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adicionar automaticamente"
        size="md"
        hideCloseButton={true}
        contentClassName="p-0"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              onClick={handleAddAutomatically}
              disabled={questionCount <= 0 || !appliedFilters}
            >
              Adicionar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col">
          <div className="px-6 py-6 flex flex-col gap-4">
            <Text size="sm" className="text-text-600">
              Defina a quantidade de questões que você quer que o sistema
              adicione automaticamente na sua{' '}
              {enableExamMode ? 'prova' : 'atividade'}
            </Text>

            <div className="flex flex-col gap-2">
              <Input
                type="number"
                min={1}
                value={questionCount > 0 ? questionCount : ''}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '') {
                    setQuestionCount(0);
                    return;
                  }
                  const numValue = Number.parseInt(inputValue, 10);
                  if (!Number.isNaN(numValue) && numValue > 0) {
                    setQuestionCount(numValue);
                  }
                }}
                placeholder="Insira o número"
                variant="outlined"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export type { ActivityListQuestionsProps };
