/**
 * Recommended Lessons / Recommended Class (Aulas Recomendadas) Type Definitions
 * Based on /recommended-class/history endpoint
 */

import {
  GenericApiStatus,
  GenericDisplayStatus,
  BadgeActionType,
  getStatusBadgeAction,
} from './common';

/**
 * Recommended Class status from backend API
 * Re-exported from common for backward compatibility
 */
export { GenericApiStatus as GoalApiStatus } from './common';

/**
 * Recommended Class status for display in UI (Badge component)
 * Re-exported from common for backward compatibility
 */
export { GenericDisplayStatus as GoalDisplayStatus } from './common';

/**
 * Badge action types for recommended class status visualization
 * Re-exported from common for backward compatibility
 */
export { BadgeActionType as GoalBadgeActionType } from './common';

/**
 * Subject info from API response
 */
export interface GoalSubject {
  id: string;
  name: string;
}

/**
 * Creator info from API response
 */
export interface GoalCreator {
  id: string;
  name: string;
}

/**
 * Recommended Class stats from API response
 */
export interface GoalStats {
  totalStudents: number;
  completedCount: number;
  completionPercentage: number;
}

/**
 * Class breakdown info from API response
 */
export interface GoalBreakdown {
  classId: string;
  className: string;
  schoolId: string;
  schoolName: string;
  studentCount: number;
  completedCount: number;
}

/**
 * Recommended Class data from API response
 */
export interface GoalData {
  id: string;
  title: string;
  startDate: string | null;
  finalDate: string | null;
  createdAt: string;
  progress: number;
  totalLessons: number;
}

/**
 * Recommended Class history item from /recommended-class/history endpoint
 */
export interface GoalHistoryItem {
  recommendedClass: GoalData;
  subject: GoalSubject | null;
  creator: GoalCreator | null;
  stats: GoalStats;
  breakdown: GoalBreakdown[];
}

/**
 * Recommended Class table item interface for recommended class list table
 */
export interface GoalTableItem extends Record<string, unknown> {
  id: string;
  startDate: string | null;
  deadline: string | null;
  title: string;
  school: string;
  year: string;
  subject: string;
  class: string;
  status: GenericDisplayStatus;
  completionPercentage: number;
}

/**
 * Recommended Class history API complete response from /recommended-class/history
 */
export interface GoalsHistoryApiResponse {
  message: string;
  data: {
    recommendedClass: GoalHistoryItem[];
    total: number;
  };
}

/**
 * Recommended Class history filters for API query parameters
 */
export interface GoalHistoryFilters {
  page?: number;
  limit?: number;
  status?: GenericApiStatus;
  search?: string;
  startDate?: string;
  finalDate?: string;
  subjectId?: string;
  schoolId?: string;
  schoolIds?: string[];
  classId?: string;
  classIds?: string[];
  studentIds?: string[];
  sortBy?: 'createdAt' | 'finalDate' | 'title' | 'completionPercentage';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination info for recommended class history
 */
export interface GoalHistoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filter option for dropdowns
 * Extends with index signature to be compatible with CheckBoxGroup Item type
 */
export interface GoalFilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * User data for filter options (schools, classes, subjects)
 */
export interface GoalUserFilterData {
  schools?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string; schoolId?: string }>;
  subjects?: Array<{ id: string; name: string }>;
  schoolYears?: Array<{ id: string; name: string }>;
}

/**
 * Get status badge action based on recommended class display status
 * @param status - Recommended Class display status
 * @returns Badge action type for styling
 */
export const getGoalStatusBadgeAction = (
  status: GenericDisplayStatus
): BadgeActionType => getStatusBadgeAction(status);

/**
 * Recommended Class status options for filter (Vencida and Ativa)
 */
export const GOAL_FILTER_STATUS_OPTIONS: GoalFilterOption[] = [
  { id: GenericApiStatus.VENCIDA, name: 'Vencida' },
  { id: GenericApiStatus.A_VENCER, name: 'Ativa' },
];

/**
 * All recommended class status options
 */
export const GOAL_STATUS_OPTIONS: GoalFilterOption[] = [
  { id: GenericApiStatus.A_VENCER, name: 'A Vencer' },
  { id: GenericApiStatus.VENCIDA, name: 'Vencida' },
  { id: GenericApiStatus.CONCLUIDA, name: 'Concluída' },
];

// ============================================
// Recommended Lesson Details Types
// Based on /recommended class/{id} and /recommended class/{id}/details endpoints
// ============================================

/**
 * Student status for display in UI
 */
export enum StudentLessonStatus {
  A_INICIAR = 'A INICIAR',
  EM_ANDAMENTO = 'EM ANDAMENTO',
  NAO_FINALIZADO = 'NÃO FINALIZADO',
  CONCLUIDO = 'CONCLUÍDO',
}

/**
 * Badge action type for student status
 */
export const getStudentStatusBadgeAction = (
  status: StudentLessonStatus
): 'success' | 'warning' | 'error' | 'info' => {
  const actionMap: Record<
    StudentLessonStatus,
    'success' | 'warning' | 'error' | 'info'
  > = {
    [StudentLessonStatus.CONCLUIDO]: 'success',
    [StudentLessonStatus.EM_ANDAMENTO]: 'info',
    [StudentLessonStatus.A_INICIAR]: 'warning',
    [StudentLessonStatus.NAO_FINALIZADO]: 'error',
  };
  return actionMap[status] ?? 'warning';
};

/**
 * Checks if a deadline has passed
 * @param deadline - ISO date string of the deadline
 * @returns true if deadline has passed, false otherwise
 */
export const isDeadlinePassed = (deadline: string | null): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Derives student display status from progress, completedAt, and deadline
 * @param progress - Student progress percentage (0-100)
 * @param completedAt - ISO date string when student completed, or null
 * @param deadline - ISO date string of the recommended class deadline, or null
 * @returns The appropriate StudentLessonStatus
 */
export const deriveStudentStatus = (
  progress: number,
  completedAt: string | null,
  deadline?: string | null
): StudentLessonStatus => {
  // If completed (either by completedAt or 100% progress), it's CONCLUIDO
  if (completedAt) return StudentLessonStatus.CONCLUIDO;
  if (progress === 100) return StudentLessonStatus.CONCLUIDO;

  // If deadline passed and not completed, it's NAO_FINALIZADO
  if (isDeadlinePassed(deadline ?? null) && progress < 100) {
    return StudentLessonStatus.NAO_FINALIZADO;
  }

  // Otherwise, derive from progress
  if (progress === 0) return StudentLessonStatus.A_INICIAR;
  if (progress > 0) return StudentLessonStatus.EM_ANDAMENTO;
  return StudentLessonStatus.A_INICIAR;
};

/**
 * Formats days to complete as a readable string
 */
export const formatDaysToComplete = (
  daysToComplete: number | null
): string | null => {
  if (daysToComplete === null) return null;
  if (daysToComplete === 1) return '1 dia';
  return `${daysToComplete} dias`;
};

// ============================================
// API Response Types - /recommended class/{id}/details
// ============================================

/**
 * Student data from /recommended class/{id}/details endpoint
 */
export interface GoalDetailStudent {
  userInstitutionId: string;
  userId: string;
  name: string;
  progress: number;
  completedAt: string | null;
  avgScore: number | null;
  daysToComplete: number | null;
}

/**
 * Aggregated stats from /recommended class/{id}/details endpoint
 */
export interface GoalDetailAggregated {
  completionPercentage: number;
  avgScore: number | null;
}

/**
 * Content performance item from /recommended class/{id}/details endpoint
 */
export interface GoalDetailContentPerformanceItem {
  contentId: string;
  contentName: string;
  rate: number;
}

/**
 * Content performance from /recommended class/{id}/details endpoint
 */
export interface GoalDetailContentPerformance {
  best: GoalDetailContentPerformanceItem | null;
  worst: GoalDetailContentPerformanceItem | null;
}

/**
 * Response data from /recommended class/{id}/details endpoint
 */
export interface GoalDetailsData {
  students: GoalDetailStudent[];
  aggregated: GoalDetailAggregated;
  contentPerformance: GoalDetailContentPerformance;
}

/**
 * Full API response from /recommended class/{id}/details endpoint
 */
export interface GoalDetailsApiResponse {
  message: string;
  data: GoalDetailsData;
}

// ============================================
// Recommended Class Activity Types - /recommended class/{id} activities
// ============================================

/**
 * Activity status for recommended class activities
 * Used in activitiesGoals array from /recommended class/{id} endpoint
 */
export const GOAL_ACTIVITY_STATUS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA',
  EXPIRADA: 'EXPIRADA',
} as const;

export type GoalActivityStatus =
  (typeof GOAL_ACTIVITY_STATUS)[keyof typeof GOAL_ACTIVITY_STATUS];

/**
 * Activity details within a recommended class
 */
export interface GoalActivity {
  id: string;
  title: string;
  status: GoalActivityStatus;
}

/**
 * User activities within a recommended class
 */
export interface GoalSupUsersActivities {
  id: string;
  activity: GoalActivity;
  userInstitutionId: string;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
  lastInteraction: string;
}

/**
 * Activities associated with a recommended class
 */
export interface GoalActivitiesGoals {
  recommendedClassId: string;
  supUsersActivitiesId: string;
  supUsersActivities: GoalSupUsersActivities;
}

// ============================================
// API Response Types - /recommended class/{id}
// ============================================

/**
 * Subject info from lesson in /recommended class/{id} response
 */
export interface GoalLessonSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

/**
 * Lesson info from /recommended class/{id} response
 */
export interface GoalLesson {
  id: string;
  content: { id: string; name: string };
  subtopic: { id: string; name: string };
  topic: { id: string; name: string };
  subject: GoalLessonSubject;
}

/**
 * Lesson progress from /recommended class/{id} response
 */
export interface GoalLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  progress: number;
  lesson: GoalLesson;
}

/**
 * Lesson recommended class item from /recommended class/{id} response
 */
export interface GoalLessonGoalItem {
  recommendedClassId: string;
  supLessonsProgressId: string;
  supLessonsProgress: GoalLessonProgress;
}

/**
 * Recommended Class metadata from /recommended class/{id} endpoint
 */
export interface GoalMetadata {
  id: string;
  title: string;
  startDate: string;
  finalDate: string;
  progress: number;
  lessons: GoalLessonGoalItem[];
  activities?: GoalActivitiesGoals[];
}

/**
 * Full API response from /recommended class/{id} endpoint
 */
export interface GoalApiResponse {
  message: string;
  data: GoalMetadata;
}

// ============================================
// Combined Data for Component
// ============================================

/**
 * Combined data structure for RecommendedLessonDetails component
 * Combines data from /recommended class/{id}, /recommended class/{id}/details, and breakdown info
 */
export interface LessonDetailsData {
  /** Recommended Class metadata from /recommended class/{id} */
  recommendedClass: GoalMetadata;
  /** Details from /recommended class/{id}/details */
  details: GoalDetailsData;
  /** Optional breakdown info from /recommended-class/history */
  breakdown?: GoalBreakdown;
}

// ============================================
// Recommended Class Draft/Model Types
// Based on /recommended-class/drafts endpoint
// ============================================

/**
 * Recommended Class draft type enum - matches backend GOAL_DRAFT_TYPE
 */
export enum GoalDraftType {
  MODELO = 'MODELO',
  RASCUNHO = 'RASCUNHO',
}

/**
 * Recommended Class model response from backend API /recommended-class/drafts
 */
export interface GoalModelResponse {
  id: string;
  type: GoalDraftType;
  title: string;
  description: string | null;
  creatorUserInstitutionId: string;
  subjectId: string | null;
  startDate: string | null;
  finalDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Recommended Class model table item for display in models table
 */
export interface GoalModelTableItem extends Record<string, unknown> {
  id: string;
  title: string;
  savedAt: string;
  subject: string;
  subjectId: string | null;
}

/**
 * Recommended Class models API complete response from /recommended-class/drafts
 */
export interface GoalModelsApiResponse {
  message: string;
  data: {
    drafts: GoalModelResponse[];
    total: number;
  };
}

/**
 * Recommended Class model filters for API query parameters
 */
export interface GoalModelFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  type?: GoalDraftType;
}

/**
 * Pagination info for recommended class models
 */
export interface GoalModelPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
