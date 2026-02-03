import { useMemo, useState, type ReactNode } from 'react';
import {
  MagnifyingGlass,
  XCircleIcon,
  Medal,
  SealWarning,
} from '@phosphor-icons/react';
import { CaretRight } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import { CardActivitiesResults } from '../Card/Card';
import type {
  StudentLessonProgressModalProps,
  StudentLessonProgressData,
  StudentLessonProgressLabels,
  LessonProgressItem,
} from './types';
import { DEFAULT_LESSON_PROGRESS_LABELS } from './types';
import { cn } from '../../utils/utils';

/**
 * Nested accordion item for lesson progress
 */
interface LessonAccordionItemProps {
  item: LessonProgressItem;
  noDataMessage: string;
  level?: number;
}

const LessonAccordionItem = ({
  item,
  noDataMessage,
  level = 0,
}: LessonAccordionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const hasNoData = item.status === 'no_data' || item.progress === null;
  const progressValue = item.progress ?? 0;

  // Indentation based on level
  const paddingLeft = level > 0 ? `${level * 16}px` : undefined;

  return (
    <div className="flex flex-col">
      {/* Item row */}
      <button
        type="button"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        disabled={!hasChildren}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-4 text-left transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-950 focus:ring-inset rounded-xl',
          hasChildren && 'cursor-pointer hover:bg-background-50',
          !hasChildren && 'cursor-default',
          level > 0 && 'border-t border-border-50'
        )}
        style={{ paddingLeft }}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* Level 0: Topic with progress bar */}
        {level === 0 ? (
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <Text size="lg" weight="bold" className="text-text-950">
              {item.topic}
            </Text>
            {hasNoData ? (
              <Text size="xs" className="text-text-500">
                {noDataMessage}
              </Text>
            ) : (
              <div className="flex flex-row items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    value={progressValue}
                    variant="green"
                    size="medium"
                  />
                </div>
                <Text
                  size="xs"
                  weight="medium"
                  className="text-text-950 whitespace-nowrap"
                >
                  {Math.round(progressValue)}%
                </Text>
              </div>
            )}
          </div>
        ) : (
          /* Level 1+: Subtopic/lesson with only percentage */
          <div className="flex items-center justify-between flex-1 min-w-0">
            <Text size="md" weight="medium" className="text-text-950">
              {item.topic}
            </Text>
            {!hasNoData && (
              <Text
                size="xs"
                weight="medium"
                className="text-text-500 whitespace-nowrap"
              >
                {Math.round(progressValue)}%
              </Text>
            )}
          </div>
        )}

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

      {/* Children (expanded content) */}
      {hasChildren && (
        <div
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="pl-4">
            {item.children!.map((child) => (
              <LessonAccordionItem
                key={child.id}
                item={child}
                noDataMessage={noDataMessage}
                level={level + 1}
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
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-6 bg-background-200 rounded w-48" />
    <div className="flex flex-row gap-3">
      <div className="w-[107px] h-[107px] bg-background-200 rounded-full" />
      <div className="flex-1 h-[107px] bg-background-200 rounded-xl" />
      <div className="flex-1 h-[107px] bg-background-200 rounded-xl" />
    </div>
    <div className="h-6 bg-background-200 rounded w-36 mt-4" />
    <div className="flex flex-col gap-2">
      <div className="h-20 bg-background-200 rounded-xl" />
      <div className="h-20 bg-background-200 rounded-xl" />
      <div className="h-20 bg-background-200 rounded-xl" />
    </div>
  </div>
);

/**
 * Error state component
 */
const ErrorContent = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <Text
      as="span"
      className="size-12 rounded-full bg-error-100 flex items-center justify-center"
    >
      <XCircleIcon size={24} className="text-error-700" weight="fill" />
    </Text>
    <Text size="md" className="text-error-700 text-center">
      {message}
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
        <MagnifyingGlass size={14} className="text-primary-800" weight="bold" />
      </Text>
      <Text size="md" className="text-text-950">
        {data.name}
      </Text>
    </div>

    {/* Stats cards row */}
    <div className="grid grid-cols-3 gap-3">
      {/* Completion rate circle */}
      <div className="flex items-center justify-center">
        <ProgressCircle
          value={data.overallCompletionRate}
          variant="green"
          size="small"
          label={labels.completionRateLabel}
          showPercentage
        />
      </div>

      {/* Best result card */}
      <CardActivitiesResults
        icon={<Medal size={16} weight="regular" className="text-text-950" />}
        title={labels.bestResultLabel}
        subTitle={data.bestResult || '-'}
        header=""
        action="success"
      />

      {/* Biggest difficulty card */}
      <CardActivitiesResults
        icon={<SealWarning size={16} weight="regular" className="text-white" />}
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
          {data.lessonProgress.map((item) => (
            <div
              key={item.id}
              className="bg-background rounded-xl border border-border-50"
            >
              <LessonAccordionItem
                item={item}
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
    return <ErrorContent message={error} />;
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
 *
 * @example
 * ```tsx
 * <StudentLessonProgressModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   data={{
 *     name: 'Lucas Oliveira',
 *     overallCompletionRate: 90,
 *     bestResult: 'Fotossíntese',
 *     biggestDifficulty: 'Células',
 *     lessonProgress: [
 *       {
 *         id: '1',
 *         topic: 'Cinemática',
 *         progress: 70,
 *         status: 'in_progress',
 *         children: [
 *           { id: '1-1', topic: 'Aspectos iniciais', progress: 70, status: 'in_progress' },
 *           { id: '1-2', topic: 'Movimento uniforme', progress: 70, status: 'in_progress' },
 *         ],
 *       },
 *     ],
 *   }}
 * />
 * ```
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

  if (!data && !loading && !error) {
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
      {renderModalContent(loading, error, data, labels)}
    </Modal>
  );
};

export default StudentLessonProgressModal;
