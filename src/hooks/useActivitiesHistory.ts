import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import { mapApiStatusToDisplay } from '../types/common';
import type {
  ActivityHistoryResponse,
  ActivityTableItem,
  ActivitiesHistoryApiResponse,
  ActivityHistoryFilters,
  ActivityPagination,
  ActivityFilterOption,
} from '../types/activitiesHistory';
import {
  mergeFilterOptions,
  extractBreakdownFilterOptions,
} from '../utils/filterHelpers';

/**
 * Options for configuring the useActivitiesHistory hook
 */
export interface UseActivitiesHistoryOptions {
  /** Filter by activity category (PROVA, ATIVIDADE, etc.) */
  activityCategory?: 'PROVA' | 'ATIVIDADE';
}

/**
 * API filter options extracted from response
 */
export interface ActivityApiFilterOptions {
  schools: ActivityFilterOption[];
  classes: ActivityFilterOption[];
  subjects: ActivityFilterOption[];
  schoolYears: ActivityFilterOption[];
}

/**
 * Hook state interface
 */
export interface UseActivitiesHistoryState {
  activities: ActivityTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ActivityPagination;
  apiFilterOptions: ActivityApiFilterOptions;
}

/**
 * Hook return type
 */
export interface UseActivitiesHistoryReturn extends UseActivitiesHistoryState {
  fetchActivities: (filters?: ActivityHistoryFilters) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_ACTIVITIES_PAGINATION: ActivityPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Default API filter options
 */
export const DEFAULT_ACTIVITY_FILTER_OPTIONS: ActivityApiFilterOptions = {
  schools: [],
  classes: [],
  subjects: [],
  schoolYears: [],
};

/**
 * Transform API response to table item format
 * @param activity - Activity from API response
 * @returns Formatted activity for table display
 */
export const transformActivityToTableItem = (
  activity: ActivityHistoryResponse
): ActivityTableItem => {
  const firstBreakdown = activity.breakdown?.[0];
  return {
    id: activity.id,
    startDate: activity.startDate
      ? dayjs(activity.startDate).format('DD/MM')
      : '-',
    deadline: activity.finalDate
      ? dayjs(activity.finalDate).format('DD/MM')
      : '-',
    creator: activity.creator?.name?.trim() ? activity.creator.name : '-',
    creatorId: activity.creator?.id ?? null,
    title: activity.title,
    school: firstBreakdown?.school?.name ?? '-',
    year: firstBreakdown?.schoolYear?.name ?? '-',
    subject: activity.subject?.name ?? '-',
    class: firstBreakdown?.class?.name ?? '-',
    status: mapApiStatusToDisplay(activity.status),
    completionPercentage: activity.completionPercentage,
  };
};

/**
 * Extract unique filter options from activities API response.
 * Delegates to the shared extractBreakdownFilterOptions helper.
 */
export const extractActivityFilterOptions = (
  activities: ActivityHistoryResponse[]
): ActivityApiFilterOptions => extractBreakdownFilterOptions(activities);

/**
 * Join an array of selected ids into the backend's comma-separated convention
 * (e.g. `schoolIds=a,b,c`). Returns undefined for empty / non-array input so the
 * query param is omitted entirely.
 */
const toCsv = (value: unknown): string | undefined => {
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join(',');
  }
  return undefined;
};

/**
 * Collapse a single-select filter (emitted as an array by TableProvider) to its
 * first value. Also tolerates a bare string. Returns undefined when empty.
 */
const toSingle = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : undefined;
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return undefined;
};

/**
 * Build the `/activities/history` query params from the raw TableProvider filter
 * keys. TableProvider emits UI-category keys (`subject`, `school`, `class`,
 * `schoolYear`, `status`, `creatorType`) as arrays; the backend expects a
 * different, mostly single-value contract. This adapter renames each key and
 * collapses/serializes to what the backend actually reads. Mirrors
 * `buildFiltersFromParams` in RecommendedLessonsHistory.
 *
 * @param filters - Raw table params (arrays under UI keys) plus page/limit/search/sort
 * @param activityCategory - Optional value forwarded as the `type` param
 */
export const buildActivityHistoryQueryParams = (
  filters?: Record<string, unknown>,
  activityCategory?: string
): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  if (activityCategory) {
    params.type = activityCategory;
  }

  if (!filters) {
    return params;
  }

  if (filters.page !== undefined && filters.page !== null) {
    params.page = filters.page;
  }
  if (filters.limit !== undefined && filters.limit !== null) {
    params.limit = filters.limit;
  }
  if (typeof filters.search === 'string' && filters.search) {
    params.search = filters.search;
  }
  if (typeof filters.startDate === 'string' && filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (typeof filters.finalDate === 'string' && filters.finalDate) {
    params.finalDate = filters.finalDate;
  }
  if (filters.sortBy) {
    params.sortBy = filters.sortBy;
  }
  if (filters.sortOrder) {
    params.sortOrder = filters.sortOrder;
  }

  // School: prefer raw multi-select (CSV); fall back to legacy singular.
  const schoolIds = toCsv(filters.school);
  if (schoolIds) {
    params.schoolIds = schoolIds;
  } else {
    const schoolId = toSingle(filters.schoolId);
    if (schoolId) params.schoolId = schoolId;
  }

  // Class: prefer raw multi-select (CSV); fall back to legacy singular.
  const classIds = toCsv(filters.class);
  if (classIds) {
    params.classIds = classIds;
  } else {
    const classId = toSingle(filters.classId);
    if (classId) params.classId = classId;
  }

  const schoolYearIds = toCsv(filters.schoolYear);
  if (schoolYearIds) params.schoolYearIds = schoolYearIds;

  const status = toSingle(filters.status);
  if (status) params.status = status;

  // Subject: prefer raw multi-select; fall back to legacy singular.
  const subjectId = toSingle(filters.subject) ?? toSingle(filters.subjectId);
  if (subjectId) params.subjectId = subjectId;

  const creatorType = toSingle(filters.creatorType);
  if (creatorType) params.creatorType = creatorType;

  return params;
};

/**
 * Hook implementation
 */
const useActivitiesHistoryImpl = (
  apiClient: BaseApiClient,
  options?: UseActivitiesHistoryOptions
): UseActivitiesHistoryReturn => {
  const [state, setState] = useState<UseActivitiesHistoryState>({
    activities: [],
    loading: false,
    error: null,
    pagination: DEFAULT_ACTIVITIES_PAGINATION,
    apiFilterOptions: DEFAULT_ACTIVITY_FILTER_OPTIONS,
  });

  const fetchActivities = useCallback(
    async (filters?: ActivityHistoryFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildActivityHistoryQueryParams(
          filters as Record<string, unknown>,
          options?.activityCategory
        );
        const response = await apiClient.get<ActivitiesHistoryApiResponse>(
          '/activities/history',
          { params }
        );

        const { data } = response.data;

        const tableItems = data.activities.map(transformActivityToTableItem);
        const extracted = extractActivityFilterOptions(data.activities);

        setState((prev) => ({
          activities: tableItems,
          loading: false,
          error: null,
          pagination: data.pagination,
          apiFilterOptions: {
            schools: mergeFilterOptions(
              prev.apiFilterOptions.schools,
              extracted.schools
            ),
            classes: mergeFilterOptions(
              prev.apiFilterOptions.classes,
              extracted.classes
            ),
            subjects: mergeFilterOptions(
              prev.apiFilterOptions.subjects,
              extracted.subjects
            ),
            schoolYears: mergeFilterOptions(
              prev.apiFilterOptions.schoolYears,
              extracted.schoolYears
            ),
          },
        }));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar histórico de atividades',
        }));
      }
    },
    [apiClient, options?.activityCategory]
  );

  return { ...state, fetchActivities };
};

/**
 * Factory function to create useActivitiesHistory hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @param options - Hook configuration options
 * @returns Hook for managing activities history
 *
 * @example
 * ```tsx
 * import { createUseActivitiesHistory } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * const useActivitiesHistory = createUseActivitiesHistory(api, { activityCategory: 'ATIVIDADE' });
 *
 * // In your component
 * const { activities, loading, fetchActivities, apiFilterOptions } = useActivitiesHistory();
 * ```
 */
export const createUseActivitiesHistory = (
  apiClient: BaseApiClient,
  options?: UseActivitiesHistoryOptions
) => {
  return (): UseActivitiesHistoryReturn =>
    useActivitiesHistoryImpl(apiClient, options);
};

/**
 * Alias for createUseActivitiesHistory
 */
export const createActivitiesHistoryHook = createUseActivitiesHistory;
