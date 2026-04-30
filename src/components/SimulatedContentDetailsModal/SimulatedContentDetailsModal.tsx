import { useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { TableProvider, type TableParams } from '../TableProvider';
import { ArrowLeft } from 'phosphor-react';
import { useSimulatedContentDetails } from './useSimulatedContentDetails';
import { formatPercentageRounded } from '../../utils/utils';
import type {
  SimulatedContentDetailsModalProps,
  ContentStudentItem,
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
    key: 'average',
    label: 'Média',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as ContentStudentItem;
      return (
        <span className="text-sm font-semibold text-text-950">
          {Math.round(student.average)}
        </span>
      );
    },
  },
  {
    key: 'performance',
    label: 'Desempenho',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '160px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as ContentStudentItem;
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-20 shrink-0">
            <ProgressBar
              value={student.performance}
              variant="green"
              size="small"
            />
          </div>
          <span className="text-sm font-semibold text-text-600 w-10">
            {formatPercentageRounded(student.performance)}
          </span>
        </div>
      );
    },
  },
];

/**
 * Modal for displaying content (habilidade) performance details in simulated exams
 * Shows table of students with their individual performance for the selected content
 */
export function SimulatedContentDetailsModal({
  api,
  isOpen,
  onClose,
  activityFilters,
  contentId,
  contentName,
  period,
  filters,
}: SimulatedContentDetailsModalProps) {
  const { data, loading, error, fetchDetails, reset } =
    useSimulatedContentDetails(api);

  // Fetch content details when modal opens
  useEffect(() => {
    if (isOpen && contentId) {
      fetchDetails({
        activityFilters,
        contentId,
        period,
        schoolIds: filters?.schoolIds,
        schoolYearIds: filters?.schoolYearIds,
        classIds: filters?.classIds,
        page: 1,
        limit: 10,
      });
    }
  }, [isOpen, contentId, activityFilters, period, filters, fetchDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Handle table params change (pagination)
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      if (!contentId) return;
      fetchDetails({
        activityFilters,
        contentId,
        period,
        schoolIds: filters?.schoolIds,
        schoolYearIds: filters?.schoolYearIds,
        classIds: filters?.classIds,
        page: params.page,
        limit: params.limit,
      });
    },
    [contentId, activityFilters, period, filters, fetchDetails]
  );

  // Build modal title
  const modalTitle = (
    <span className="flex items-center gap-2">
      <button
        onClick={onClose}
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label="Fechar modal"
      >
        <ArrowLeft size={20} className="text-text-600" />
      </button>
      <span>Desempenho competência</span>
    </span>
  );

  // Render loading state
  if (loading && !data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
        <div className="flex flex-col gap-4">
          {/* Header skeleton */}
          <div className="p-4 bg-background-50 rounded-xl">
            <SkeletonRounded className="h-5 w-48 mb-2" />
            <SkeletonRounded className="h-4 w-64" />
          </div>

          {/* Counters skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonRounded key={i} className="h-20 rounded-xl" />
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
      <div className="flex flex-col gap-6">
        {/* Content header */}
        <div className="flex flex-col gap-1 p-4 bg-background-50 rounded-xl">
          <Text size="md" weight="semibold" className="text-text-950">
            {data.content.name || contentName}
          </Text>
          <div className="flex items-center gap-2">
            {data.content.bnccCode && (
              <Text size="sm" className="text-primary-600">
                {data.content.bnccCode}
              </Text>
            )}
            <Text size="sm" className="text-text-500">
              {data.content.subject.name} • {data.content.questionsCount}{' '}
              questões • {data.content.studentsCount} alunos
            </Text>
          </div>
        </div>

        {/* Performance counters */}
        <div className="grid grid-cols-3 gap-3">
          <CounterCard
            label="Acima da média"
            count={data.counters.aboveAverage}
            variant="success"
          />
          <CounterCard
            label="Na média"
            count={data.counters.atAverage}
            variant="info"
          />
          <CounterCard
            label="Abaixo da média"
            count={data.counters.belowAverage}
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
  readonly variant: 'success' | 'info' | 'error';
}) {
  const bgColors = {
    success: 'bg-success-50',
    info: 'bg-primary-50',
    error: 'bg-error-50',
  };

  const textColors = {
    success: 'text-success-700',
    info: 'text-primary-700',
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
