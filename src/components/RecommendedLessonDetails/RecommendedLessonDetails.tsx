import { useMemo, useState, useCallback } from 'react';
import Text from '../Text/Text';
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
  DEFAULT_LABELS,
  type BreadcrumbItem,
  type LessonDetailsLabels,
  type StudentActivityPerformanceData,
  type PerformanceActivity,
  type PerformanceLesson,
  type LessonQuestion,
} from './types';
import { ANSWER_STATUS } from '../Quiz/useQuizStore';

/**
 * Answer data from the student answers API
 */
interface StudentAnswerData {
  id: string;
  questionId: string;
  answer: string | null;
  selectedOptions: Array<{ optionId: string }>;
  answerStatus: string;
  statement: string;
  questionType: string;
  difficultyLevel: string;
  solutionExplanation: string | null;
  correctOption: string | null;
  teacherFeedback: string | null;
  attachment: string | null;
  score: number | null;
  options?: Array<{
    id: string;
    option: string;
    isCorrect: boolean;
  }>;
  knowledgeMatrix: Array<{
    areaKnowledge: { id: string; name: string };
    subject: { id: string; name: string; color: string; icon: string };
    topic: { id: string; name: string };
    subtopic: { id: string; name: string };
    content: { id: string; name: string };
  }>;
}

/**
 * Activity statistics from the API
 */
interface ActivityStatistics {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  pendingAnswers: number;
  score: number | null;
  timeSpent: number;
}

/**
 * Activity data from the student answers API
 */
interface StudentActivityData {
  id: string;
  title: string;
  sequence: number;
  answers: StudentAnswerData[];
  statistics: ActivityStatistics;
}

/**
 * Lesson data from the student answers API
 */
interface StudentLessonData {
  id: string;
  title: string;
  sequence: number;
  progress: number;
  completedAt: string | null;
  questionnaire: {
    id: string;
    answers: StudentAnswerData[];
    statistics: ActivityStatistics;
  } | null;
}

/**
 * Response from /recommended-class/{id}/student/{studentId}/answers
 */
interface StudentAnswersResponse {
  message: string;
  data: {
    activities: StudentActivityData[];
    lessons: StudentLessonData[];
  };
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
/**
 * Determine if answer is correct based on answer status
 * Returns null for pending/unevaluated answers
 */
const getIsCorrectFromStatus = (answerStatus: string): boolean | null => {
  if (answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA) return true;
  if (answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA) return false;
  // For pending, blank, or other statuses, return null (not yet evaluated)
  return null;
};

/**
 * Convert answer data to LessonQuestion format
 */
const convertAnswerToLessonQuestion = (
  answer: StudentAnswerData,
  index: number,
  activityId: string
): LessonQuestion => {
  const isCorrect = getIsCorrectFromStatus(answer.answerStatus);

  return {
    id: answer.questionId,
    answerId: answer.id,
    activityId,
    title: `Questão ${index + 1}`,
    statement: answer.statement || '',
    questionType: answer.questionType,
    isCorrect,
    teacherFeedback: answer.teacherFeedback,
    alternatives: (answer.options || []).map((opt) => ({
      id: opt.id,
      text: opt.option,
      isCorrect: opt.isCorrect ?? false,
      isSelected:
        answer.selectedOptions?.some((s) => s.optionId === opt.id) ?? false,
    })),
  };
};

/**
 * Convert activity data to PerformanceActivity format
 */
const convertActivityToPerformance = (
  activity: StudentActivityData
): PerformanceActivity => {
  const questions: LessonQuestion[] = activity.answers.map((answer, index) =>
    convertAnswerToLessonQuestion(answer, index, activity.id)
  );

  return {
    id: activity.id,
    title: activity.title,
    questions,
  };
};

/**
 * Convert lesson data to PerformanceLesson format
 */
const convertLessonToPerformance = (
  lesson: StudentLessonData
): PerformanceLesson => {
  return {
    id: lesson.id,
    title: lesson.title,
    progress: lesson.progress,
  };
};

/**
 * Convert API response to StudentActivityPerformanceData
 */
const convertStudentAnswersToPerformanceData = (
  response: StudentAnswersResponse,
  userInstitutionId: string,
  userId: string,
  studentName: string
): StudentActivityPerformanceData => {
  const { activities, lessons } = response.data;

  // Convert activities
  const performanceActivities = activities.map(convertActivityToPerformance);

  // Convert lessons
  const performanceLessons = lessons.map(convertLessonToPerformance);

  // Aggregate statistics from all activities
  const totalCorrect = activities.reduce(
    (sum, a) => sum + a.statistics.correctAnswers,
    0
  );
  const totalIncorrect = activities.reduce(
    (sum, a) => sum + a.statistics.incorrectAnswers,
    0
  );
  const scores = activities
    .map((a) => a.statistics.score)
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : null;

  return {
    userInstitutionId,
    userId,
    studentName,
    score: avgScore,
    correctAnswers: totalCorrect,
    incorrectAnswers: totalIncorrect,
    completionTime: null,
    bestResult: null,
    hardestTopic: null,
    activities: performanceActivities,
    lessons: performanceLessons,
  };
};

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
      const studentName = student?.name || 'Aluno';
      const userId = student?.userId || '';

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
    [apiClient, data?.recommendedClass.id, data?.details.students]
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
