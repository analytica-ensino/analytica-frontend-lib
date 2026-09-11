import { cn } from '../../utils/utils';
import Text from '../Text/Text';
import {
  AI_CORRECTION_STATUS,
  CORRECTION_SOURCE,
  useQuizStore,
} from './useQuizStore';
import { QuizVariant } from './Quiz.types';
import CorrectionSourceTag from './CorrectionSourceTag';

export interface TeacherQuestionCommentProps {
  readonly className?: string;
}

/**
 * Heading above the feedback, phrased for whoever actually wrote it.
 *
 * Attributing an AI correction to "o professor" would be a lie the tag right
 * next to it immediately contradicts, so the two are derived from the same
 * `correctionSource`.
 *
 * @param correctionSource - Who produced the correction
 * @returns The heading to display
 */
function getFeedbackTitle(correctionSource?: CORRECTION_SOURCE | null): string {
  if (correctionSource === CORRECTION_SOURCE.IA) {
    return 'Correção por IA';
  }

  if (correctionSource === CORRECTION_SOURCE.IA_PROFESSOR) {
    return 'Correção revisada pelo professor';
  }

  return 'Comentário do professor';
}

/**
 * Feedback on the question currently under review.
 *
 * Distinct from `TeacherFeedbackSection`, which shows the single observation the
 * teacher wrote for the activity as a whole: this one is per question and sits
 * right below its alternatives, which is where the explanation of a specific
 * mistake belongs.
 *
 * For a dissertative answer the text can come from either of two places. The
 * teacher's own words win when they exist; otherwise the AI's stand. They are
 * never merged — the backend keeps them in separate columns precisely so a
 * review does not destroy the original verdict — and the tag says which one is
 * on screen.
 *
 * It also renders while there is nothing to show yet: an answer whose AI
 * correction is still running gets the "Corrigindo com IA" tag on its own, so
 * the student who lands here right after submitting sees that feedback is
 * coming rather than an empty space.
 *
 * Renders nothing outside the result variant, or when the question has neither
 * feedback nor a correction under way.
 *
 * @param props - Component props
 * @returns JSX element or null
 *
 * @example
 * ```tsx
 * <Quiz variant="result">
 *   <QuizContent />
 * </Quiz>
 * ```
 */
export const TeacherQuestionComment = ({
  className,
}: TeacherQuestionCommentProps) => {
  const { variant, getCurrentQuestion, getQuestionResultByQuestionId } =
    useQuizStore();

  if (variant !== QuizVariant.RESULT) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return null;
  }

  const result = getQuestionResultByQuestionId(currentQuestion.id);
  if (!result) {
    return null;
  }

  const { teacherFeedback, aiFeedback, aiCorrectionStatus, correctionSource } =
    result;

  const comment = teacherFeedback || aiFeedback;
  const isCorrecting = aiCorrectionStatus === AI_CORRECTION_STATUS.PENDING;

  if (!comment && !isCorrecting) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-background border border-border-100 rounded-lg p-4 mt-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {comment && (
          <Text className="text-sm font-bold text-text-950">
            {getFeedbackTitle(correctionSource)}
          </Text>
        )}
        <CorrectionSourceTag
          correctionSource={correctionSource}
          aiCorrectionStatus={aiCorrectionStatus}
        />
      </div>

      {comment ? (
        <Text size="sm" className="text-text-700 whitespace-pre-wrap">
          {comment}
        </Text>
      ) : (
        <Text size="sm" className="text-text-600">
          Sua resposta está sendo corrigida. O feedback aparece aqui em
          instantes.
        </Text>
      )}
    </div>
  );
};

export default TeacherQuestionComment;
