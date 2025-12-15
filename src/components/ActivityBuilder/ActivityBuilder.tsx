import { useState, useCallback, useMemo, useEffect } from 'react';
import { Funnel } from 'phosphor-react';
import {
  ActivityFilters,
  ActivityPreview,
  ActivityQuestionsList,
  Button,
  useQuestionFiltersStore,
  type QuestionFiltersState,
  type BaseApiClient,
  type Question,
  type PreviewQuestion,
  QUESTION_TYPE,
  useTheme,
} from '../..';
import { cn } from '../../utils/utils';

/**
 * Converts a Question from API to PreviewQuestion format
 */
const convertQuestionToPreviewQuestion = (question: Question): PreviewQuestion => {
  // Get subject info from knowledge matrix
  let subjectName = 'Assunto não informado';
  let subjectColor = '#000000';
  let iconName = 'BookOpen';

  if (question.knowledgeMatrix && question.knowledgeMatrix.length > 0) {
    const matrix = question.knowledgeMatrix[0];
    const subject = matrix.subject;

    if (subject) {
      subjectName = subject.name;
      subjectColor = subject.color || '#000000';
      iconName = subject.icon || 'BookOpen';
    }
  }

  return {
    id: question.id,
    subjectName,
    subjectColor,
    iconName,
    questionType: question.questionType,
    enunciado: question.statement,
    question: question.options
      ? {
          options: question.options.map((opt) => ({
            id: opt.id,
            option: opt.option,
          })),
          correctOptionIds: [],
        }
      : undefined,
  };
};

export interface ActivityBuilderProps {
  apiClient: BaseApiClient;
  institutionId?: string | null;
  allowedQuestionTypes?: QUESTION_TYPE[];
  onQuestionsChange?: (questions: PreviewQuestion[]) => void;
  initialQuestions?: PreviewQuestion[];
  className?: string;
  onDownloadPdf?: () => void;
  onAddAutomatic?: () => void;
}

/**
 * ActivityBuilder component that integrates filters, questions list, and preview
 * Provides a complete interface for building activities by selecting questions
 */
export const ActivityBuilder = ({
  apiClient,
  institutionId = null,
  allowedQuestionTypes,
  onQuestionsChange,
  initialQuestions = [],
  className,
  onDownloadPdf,
  onAddAutomatic,
}: ActivityBuilderProps) => {
  const { isDark } = useTheme();
  const [addedQuestions, setAddedQuestions] = useState<PreviewQuestion[]>(
    initialQuestions
  );

  const applyFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.applyFilters
  );
  const draftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.draftFilters
  );
  const setDraftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.setDraftFilters
  );

  // Sync initialQuestions when they change externally
  useEffect(() => {
    if (initialQuestions.length !== addedQuestions.length) {
      setAddedQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Notify parent when questions change
  useEffect(() => {
    onQuestionsChange?.(addedQuestions);
  }, [addedQuestions, onQuestionsChange]);

  const handleFiltersChange = useCallback(
    (filters: any) => {
      setDraftFilters(filters);
    },
    [setDraftFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddQuestion = useCallback(
    (question: Question) => {
      const previewQuestion = convertQuestionToPreviewQuestion(question);
      setAddedQuestions((prev) => {
        // Check if question already exists
        if (prev.some((q) => q.id === question.id)) {
          return prev;
        }
        return [...prev, previewQuestion];
      });
    },
    []
  );

  const handleRemoveQuestion = useCallback((questionId: string) => {
    setAddedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setAddedQuestions([]);
  }, []);

  const handleReorder = useCallback((orderedQuestions: PreviewQuestion[]) => {
    setAddedQuestions(orderedQuestions);
  }, []);

  const handlePositionsChange = useCallback(
    (orderedQuestions: PreviewQuestion[]) => {
      setAddedQuestions(orderedQuestions);
    },
    []
  );

  return (
    <div
      className={cn(
        'flex flex-col w-full h-full overflow-hidden bg-background',
        className
      )}
    >
      {/* Main Content with 3 columns */}
      <div className="grid grid-cols-[400px_1fr_470px] w-full flex-1 overflow-hidden gap-5 min-h-0 p-5">
        {/* First Column - Filters */}
        <div className="flex flex-col gap-3 overflow-hidden h-full min-h-0 max-h-full relative">
          <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-h-full">
            <ActivityFilters
              apiClient={apiClient}
              institutionId={institutionId}
              allowedQuestionTypes={allowedQuestionTypes}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              size="medium"
              iconLeft={<Funnel />}
              onClick={handleApplyFilters}
              disabled={!draftFilters}
              className="w-full"
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Second Column - Center, fills remaining space */}
        <ActivityQuestionsList
          apiClient={apiClient}
          onAddQuestion={handleAddQuestion}
          onAddAutomatic={onAddAutomatic}
        />

        {/* Third Column - Preview */}
        <ActivityPreview
          questions={addedQuestions}
          onRemoveAll={handleRemoveAll}
          onReorder={handleReorder}
          onPositionsChange={handlePositionsChange}
          onDownloadPdf={onDownloadPdf}
          isDark={isDark}
        />
      </div>
    </div>
  );
};



