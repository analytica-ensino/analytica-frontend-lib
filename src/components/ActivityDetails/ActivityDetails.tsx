import { useState, useMemo, useCallback, useEffect } from 'react';
import { Medal, Star, File, CaretRight, WarningCircle } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import EmptyState from '../EmptyState/EmptyState';
import {
  SkeletonText,
  SkeletonRounded,
  SkeletonTable,
} from '../Skeleton/Skeleton';
import { TableProvider } from '../TableProvider/TableProvider';
import CorrectActivityModal from '../CorrectActivityModal/CorrectActivityModal';
import { getSubjectInfo, type SubjectData } from '../SubjectInfo/SubjectInfo';
import { useMobile } from '../../hooks/useMobile';
import { cn } from '../../utils/utils';
import { SubjectEnum } from '../../enums/SubjectEnum';
import type { ColumnConfig, TableParams } from '../TableProvider/TableProvider';
import type { StudentActivityCorrectionData } from '../../types/studentActivityCorrection';
import {
  STUDENT_ACTIVITY_STATUS,
  type ActivityDetailsData,
  type ActivityDetailsQueryParams,
  type ActivityStudentTableItem,
  type StudentActivityStatus,
} from '../../types/activityDetails';
import {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
} from '../../utils/activityDetailsUtils';

/**
 * Props for the ActivityDetails component
 */
export interface ActivityDetailsProps {
  /** Activity ID to display details for */
  activityId: string;
  /** Function to fetch activity details. Must be memoized (using useCallback) to prevent re-fetches on every render. */
  fetchActivityDetails: (
    id: string,
    params?: ActivityDetailsQueryParams
  ) => Promise<ActivityDetailsData>;
  /** Function to fetch student correction data */
  fetchStudentCorrection: (
    activityId: string,
    studentId: string,
    studentName: string
  ) => Promise<StudentActivityCorrectionData>;
  /** Function to submit observation */
  submitObservation: (
    activityId: string,
    studentId: string,
    observation: string,
    files: File[]
  ) => Promise<void>;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when view activity button is clicked */
  onViewActivity?: () => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
}

/**
 * Create table columns configuration
 * @param onCorrectActivity - Callback for correction action
 * @returns Column configuration array
 */
const createTableColumns = (
  onCorrectActivity: (studentId: string) => void
): ColumnConfig<ActivityStudentTableItem>[] => [
  {
    key: 'studentName',
    label: 'Aluno',
    sortable: true,
    render: (value: unknown) => {
      const name = typeof value === 'string' ? value : '';
      return (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Text className="text-xs font-semibold text-primary-700">
              {name.charAt(0).toUpperCase()}
            </Text>
          </div>
          <Text className="text-sm font-normal text-text-950">{name}</Text>
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (value: unknown) => {
      const config = getStatusBadgeConfig(value as StudentActivityStatus);
      return (
        <Badge
          className={`${config.bgColor} ${config.textColor} text-xs px-2 py-1`}
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    key: 'answeredAt',
    label: 'Respondido em',
    sortable: true,
    render: (value: unknown) => {
      if (!value || typeof value !== 'string') {
        return <Text className="text-sm text-text-400">-</Text>;
      }
      return (
        <Text className="text-sm text-text-700">
          {formatDateToBrazilian(value)}
        </Text>
      );
    },
  },
  {
    key: 'timeSpent',
    label: 'Duração',
    sortable: false,
    render: (value: unknown) =>
      Number(value) > 0 ? (
        <Text className="text-sm text-text-700">
          {formatTimeSpent(Number(value))}
        </Text>
      ) : (
        <Text className="text-sm text-text-400">-</Text>
      ),
  },
  {
    key: 'score',
    label: 'Nota',
    sortable: true,
    render: (value: unknown) =>
      value === null ? (
        <Text className="text-sm text-text-400">-</Text>
      ) : (
        <Text className="text-sm font-semibold text-text-950">
          {Number(value).toFixed(1)}
        </Text>
      ),
  },
  {
    key: 'actions',
    label: 'Resultado',
    sortable: false,
    render: (_value: unknown, row: ActivityStudentTableItem) => {
      if (row.status === STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO) {
        return (
          <Button
            variant="outline"
            size="small"
            onClick={() => onCorrectActivity(row.studentId)}
            className="text-xs"
          >
            Corrigir atividade
          </Button>
        );
      }

      if (
        row.status === STUDENT_ACTIVITY_STATUS.CONCLUIDO ||
        row.status === STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE
      ) {
        return (
          <Button
            variant="link"
            size="small"
            onClick={() => onCorrectActivity(row.studentId)}
            className="text-xs"
          >
            Ver detalhes
          </Button>
        );
      }

      return null;
    },
  },
];

/**
 * ActivityDetails component
 * Displays detailed information about an activity including statistics and student progress
 */
export const ActivityDetails = ({
  activityId,
  fetchActivityDetails,
  fetchStudentCorrection,
  submitObservation,
  onBack,
  onViewActivity,
  emptyStateImage,
  mapSubjectNameToEnum,
}: ActivityDetailsProps) => {
  const { isMobile } = useMobile();

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<
    'name' | 'score' | 'answeredAt' | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    undefined
  );

  // Data state
  const [data, setData] = useState<ActivityDetailsData | null>(null);
  const [correctionData, setCorrectionData] =
    useState<StudentActivityCorrectionData | null>(null);

  // Loading/Error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnlyModal, setIsViewOnlyModal] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  /**
   * Fetch activity details when params change
   */
  useEffect(() => {
    const loadData = async () => {
      if (!activityId) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchActivityDetails(activityId, {
          page,
          limit,
          sortBy,
          sortOrder,
        });
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar detalhes'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activityId, page, limit, sortBy, sortOrder, fetchActivityDetails]);

  /**
   * Handle correct activity button click
   */
  const handleCorrectActivity = useCallback(
    async (studentId: string) => {
      const student = data?.students.find((s) => s.studentId === studentId);
      if (!student || !activityId) return;

      const isViewOnly =
        student.status !== STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO;
      setIsViewOnlyModal(isViewOnly);

      setCorrectionError(null);
      try {
        const correction = await fetchStudentCorrection(
          activityId,
          studentId,
          student.studentName || 'Aluno'
        );
        setCorrectionData(correction);
        setIsModalOpen(true);
      } catch (err) {
        console.error('Failed to fetch student correction:', err);
        setCorrectionError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar dados de correção'
        );
      }
    },
    [data?.students, activityId, fetchStudentCorrection]
  );

  /**
   * Handle modal close
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Handle observation submit
   * @param studentId - Student ID from modal (passed explicitly to avoid stale closure)
   * @param observation - Observation text
   * @param files - Attached files
   */
  const handleObservationSubmit = useCallback(
    async (studentId: string, observation: string, files: File[]) => {
      if (!activityId || !studentId) return;
      try {
        await submitObservation(activityId, studentId, observation, files);
      } catch (err) {
        console.error('Failed to submit observation:', err);
      }
    },
    [activityId, submitObservation]
  );

  /**
   * Convert student data to table format
   */
  const tableData: ActivityStudentTableItem[] = useMemo(() => {
    if (!data?.students) return [];

    return data.students.map((student) => ({
      id: student.studentId,
      studentId: student.studentId,
      studentName: student.studentName,
      status: student.status,
      answeredAt: student.answeredAt,
      timeSpent: student.timeSpent,
      score: student.score,
    }));
  }, [data?.students]);

  /**
   * Table columns configuration
   */
  const columns = useMemo(
    () => createTableColumns(handleCorrectActivity),
    [handleCorrectActivity]
  );

  /**
   * Handle table parameters change
   */
  const handleTableParamsChange = (params: TableParams) => {
    if (params.page) setPage(params.page);
    if (params.limit) setLimit(params.limit);
    if (params.sortBy !== undefined) {
      // Map table column keys to API parameter names
      const sortByMap: Record<string, 'name' | 'score' | 'answeredAt'> = {
        studentName: 'name',
        answeredAt: 'answeredAt',
        score: 'score',
      };
      setSortBy(params.sortBy ? sortByMap[params.sortBy] : undefined);
    }
    if (params.sortOrder !== undefined) {
      setSortOrder(params.sortOrder as 'asc' | 'desc' | undefined);
    }
  };

  /**
   * Handle view activity button click
   */
  const handleViewActivity = () => {
    if (onViewActivity) {
      onViewActivity();
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  /**
   * Get subject info for icon display
   */
  const subjectEnum =
    data?.activity?.subjectName && mapSubjectNameToEnum
      ? mapSubjectNameToEnum(data.activity.subjectName)
      : null;
  const subjectInfo: SubjectData | null = subjectEnum
    ? getSubjectInfo(subjectEnum)
    : null;

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden">
        <div className="flex flex-col w-full h-full max-w-[1150px] mx-auto z-10 lg:px-0 px-4 pt-4 gap-4">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 py-4">
            <SkeletonText width={100} height={14} />
          </div>

          {/* Header Card Skeleton */}
          <SkeletonRounded className="w-full h-[120px]" />

          {/* Statistics Cards Skeleton */}
          <div
            className={cn(
              'grid gap-5',
              isMobile ? 'grid-cols-2' : 'grid-cols-5'
            )}
          >
            {[
              'total-students',
              'completed',
              'pending',
              'avg-score',
              'avg-time',
            ].map((id) => (
              <SkeletonRounded key={id} className="w-full h-[150px]" />
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="w-full bg-background rounded-xl p-6">
            <SkeletonTable rows={5} columns={6} showHeader />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex flex-col w-full h-auto relative justify-center items-center mb-5">
        <div className="flex flex-col w-full h-full max-w-[1150px] mx-auto z-10 lg:px-0 px-4 pt-4">
          <EmptyState
            image={emptyStateImage}
            title="Erro ao carregar detalhes"
            description={
              error || 'Não foi possível carregar os detalhes da atividade'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden">
      {/* Main container */}
      <div className="flex flex-col w-full h-full max-w-[1150px] mx-auto z-10 lg:px-0 px-4 pt-4 gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4">
          <button
            onClick={handleBack}
            className="text-text-500 hover:text-text-700 text-sm font-bold underline"
          >
            Atividades
          </button>
          <CaretRight size={16} className="text-text-500" />
          <Text className="text-text-950 text-sm font-bold">
            {data.activity?.title || 'Atividade'}
          </Text>
        </div>

        {/* Activity header card */}
        {data.activity && (
          <div className="bg-background rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <Text className="text-2xl font-bold text-text-950">
                  {data.activity.title}
                </Text>
                <div className="flex items-center gap-2 flex-wrap">
                  <Text className="text-sm text-text-500">
                    Início{' '}
                    {data.activity.startDate
                      ? formatDateToBrazilian(data.activity.startDate)
                      : '00/00/0000'}
                  </Text>
                  <span className="w-1 h-1 rounded-full bg-text-500" />
                  <Text className="text-sm text-text-500">
                    Prazo final{' '}
                    {data.activity.finalDate
                      ? formatDateToBrazilian(data.activity.finalDate)
                      : '00/00/0000'}
                  </Text>
                  <span className="w-1 h-1 rounded-full bg-text-500" />
                  <Text className="text-sm text-text-500">
                    {data.activity.schoolName}
                  </Text>
                  <span className="w-1 h-1 rounded-full bg-text-500" />
                  <Text className="text-sm text-text-500">
                    {data.activity.year}
                  </Text>
                  <span className="w-1 h-1 rounded-full bg-text-500" />
                  {subjectInfo ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          'w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0',
                          subjectInfo.colorClass
                        )}
                      >
                        {subjectInfo.icon}
                      </span>
                      <Text className="text-sm text-text-500">
                        {data.activity.subjectName}
                      </Text>
                    </div>
                  ) : (
                    <Text className="text-sm text-text-500">
                      {data.activity.subjectName}
                    </Text>
                  )}
                  <span className="w-1 h-1 rounded-full bg-text-500" />
                  <Text className="text-sm text-text-500">
                    {data.activity.className}
                  </Text>
                </div>
              </div>
              <Button
                size="small"
                onClick={handleViewActivity}
                className="bg-primary-950 text-text gap-2"
              >
                <File size={16} />
                Ver atividade
              </Button>
            </div>
          </div>
        )}

        {/* Statistics cards */}
        <div
          className={cn('grid gap-5', isMobile ? 'grid-cols-2' : 'grid-cols-5')}
        >
          {/* Completion percentage */}
          <div className="border border-border-50 rounded-xl py-4 px-0 flex flex-col items-center justify-center gap-2 bg-primary-50">
            <div className="relative w-[90px] h-[90px]">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="45"
                  cy="45"
                  r="40"
                  stroke="var(--color-primary-100)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="45"
                  cy="45"
                  r="40"
                  stroke="var(--color-primary-700)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(data.generalStats.completionPercentage / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Text className="text-xl font-medium text-primary-600">
                  {Math.round(data.generalStats.completionPercentage)}%
                </Text>
                <Text className="text-2xs font-bold text-text-600 uppercase">
                  Concluído
                </Text>
              </div>
            </div>
          </div>

          {/* Average score */}
          <div className="border border-border-50 rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1 bg-warning-background">
            <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-warning-300">
              <Star size={16} className="text-white" weight="regular" />
            </div>
            <Text className="text-2xs font-bold uppercase text-center text-warning-600">
              Média da Turma
            </Text>
            <Text className="text-xl font-bold text-warning-600">
              {data.generalStats.averageScore.toFixed(1)}
            </Text>
          </div>

          {/* Most correct questions */}
          <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-success-200">
            <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-indicator-positive">
              <Medal size={16} className="text-text-950" weight="regular" />
            </div>
            <Text className="text-2xs font-bold uppercase text-center text-success-700">
              Questões com mais acertos
            </Text>
            <Text className="text-xl font-bold text-success-700">
              {formatQuestionNumbers(data.questionStats.mostCorrect)}
            </Text>
          </div>

          {/* Most incorrect questions */}
          <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-error-100">
            <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-indicator-negative">
              <WarningCircle
                size={16}
                className="text-white"
                weight="regular"
              />
            </div>
            <Text className="text-2xs font-bold uppercase text-center text-error-700">
              Questões com mais erros
            </Text>
            <Text className="text-xl font-bold text-error-700">
              {formatQuestionNumbers(data.questionStats.mostIncorrect)}
            </Text>
          </div>

          {/* Not answered questions */}
          <div className="border border-border-50 rounded-xl py-2 px-3 flex flex-col items-center justify-center gap-1 bg-info-background">
            <div className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center bg-info-500">
              <WarningCircle
                size={16}
                className="text-white"
                weight="regular"
              />
            </div>
            <Text className="text-2xs font-bold uppercase text-center text-info-700">
              Questões não respondidas
            </Text>
            <Text className="text-xl font-bold text-info-700">
              {formatQuestionNumbers(data.questionStats.notAnswered)}
            </Text>
          </div>
        </div>

        {/* Correction error message */}
        {correctionError && (
          <div className="w-full bg-error-50 border border-error-200 rounded-xl p-4 flex items-center gap-3">
            <WarningCircle size={20} className="text-error-600" weight="fill" />
            <Text className="text-error-700 text-sm">{correctionError}</Text>
          </div>
        )}

        {/* Students table */}
        <div className="w-full bg-background rounded-xl p-6 space-y-4">
          <TableProvider<ActivityStudentTableItem>
            data={tableData}
            headers={columns}
            loading={false}
            variant="borderless"
            enableTableSort
            enablePagination
            paginationConfig={{
              itemLabel: 'alunos',
              itemsPerPageOptions: [10, 20, 50],
              defaultItemsPerPage: 10,
              totalItems: data.pagination.total,
              totalPages: data.pagination.totalPages,
            }}
            emptyState={{
              component: (
                <EmptyState
                  image={emptyStateImage}
                  title="Nenhum aluno encontrado"
                  description="Não há alunos matriculados nesta atividade"
                />
              ),
            }}
            onParamsChange={handleTableParamsChange}
          >
            {({ table, pagination }) => (
              <>
                {table}
                {pagination}
              </>
            )}
          </TableProvider>
        </div>
      </div>

      {/* Correct Activity Modal */}
      <CorrectActivityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={correctionData}
        isViewOnly={isViewOnlyModal}
        onObservationSubmit={handleObservationSubmit}
      />
    </div>
  );
};

export default ActivityDetails;
