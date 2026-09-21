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
import type { ActivityFiltersData } from '../../types/activityFilters';
import type { QuestionsFilterBody } from '../../types/questions';
import { mapQuestionTypeToEnumRequired } from '../../utils/questionTypeUtils';
import { areFiltersEqual } from '../../utils/activityFilters';
import { highlightSearchTerm } from '../../utils/stringUtils';
import { useSentQuestionIds } from '../../hooks/useSentQuestionIds';
import Activities from '../../assets/icons/Activities';

interface ActivityListQuestionsProps {
  apiClient: BaseApiClient;
  onAddQuestion?: (question: Question) => void;
  addedQuestionIds?: string[];
  className?: string;
  /** Enable exam mode - changes text labels from 'atividade' to 'prova' */
  enableExamMode?: boolean;
  /**
   * Restricts the bank to the questions linked to this institution.
   *
   * Teachers and managers never need it: the backend already scopes the list
   * by the institution in their session. A SUPER_ADMIN has no institution and
   * sees every question, so a backoffice screen building an exam for one
   * institution passes the target here.
   */
  institutionId?: string;
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
  institutionId,
}: ActivityListQuestionsProps) => {
  const { isDark } = useTheme();
  const sentQuestionIds = useSentQuestionIds(apiClient);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(1);
  // What the input shows (every keystroke) and what was sent to the server
  // (the debounced value). The search runs on `/questions/list` (`search`,
  // statement only): an in-memory search would need every page of the
  // filter loaded first, which froze the page on large banks.
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
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
  const cachedInstitutionId = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.cachedInstitutionId
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
   * Applied filters in the shape `/questions/list` expects, plus the
   * institution scope when one was given.
   */
  const toApiFilters = useCallback(
    (filters: ActivityFiltersData): QuestionsFilterBody => ({
      ...convertActivityFiltersToQuestionsFilter(filters),
      ...(institutionId && { institutionId: [institutionId] }),
    }),
    [institutionId]
  );

  /**
   * Check if we already have a valid cache result for current filters
   * This is true even if the result is empty (0 questions)
   */
  // The institution is part of the cache identity: the same filters scoped
  // to another institution are a different list.
  const hasValidCacheResult = useMemo(() => {
    if (!appliedFilters || !cachedFilters) return false;
    if ((institutionId ?? null) !== cachedInstitutionId) return false;
    return areFiltersEqual(appliedFilters, cachedFilters);
  }, [appliedFilters, cachedFilters, institutionId, cachedInstitutionId]); // cachedPagination removed: only used as null guard, cachedFilters already guards

  /**
   * Check if cached questions match current filters AND have data
   * Used for displaying cached data while loading or for pagination
   */
  const filtersMatchCache = useMemo(() => {
    if (!hasValidCacheResult) return false;
    return cachedQuestions.length > 0;
  }, [hasValidCacheResult, cachedQuestions]);

  const { questions, hiddenAddedCount } = useMemo(() => {
    let sourceQuestions: typeof allQuestions;

    const hasFreshData = !loading && pagination !== null;

    if (appliedSearch) {
      // The cache holds the unsearched list; the hook holds the results.
      sourceQuestions = allQuestions;
    } else if (hasFreshData) {
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

    // Questions already on the activity are hidden here, after the fetch
    // that counted them — so the counter subtracts them as well.
    const visible = sourceQuestions.filter(
      (question) => !addedQuestionIds.includes(question.id)
    );
    return {
      questions: visible,
      hiddenAddedCount: sourceQuestions.length - visible.length,
    };
  }, [
    allQuestions,
    cachedQuestions,
    filtersMatchCache,
    addedQuestionIds,
    loading,
    pagination,
    appliedSearch,
  ]);

  // Use hook's pagination if it has more pages loaded, otherwise use cached
  // This ensures we track progress when loading more pages via infinite scroll
  const effectivePagination = useMemo(() => {
    if (appliedSearch) {
      return pagination;
    }
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
  }, [pagination, cachedPagination, filtersMatchCache, appliedSearch]);

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

  const displayedQuestions = questions;

  const lastAppliedFiltersRef = useRef(appliedFilters);
  const lastAppliedSearchRef = useRef(appliedSearch);

  /**
   * Initialize from cache if available and filters match
   * Only fetch if cache is invalid or filters changed
   */
  useEffect(() => {
    const filtersChanged = lastAppliedFiltersRef.current !== appliedFilters;
    lastAppliedFiltersRef.current = appliedFilters;
    // Clearing a search must refetch: the hook still holds the results, and
    // the store cache is only consulted when it has more rows than the hook.
    const searchCleared =
      Boolean(lastAppliedSearchRef.current) && !appliedSearch;
    lastAppliedSearchRef.current = appliedSearch;

    if (filtersChanged) {
      // Reset page tracking and the search when filters change. Clearing an
      // active search re-runs this effect without it, on the path below.
      lastLoadedPageRef.current = 1;
      setSearchTerm('');
      if (appliedSearch) {
        setAppliedSearch('');
        return;
      }
    }

    if (appliedFilters) {
      if (appliedSearch) {
        // A search is never served from (or written to) the store cache.
        fetchQuestions(
          {
            ...toApiFilters(appliedFilters),
            search: appliedSearch,
            ...(addedQuestionIdsRef.current.length > 0 && {
              selectedQuestionsIds: addedQuestionIdsRef.current,
            }),
          },
          false
        );
        return;
      }

      if (hasValidCacheResult && !searchCleared) {
        // Update page ref to match cached pagination
        if (cachedPagination?.page) {
          lastLoadedPageRef.current = cachedPagination.page;
        }
        return;
      }

      const apiFilters = {
        ...toApiFilters(appliedFilters),
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
    appliedSearch,
    fetchQuestions,
    reset,
    hasValidCacheResult,
    clearCachedQuestions,
    toApiFilters,
  ]); // cachedPagination intentionally excluded: it changes every page load and would wipe searchTerm on each scroll

  useEffect(() => {
    if (appliedFilters && pagination && !appliedSearch) {
      setCachedQuestions(
        allQuestions,
        pagination,
        appliedFilters,
        institutionId
      );
      lastLoadedPageRef.current = pagination.page;
    }
  }, [
    allQuestions,
    pagination,
    appliedFilters,
    appliedSearch,
    institutionId,
    setCachedQuestions,
  ]);

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
          ? toApiFilters(appliedFilters)
          : undefined;
        loadMore(apiFilters, effectivePagination ?? undefined);
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [
    loading,
    loadingMore,
    effectivePagination,
    loadMore,
    appliedFilters,
    toApiFilters,
  ]);

  const totalQuestions = Math.max(
    (effectivePagination?.total || 0) - hiddenAddedCount,
    0
  );
  const uniqueQuestion = (count = totalQuestions) =>
    count === 1 ? 'questão' : 'questões';

  const getStatusText = () => {
    if (loading && displayedQuestions.length === 0) {
      return appliedSearch ? 'Buscando...' : 'Carregando...';
    }
    return `${totalQuestions} ${uniqueQuestion()} total`;
  };

  /**
   * Handle adding questions automatically using random search
   */
  const handleAddAutomatically = async () => {
    if (questionCount <= 0) return;

    try {
      // Get current filters or empty filters
      const baseFilters = appliedFilters ? toApiFilters(appliedFilters) : {};

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
    if (loading && displayedQuestions.length === 0) {
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

    if (displayedQuestions.length === 0) {
      if (appliedSearch) {
        return (
          <div className="flex items-center justify-center h-full">
            <Text size="md" className="text-text-600">
              Nenhuma questão encontrada para &quot;{appliedSearch}&quot;.
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
                appliedSearch
                  ? highlightSearchTerm(question.statement ?? '', appliedSearch)
                  : question.statement
              }
              additionalContent={question.additionalContent}
              alreadySent={sentQuestionIds.has(question.id)}
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
              onSearch={(val) => setAppliedSearch(val.trim())}
              onClear={() => {
                setSearchTerm('');
                setAppliedSearch('');
              }}
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
            {getStatusText()}
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
