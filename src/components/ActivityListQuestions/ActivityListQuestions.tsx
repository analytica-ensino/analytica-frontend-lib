import { useEffect, useMemo, useRef, useState } from 'react';
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
   * Check if cached questions match current filters using areFiltersEqual
   */
  const filtersMatchCache = useMemo(() => {
    if (!appliedFilters || !cachedFilters) return false;
    if (cachedQuestions.length === 0) return false;
    return areFiltersEqual(appliedFilters, cachedFilters);
  }, [appliedFilters, cachedFilters, cachedQuestions]);

  // Use cached questions if filters match, otherwise use hook's questions
  // Filter out questions that are already added
  const questions = useMemo(() => {
    const sourceQuestions =
      filtersMatchCache && cachedQuestions.length > 0
        ? cachedQuestions
        : allQuestions;

    return sourceQuestions.filter(
      (question) => !addedQuestionIds.includes(question.id)
    );
  }, [allQuestions, cachedQuestions, filtersMatchCache, addedQuestionIds]);

  // Use cached pagination if filters match, otherwise use hook's pagination
  const effectivePagination =
    filtersMatchCache && cachedPagination ? cachedPagination : pagination;

  const observerTarget = useRef<HTMLDivElement>(null);

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
    if (appliedFilters) {
      // Check if we have valid cached data
      if (filtersMatchCache && cachedQuestions.length > 0) {
        // Skip fetch - use cached data
        // The hook will maintain its own state, but we prevent unnecessary API calls
        return;
      }

      // Fetch new data if cache is invalid or filters changed
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
    filtersMatchCache,
    clearCachedQuestions,
  ]);

  /**
   * Update cache when questions are successfully fetched
   */
  useEffect(() => {
    if (
      appliedFilters &&
      allQuestions.length > 0 &&
      pagination &&
      !filtersMatchCache
    ) {
      setCachedQuestions(allQuestions, pagination, appliedFilters);
    }
  }, [
    allQuestions,
    pagination,
    appliedFilters,
    filtersMatchCache,
    setCachedQuestions,
  ]);

  /**
   * Intersection Observer for infinite scroll
   * Loads more questions when user scrolls to the bottom
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadingMore &&
          effectivePagination?.hasNext &&
          !filtersMatchCache
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadingMore, pagination, loadMore]);

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
        {effectivePagination?.hasNext && (
          <div ref={observerTarget} className="h-4 w-full">
            {loadingMore && (
              <div className="flex flex-col gap-2 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border rounded">
                    <SkeletonText lines={2} />
                  </div>
                ))}
              </div>
            )}
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

      <div className="flex flex-col gap-3 overflow-auto flex-1 min-h-0">
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
