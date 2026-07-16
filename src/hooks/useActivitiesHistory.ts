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
 * Assign a resolved string value onto the params object only when it is present.
 * Keeps the builder free of repetitive `if (value) params[key] = value` blocks.
 */
const assignIf = (
  params: Record<string, unknown>,
  key: string,
  value: string | undefined
): void => {
  if (value) {
    params[key] = value;
  }
};

/**
 * Raw scalar keys forwarded to the backend untouched (pagination, text search,
 * date range and sorting). Copied verbatim when present and non-empty.
 */
const PASSTHROUGH_KEYS = [
  'page',
  'limit',
  'search',
  'startDate',
  'finalDate',
  'sortBy',
  'sortOrder',
] as const;

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
  assignIf(params, 'type', activityCategory);

  if (!filters) {
    return params;
  }

  for (const key of PASSTHROUGH_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  }

  // Multi-select filters serialized as comma-separated ids. School and class each
  // fall back to their legacy singular key when the raw multi-select key is absent.
  assignIf(params, 'schoolIds', toCsv(filters.school));
  assignIf(params, 'classIds', toCsv(filters.class));
  assignIf(params, 'schoolYearIds', toCsv(filters.schoolYear));
  if (!params.schoolIds) {
    assignIf(params, 'schoolId', toSingle(filters.schoolId));
  }
  if (!params.classIds) {
    assignIf(params, 'classId', toSingle(filters.classId));
  }

  // Single-select filters (subject also honors the legacy singular key).
  assignIf(params, 'status', toSingle(filters.status));
  assignIf(
    params,
    'subjectId',
    toSingle(filters.subject) ?? toSingle(filters.subjectId)
  );
  assignIf(params, 'creatorType', toSingle(filters.creatorType));

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
