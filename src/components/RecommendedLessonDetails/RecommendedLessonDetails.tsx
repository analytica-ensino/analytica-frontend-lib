import { useMemo, useState, useCallback } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import type { LessonDetailsData } from '../../types/recommendedLessons';
import type { SubjectEnum } from '../../enums/SubjectEnum';
import {
  Breadcrumb,
  LessonHeader,
  LoadingSkeleton,
  ResultsSection,
  StudentsTable,
  StudentPerformanceModal,
} from './components';
import { transformStudentForDisplay } from './utils/lessonDetailsUtils';
import {
  DEFAULT_LABELS,
  type BreadcrumbItem,
  type LessonDetailsLabels,
  type StudentPerformanceData,
} from './types';

/**
 * Props for RecommendedLessonDetails component
 */
export interface RecommendedLessonDetailsProps {
  /** RecommendedClass ID for fetching student performance */
  recommendedClassId?: string;
  /** Lesson data to display (from API responses) */
  data: LessonDetailsData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Callback when "Ver aula" button is clicked */
  onViewLesson?: () => void;
  /**
   * Function to fetch student performance data.
   * When provided, the component manages the performance modal internally.
   * Must be memoized (using useCallback) to prevent re-fetches on every render.
   */
  fetchStudentPerformance?: (
    recommendedClassId: string,
    studentId: string
  ) => Promise<StudentPerformanceData>;
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
 *   onViewLesson={() => navigate('/view-lesson')}
 *   onViewStudentPerformance={(id) => navigate(`/student/${id}`)}
 *   mapSubjectNameToEnum={mapSubjectNameToEnum}
 * />
 * ```
 */
const RecommendedLessonDetails = ({
  recommendedClassId,
  data,
  loading = false,
  error = null,
  onViewLesson,
  fetchStudentPerformance,
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

  // Student performance modal state
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [performanceData, setPerformanceData] =
    useState<StudentPerformanceData | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  /**
   * Handle view student performance action
   */
  const handleViewStudentPerformance = useCallback(
    async (studentId: string) => {
      if (!fetchStudentPerformance || !recommendedClassId) return;

      setPerformanceModalOpen(true);
      setPerformanceLoading(true);
      setPerformanceData(null);
      setPerformanceError(null);

      try {
        const result = await fetchStudentPerformance(
          recommendedClassId,
          studentId
        );
        setPerformanceData(result);
      } catch (err) {
        console.error('Error fetching student performance:', err);
        setPerformanceError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar desempenho do aluno'
        );
      } finally {
        setPerformanceLoading(false);
      }
    },
    [fetchStudentPerformance, recommendedClassId]
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
        data-testid="recommended-lesson-details"
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
          onViewPerformance={
            fetchStudentPerformance ? handleViewStudentPerformance : undefined
          }
          labels={labels}
        />
      </div>

      {/* Student Performance Modal */}
      {fetchStudentPerformance && (
        <StudentPerformanceModal
          isOpen={performanceModalOpen}
          onClose={handleClosePerformanceModal}
          data={performanceData}
          loading={performanceLoading}
          error={performanceError}
        />
      )}
    </>
  );
};

export default RecommendedLessonDetails;
