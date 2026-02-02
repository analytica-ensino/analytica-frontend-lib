import { ANSWER_STATUS } from '../../Quiz/useQuizStore';
import type {
  LessonQuestion,
  PerformanceActivity,
  PerformanceLesson,
  StudentActivityPerformanceData,
} from '../types';

/**
 * Answer data from the student answers API
 */
export interface StudentAnswerData {
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
export interface ActivityStatistics {
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
export interface StudentActivityData {
  id: string;
  title: string;
  sequence: number;
  answers: StudentAnswerData[];
  statistics: ActivityStatistics;
}

/**
 * Lesson data from the student answers API
 */
export interface StudentLessonData {
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
export interface StudentAnswersResponse {
  message: string;
  data: {
    activities: StudentActivityData[];
    lessons: StudentLessonData[];
  };
}

/**
 * Determine if answer is correct based on answer status
 * Returns null for pending/unevaluated answers
 */
export const getIsCorrectFromStatus = (
  answerStatus: string
): boolean | null => {
  if (answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA) return true;
  if (answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA) return false;
  // For pending, blank, or other statuses, return null (not yet evaluated)
  return null;
};

/**
 * Convert answer data to LessonQuestion format
 */
export const convertAnswerToLessonQuestion = (
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
export const convertActivityToPerformance = (
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
export const convertLessonToPerformance = (
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
export const convertStudentAnswersToPerformanceData = (
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
