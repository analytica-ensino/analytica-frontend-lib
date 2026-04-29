import { useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { useEssayCompetenceDetails } from './useEssayCompetenceDetails';
import {
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  type EssayCompetenceDetailsModalProps,
  type EssayCompetenceStudentItem,
  type SimulatedPerformanceTag,
} from './types';

/**
 * Map performance tag to Badge action type
 */
const PERFORMANCE_TAG_TO_BADGE_ACTION: Record<
  SimulatedPerformanceTag,
  'success' | 'info' | 'warning' | 'error'
> = {
  HIGHLIGHT: 'success',
  ABOVE_AVERAGE: 'info',
  BELOW_AVERAGE: 'warning',
  ATTENTION_POINT: 'error',
};

const DEFAULT_LABELS = {
  loading: 'Carregando...',
  noData: 'Nenhum dado encontrado',
  noStudents: 'Nenhum estudante encontrado',
  classAverage: 'Média da turma',
  highlight: 'Destaque',
  aboveAverage: 'Acima da média',
  belowAverage: 'Abaixo da média',
  attention: 'Atenção',
  previous: 'Anterior',
  next: 'Próxima',
  page: 'Página',
  of: 'de',
};

/**
 * Format percentage rounded
 */
function formatPercentageRounded(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Modal for displaying essay competence performance details
 * Shows list of students with their scores for a specific competency
 */
export function EssayCompetenceDetailsModal({
  api,
  isOpen,
  onClose,
  competenceNumber,
  competenceName,
  period,
  schoolIds,
  schoolYearIds,
  classIds,
  labels: customLabels,
}: EssayCompetenceDetailsModalProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const { data, loading, error, fetchDetails, reset } =
    useEssayCompetenceDetails(api);

  // Fetch details when modal opens
  useEffect(() => {
    if (isOpen && competenceNumber) {
      fetchDetails({
        competenceNumber,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
        page: 1,
        limit: 20,
      });
    }
  }, [
    isOpen,
    competenceNumber,
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

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      if (!competenceNumber) return;
      fetchDetails({
        competenceNumber,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
        page,
        limit: 20,
      });
    },
    [competenceNumber, period, schoolIds, schoolYearIds, classIds, fetchDetails]
  );

  const modalTitle = competenceName || `Competência ${competenceNumber}`;

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

          {/* Counters skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonRounded key={i} className="flex-1 h-16 rounded-xl" />
            ))}
          </div>

          {/* Students skeleton */}
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonRounded key={i} className="h-16 rounded-xl" />
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

  const totalPages = Math.ceil(data.students.total / data.students.limit);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="flex flex-col gap-4">
        {/* Header card */}
        <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
          <div className="flex flex-col gap-1">
            <Text size="md" weight="semibold" className="text-text-950">
              {data.competence.name}
            </Text>
            <Text size="sm" className="text-text-500">
              {data.totalStudents}{' '}
              {data.totalStudents === 1 ? 'estudante' : 'estudantes'} -{' '}
              {data.totalEssays}{' '}
              {data.totalEssays === 1 ? 'redação' : 'redações'}
            </Text>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1">
              <Text size="lg" weight="bold" className="text-text-950">
                {Math.round(data.classAverage)}
              </Text>
              <Text size="xs" className="text-text-400">
                / 200
              </Text>
            </div>
            <Text size="sm" className="text-text-500">
              {labels.classAverage}:{' '}
              {formatPercentageRounded(data.classAveragePercentage)}
            </Text>
          </div>
        </div>

        {/* Performance counters */}
        <div className="flex gap-3">
          <CounterCard
            label={labels.highlight}
            count={data.counters.highlight}
            variant="success"
          />
          <CounterCard
            label={labels.aboveAverage}
            count={data.counters.aboveAverage}
            variant="info"
          />
          <CounterCard
            label={labels.belowAverage}
            count={data.counters.belowAverage}
            variant="warning"
          />
          <CounterCard
            label={labels.attention}
            count={data.counters.attentionPoint}
            variant="error"
          />
        </div>

        {/* Students list */}
        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
          {data.students.data.length > 0 ? (
            data.students.data.map((student) => (
              <StudentItem key={student.userInstitutionId} student={student} />
            ))
          ) : (
            <Text size="sm" className="text-text-500 text-center py-4">
              {labels.noStudents}
            </Text>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handlePageChange(data.students.page - 1)}
              disabled={data.students.page <= 1}
              className="px-3 py-1 text-sm text-text-600 hover:text-text-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {labels.previous}
            </button>
            <Text size="sm" className="text-text-500">
              {labels.page} {data.students.page} {labels.of} {totalPages}
            </Text>
            <button
              onClick={() => handlePageChange(data.students.page + 1)}
              disabled={data.students.page >= totalPages}
              className="px-3 py-1 text-sm text-text-600 hover:text-text-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {labels.next}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Counter card component
 */
function CounterCard({
  label,
  count,
  variant,
}: {
  readonly label: string;
  readonly count: number;
  readonly variant: 'success' | 'info' | 'warning' | 'error';
}) {
  const bgColors = {
    success: 'bg-success-50',
    info: 'bg-info-50',
    warning: 'bg-warning-50',
    error: 'bg-error-50',
  };

  const textColors = {
    success: 'text-success-700',
    info: 'text-info-700',
    warning: 'text-warning-700',
    error: 'text-error-700',
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl ${bgColors[variant]}`}
    >
      <Text size="lg" weight="bold" className={textColors[variant]}>
        {count}
      </Text>
      <Text size="xs" className="text-text-500 text-center">
        {label}
      </Text>
    </div>
  );
}

/**
 * Student item component
 */
function StudentItem({
  student,
}: {
  readonly student: EssayCompetenceStudentItem;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl">
      {/* Student info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {student.name}
        </Text>
        <Text size="xs" className="text-text-500 truncate">
          {student.school} - {student.class}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-24 shrink-0">
        <ProgressBar
          value={student.averagePercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1 shrink-0 min-w-[50px] justify-end">
        <Text size="sm" weight="semibold" className="text-success-600">
          {Math.round(student.averageScore)}
        </Text>
        <Text size="xs" className="text-text-500">
          / 200
        </Text>
      </div>

      {/* Performance badge */}
      <Badge
        variant="solid"
        action={PERFORMANCE_TAG_TO_BADGE_ACTION[student.performance]}
        size="small"
      >
        {SIMULATED_PERFORMANCE_TAG_CONFIG[student.performance].label}
      </Badge>
    </div>
  );
}
