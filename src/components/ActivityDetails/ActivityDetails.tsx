import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Medal,
  Star,
  CaretRight,
  WarningCircle,
  DownloadSimple,
} from 'phosphor-react';
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
import type {
  StudentActivityCorrectionData,
  SaveQuestionCorrectionPayload,
} from '../../utils/studentActivityCorrection';
import { convertApiResponseToCorrectionData } from '../../utils/studentActivityCorrection';
import {
  STUDENT_ACTIVITY_STATUS,
  type ActivityDetailsData,
  type ActivityStudentTableItem,
  type StudentActivityStatus,
} from '../../types/activityDetails';
import {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
} from '../../utils/activityDetailsUtils';
import type { BaseApiClient } from '../../types/api';
import { useActivityDetails } from '../../hooks/useActivityDetails';
import {
  useQuestionsPdfPrint,
  QuestionsPdfContent,
} from '../QuestionsPdfGenerator';
import type { PreviewQuestion } from '../ActivityPreview/ActivityPreview';
import { convertQuestionToPreview } from '../ActivityCreate/ActivityCreate.utils';
import type { Question } from '../../types/questions';
import { createUseQuestionsList } from '../../hooks/useQuestionsList';
import useToastStore from '../Toast/utils/ToastStore';

/**
 * Props for the ActivityDetails component
 */
export interface ActivityDetailsProps {
  /** Activity ID to display details for */
  activityId: string;
  /** API client instance for making requests */
  apiClient: BaseApiClient;
  /** Callback when back button is clicked */
  onBack?: () => void;
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
 * Normalize questions with positions
 */
const normalizeWithPositions = (items: PreviewQuestion[]) =>
  items.map((item, index) => ({
    ...item,
    position: index + 1,
  }));

/**
 * ActivityDetails component
 * Displays detailed information about an activity including statistics and student progress
 */
export const ActivityDetails = ({
  activityId,
  apiClient,
  onBack,
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

  // PDF download state
  const [activityQuestions, setActivityQuestions] = useState<PreviewQuestion[]>(
    []
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [activityQuestionsError, setActivityQuestionsError] = useState<
    string | null
  >(null);

  // Toast store for notifications
  const addToast = useToastStore((state) => state.addToast);

  // Use activity details hook
  const {
    fetchActivityDetails,
    fetchStudentCorrection,
    submitObservation,
    submitQuestionCorrection,
  } = useActivityDetails(apiClient);

  // Use questions list hook for fetching questions by IDs
  // Store hook factory in ref to preserve identity across renders
  const hookFactoryRef = useRef<ReturnType<
    typeof createUseQuestionsList
  > | null>(null);
  const apiClientRef = useRef<BaseApiClient | null>(null);

  // Create hook factory only when apiClient changes
  if (apiClientRef.current !== apiClient || !hookFactoryRef.current) {
    hookFactoryRef.current = createUseQuestionsList(apiClient);
    apiClientRef.current = apiClient;
  }

  const { fetchQuestionsByIds } = hookFactoryRef.current();

  /**
   * Reset PDF/question state when activityId changes
   * Prevents printing stale data when navigating between activities
   */
  useEffect(() => {
    setActivityQuestions([]);
    setIsLoadingQuestions(false);
    setShouldPrint(false);
    setActivityQuestionsError(null);
  }, [activityId]);

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
        const apiResponse = await fetchStudentCorrection(activityId, studentId);
        // Convert API response to StudentActivityCorrectionData format
        const correction = convertApiResponseToCorrectionData(
          apiResponse,
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
   * @param files - Attached files (only first file is used)
   */
  const handleObservationSubmit = useCallback(
    async (studentId: string, observation: string, files: File[]) => {
      if (!activityId || !studentId) return;
      try {
        const file = files.length > 0 ? files[0] : null;
        await submitObservation(activityId, studentId, observation, file);
      } catch (err) {
        console.error('Failed to submit observation:', err);
      }
    },
    [activityId, submitObservation]
  );

  /**
   * Handle question correction submit
   * @param studentId - Student ID from modal
   * @param payload - Question correction payload
   */
  const handleQuestionCorrectionSubmit = useCallback(
    async (studentId: string, payload: SaveQuestionCorrectionPayload) => {
      if (!activityId || !studentId) return;
      try {
        await submitQuestionCorrection(activityId, studentId, payload);
      } catch (err) {
        console.error('Failed to submit question correction:', err);
        throw err;
      }
    },
    [activityId, submitQuestionCorrection]
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

  const orderedQuestions = useMemo(
    () => normalizeWithPositions(activityQuestions),
    [activityQuestions]
  );

  /**
   * Use PDF print hook
   */
  const { contentRef, handlePrint } = useQuestionsPdfPrint(orderedQuestions);

  /**
   * Fetch activity questions for PDF download
   * @returns Promise that resolves to true if questions were successfully loaded (non-empty), false otherwise
   */
  const fetchActivityQuestions = useCallback(async (): Promise<boolean> => {
    if (!activityId) return false;

    setIsLoadingQuestions(true);
    setActivityQuestionsError(null);
    try {
      // Try to fetch quiz which might contain questions
      let quizResponse:
        | Awaited<
            ReturnType<
              typeof apiClient.get<{
                data: { questions?: Question[]; questionIds?: string[] };
              }>
            >
          >
        | undefined;
      let quizError: Error | undefined;

      try {
        quizResponse = await apiClient.get<{
          data: { questions?: Question[]; questionIds?: string[] };
        }>(`/activities/${activityId}/quiz`);
      } catch (err) {
        quizError = err instanceof Error ? err : new Error(String(err));
      }

      let questions: Question[] = [];

      // Check if quiz response has questions directly
      if (quizResponse?.data?.data?.questions) {
        questions = quizResponse.data.data.questions;
      }
      // Or check if it has questionIds and fetch them
      else if (quizResponse?.data?.data?.questionIds) {
        questions = await fetchQuestionsByIds(
          quizResponse.data.data.questionIds
        );
      }
      // Try to fetch from activity details endpoint
      else {
        // Try alternative endpoint structure
        let activityResponse:
          | Awaited<
              ReturnType<
                typeof apiClient.get<{
                  data: { questions?: Question[]; questionIds?: string[] };
                }>
              >
            >
          | undefined;
        let activityError: Error | undefined;

        try {
          activityResponse = await apiClient.get<{
            data: { questions?: Question[]; questionIds?: string[] };
          }>(`/activities/${activityId}`);
        } catch (err) {
          activityError = err instanceof Error ? err : new Error(String(err));
        }

        // If both requests failed, surface the error
        if (!quizResponse && !activityResponse) {
          const errorMessage =
            quizError?.message ||
            activityError?.message ||
            'Erro ao buscar questões da atividade. Tente novamente.';
          console.error('Erro ao buscar questões da atividade:', {
            quizError,
            activityError,
          });
          setActivityQuestions([]);
          setActivityQuestionsError(errorMessage);
          // Show toast notification
          addToast({
            title: 'Erro ao carregar questões',
            description: errorMessage,
            variant: 'solid',
            action: 'warning',
            position: 'top-right',
          });
          return false;
        }

        if (activityResponse?.data?.data?.questions) {
          questions = activityResponse.data.data.questions;
        } else if (activityResponse?.data?.data?.questionIds) {
          questions = await fetchQuestionsByIds(
            activityResponse.data.data.questionIds
          );
        }
      }

      // Convert questions to PreviewQuestion format
      const previewQuestions = questions.map((q) =>
        convertQuestionToPreview(q)
      );
      setActivityQuestions(previewQuestions);
      // Clear error on success
      setActivityQuestionsError(null);

      // Notify user if no questions were found
      if (previewQuestions.length === 0) {
        addToast({
          title: 'Nenhuma questão encontrada',
          description: 'Esta atividade não possui questões para download.',
          variant: 'solid',
          action: 'info',
          position: 'top-right',
        });
      }

      // Return true if we have questions, false otherwise
      return previewQuestions.length > 0;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao buscar questões da atividade. Tente novamente.';
      console.error('Erro ao buscar questões da atividade:', err);
      setActivityQuestions([]);
      setActivityQuestionsError(errorMessage);
      // Show toast notification
      addToast({
        title: 'Erro ao carregar questões',
        description: errorMessage,
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
      return false;
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [activityId, apiClient, fetchQuestionsByIds, addToast]);

  /**
   * Handle download PDF button click
   */
  const handleDownloadPdf = useCallback(async () => {
    try {
      // If questions are not loaded yet, fetch them first
      if (activityQuestions.length === 0) {
        const success = await fetchActivityQuestions();
        // Only set print flag if fetch succeeded and returned questions
        setShouldPrint(success);
      } else {
        // Questions already loaded, verify they're not empty before printing
        if (activityQuestions.length > 0) {
          setShouldPrint(true);
        } else {
          setShouldPrint(false);
        }
      }
    } catch {
      // Error already handled in fetchActivityQuestions, ensure print flag is false
      setShouldPrint(false);
    }
  }, [activityQuestions.length, fetchActivityQuestions]);

  /**
   * Effect to handle PDF printing when shouldPrint flag is set
   * Waits for contentRef to be ready and questions to be loaded
   */
  useEffect(() => {
    if (!shouldPrint) {
      return;
    }

    // Guard against empty activityQuestions - reset flag if empty
    if (activityQuestions.length === 0) {
      setShouldPrint(false);
      return;
    }

    // Check if all conditions are met for printing
    if (
      contentRef.current &&
      handlePrint &&
      typeof handlePrint === 'function'
    ) {
      handlePrint();
      setShouldPrint(false);
      return;
    }

    // If conditions aren't met but shouldPrint is true, reset it to prevent getting stuck
    // This handles cases where contentRef or handlePrint aren't ready yet
    setShouldPrint(false);
  }, [shouldPrint, activityQuestions.length, contentRef, handlePrint]);

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
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="small"
                  onClick={handleDownloadPdf}
                  disabled={isLoadingQuestions}
                  iconLeft={<DownloadSimple size={16} />}
                  className="bg-primary-950 text-text gap-2"
                >
                  {isLoadingQuestions ? 'Carregando...' : 'Baixar Atividade'}
                </Button>
                {activityQuestionsError && (
                  <div className="flex items-center gap-2 max-w-[300px]">
                    <WarningCircle
                      size={16}
                      className="text-error-600 shrink-0"
                      weight="fill"
                    />
                    <Text className="text-error-700 text-xs">
                      {activityQuestionsError}
                    </Text>
                  </div>
                )}
              </div>
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
        onQuestionCorrectionSubmit={handleQuestionCorrectionSubmit}
      />

      {/* Hidden PDF content for printing */}
      <div style={{ display: 'none' }}>
        <QuestionsPdfContent ref={contentRef} questions={orderedQuestions} />
      </div>
    </div>
  );
};

export default ActivityDetails;
