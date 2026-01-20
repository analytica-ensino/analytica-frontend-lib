/**
 * Activities History Type Definitions
 * Types and interfaces for activities history and models functionality
 * Based on /activities/history and /activity-drafts endpoints
 */

import { ActivityType } from '@/components/ActivityCreate/ActivityCreate.types';
import {
  GenericApiStatus,
  GenericDisplayStatus,
  BadgeActionType,
  getStatusBadgeAction,
  mapApiStatusToDisplay,
} from './common';

/**
 * Activity status from backend API /activities/history
 * Re-exported from common for backward compatibility
 */
export { GenericApiStatus as ActivityApiStatus } from './common';

/**
 * Activity status for display in UI (Badge component)
 * Re-exported from common for backward compatibility
 */
export { GenericDisplayStatus as ActivityDisplayStatus } from './common';

/**
 * Badge action types for activity status visualization
 * Re-exported from common for backward compatibility
 */
export { BadgeActionType as ActivityBadgeActionType } from './common';

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
  status: GenericApiStatus;
  completionPercentage: number;
  subjectId?: string | null;
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
  status: GenericDisplayStatus;
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
  status?: GenericApiStatus;
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
 * Subject object with icon and color information
 */
export interface SubjectData {
  id: string;
  name: string;
  icon: string;
  color: string;
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
  subject?: SubjectData | null;
  filters: ActivityDraftFilters | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity model table item for display
 */
export interface ActivityModelTableItem extends Record<string, unknown> {
  id: string;
  type: ActivityType;
  title: string;
  savedAt: string;
  subject: SubjectData | null;
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
  status: GenericDisplayStatus
): BadgeActionType => getStatusBadgeAction(status);

/**
 * Activity status options for filter
 */
export const ACTIVITY_FILTER_STATUS_OPTIONS: ActivityFilterOption[] = [
  { id: GenericApiStatus.A_VENCER, name: 'A Vencer' },
  { id: GenericApiStatus.VENCIDA, name: 'Vencida' },
  { id: GenericApiStatus.CONCLUIDA, name: 'Concluída' },
];

/**
 * Map API status to display status
 * @param apiStatus - Status from backend API
 * @returns Formatted status for UI display
 */
export const mapActivityStatusToDisplay = (
  apiStatus: GenericApiStatus
): GenericDisplayStatus => mapApiStatusToDisplay(apiStatus);
