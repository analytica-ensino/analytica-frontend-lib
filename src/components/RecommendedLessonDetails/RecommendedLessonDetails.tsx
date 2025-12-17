import { useCallback, useMemo } from 'react';
import {
  CaretRightIcon,
  TrophyIcon,
  WarningIcon,
  UserIcon,
  BookBookmarkIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import Table, {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  useTableSort,
} from '../Table/Table';
import { getSubjectInfo } from '../SubjectInfo/SubjectInfo';
import { cn } from '../../utils/utils';
import type {
  LessonDetailsData,
  GoalDetailStudent,
} from '../../types/recommendedLessons';
import {
  StudentLessonStatus,
  getStudentStatusBadgeAction,
  deriveStudentStatus,
  formatDaysToComplete,
} from '../../types/recommendedLessons';
import type { SubjectEnum } from '../../enums/SubjectEnum';

/**
 * Internal student type for table display
 */
interface DisplayStudent extends Record<string, unknown> {
  id: string;
  name: string;
  status: StudentLessonStatus;
  completionPercentage: number;
  duration: string | null;
}

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
  breadcrumbs?: Array<{ label: string; path?: string }>;
  /** Custom labels */
  labels?: {
    viewLesson?: string;
    viewPerformance?: string;
    resultsTitle?: string;
    completedLabel?: string;
    bestResultLabel?: string;
    hardestTopicLabel?: string;
    studentColumn?: string;
    statusColumn?: string;
    completionColumn?: string;
    durationColumn?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default labels for the component
 */
const DEFAULT_LABELS = {
  viewLesson: 'Ver aula',
  viewPerformance: 'Ver desempenho',
  resultsTitle: 'Resultados da aula recomendada',
  completedLabel: 'CONCLUÍDO',
  bestResultLabel: 'MELHOR RESULTADO',
  hardestTopicLabel: 'MAIOR DIFICULDADE',
  studentColumn: 'Aluno',
  statusColumn: 'Status',
  completionColumn: 'Conclusão',
  durationColumn: 'Duração',
};

/**
 * Format date string to display format
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '00/00/0000';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '00/00/0000';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Transform API student data to display format
 * @param student - Student data from API
 * @param deadline - Goal deadline to determine NAO_FINALIZADO status
 */
const transformStudentForDisplay = (
  student: GoalDetailStudent,
  deadline?: string | null
): DisplayStudent => ({
  id: student.userInstitutionId,
  name: student.name,
  status: deriveStudentStatus(student.progress, student.completedAt, deadline),
  completionPercentage: student.progress,
  duration: formatDaysToComplete(student.daysToComplete),
});

/**
 * Breadcrumb navigation component
 */
const Breadcrumb = ({
  items,
  onItemClick,
}: {
  items: Array<{ label: string; path?: string }>;
  onItemClick?: (path: string) => void;
}) => (
  <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <span key={item.path ?? item.label} className="flex items-center gap-2">
        {index > 0 && <CaretRightIcon size={14} className="text-text-500" />}
        {item.path ? (
          <button
            onClick={() => onItemClick?.(item.path!)}
            className="text-text-600 hover:text-primary-700 transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-text-950 font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

/**
 * Header section with metadata
 */
const LessonHeader = ({
  data,
  onViewLesson,
  mapSubjectNameToEnum,
  viewLessonLabel,
}: {
  data: LessonDetailsData;
  onViewLesson?: () => void;
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null;
  viewLessonLabel: string;
}) => {
  const { goal, breakdown } = data;

  // Extract subject from first lesson if available
  const subjectName =
    goal.lessonsGoals[0]?.supLessonsProgress?.lesson?.subject?.name || '';
  const subjectEnum = mapSubjectNameToEnum?.(subjectName);
  const subjectInfo = subjectEnum ? getSubjectInfo(subjectEnum) : null;

  return (
    <div className="bg-background rounded-xl border border-border-50 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h1"
            size="xl"
            weight="bold"
            className="text-text-950 lg:text-2xl"
          >
            {goal.title}
          </Text>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-600">
            <span>Início em {formatDate(goal.startDate)}</span>
            <span className="text-text-400">•</span>
            <span>Prazo final {formatDate(goal.finalDate)}</span>
            {breakdown?.schoolName && (
              <>
                <span className="text-text-400">•</span>
                <span>{breakdown.schoolName}</span>
              </>
            )}
            {subjectName && (
              <>
                <span className="text-text-400">•</span>
                <span className="flex items-center gap-1">
                  {subjectInfo && (
                    <span
                      className={cn(
                        'size-5 rounded flex items-center justify-center text-white',
                        subjectInfo.colorClass
                      )}
                    >
                      {subjectInfo.icon}
                    </span>
                  )}
                  {subjectName}
                </span>
              </>
            )}
            {breakdown?.className && (
              <>
                <span className="text-text-400">•</span>
                <span>{breakdown.className}</span>
              </>
            )}
          </div>
        </div>
        {onViewLesson && (
          <Button
            variant="solid"
            action="primary"
            size="small"
            iconLeft={<BookBookmarkIcon size={16} />}
            onClick={onViewLesson}
          >
            {viewLessonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Results section with 3 cards
 */
const ResultsSection = ({
  data,
  labels,
}: {
  data: LessonDetailsData;
  labels: typeof DEFAULT_LABELS;
}) => {
  const { details } = data;
  const { aggregated, contentPerformance } = details;

  return (
    <div className="flex flex-col gap-4">
      <Text as="h2" size="md" weight="semibold" className="text-text-950">
        {labels.resultsTitle}
      </Text>
      {/* Container branco com os 3 cards */}
      <div className="bg-background rounded-xl border border-border-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completion percentage card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-primary-50">
            <ProgressCircle
              value={aggregated.completionPercentage}
              size="small"
              variant="blue"
              label={labels.completedLabel}
              showPercentage
            />
          </div>

          {/* Best result topic card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-success-200">
            <span className="size-8 rounded-full flex items-center justify-center bg-warning-300 mb-2">
              <TrophyIcon size={18} weight="fill" className="text-white" />
            </span>
            <Text
              size="2xs"
              weight="bold"
              className="text-text-700 uppercase text-center leading-none mb-1"
            >
              {labels.bestResultLabel}
            </Text>
            <Text
              size="xl"
              weight="bold"
              className="text-success-700 text-center leading-none tracking-wide"
            >
              {contentPerformance.best?.contentName || '-'}
            </Text>
          </div>

          {/* Hardest topic card */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4 min-h-28 bg-error-100">
            <span className="size-8 rounded-full flex items-center justify-center bg-error-300 mb-2">
              <WarningIcon size={18} weight="fill" className="text-error-700" />
            </span>
            <Text
              size="2xs"
              weight="bold"
              className="text-text-700 uppercase text-center leading-none mb-1"
            >
              {labels.hardestTopicLabel}
            </Text>
            <Text
              size="xl"
              weight="bold"
              className="text-error-700 text-center leading-none tracking-wide"
            >
              {contentPerformance.worst?.contentName || '-'}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Students table component
 */
const StudentsTable = ({
  students,
  onViewPerformance,
  labels,
}: {
  students: DisplayStudent[];
  onViewPerformance?: (studentId: string) => void;
  labels: typeof DEFAULT_LABELS;
}) => {
  const { sortedData, sortColumn, sortDirection, handleSort } =
    useTableSort<DisplayStudent>(students);

  const canViewPerformance = useCallback((student: DisplayStudent) => {
    return (
      student.status === StudentLessonStatus.CONCLUIDO ||
      student.status === StudentLessonStatus.NAO_FINALIZADO
    );
  }, []);

  return (
    <div className="bg-background rounded-xl border border-border-50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection={sortColumn === 'name' ? sortDirection : undefined}
              onSort={() => handleSort('name')}
            >
              {labels.studentColumn}
            </TableHead>
            <TableHead
              sortable
              sortDirection={
                sortColumn === 'status' ? sortDirection : undefined
              }
              onSort={() => handleSort('status')}
            >
              {labels.statusColumn}
            </TableHead>
            <TableHead
              sortable
              sortDirection={
                sortColumn === 'completionPercentage'
                  ? sortDirection
                  : undefined
              }
              onSort={() => handleSort('completionPercentage')}
            >
              {labels.completionColumn}
            </TableHead>
            <TableHead>{labels.durationColumn}</TableHead>
            <TableHead className="w-[140px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-full bg-background-100 flex items-center justify-center">
                    <UserIcon size={16} className="text-text-500" />
                  </span>
                  <Text size="sm" className="text-text-950">
                    {student.name}
                  </Text>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="solid"
                  action={getStudentStatusBadgeAction(student.status)}
                  size="small"
                >
                  {student.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <Text size="sm" className="text-primary-700 font-medium">
                    {student.completionPercentage}%
                  </Text>
                  <ProgressBar
                    value={student.completionPercentage}
                    size="small"
                    variant="blue"
                    className="w-full max-w-[100px]"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Text size="sm" className="text-text-700">
                  {student.duration ?? '-'}
                </Text>
              </TableCell>
              <TableCell>
                {canViewPerformance(student) ? (
                  <Button
                    variant="outline"
                    size="extra-small"
                    onClick={() => onViewPerformance?.(student.id)}
                  >
                    {labels.viewPerformance}
                  </Button>
                ) : (
                  <Button variant="outline" size="extra-small" disabled>
                    {labels.viewPerformance}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    {/* Breadcrumb skeleton */}
    <div className="h-4 bg-background-200 rounded w-64" />

    {/* Header skeleton */}
    <div className="bg-background rounded-xl border border-border-50 p-6">
      <div className="flex flex-col gap-3">
        <div className="h-7 bg-background-200 rounded w-3/4" />
        <div className="h-4 bg-background-200 rounded w-1/2" />
      </div>
    </div>

    {/* Results section skeleton */}
    <div className="flex flex-col gap-4">
      <div className="h-5 bg-background-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[140px] bg-background-200 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-background rounded-xl border border-border-50 p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-background-200 rounded" />
        ))}
      </div>
    </div>
  </div>
);

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

  const defaultBreadcrumbs = useMemo(
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
