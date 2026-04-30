import { useEffect } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { useEssayStudentDetails } from './useEssayStudentDetails';
import {
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  SimulatedPerformanceTag,
  type EssayStudentDetailsModalProps,
  type EssayCompetencyPerformance,
} from './types';

/**
 * Map performance tag to Badge action type
 */
const PERFORMANCE_TAG_TO_BADGE_ACTION: Record<
  SimulatedPerformanceTag,
  'success' | 'info' | 'warning' | 'error'
> = {
  [SimulatedPerformanceTag.HIGHLIGHT]: 'success',
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: 'info',
  [SimulatedPerformanceTag.BELOW_AVERAGE]: 'warning',
  [SimulatedPerformanceTag.ATTENTION_POINT]: 'error',
};

const DEFAULT_LABELS = {
  loading: 'Carregando...',
  noData: 'Nenhum dado encontrado',
  competencies: 'Competências',
  noCompetencies: 'Nenhuma competência encontrada',
  essays: 'redações',
};

/**
 * Format percentage rounded
 */
function formatPercentageRounded(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Modal for displaying essay student performance details
 * Shows 5 ENEM competencies with their average scores
 */
export function EssayStudentDetailsModal({
  api,
  isOpen,
  onClose,
  userInstitutionId,
  studentName,
  period,
  schoolIds,
  schoolYearIds,
  classIds,
  labels: customLabels,
}: EssayStudentDetailsModalProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const { data, loading, error, fetchDetails, reset } =
    useEssayStudentDetails(api);

  // Fetch details when modal opens
  useEffect(() => {
    if (isOpen && userInstitutionId) {
      fetchDetails({
        userInstitutionId,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
      });
    }
  }, [
    isOpen,
    userInstitutionId,
    period,
    schoolIds,
    schoolYearIds,
    classIds,
    fetchDetails,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const modalTitle = `Desempenho de ${studentName || 'Estudante'}`;

  // Render loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex flex-col gap-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
            <div className="flex flex-col gap-2">
              <SkeletonRounded className="h-5 w-40" />
              <SkeletonRounded className="h-4 w-32" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <SkeletonRounded className="h-6 w-16" />
              <SkeletonRounded className="h-5 w-24" />
            </div>
          </div>

          {/* Competencies skeleton */}
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl"
              >
                <SkeletonRounded className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <SkeletonRounded className="h-4 w-3/4" />
                </div>
                <SkeletonRounded className="h-3 w-32" />
                <SkeletonRounded className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  // Render error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-error-500">
            {error}
          </Text>
        </div>
      </Modal>
    );
  }

  // Render empty state
  if (!data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-text-500">
            {labels.noData}
          </Text>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="flex flex-col gap-4">
        {/* Student header card */}
        <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
          <div className="flex flex-col gap-1">
            <Text size="md" weight="semibold" className="text-text-950">
              {data.student.name}
            </Text>
            <Text size="sm" className="text-text-500">
              {data.student.school} - {data.student.class}
            </Text>
            <Text size="xs" className="text-text-400">
              {data.essaysCount}{' '}
              {data.essaysCount === 1 ? 'redação' : labels.essays}
            </Text>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1">
              <Text size="lg" weight="bold" className="text-text-950">
                {Math.round(data.overallAverage)}
              </Text>
              <Text size="xs" className="text-text-400">
                / 1000
              </Text>
            </div>
            <Text size="sm" className="text-text-500">
              {formatPercentageRounded(data.overallPercentage)}
            </Text>
            <Badge
              variant="solid"
              action={PERFORMANCE_TAG_TO_BADGE_ACTION[data.performance]}
              size="small"
            >
              {SIMULATED_PERFORMANCE_TAG_CONFIG[data.performance].label}
            </Badge>
          </div>
        </div>

        {/* Section title */}
        <Text size="sm" weight="semibold" className="text-text-700">
          {labels.competencies}
        </Text>

        {/* List of competencies */}
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {data.competencies.length > 0 ? (
            data.competencies.map((competency) => (
              <CompetencyItem key={competency.number} competency={competency} />
            ))
          ) : (
            <Text size="sm" className="text-text-500 text-center py-4">
              {labels.noCompetencies}
            </Text>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Competency item component
 */
function CompetencyItem({
  competency,
}: {
  readonly competency: EssayCompetencyPerformance;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl">
      {/* Competency number badge */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 flex-shrink-0">
        <Text size="sm" weight="bold" className="text-rose-600">
          {competency.number}
        </Text>
      </div>

      {/* Competency info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {competency.name}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={competency.averagePercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1 flex-shrink-0 min-w-[60px] justify-end">
        <Text size="sm" weight="semibold" className="text-success-600">
          {Math.round(competency.averageScore)}
        </Text>
        <Text size="xs" className="text-text-500">
          / 200
        </Text>
      </div>
    </div>
  );
}
