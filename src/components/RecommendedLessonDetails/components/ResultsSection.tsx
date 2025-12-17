import { TrophyIcon, WarningIcon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
import ProgressCircle from '../../ProgressCircle/ProgressCircle';
import type { LessonDetailsData } from '../../../types/recommendedLessons';
import type { LessonDetailsLabels } from '../types';

/**
 * Props for ResultsSection component
 */
interface ResultsSectionProps {
  /** Lesson details data */
  data: LessonDetailsData;
  /** Labels for the component */
  labels: LessonDetailsLabels;
}

/**
 * Results section with 3 cards
 * Displays completion percentage, best result, and hardest topic
 */
export const ResultsSection = ({ data, labels }: ResultsSectionProps) => {
  const { details } = data;
  const { aggregated, contentPerformance } = details;

  return (
    <div className="flex flex-col gap-4">
      <Text as="h2" size="md" weight="semibold" className="text-text-950">
        {labels.resultsTitle}
      </Text>
      {/* White container with the 3 cards */}
      <div className="bg-background rounded-xl border border-border-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completion percentage card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-primary-50">
            <ProgressCircle
              value={aggregated.completionPercentage}
              size="small"
              variant="blue"
              label={labels.completedLabel}
              showPercentage
            />
          </div>

          {/* Best result topic card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-success-200">
            <Text
              as="span"
              className="size-8 rounded-full flex items-center justify-center bg-warning-300 mb-2"
            >
              <TrophyIcon size={18} weight="fill" className="text-white" />
            </Text>
            <Text
              size="2xs"
              weight="bold"
              className="text-text-700 uppercase text-center leading-none mb-1"
            >
              {labels.bestResultLabel}
            </Text>
            <Text
              size="xl"
              weight="bold"
              className="text-success-700 text-center leading-none tracking-wide"
            >
              {contentPerformance.best?.contentName || '-'}
            </Text>
          </div>

          {/* Hardest topic card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-error-100">
            <Text
              as="span"
              className="size-8 rounded-full flex items-center justify-center bg-error-300 mb-2"
            >
              <WarningIcon size={18} weight="fill" className="text-error-700" />
            </Text>
            <Text
              size="2xs"
              weight="bold"
              className="text-text-700 uppercase text-center leading-none mb-1"
            >
              {labels.hardestTopicLabel}
            </Text>
            <Text
              size="xl"
              weight="bold"
              className="text-error-700 text-center leading-none tracking-wide"
            >
              {contentPerformance.worst?.contentName || '-'}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
