import { useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { TableProvider, type TableParams } from '../TableProvider';
import { useEssayCompetenceDetails } from './useEssayCompetenceDetails';
import {
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  PERFORMANCE_TAG_TO_BADGE_ACTION,
} from '../SimulatedStudentDetailsModal/types';
import type {
  EssayCompetenceDetailsModalProps,
  EssayCompetenceStudentItem,
} from './types';

/**
 * Table columns configuration
 */
const TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Nome',
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'school',
    label: 'Escola',
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'schoolYear',
    label: 'Ano',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '80px',
  },
  {
    key: 'class',
    label: 'Turma',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '80px',
  },
  {
    key: 'averageScore',
    label: 'Média',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as EssayCompetenceStudentItem;
      return (
        <Text size="sm" color="text-text-950">
          {Math.round(student.averageScore)}/200
        </Text>
      );
    },
  },
  {
    key: 'performance',
    label: 'Proficiência',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '140px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as EssayCompetenceStudentItem;
      return (
        <Badge
          variant="solid"
          action={PERFORMANCE_TAG_TO_BADGE_ACTION[student.performance]}
          size="small"
        >
          {SIMULATED_PERFORMANCE_TAG_CONFIG[student.performance].label}
        </Badge>
      );
    },
  },
];

/**
 * Modal for displaying essay competence performance details
 * Shows table of students with their scores for a specific competency
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
}: EssayCompetenceDetailsModalProps) {
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
        limit: 10,
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

  // Handle table params change (pagination)
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      if (!competenceNumber) return;
      fetchDetails({
        competenceNumber,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
        page: params.page,
        limit: params.limit,
      });
    },
    [competenceNumber, period, schoolIds, schoolYearIds, classIds, fetchDetails]
  );

  const modalTitle = competenceNumber
    ? `C${competenceNumber} - ${competenceName || `Competência ${competenceNumber}`}`
    : 'Detalhes da Competência';

  // Render loading state
  if (loading && !data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
        <div className="flex flex-col gap-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-2">
            <SkeletonRounded className="h-4 w-32" />
          </div>

          {/* Counters skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <SkeletonRounded key={i} className="flex-1 h-20 rounded-xl" />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="flex flex-col gap-2">
            <SkeletonRounded className="h-10 rounded-lg" />
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonRounded key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  // Render error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
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
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-text-500">
            Nenhum dado encontrado
          </Text>
        </div>
      </Modal>
    );
  }

  // Calculate combined counter values
  const aboveAverageCount =
    data.counters.highlight + data.counters.aboveAverage;
  const belowAverageCount = data.counters.belowAverage;
  const attentionCount = data.counters.attentionPoint;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
      <div className="flex flex-col gap-6">
        {/* Subtitle */}
        <Text size="sm" className="text-text-500">
          Redação • {data.totalEssays}{' '}
          {data.totalEssays === 1 ? 'redação' : 'redações'} •{' '}
          {data.totalStudents} {data.totalStudents === 1 ? 'aluno' : 'alunos'}
        </Text>

        {/* Performance counters - 3 cards */}
        <div className="flex gap-3">
          <CounterCard
            label="Acima da média"
            count={aboveAverageCount}
            variant="success"
          />
          <CounterCard
            label="Abaixo da média"
            count={belowAverageCount}
            variant="warning"
          />
          <CounterCard
            label="Ponto de atenção"
            count={attentionCount}
            variant="error"
          />
        </div>

        {/* Students table */}
        <TableProvider
          data={data.students.data as unknown as Record<string, unknown>[]}
          headers={TABLE_COLUMNS}
          variant="borderless"
          loading={loading}
          enablePagination
          rowKey="userInstitutionId"
          paginationConfig={{
            itemLabel: 'estudantes',
            itemsPerPageOptions: [10, 20, 50],
            defaultItemsPerPage: 10,
            totalItems: data.students.total,
            totalPages: Math.ceil(data.students.total / data.students.limit),
          }}
          onParamsChange={handleParamsChange}
        />
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
  readonly variant: 'success' | 'warning' | 'error';
}) {
  const bgColors = {
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    error: 'bg-error-50',
  };

  const textColors = {
    success: 'text-success-700',
    warning: 'text-warning-700',
    error: 'text-error-700',
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl ${bgColors[variant]}`}
    >
      <Text size="2xl" weight="bold" className={textColors[variant]}>
        {count}
      </Text>
      <Text size="sm" className="text-text-600 text-center">
        {label}
      </Text>
    </div>
  );
}
