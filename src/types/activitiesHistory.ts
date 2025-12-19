/**
 * Activities History Type Definitions
 * Types and interfaces for activities history and models functionality
 * Based on /activities/history and /activity-drafts endpoints
 */

/**
 * Activity status from backend API /activities/history
 */
export enum ActivityApiStatus {
  A_VENCER = 'A_VENCER',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUIDA',
}

/**
 * Activity status for display in UI (Badge component)
 */
export enum ActivityDisplayStatus {
  ATIVA = 'ATIVA',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUÍDA',
}

/**
 * Badge action types for activity status visualization
 */
export enum ActivityBadgeActionType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Activity draft type enum (matches backend ACTIVITY_DRAFT_TYPE)
 */
export enum ActivityDraftType {
  MODELO = 'MODELO',
  RASCUNHO = 'RASCUNHO',
}

/**
 * Activity history response from backend API /activities/history
 */
export interface ActivityHistoryResponse {
  id: string;
  title: string;
  startDate: string | null;
  finalDate: string | null;
  status: ActivityApiStatus;
  completionPercentage: number;
  subjectId: string;
  schoolId?: string;
  schoolName?: string;
  year?: string;
  className?: string;
  subjectName?: string;
}

/**
 * Activity table item interface for activities list table
 */
export interface ActivityTableItem extends Record<string, unknown> {
  id: string;
  startDate: string | null;
  deadline: string | null;
  title: string;
  school: string;
  year: string;
  subject: string;
  class: string;
  status: ActivityDisplayStatus;
  completionPercentage: number;
}

/**
 * Pagination info from API
 */
export interface ActivityPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Activities history API complete response
 */
export interface ActivitiesHistoryApiResponse {
  message: string;
  data: {
    activities: ActivityHistoryResponse[];
    pagination: ActivityPagination;
  };
}

/**
 * Activity history filters for API query parameters
 */
export interface ActivityHistoryFilters {
  page?: number;
  limit?: number;
  status?: ActivityApiStatus;
  search?: string;
  startDate?: string;
  finalDate?: string;
  subjectId?: string;
  schoolId?: string;
  sortBy?: 'finalDate' | 'title' | 'completionPercentage';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Activity draft filters object from backend
 */
export interface ActivityDraftFilters {
  questionTypes?: string[];
  questionBanks?: string[];
  subjects?: string[];
  topics?: string[];
  subtopics?: string[];
  contents?: string[];
}

/**
 * Activity model response from backend API (/activity-drafts)
 */
export interface ActivityModelResponse {
  id: string;
  type: ActivityDraftType;
  title: string | null;
  creatorUserInstitutionId: string | null;
  subjectId: string | null;
  filters: ActivityDraftFilters | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity model table item for display
 */
export interface ActivityModelTableItem extends Record<string, unknown> {
  id: string;
  title: string;
  savedAt: string;
  subject: string;
  subjectId: string | null;
}

/**
 * Activity models API response
 */
export interface ActivityModelsApiResponse {
  message: string;
  data: {
    activityDrafts: ActivityModelResponse[];
    total: number;
  };
}

/**
 * Activity model filters for API query
 */
export interface ActivityModelFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  type?: ActivityDraftType;
}

/**
 * Filter option for dropdowns
 * Extends with index signature to be compatible with CheckBoxGroup Item type
 */
export interface ActivityFilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * User data for filter options (schools, classes, subjects)
 */
export interface ActivityUserFilterData {
  schools?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string; schoolId?: string }>;
  subjects?: Array<{ id: string; name: string }>;
  schoolYears?: Array<{ id: string; name: string }>;
}

/**
 * Get status badge action based on activity display status
 * @param status - Activity display status
 * @returns Badge action type for styling
 */
export const getActivityStatusBadgeAction = (
  status: ActivityDisplayStatus
): ActivityBadgeActionType => {
  const actionMap: Record<ActivityDisplayStatus, ActivityBadgeActionType> = {
    [ActivityDisplayStatus.CONCLUIDA]: ActivityBadgeActionType.SUCCESS,
    [ActivityDisplayStatus.ATIVA]: ActivityBadgeActionType.WARNING,
    [ActivityDisplayStatus.VENCIDA]: ActivityBadgeActionType.ERROR,
  };
  return actionMap[status] ?? ActivityBadgeActionType.WARNING;
};

/**
 * Activity status options for filter
 */
export const ACTIVITY_FILTER_STATUS_OPTIONS: ActivityFilterOption[] = [
  { id: ActivityApiStatus.A_VENCER, name: 'A Vencer' },
  { id: ActivityApiStatus.VENCIDA, name: 'Vencida' },
  { id: ActivityApiStatus.CONCLUIDA, name: 'Concluída' },
];

/**
 * Map API status to display status
 * @param apiStatus - Status from backend API
 * @returns Formatted status for UI display
 */
export const mapActivityStatusToDisplay = (
  apiStatus: ActivityApiStatus
): ActivityDisplayStatus => {
  const statusMap: Record<ActivityApiStatus, ActivityDisplayStatus> = {
    [ActivityApiStatus.A_VENCER]: ActivityDisplayStatus.ATIVA,
    [ActivityApiStatus.VENCIDA]: ActivityDisplayStatus.VENCIDA,
    [ActivityApiStatus.CONCLUIDA]: ActivityDisplayStatus.CONCLUIDA,
  };
  return statusMap[apiStatus];
};
