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
export { GenericApiStatus as RecommendedClassApiStatus } from './common';

/**
 * Recommended Class status for display in UI (Badge component)
 * Re-exported from common for backward compatibility
 */
export { GenericDisplayStatus as RecommendedClassDisplayStatus } from './common';

/**
 * Badge action types for recommended class status visualization
 * Re-exported from common for backward compatibility
 */
export { BadgeActionType as RecommendedClassBadgeActionType } from './common';

/**
 * Subject info from API response
 */
export interface RecommendedClassSubject {
  id: string;
  name: string;
}

/**
 * Creator info from API response
 */
export interface RecommendedClassCreator {
  id: string;
  name: string;
}

/**
 * Recommended Class stats from API response
 */
export interface RecommendedClassStats {
  totalStudents: number;
  completedCount: number;
  completionPercentage: number;
}

/**
 * Class breakdown info from API response
 */
export interface RecommendedClassBreakdown {
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
export interface RecommendedClassData {
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
export interface RecommendedClassHistoryItem {
  recommendedClass: RecommendedClassData;
  subject: RecommendedClassSubject | null;
  creator: RecommendedClassCreator | null;
  stats: RecommendedClassStats;
  breakdown: RecommendedClassBreakdown[];
}

/**
 * Recommended Class table item interface for recommended class list table
 */
export interface RecommendedClassTableItem extends Record<string, unknown> {
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
export interface RecommendedClassHistoryApiResponse {
  message: string;
  data: {
    recommendedClass: RecommendedClassHistoryItem[];
    total: number;
  };
}

/**
 * Recommended Class history filters for API query parameters
 */
export interface RecommendedClassHistoryFilters {
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
export interface RecommendedClassHistoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filter option for dropdowns
 * Extends with index signature to be compatible with CheckBoxGroup Item type
 */
export interface RecommendedClassFilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * User data for filter options (schools, classes, subjects)
 */
export interface RecommendedClassUserFilterData {
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
export const getRecommendedClassStatusBadgeAction = (
  status: GenericDisplayStatus
): BadgeActionType => getStatusBadgeAction(status);

/**
 * Recommended Class status options for filter (Vencida and Ativa)
 */
export const RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS: RecommendedClassFilterOption[] =
  [
    { id: GenericApiStatus.VENCIDA, name: 'Vencida' },
    { id: GenericApiStatus.A_VENCER, name: 'Ativa' },
  ];

/**
 * All recommended class status options
 */
export const RECOMMENDED_CLASS_STATUS_OPTIONS: RecommendedClassFilterOption[] =
  [
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
export interface RecommendedClassDetailStudent {
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
export interface RecommendedClassDetailAggregated {
  completionPercentage: number;
  avgScore: number | null;
}

/**
 * Content performance item from /recommended class/{id}/details endpoint
 */
export interface RecommendedClassDetailContentPerformanceItem {
  contentId: string;
  contentName: string;
  rate: number;
}

/**
 * Content performance from /recommended class/{id}/details endpoint
 */
export interface RecommendedClassDetailContentPerformance {
  best: RecommendedClassDetailContentPerformanceItem | null;
  worst: RecommendedClassDetailContentPerformanceItem | null;
}

/**
 * Response data from /recommended class/{id}/details endpoint
 */
export interface RecommendedClassDetailsData {
  students: RecommendedClassDetailStudent[];
  aggregated: RecommendedClassDetailAggregated;
  contentPerformance: RecommendedClassDetailContentPerformance;
}

/**
 * Full API response from /recommended class/{id}/details endpoint
 */
export interface RecommendedClassDetailsApiResponse {
  message: string;
  data: RecommendedClassDetailsData;
}

// ============================================
// Recommended Class Activity Types - /recommended class/{id} activities
// ============================================

/**
 * Activity status for recommended class activities
 * Used in activitiesRecommendedClass array from /recommended class/{id} endpoint
 */
export const RECOMMENDED_CLASS_ACTIVITY_STATUS = {
  PENDENTE: 'PENDENTE',
  CONCLUIDA: 'CONCLUIDA',
  EXPIRADA: 'EXPIRADA',
} as const;

export type RecommendedClassActivityStatus =
  (typeof RECOMMENDED_CLASS_ACTIVITY_STATUS)[keyof typeof RECOMMENDED_CLASS_ACTIVITY_STATUS];

/**
 * Activity details within a recommended class
 */
export interface RecommendedClassActivity {
  id: string;
  title: string;
  status: RecommendedClassActivityStatus;
}

/**
 * User activities within a recommended class
 */
export interface RecommendedClassSupUsersActivities {
  id: string;
  activity: RecommendedClassActivity;
  userInstitutionId: string;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
  lastInteraction: string;
}

/**
 * Activities associated with a recommended class
 */
export interface RecommendedClassActivities {
  recommendedClassId: string;
  supUsersActivitiesId: string;
  supUsersActivities: RecommendedClassSupUsersActivities;
}

// ============================================
// API Response Types - /recommended class/{id}
// ============================================

/**
 * Subject info from lesson in /recommended class/{id} response
 */
export interface RecommendedClassLessonSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

/**
 * Lesson info from /recommended class/{id} response
 */
export interface RecommendedClassLesson {
  id: string;
  content: { id: string; name: string };
  subtopic: { id: string; name: string };
  topic: { id: string; name: string };
  subject: RecommendedClassLessonSubject;
}

/**
 * Lesson progress from /recommended class/{id} response
 */
export interface RecommendedClassLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  progress: number;
  lesson: RecommendedClassLesson;
}

/**
 * Lesson recommended class item from /recommended class/{id} response
 */
export interface RecommendedClassLessonsItem {
  recommendedClassId: string;
  supLessonsProgressId: string;
  supLessonsProgress: RecommendedClassLessonProgress;
}

/**
 * Recommended Class metadata from /recommended class/{id} endpoint
 */
export interface RecommendedClassMetadata {
  id: string;
  title: string;
  startDate: string;
  finalDate: string;
  progress: number;
  lessons: RecommendedClassLessonsItem[];
  activities?: RecommendedClassActivities[];
}

/**
 * Full API response from /recommended class/{id} endpoint
 */
export interface RecommendedClassApiResponse {
  message: string;
  data: RecommendedClassMetadata;
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
  recommendedClass: RecommendedClassMetadata;
  /** Details from /recommended class/{id}/details */
  details: RecommendedClassDetailsData;
  /** Optional breakdown info from /recommended-class/history */
  breakdown?: RecommendedClassBreakdown;
}

// ============================================
// Recommended Class Draft/Model Types
// Based on /recommended-class/drafts endpoint
// ============================================

/**
 * Recommended Class draft type enum - matches backend RECOMMENDED_CLASS_DRAFT_TYPE
 */
export enum RecommendedClassDraftType {
  MODELO = 'MODELO',
  RASCUNHO = 'RASCUNHO',
}

/**
 * Recommended Class model response from backend API /recommended-class/drafts
 */
export interface RecommendedClassModelResponse {
  id: string;
  type: RecommendedClassDraftType;
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
export interface RecommendedClassModelTableItem
  extends Record<string, unknown> {
  id: string;
  title: string;
  savedAt: string;
  subject: string;
  subjectId: string | null;
}

/**
 * Recommended Class models API complete response from /recommended-class/drafts
 */
export interface RecommendedClassModelsApiResponse {
  message: string;
  data: {
    drafts: RecommendedClassModelResponse[];
    total: number;
  };
}

/**
 * Recommended Class model filters for API query parameters
 */
export interface RecommendedClassModelFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  type?: RecommendedClassDraftType;
}

/**
 * Pagination info for recommended class models
 */
export interface RecommendedClassModelPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
