import { useMemo, type ReactNode } from 'react';
import { UserIcon, TrophyIcon, XCircleIcon } from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { CardAccordation } from '../Accordation/Accordation';
import type {
  StudentPerformanceDetailsModalProps,
  StudentPerformanceDetailsData,
  StudentPerformanceDetailsLabels,
  ActivityProgress,
} from './types';
import { DEFAULT_PERFORMANCE_DETAILS_LABELS } from './types';

/**
 * Performance stat card with colored header and white footer
 * Used for NOTA, CORRETAS, INCORRETAS cards
 */
interface PerformanceStatCardProps {
  /** Icon to display */
  icon: ReactNode;
  /** Card label (e.g., "NOTA") */
  label: string;
  /** Main value (e.g., "9.0" or "8") */
  value: string | number;
  /** Secondary label (e.g., "DESEMPENHO") */
  secondaryLabel: string;
  /** Badge text (e.g., "Acima da média") */
  badgeText: string | null;
  /** Color variant */
  variant: 'orange' | 'green' | 'red';
}

const STAT_CARD_COLORS = {
  orange: {
    headerBg: 'bg-warning-background',
    iconBg: 'bg-warning-300',
    valueColor: 'text-warning-600',
    secondaryLabelColor: 'text-warning-500',
  },
  green: {
    headerBg: 'bg-success-200',
    iconBg: 'bg-warning-300',
    valueColor: 'text-success-700',
    secondaryLabelColor: 'text-success-600',
  },
  red: {
    headerBg: 'bg-error-100',
    iconBg: 'bg-error-500',
    valueColor: 'text-error-700',
    secondaryLabelColor: 'text-error-300',
  },
} as const;

/**
 * Performance stat card component
 */
const PerformanceStatCard = ({
  icon,
  label,
  value,
  secondaryLabel,
  badgeText,
  variant,
}: PerformanceStatCardProps) => {
  const colors = STAT_CARD_COLORS[variant];

  return (
    <div className="flex flex-col rounded-xl border border-border-50 bg-background overflow-hidden flex-1">
      {/* Header section with colored background */}
      <div
        className={`flex flex-col items-center justify-center px-2 sm:px-3 py-2 gap-1 ${colors.headerBg}`}
      >
        <Text
          as="span"
          className={`size-8 rounded-full flex items-center justify-center ${colors.iconBg}`}
        >
          {icon}
        </Text>
        <Text
          size="2xs"
          weight="medium"
          className="text-text-800 uppercase text-center leading-none"
        >
          {label}
        </Text>
        <Text
          size="xl"
          weight="bold"
          className={`${colors.valueColor} text-center`}
        >
          {value}
        </Text>
      </div>

      {/* Footer section with white background */}
      <div className="flex flex-col items-center gap-2 px-2 sm:px-3 py-2">
        <Text
          size="2xs"
          weight="medium"
          className={`${colors.secondaryLabelColor} uppercase text-center`}
        >
          {secondaryLabel}
        </Text>
        <Badge size="large" action="info">
          {badgeText || '-'}
        </Badge>
      </div>
    </div>
  );
};

/**
 * Metric card for secondary/tertiary stats
 * Used for ATIVIDADES REALIZADAS, CONTEÚDOS, ACESSOS, etc.
 */
interface MetricCardProps {
  /** Card label */
  label: string;
  /** Value to display */
  value: string | number;
}

const MetricCard = ({ label, value }: MetricCardProps) => (
  <div className="flex flex-col items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl border border-border-50 bg-background">
    <Text
      size="2xs"
      weight="medium"
      className="text-text-600 uppercase text-center"
    >
      {label}
    </Text>
    <Badge size="large" action="info">
      {value}
    </Badge>
  </div>
);

/**
 * Activity progress card with expandable accordion content
 */
interface ActivityCardProps {
  /** Activity data */
  activity: ActivityProgress;
  /** No data message */
  noDataMessage: string;
}

const ActivityAccordionCard = ({
  activity,
  noDataMessage,
}: ActivityCardProps) => {
  const hasData = !activity.hasNoData && activity.totalCount > 0;
  const progressPercentage = hasData
    ? (activity.correctCount / activity.totalCount) * 100
    : 0;

  return (
    <CardAccordation
      value={activity.id}
      className="bg-background rounded-xl border border-border-50"
      triggerClassName="p-4"
      contentClassName="px-4 pb-4"
      trigger={
        <div className="flex flex-col gap-2 flex-1">
          <Text size="lg" weight="bold" className="text-text-950">
            {activity.name}
          </Text>
          {hasData ? (
            <div className="flex flex-row items-center gap-2">
              <div className="flex-1">
                <ProgressBar
                  value={progressPercentage}
                  variant="green"
                  size="medium"
                />
              </div>
              <Text
                size="xs"
                weight="medium"
                className="text-text-950 whitespace-nowrap"
              >
                {activity.correctCount} de {activity.totalCount} corretas
              </Text>
            </div>
          ) : (
            <Text size="xs" className="text-text-500">
              {noDataMessage}
            </Text>
          )}
        </div>
      }
    >
      <Text size="sm" className="text-text-700">
        {activity.description || 'Detalhes da atividade não disponíveis.'}
      </Text>
    </CardAccordation>
  );
};

/**
 * Loading skeleton for the modal content
 */
const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-6 bg-background-200 rounded w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="h-48 bg-background-200 rounded-xl" />
      <div className="h-48 bg-background-200 rounded-xl" />
      <div className="h-48 bg-background-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
 * Performance content when data is available
 */
const PerformanceContent = ({
  data,
  labels,
}: {
  data: StudentPerformanceDetailsData;
  labels: StudentPerformanceDetailsLabels;
}) => (
  <div className="flex flex-col gap-4">
    {/* Student name with icon */}
    <div className="flex items-center gap-2 pt-2">
      <Text
        as="span"
        className="size-6 rounded-full bg-primary-100 flex items-center justify-center"
      >
        <UserIcon size={14} className="text-primary-800" weight="fill" />
      </Text>
      <Text size="md" className="text-text-950">
        {data.studentName}
      </Text>
    </div>

    {/* Main stats row - 3 colored cards */}
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {/* NOTA card */}
      <PerformanceStatCard
        icon={<TrophyIcon size={16} weight="fill" className="text-white" />}
        label={labels.gradeLabel}
        value={data.grade.value.toFixed(1)}
        secondaryLabel={labels.performanceTagLabel}
        badgeText={data.grade.performanceLabel}
        variant="orange"
      />

      {/* CORRETAS card */}
      <PerformanceStatCard
        icon={<TrophyIcon size={16} weight="fill" className="text-text-950" />}
        label={labels.correctQuestionsLabel}
        value={data.correctQuestions.value}
        secondaryLabel={labels.bestResultLabel}
        badgeText={data.correctQuestions.bestResultTopic}
        variant="green"
      />

      {/* INCORRETAS card */}
      <PerformanceStatCard
        icon={<XCircleIcon size={16} weight="fill" className="text-white" />}
        label={labels.incorrectQuestionsLabel}
        value={data.incorrectQuestions.value}
        secondaryLabel={labels.hardestTopicLabel}
        badgeText={data.incorrectQuestions.hardestTopic}
        variant="red"
      />
    </div>

    {/* Secondary stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      <MetricCard
        label={labels.activitiesLabel}
        value={data.activitiesCompleted}
      />
      <MetricCard label={labels.contentsLabel} value={data.contentsCompleted} />
      <MetricCard
        label={labels.questionsLabel}
        value={data.questionsAnswered}
      />
    </div>

    {/* Tertiary stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
      <MetricCard label={labels.accessCountLabel} value={data.accessCount} />
      <MetricCard label={labels.timeOnlineLabel} value={data.timeOnline} />
      <MetricCard label={labels.lastLoginLabel} value={data.lastLogin} />
    </div>

    {/* Activities progress section */}
    {data.activities.length > 0 && (
      <div className="flex flex-col gap-4 pt-4">
        <Text size="lg" weight="bold" className="text-text-950">
          {labels.activitiesProgressTitle}
        </Text>
        <div className="flex flex-col gap-2">
          {data.activities.map((activity) => (
            <ActivityAccordionCard
              key={activity.id}
              activity={activity}
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
  data: StudentPerformanceDetailsData | null,
  labels: StudentPerformanceDetailsLabels
): ReactNode => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorContent message={error} />;
  }

  if (data) {
    return <PerformanceContent data={data} labels={labels} />;
  }

  return null;
};

/**
 * StudentPerformanceDetailsModal component
 *
 * Displays a modal with detailed student performance information including:
 * - Student name with profile icon
 * - Three main stat cards (grade, correct questions, incorrect questions)
 * - Six metric cards (activities, contents, questions, access, time, last login)
 * - Expandable list of activity progress
 *
 * @example
 * ```tsx
 * <StudentPerformanceDetailsModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   data={{
 *     studentName: 'Fernanda Rocha',
 *     grade: { value: 9.0, performanceLabel: 'Acima da média' },
 *     correctQuestions: { value: 8, bestResultTopic: 'Fotossíntese' },
 *     incorrectQuestions: { value: 7, hardestTopic: 'Células' },
 *     activitiesCompleted: 10,
 *     contentsCompleted: 2,
 *     questionsAnswered: 40,
 *     accessCount: '00',
 *     timeOnline: '00:00:00',
 *     lastLogin: '00/00/0000 • 00:00h',
 *     activities: [
 *       { id: '1', name: 'Atividade 1', correctCount: 30, totalCount: 50 },
 *       { id: '2', name: 'Atividade 2', correctCount: 0, totalCount: 0, hasNoData: true },
 *     ],
 *   }}
 * />
 * ```
 */
export const StudentPerformanceDetailsModal = ({
  isOpen,
  onClose,
  data,
  loading = false,
  error = null,
  labels: customLabels,
}: StudentPerformanceDetailsModalProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_PERFORMANCE_DETAILS_LABELS, ...customLabels }),
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

export default StudentPerformanceDetailsModal;
