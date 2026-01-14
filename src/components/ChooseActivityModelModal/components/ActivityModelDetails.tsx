import { Text } from '../../../index';
import { ActivityCardQuestionPreview } from '../../ActivityCardQuestionPreview/ActivityCardQuestionPreview';
import type { ActivityData } from '../../ActivityCreate/ActivityCreate.types';

interface ActivityModelDetailsProps {
  /** Activity data with questions */
  activityDetails: ActivityData | null;
  /** Loading state */
  loading: boolean;
}

/**
 * Detailed view of an activity model showing its questions
 * Used as content for the ChooseActivityModelModal
 */
export const ActivityModelDetails = ({
  activityDetails,
  loading,
}: ActivityModelDetailsProps) => {
  const totalQuestions = activityDetails?.selectedQuestions?.length ?? 0;
  const totalQuestionsLabel =
    totalQuestions === 1
      ? '1 questão adicionada'
      : `${totalQuestions} questões adicionadas`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text size="sm" className="text-text-600">
          Carregando detalhes...
        </Text>
      </div>
    );
  }

  if (!activityDetails) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text size="sm" className="text-text-600">
          Nenhum detalhe disponível
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text size="sm" className="text-text-800">
          {totalQuestionsLabel}
        </Text>
      </div>

      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
        {activityDetails.selectedQuestions?.map((question, index) => (
          <div
            key={question.id}
            className="rounded-lg border border-border-200 bg-background"
          >
            <ActivityCardQuestionPreview
              subjectName={
                question.knowledgeMatrix?.[0]?.subject?.name ??
                'Assunto não informado'
              }
              subjectColor={
                question.knowledgeMatrix?.[0]?.subject?.color ?? '#000000'
              }
              iconName={
                question.knowledgeMatrix?.[0]?.subject?.icon ?? 'BookOpen'
              }
              questionType={question.questionType}
              enunciado={question.statement}
              defaultExpanded={false}
              question={{
                options:
                  question.options?.map((opt) => ({
                    id: opt.id,
                    option: opt.option,
                  })) ?? [],
                correctOptionIds:
                  question.options
                    ?.filter((opt) => opt.correct)
                    .map((opt) => opt.id) ?? [],
              }}
              value={question.id}
              position={index + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export type { ActivityModelDetailsProps };
