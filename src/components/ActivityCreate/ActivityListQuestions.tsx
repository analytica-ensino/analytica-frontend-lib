import { useEffect, useRef } from 'react';
import {
  ActivityCardQuestionBanks,
  Button,
  QUESTION_TYPE,
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
import { Notebook } from 'phosphor-react';
import { convertActivityFiltersToQuestionsFilter } from '../../utils/questionFiltersConverter';

/**
 * Maps API question type string to QUESTION_TYPE enum
 */
const mapQuestionTypeToEnum = (type: string): QUESTION_TYPE => {
  const typeMap: Record<string, QUESTION_TYPE> = {
    ALTERNATIVA: QUESTION_TYPE.ALTERNATIVA,
    DISSERTATIVA: QUESTION_TYPE.DISSERTATIVA,
    MULTIPLA_ESCOLHA: QUESTION_TYPE.MULTIPLA_ESCOLHA,
    VERDADEIRO_FALSO: QUESTION_TYPE.VERDADEIRO_FALSO,
    IMAGEM: QUESTION_TYPE.IMAGEM,
    LIGAR_PONTOS: QUESTION_TYPE.LIGAR_PONTOS,
    PREENCHER: QUESTION_TYPE.PREENCHER,
  };
  return typeMap[type] || QUESTION_TYPE.ALTERNATIVA;
};

/**
 * Component that displays the list of questions from the API
 * Fetches and displays questions based on applied filters
 */
export const ActivityListQuestions = ({
  apiClient,
  onAddQuestion,
  addedQuestionIds = [],
}: {
  apiClient: BaseApiClient;
  onAddQuestion?: (question: Question) => void;
  addedQuestionIds?: string[];
}) => {
  const { isDark } = useTheme();
  const appliedFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.appliedFilters
  );
  const useQuestionsList = createUseQuestionsList(apiClient);

  const {
    questions,
    pagination,
    loading,
    loadingMore,
    error,
    fetchQuestions,
    loadMore,
    reset,
  } = useQuestionsList();

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
   * Fetch questions only when applied filters are set (not on initial load)
   * Only fetches when user clicks "Filtrar" button
   * Resets questions when filters change
   */
  useEffect(() => {
    if (appliedFilters) {
      const apiFilters =
        convertActivityFiltersToQuestionsFilter(appliedFilters);
      fetchQuestions(apiFilters, false);
    } else {
      reset();
    }
  }, [appliedFilters, fetchQuestions, reset]);

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
          pagination?.hasNext
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

  const totalQuestions = pagination?.total || 0;

  const uniqueQuestion = () => {
    return totalQuestions === 1 ? 'questão' : 'questões';
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
          const subjectInfo = getSubjectInfo(question as Question);
          const questionType = mapQuestionTypeToEnum(question.questionType);
          const isAdded = addedQuestionIds.includes(question.id);

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
                if (onAddQuestion && !isAdded) {
                  onAddQuestion(question as Question);
                }
              }}
            />
          );
        })}
        {pagination?.hasNext && (
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
    <div className="w-full flex flex-col p-4 gap-2 overflow-hidden h-full min-h-0">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Notebook size={24} />
          <Text size="lg" weight="bold">
            Banco de questões
          </Text>
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-650">
            {loading
              ? 'Carregando...'
              : `${totalQuestions} ${uniqueQuestion()} total`}
          </Text>

          <Button size="small">Adicionar automaticamente</Button>
        </section>
      </div>

      <div className="flex flex-col gap-1 overflow-auto flex-1 min-h-0">
        {renderQuestionsContent()}
      </div>
    </div>
  );
};
