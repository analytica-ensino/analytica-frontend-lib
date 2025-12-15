/**
 * Recommended Lessons / Goals (Aulas Recomendadas) Type Definitions
 * Based on /recommended-class/history endpoint
 */

/**
 * Goal status from backend API
 */
export enum GoalApiStatus {
  A_VENCER = 'A_VENCER',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUIDA',
}

/**
 * Goal status for display in UI (Badge component)
 */
export enum GoalDisplayStatus {
  ATIVA = 'ATIVA',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUÍDA',
}

/**
 * Badge action types for goal status visualization
 */
export enum GoalBadgeActionType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

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
 * Goal stats from API response
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
 * Goal data from API response
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
 * Goal history item from /recommended-class/history endpoint
 */
export interface GoalHistoryItem {
  goal: GoalData;
  subject: GoalSubject | null;
  creator: GoalCreator | null;
  stats: GoalStats;
  breakdown: GoalBreakdown[];
}

/**
 * Goal table item interface for goals list table
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
  status: GoalDisplayStatus;
  completionPercentage: number;
}

/**
 * Goals history API complete response from /recommended-class/history
 */
export interface GoalsHistoryApiResponse {
  message: string;
  data: {
    goals: GoalHistoryItem[];
    total: number;
  };
}

/**
 * Goal history filters for API query parameters
 */
export interface GoalHistoryFilters {
  page?: number;
  limit?: number;
  status?: GoalApiStatus;
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
 * Pagination info for goals history
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
 * Get status badge action based on goal display status
 * @param status - Goal display status
 * @returns Badge action type for styling
 */
export const getGoalStatusBadgeAction = (
  status: GoalDisplayStatus
): GoalBadgeActionType => {
  const actionMap: Record<GoalDisplayStatus, GoalBadgeActionType> = {
    [GoalDisplayStatus.CONCLUIDA]: GoalBadgeActionType.SUCCESS,
    [GoalDisplayStatus.ATIVA]: GoalBadgeActionType.WARNING,
    [GoalDisplayStatus.VENCIDA]: GoalBadgeActionType.ERROR,
  };
  return actionMap[status] ?? GoalBadgeActionType.WARNING;
};

/**
 * Goal status options for filter (Vencida and Ativa)
 */
export const GOAL_FILTER_STATUS_OPTIONS: GoalFilterOption[] = [
  { id: GoalApiStatus.VENCIDA, name: 'Vencida' },
  { id: GoalApiStatus.A_VENCER, name: 'Ativa' },
];

/**
 * All goal status options
 */
export const GOAL_STATUS_OPTIONS: GoalFilterOption[] = [
  { id: GoalApiStatus.A_VENCER, name: 'A Vencer' },
  { id: GoalApiStatus.VENCIDA, name: 'Vencida' },
  { id: GoalApiStatus.CONCLUIDA, name: 'Concluída' },
];
