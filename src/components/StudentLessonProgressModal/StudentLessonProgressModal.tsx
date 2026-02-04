import { useMemo, useState, type ReactNode } from 'react';
import {
  MagnifyingGlassIcon,
  XCircleIcon,
  MedalIcon,
  SealWarningIcon,
} from '@phosphor-icons/react';
import { CaretRight } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import { CardActivitiesResults } from '../Card/Card';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonRounded,
} from '../Skeleton/Skeleton';
import type {
  StudentLessonProgressModalProps,
  StudentLessonProgressData,
  StudentLessonProgressLabels,
  TopicProgressItem,
  SubtopicProgressItem,
  ContentProgressItem,
} from './types';
import { DEFAULT_LESSON_PROGRESS_LABELS } from './types';
import { cn } from '../../utils/utils';

/**
 * Content item accordion (deepest level - individual lessons)
 */
const ContentAccordionItem = ({
  item,
  noDataMessage,
}: {
  item: ContentProgressItem;
  noDataMessage: string;
}) => {
  const hasNoData = item.progress === 0 && !item.isCompleted;

  return (
    <div className="flex items-center justify-between p-4 border-t border-border-50">
      <Text size="sm" className="text-text-950">
        {item.content.name}
      </Text>
      {hasNoData ? (
        <Text size="xs" className="text-text-500">
          {noDataMessage}
        </Text>
      ) : (
        <Text
          size="xs"
          weight="medium"
          className="text-text-500 whitespace-nowrap"
        >
          {Math.round(item.progress)}%
        </Text>
      )}
    </div>
  );
};

/**
 * Subtopic accordion item (middle level)
 */
const SubtopicAccordionItem = ({
  item,
  noDataMessage,
}: {
  item: SubtopicProgressItem;
  noDataMessage: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.contents && item.contents.length > 0;
  const hasNoData = item.status === 'no_data';

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        disabled={!hasChildren}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-4 text-left transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-950 focus:ring-inset rounded-xl',
          'border-t border-border-50',
          hasChildren && 'cursor-pointer hover:bg-background-50',
          !hasChildren && 'cursor-default'
        )}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <div className="flex items-center justify-between flex-1 min-w-0">
          <Text size="md" weight="medium" className="text-text-950">
            {item.subtopic.name}
          </Text>
          {!hasNoData && (
            <Text
              size="xs"
              weight="medium"
              className="text-text-500 whitespace-nowrap"
            >
              {Math.round(item.progress)}%
            </Text>
          )}
        </div>

        {hasChildren && (
          <CaretRight
            size={20}
            className={cn(
              'transition-transform duration-200 flex-shrink-0 text-text-700',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
          />
        )}
      </button>

      {hasChildren && (
        <div
          data-testid={`accordion-content-subtopic-${item.subtopic.id}`}
          data-expanded={isExpanded}
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="pl-4">
            {item.contents.map((content) => (
              <ContentAccordionItem
                key={content.content.id}
                item={content}
                noDataMessage={noDataMessage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Topic accordion item (top level)
 */
const TopicAccordionItem = ({
  item,
  noDataMessage,
}: {
  item: TopicProgressItem;
  noDataMessage: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.subtopics && item.subtopics.length > 0;
  const hasNoData = item.status === 'no_data';

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        disabled={!hasChildren}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-4 text-left transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-950 focus:ring-inset rounded-xl',
          hasChildren && 'cursor-pointer hover:bg-background-50',
          !hasChildren && 'cursor-default'
        )}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Text size="lg" weight="bold" className="text-text-950">
            {item.topic.name}
          </Text>
          {hasNoData ? (
            <Text size="xs" className="text-text-500">
              {noDataMessage}
            </Text>
          ) : (
            <div className="flex flex-row items-center gap-2">
              <div className="flex-1">
                <ProgressBar
                  value={item.progress}
                  variant="green"
                  size="medium"
                />
              </div>
              <Text
                size="xs"
                weight="medium"
                className="text-text-950 whitespace-nowrap"
              >
                {Math.round(item.progress)}%
              </Text>
            </div>
          )}
        </div>

        {hasChildren && (
          <CaretRight
            size={20}
            className={cn(
              'transition-transform duration-200 flex-shrink-0 text-text-700',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
          />
        )}
      </button>

      {hasChildren && (
        <div
          data-testid={`accordion-content-${item.topic.id}`}
          data-expanded={isExpanded}
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="pl-4">
            {item.subtopics.map((subtopic) => (
              <SubtopicAccordionItem
                key={subtopic.subtopic.id}
                item={subtopic}
                noDataMessage={noDataMessage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Loading skeleton for the modal content
 */
const LoadingSkeleton = () => (
  <div data-testid="lesson-progress-skeleton" className="flex flex-col gap-4">
    <Skeleton variant="text" width="12rem" height={24} />
    <div className="flex flex-row gap-3">
      <SkeletonCircle width={107} height={107} />
      <SkeletonRounded className="flex-1" height={107} />
      <SkeletonRounded className="flex-1" height={107} />
    </div>
    <Skeleton variant="text" width="9rem" height={24} className="mt-4" />
    <div className="flex flex-col gap-2">
      <SkeletonRounded height={80} />
      <SkeletonRounded height={80} />
      <SkeletonRounded height={80} />
    </div>
  </div>
);

/**
 * Error state component
 */
const ErrorContent = ({
  message,
  prefix,
}: {
  message: string;
  prefix?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <Text
      as="span"
      className="size-12 rounded-full bg-error-100 flex items-center justify-center"
    >
      <XCircleIcon size={24} className="text-error-700" weight="fill" />
    </Text>
    <Text size="md" className="text-error-700 text-center">
      {prefix ? `${prefix}: ${message}` : message}
    </Text>
  </div>
);

/**
 * Progress content when data is available
 */
const ProgressContent = ({
  data,
  labels,
}: {
  data: StudentLessonProgressData;
  labels: StudentLessonProgressLabels;
}) => (
  <div className="flex flex-col gap-4">
    {/* Student name with search icon */}
    <div className="flex items-center gap-2 pt-2">
      <Text
        as="span"
        className="size-6 rounded-full bg-primary-100 flex items-center justify-center"
      >
        <MagnifyingGlassIcon
          size={14}
          className="text-primary-800"
          weight="bold"
        />
      </Text>
      <Text size="md" className="text-text-950">
        {data.name}
      </Text>
    </div>

    {/* Stats cards row */}
    <div className="grid grid-cols-3 gap-3">
      <div className="flex items-center justify-center">
        <ProgressCircle
          value={data.overallCompletionRate}
          variant="green"
          size="small"
          label={labels.completionRateLabel}
          showPercentage
        />
      </div>

      <CardActivitiesResults
        icon={
          <MedalIcon size={16} weight="regular" className="text-text-950" />
        }
        title={labels.bestResultLabel}
        subTitle={data.bestResult || '-'}
        header=""
        action="success"
      />

      <CardActivitiesResults
        icon={
          <SealWarningIcon size={16} weight="regular" className="text-white" />
        }
        title={labels.biggestDifficultyLabel}
        subTitle={data.biggestDifficulty || '-'}
        header=""
        action="error"
      />
    </div>

    {/* Lesson progress section */}
    {data.lessonProgress.length > 0 && (
      <div className="flex flex-col gap-4 pt-4">
        <Text size="lg" weight="bold" className="text-text-950">
          {labels.lessonProgressTitle}
        </Text>
        <div className="flex flex-col gap-2">
          {data.lessonProgress.map((topic) => (
            <div
              key={topic.topic.id}
              data-testid={`lesson-item-${topic.topic.id}`}
              className="bg-background rounded-xl border border-border-50"
            >
              <TopicAccordionItem
                item={topic}
                noDataMessage={labels.noDataMessage}
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

/**
 * Renders the modal content based on loading, error, and data state
 */
const renderModalContent = (
  loading: boolean,
  error: string | null | undefined,
  data: StudentLessonProgressData | null,
  labels: StudentLessonProgressLabels
): ReactNode => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorContent message={error} prefix={labels.errorMessagePrefix} />;
  }

  if (data) {
    return <ProgressContent data={data} labels={labels} />;
  }

  return null;
};

/**
 * StudentLessonProgressModal component
 *
 * Displays a modal with student lesson progress information including:
 * - Student name with profile icon
 * - Completion rate circle
 * - Best result and biggest difficulty highlight cards
 * - Expandable nested list of lesson progress by topic
 */
export const StudentLessonProgressModal = ({
  isOpen,
  onClose,
  data,
  loading = false,
  error = null,
  labels: customLabels,
}: StudentLessonProgressModalProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_LESSON_PROGRESS_LABELS, ...customLabels }),
    [customLabels]
  );

  const content = renderModalContent(loading, error, data, labels);

  if (!content) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={labels.title}
      size="lg"
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      {content}
    </Modal>
  );
};

export default StudentLessonProgressModal;
