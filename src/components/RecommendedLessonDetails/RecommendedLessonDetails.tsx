import { useMemo } from 'react';
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
} from './components';
import { transformStudentForDisplay } from './utils/lessonDetailsUtils';
import {
  DEFAULT_LABELS,
  type BreadcrumbItem,
  type LessonDetailsLabels,
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
  /** Callback when "Ver desempenho" button is clicked for a student */
  onViewStudentPerformance?: (studentId: string) => void;
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
 *     goal: goalData,       // from /goals/{id}
 *     details: detailsData, // from /goals/{id}/details
 *     breakdown: breakdown, // optional, from /recommended-class/history
 *   }}
 *   onViewLesson={() => navigate('/view-lesson')}
 *   onViewStudentPerformance={(id) => navigate(`/student/${id}`)}
 *   mapSubjectNameToEnum={mapSubjectNameToEnum}
 * />
 * ```
 */
const RecommendedLessonDetails = ({
  data,
  loading = false,
  error = null,
  onViewLesson,
  onViewStudentPerformance,
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

  const defaultBreadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: 'Aulas recomendadas', path: '/aulas-recomendadas' },
      { label: data?.goal.title || 'Detalhes' },
    ],
    [data?.goal.title]
  );

  const breadcrumbItems = breadcrumbs || defaultBreadcrumbs;

  // Transform API students to display format
  const displayStudents = useMemo(() => {
    if (!data?.details.students) return [];
    const deadline = data?.goal.finalDate;
    return data.details.students.map((student) =>
      transformStudentForDisplay(student, deadline)
    );
  }, [data?.details.students, data?.goal.finalDate]);

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
        onViewPerformance={onViewStudentPerformance}
        labels={labels}
      />
    </div>
  );
};

export default RecommendedLessonDetails;
