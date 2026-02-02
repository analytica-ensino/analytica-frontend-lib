import { useMemo, useState, useCallback } from 'react';
import Text from '../Text/Text';
import useToastStore from '../Toast/utils/ToastStore';
import { cn } from '../../utils/utils';
import type { LessonDetailsData } from '../../types/recommendedLessons';
import type { SubjectEnum } from '../../enums/SubjectEnum';
import type { BaseApiClient } from '../../types/api';
import {
  Breadcrumb,
  LessonHeader,
  LoadingSkeleton,
  ResultsSection,
  StudentsTable,
  StudentActivityPerformanceModal,
} from './components';
import { transformStudentForDisplay } from './utils/lessonDetailsUtils';
import {
  convertStudentAnswersToPerformanceData,
  type StudentAnswersResponse,
} from './utils/performanceUtils';
import {
  DEFAULT_LABELS,
  type BreadcrumbItem,
  type LessonDetailsLabels,
  type StudentActivityPerformanceData,
} from './types';

/**
 * Props for RecommendedLessonDetails component
 */
export interface RecommendedLessonDetailsProps {
  /** Lesson data to display (from API responses) */
  data: LessonDetailsData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Callback when "Ver aula" button is clicked */
  onViewLesson?: () => void;
  /**
   * API client for making requests.
   * When provided, enables the "Corrigir atividade" functionality.
   */
  apiClient?: BaseApiClient;
  /** Callback for breadcrumb navigation */
  onBreadcrumbClick?: (path: string) => void;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null;
  /** Custom breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Custom labels */
  labels?: Partial<LessonDetailsLabels>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RecommendedLessonDetails component
 *
 * Displays detailed information about a recommended lesson including:
 * - Breadcrumb navigation
 * - Lesson metadata (title, dates, school, subject, class)
 * - Results cards (completion %, best result topic, hardest topic)
 * - Students table with status, progress, and actions
 *
 * @example
 * ```tsx
 * <RecommendedLessonDetails
 *   data={{
 *     recommendedClass: recommendedClassData,       // from /recommendedClass/{id}
 *     details: detailsData, // from /recommendedClass/{id}/details
 *     breakdown: breakdown, // optional, from /recommended-class/history
 *   }}
 *   apiClient={api}
 *   onViewLesson={() => navigate('/view-lesson')}
 *   mapSubjectNameToEnum={mapSubjectNameToEnum}
 * />
 * ```
 */
const RecommendedLessonDetails = ({
  data,
  loading = false,
  error = null,
  onViewLesson,
  apiClient,
  onBreadcrumbClick,
  mapSubjectNameToEnum,
  breadcrumbs,
  labels: customLabels,
  className,
}: RecommendedLessonDetailsProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }),
    [customLabels]
  );

  // Toast store for notifications
  const addToast = useToastStore((state) => state.addToast);

  // Activity performance modal state
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [performanceData, setPerformanceData] =
    useState<StudentActivityPerformanceData | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  /**
   * Handle correct activity action
   * Fetches all activities and lessons for the student and opens the performance modal
   */
  const handleCorrectActivity = useCallback(
    async (studentId: string) => {
      if (!apiClient || !data?.recommendedClass.id) return;

      // Find student from data
      const student = data?.details.students.find(
        (s) => s.userInstitutionId === studentId
      );

      // Guard: ensure student and userId are valid before proceeding
      if (!student?.userId) {
        addToast({
          title: 'Erro ao carregar aluno',
          description: 'Não foi possível identificar o aluno. Tente novamente.',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }

      const studentName = student.name;
      const userId = student.userId;

      setPerformanceModalOpen(true);
      setPerformanceLoading(true);
      setPerformanceData(null);
      setPerformanceError(null);

      try {
        // Fetch all answers for the student in this recommended class
        const response = await apiClient.get<StudentAnswersResponse>(
          `/recommended-class/${data.recommendedClass.id}/student/${studentId}/answers`
        );

        // Convert API response to performance data format
        const performanceData = convertStudentAnswersToPerformanceData(
          response.data,
          studentId,
          userId,
          studentName
        );

        setPerformanceData(performanceData);
      } catch (err) {
        console.error('Error fetching activity performance data:', err);
        setPerformanceError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar desempenho do aluno'
        );
      } finally {
        setPerformanceLoading(false);
      }
    },
    [apiClient, data?.recommendedClass.id, data?.details.students, addToast]
  );

  /**
   * Handle close performance modal
   */
  const handleClosePerformanceModal = useCallback(() => {
    setPerformanceModalOpen(false);
    setPerformanceData(null);
    setPerformanceError(null);
  }, []);

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: 'Aulas recomendadas', path: '/aulas-recomendadas' },
      { label: data?.recommendedClass.title || 'Detalhes' },
    ],
    [data?.recommendedClass.title]
  );

  const breadcrumbItems = breadcrumbs || defaultBreadcrumbs;

  // Transform API students to display format
  const displayStudents = useMemo(() => {
    if (!data?.details.students) return [];
    const deadline = data?.recommendedClass.finalDate;
    return data.details.students.map((student) =>
      transformStudentForDisplay(student, deadline)
    );
  }, [data?.details.students, data?.recommendedClass.finalDate]);

  if (loading) {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        data-testid="lesson-details-loading"
      >
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          className
        )}
        data-testid="lesson-details-error"
      >
        <Text size="md" className="text-error-700">
          {error}
        </Text>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div
        className={cn('flex flex-col gap-6', className)}
        data-testid="recommended-class-details"
      >
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} onItemClick={onBreadcrumbClick} />

        {/* Header with metadata */}
        <LessonHeader
          data={data}
          onViewLesson={onViewLesson}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
          viewLessonLabel={labels.viewLesson}
        />

        {/* Results section */}
        <ResultsSection data={data} labels={labels} />

        {/* Students table */}
        <StudentsTable
          students={displayStudents}
          onCorrectActivity={apiClient ? handleCorrectActivity : undefined}
          labels={labels}
        />
      </div>

      {/* Student Activity Performance Modal */}
      {apiClient && (
        <StudentActivityPerformanceModal
          isOpen={performanceModalOpen}
          onClose={handleClosePerformanceModal}
          data={performanceData}
          loading={performanceLoading}
          error={performanceError}
          apiClient={apiClient}
        />
      )}
    </>
  );
};

export default RecommendedLessonDetails;
