import { useMemo, useState, type ReactNode } from 'react';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { MedalIcon } from '@phosphor-icons/react/dist/csr/Medal';
import { SealWarningIcon } from '@phosphor-icons/react/dist/csr/SealWarning';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import { CardActivitiesResults } from '../Card/Card';
import { UserIcon } from '../UserIcon/UserIcon';
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
import { hasContentData, roundProgress } from './lessonProgress';
import { cn } from '../../utils/utils';

/**
 * Value line of the two highlight cards: 20px as designed, wrapping onto a
 * second line instead of being cut — a topic name is what the teacher came
 * to read, so an ellipsis would hide the point of the card.
 */
const HIGHLIGHT_VALUE_CLASS =
  'text-xl leading-6 whitespace-normal text-clip line-clamp-2';

/**
 * Body of an expandable row.
 *
 * Animates through `grid-template-rows` (0fr → 1fr), so the open height is the
 * content's own — a `max-h` cap would clip a long list of lessons behind
 * `overflow-hidden` with no way to reach the rest. While collapsed it is both
 * hidden from assistive technology and `inert`: the subtopic buttons inside a
 * topic stay mounted, and `aria-hidden` alone would leave them focusable.
 */
const Collapsible = ({
  expanded,
  testId,
  children,
}: {
  expanded: boolean;
  testId: string;
  children: ReactNode;
}) => (
  <div
    data-testid={testId}
    data-expanded={expanded}
    aria-hidden={!expanded}
    inert={!expanded}
    className={cn(
      'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
      expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
    )}
  >
    <div className="min-h-0 overflow-hidden">{children}</div>
  </div>
);

/** Caret of an expandable row, turned down while it is open. */
const Caret = ({ expanded }: { expanded: boolean }) => (
  <CaretRightIcon
    size={18}
    className={cn(
      'shrink-0 text-text-950 transition-transform duration-200',
      expanded ? 'rotate-90' : 'rotate-0'
    )}
  />
);

/** Percentage at the end of a row, rounded as every level draws it. */
const ProgressPercent = ({
  progress,
  className,
}: {
  progress: number;
  className: string;
}) => (
  <Text
    as="span"
    size="xs"
    weight="semibold"
    className={cn('shrink-0 text-center', className)}
  >
    {roundProgress(progress)}%
  </Text>
);

/** Row of one lesson (content), the deepest level of the list. */
const ContentRow = ({
  item,
  noDataMessage,
}: {
  item: ContentProgressItem;
  noDataMessage: string;
}) => (
  <div className="flex items-center gap-4 border-t border-border-200 px-4 py-3">
    <Text size="sm" weight="medium" className="min-w-0 flex-1 text-text-950">
      {item.content.name}
    </Text>
    {hasContentData(item) ? (
      <ProgressPercent progress={item.progress} className="text-text-600" />
    ) : (
      <Text size="xs" className="shrink-0 text-text-500">
        {noDataMessage}
      </Text>
    )}
  </div>
);

/**
 * Bordered card of one subtopic; its lessons list inside it, one row each,
 * once it is expanded.
 */
const SubtopicCard = ({
  item,
  noDataMessage,
}: {
  item: SubtopicProgressItem;
  noDataMessage: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.contents.length > 0;
  const hasNoData = item.status === 'no_data';

  return (
    <div className="flex flex-col rounded-xl border border-border-200 bg-background">
      <button
        type="button"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        disabled={!hasChildren}
        className={cn(
          'flex w-full items-center gap-4 rounded-xl p-4 text-left',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-950',
          hasChildren ? 'cursor-pointer' : 'cursor-default'
        )}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <Text size="sm" weight="bold" className="min-w-0 flex-1 text-text-950">
          {item.subtopic.name}
        </Text>
        {hasNoData ? (
          <Text size="xs" className="shrink-0 text-text-500">
            {noDataMessage}
          </Text>
        ) : (
          <ProgressPercent progress={item.progress} className="text-text-600" />
        )}
        {hasChildren && <Caret expanded={isExpanded} />}
      </button>

      {hasChildren && (
        <Collapsible
          expanded={isExpanded}
          testId={`accordion-content-subtopic-${item.subtopic.id}`}
        >
          {item.contents.map((content) => (
            <ContentRow
              key={content.content.id}
              item={content}
              noDataMessage={noDataMessage}
            />
          ))}
        </Collapsible>
      )}
    </div>
  );
};

/**
 * Card of one topic: bold name, then a green bar with its percentage — or the
 * no-data message when nothing was measured yet. Its subtopic cards render
 * inside the card, under the header, once it is expanded.
 */
const TopicCard = ({
  item,
  noDataMessage,
}: {
  item: TopicProgressItem;
  noDataMessage: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.subtopics.length > 0;
  const hasNoData = item.status === 'no_data';

  return (
    <div
      data-testid={`lesson-item-${item.topic.id}`}
      className="flex flex-col rounded-xl bg-background"
    >
      <button
        type="button"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        disabled={!hasChildren}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl p-4 text-left',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-950',
          hasChildren ? 'cursor-pointer' : 'cursor-default'
        )}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text size="lg" weight="bold" className="text-text-950">
            {item.topic.name}
          </Text>
          {hasNoData ? (
            <Text size="xs" className="text-text-500">
              {noDataMessage}
            </Text>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar
                  value={item.progress}
                  variant="green"
                  size="medium"
                />
              </div>
              <ProgressPercent
                progress={item.progress}
                className="text-text-950"
              />
            </div>
          )}
        </div>
        {hasChildren && <Caret expanded={isExpanded} />}
      </button>

      {hasChildren && (
        <Collapsible
          expanded={isExpanded}
          testId={`accordion-content-${item.topic.id}`}
        >
          <div className="flex flex-col gap-2 px-4 pb-4">
            {item.subtopics.map((subtopic) => (
              <SubtopicCard
                key={subtopic.subtopic.id}
                item={subtopic}
                noDataMessage={noDataMessage}
              />
            ))}
          </div>
        </Collapsible>
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
    <div className="flex items-center gap-2 pt-2">
      <UserIcon size={24} className="shrink-0" />
      <Text size="md" className="text-text-950">
        {data.name}
      </Text>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <div className="flex items-center justify-center rounded-xl border border-border-100 bg-background p-2">
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
        subTitleClassName={HIGHLIGHT_VALUE_CLASS}
        header=""
        action="success"
      />

      <CardActivitiesResults
        icon={
          <SealWarningIcon size={16} weight="regular" className="text-white" />
        }
        title={labels.biggestDifficultyLabel}
        subTitle={data.biggestDifficulty || '-'}
        subTitleClassName={HIGHLIGHT_VALUE_CLASS}
        header=""
        action="error"
      />
    </div>

    {data.lessonProgress.length > 0 && (
      <div className="flex flex-col gap-4 pt-4">
        <Text size="lg" weight="bold" className="text-text-950">
          {labels.lessonProgressTitle}
        </Text>
        <div className="flex flex-col gap-2">
          {data.lessonProgress.map((topic) => (
            <TopicCard
              key={topic.topic.id}
              item={topic}
              noDataMessage={labels.noDataMessage}
            />
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
 * - Expandable nested list of lesson progress: topic → subtopic → lesson,
 *   with the topics of every requested subject in one trail-ordered list
 *
 * Without data, loading or error the component renders nothing.
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
