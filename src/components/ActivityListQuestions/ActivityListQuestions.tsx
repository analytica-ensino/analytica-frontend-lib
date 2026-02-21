import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Notebook } from 'phosphor-react';
import {
  ActivityCardQuestionBanks,
  Button,
  Input,
  Modal,
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

interface ActivityListQuestionsProps {
  apiClient: BaseApiClient;
  onAddQuestion?: (question: Question) => void;
  addedQuestionIds?: string[];
  className?: string;
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
}: ActivityListQuestionsProps) => {
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(1);
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
    if (!appliedFilters || !cachedFilters || !cachedPagination) return false;
    return areFiltersEqual(appliedFilters, cachedFilters);
  }, [appliedFilters, cachedFilters, cachedPagination]);

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastLoadedPageRef = useRef<number>(1);

  /**
   * Convert question options to the format expected by ActivityCardQuestionBanks
   */
  const formatQuestionOptions = (
    questionOptions: { id: string; option: string }[]
  ) => {
    return questionOptions.map((opt) => ({
      id: opt.id,
      option: opt.option,
    }));
  };

  /**
   * Get subject info from knowledge matrix
   */
  const getSubjectInfo = (question: Question) => {
    if (!question.knowledgeMatrix || question.knowledgeMatrix.length === 0) {
      return { assunto: 'Sem assunto', color: '#6B7280' };
    }

    const matrix = question.knowledgeMatrix[0];
    const subject = matrix.subject;
    const topic = matrix.topic;
    const subtopic = matrix.subtopic;

    if (!subject) {
      return { assunto: 'Sem assunto', color: '#6B7280' };
    }

    const parts = [subject.name];
    if (topic?.name) parts.push(topic.name);
    if (subtopic?.name) parts.push(subtopic.name);

    return {
      assunto: parts.join(' - '),
      color: subject.color || '#6B7280',
    };
  };

  /**
   * Initialize from cache if available and filters match
   * Only fetch if cache is invalid or filters changed
   */
  useEffect(() => {
    // Reset page tracking when filters change
    lastLoadedPageRef.current = 1;

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
    cachedPagination,
  ]);

  useEffect(() => {
    if (appliedFilters && pagination && allQuestions.length >= 0) {
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

  const uniqueQuestion = () => {
    return totalQuestions === 1 ? 'questão' : 'questões';
  };

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
    if (loading && questions.length === 0) {
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

    if (questions.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Nenhuma questão encontrada. Aplique os filtros para buscar questões.
          </Text>
        </div>
      );
    }

    return (
      <>
        {questions.map((question) => {
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
                        question.options as { id: string; option: string }[]
                      ),
                      correctOptionIds: [],
                    }
                  : undefined
              }
              questionType={questionType}
              iconName="Atom"
              subjectColor={subjectInfo.color}
              isDark={isDark}
              assunto={subjectInfo.assunto}
              enunciado={question.statement}
              onAddToActivity={() => {
                if (onAddQuestion) {
                  onAddQuestion(question);
                }
              }}
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
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Notebook size={24} />
          <Text size="lg" weight="bold">
            Banco de questões
          </Text>
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-800">
            {loading
              ? 'Carregando...'
              : `${totalQuestions} ${uniqueQuestion()} total`}
          </Text>

          <Button size="small" onClick={() => setIsModalOpen(true)}>
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
              adicione automaticamente na sua atividade
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
