import { useState, type ReactNode } from 'react';
import { CardAccordation } from '../Accordation/Accordation';
import { IconRender, Text, getSubjectColorWithOpacity } from '../../index';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';
import { cn } from '../../utils/utils';

interface ActivityCardQuestionPreviewProps {
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  isDark?: boolean;
  questionType?: QUESTION_TYPE;
  /**
   * Optional label override when questionType is not provided.
   */
  questionTypeLabel?: string;
  enunciado?: string;
  defaultExpanded?: boolean;
  value?: string;
  className?: string;
  children?: ReactNode;
}

export const ActivityCardQuestionPreview = ({
  subjectName = 'Assunto não informado',
  subjectColor = '#000000',
  iconName = 'Book',
  isDark = false,
  questionType,
  questionTypeLabel,
  enunciado = 'Enunciado não informado',
  defaultExpanded = false,
  value,
  className,
  children,
}: ActivityCardQuestionPreviewProps) => {
  const badgeColor = getSubjectColorWithOpacity(subjectColor, isDark);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const resolvedQuestionTypeLabel = questionType
    ? questionTypeLabels[questionType]
    : questionTypeLabel || 'Tipo de questão';

  return (
    <div
      className="w-full"
      onClick={() => {
        if (isExpanded) {
          setIsExpanded(false);
        }
      }}
      onMouseDown={(event) => {
        // Avoid focus outline when clicking anywhere on the card
        event.preventDefault();
      }}
    >
      <CardAccordation
        className={cn(
          'w-full rounded-lg border border-border-200 bg-background',
          className
        )}
        expanded={isExpanded}
        onToggleExpanded={setIsExpanded}
        defaultExpanded={defaultExpanded}
        value={value}
        trigger={
          <div className="w-full min-w-0 flex flex-col gap-2 py-2">
            <div className="flex flex-row gap-2 text-text-650">
              <div className="py-1 px-2 flex flex-row items-center gap-1">
                <span
                  className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
                  style={{
                    backgroundColor: badgeColor,
                  }}
                >
                  <IconRender iconName={iconName} size={14} color="currentColor" />
                </span>
                <Text size="sm">{subjectName}</Text>
              </div>

              <div className="py-1 px-2 flex flex-row items-center gap-1">
                <Text size="sm" className="">
                  {resolvedQuestionTypeLabel}
                </Text>
              </div>
            </div>

            {!isExpanded && (
              <Text
                size="md"
                weight="medium"
                className="text-text-950 truncate px-3"
              >
                {enunciado}
              </Text>
            )}
          </div>
        }
      >
        <Text
          size="md"
          weight="medium"
          className="text-text-950 break-words whitespace-pre-wrap"
        >
          {enunciado}
        </Text>
        {children}
      </CardAccordation>
    </div>
  );
};

export type { ActivityCardQuestionPreviewProps };

