import { forwardRef } from 'react';
import { PaperclipIcon } from '@phosphor-icons/react/dist/csr/Paperclip';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';
import { useQuizStore } from './useQuizStore';

export interface TeacherFeedbackSectionProps {
  className?: string;
}

export const TeacherFeedbackSection = forwardRef<
  HTMLDivElement,
  TeacherFeedbackSectionProps
>(({ className }, ref) => {
  const { getActivityFeedback } = useQuizStore();
  const feedback = getActivityFeedback();

  if (!feedback?.teacherFeedback && !feedback?.attachment) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background border border-border-100 rounded-lg p-4 mt-6',
        className
      )}
    >
      <Text className="text-sm font-bold text-text-950 mb-3">
        Observação do Professor
      </Text>

      {feedback.teacherFeedback && (
        <Text size="sm" className="text-text-700 whitespace-pre-wrap mb-3">
          {feedback.teacherFeedback}
        </Text>
      )}

      {feedback.attachment && (
        <a
          href={feedback.attachment}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-100 rounded-full text-text-800 hover:bg-secondary-200 transition-colors"
        >
          <PaperclipIcon size={16} />
          <Text size="sm" weight="medium" color="text-text-800">
            Ver anexo
          </Text>
        </a>
      )}
    </div>
  );
});

TeacherFeedbackSection.displayName = 'TeacherFeedbackSection';
