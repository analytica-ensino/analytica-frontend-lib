import { cn } from '../../utils/utils';
import Text from '../Text/Text';
import { useQuizStore } from './useQuizStore';
import { QuizVariant } from './Quiz.types';

export interface TeacherQuestionCommentProps {
  readonly className?: string;
}

/**
 * Teacher's comment on the question currently under review.
 *
 * Distinct from `TeacherFeedbackSection`, which shows the single observation the
 * teacher wrote for the activity as a whole: this one is per question and sits
 * right below its alternatives, which is where the explanation of a specific
 * mistake belongs.
 *
 * Renders nothing outside the result variant, or when the question carries no
 * comment.
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

  const comment = getQuestionResultByQuestionId(
    currentQuestion.id
  )?.teacherFeedback;
  if (!comment) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-background border border-border-100 rounded-lg p-4 mt-4',
        className
      )}
    >
      <Text className="text-sm font-bold text-text-950 mb-2">
        Comentário do professor
      </Text>
      <Text size="sm" className="text-text-700 whitespace-pre-wrap">
        {comment}
      </Text>
    </div>
  );
};

export default TeacherQuestionComment;
