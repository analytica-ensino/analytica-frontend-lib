import { useState, useCallback, useRef } from 'react';
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
    createdAt: activity.createdAt
      ? dayjs(activity.createdAt).format('DD/MM')
      : '-',
    creator: activity.creator?.name?.trim() ? activity.creator.name : '-',
    creatorId: activity.creator?.id ?? null,
    title: activity.title,
    school: firstBreakdown?.school?.name ?? '-',
    year: firstBreakdown?.schoolYear?.name ?? '-',
    subjects: activity.subjects ?? [],
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
 * Collapse a single-select filter (emitted as an array by TableProvider) to its
 * first value. Also tolerates a bare string. Returns undefined when empty.
 *
 * Only for filters the backend genuinely reads as a single value — using it on
 * a multi-select silently drops every id but the first.
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
 * Normalize a multi-select filter to a real array of ids.
 *
 * The body is JSON, so a list travels as a list — no comma-separated string and
 * no `toCsv`. A bare string is tolerated because some callers still pass the
 * legacy singular key. Returns undefined when there is nothing to send, so the
 * key is omitted rather than sent as an empty array (which the backend would
 * read as "match nothing").
 */
const toIdArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const ids = value.filter(Boolean).map(String);
    return ids.length > 0 ? ids : undefined;
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }
  return undefined;
};

/**
 * Assign a resolved array value onto the body only when it is present.
 */
const assignArrayIf = (
  body: Record<string, unknown>,
  key: string,
  value: string[] | undefined
): void => {
  if (value) {
    body[key] = value;
  }
};

/**
 * Resolve a two-option toggle (`creatorType`: mine / teachers) into the single
 * value the backend reads. Picking both options is the same as not filtering at
 * all, so the param is omitted rather than collapsed to the first choice.
 */
const toExclusiveChoice = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value.length === 1 ? String(value[0]) : undefined;
  }
  return toSingle(value);
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
 * Build the `POST /activities/history` request body from the raw TableProvider
 * filter keys.
 *
 * TableProvider emits UI-category keys (`subject`, `school`, `class`,
 * `schoolYear`, `status`, `creatorType`) as arrays; this adapter renames each
 * one to the backend contract. The endpoint takes a JSON body rather than a
 * querystring, so the list filters travel as real arrays — the previous
 * comma-separated encoding is gone.
 *
 * `subjectIds` in particular is now a list: an activity covers several subjects,
 * and it matches when it covers any of the selected ones. The old builder
 * collapsed the selection to its first id, silently dropping the rest.
 *
 * @param filters - Raw table params (arrays under UI keys) plus page/limit/search/sort
 * @param activityCategory - Optional value forwarded as the `type` field
 */
export const buildActivityHistoryBody = (
  filters?: Record<string, unknown>,
  activityCategory?: string
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  assignIf(body, 'type', activityCategory);

  if (!filters) {
    return body;
  }

  for (const key of PASSTHROUGH_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      body[key] = value;
    }
  }

  // Multi-select filters. Each one also folds in the legacy singular key a
  // direct caller may still pass, so the selection reaches the backend under the
  // plural name it actually reads.
  assignArrayIf(body, 'schoolIds', toIdArray(filters.school));
  assignArrayIf(body, 'classIds', toIdArray(filters.class));
  assignArrayIf(body, 'schoolYearIds', toIdArray(filters.schoolYear));
  assignArrayIf(
    body,
    'subjectIds',
    toIdArray(filters.subject) ??
      toIdArray(filters.subjectIds) ??
      toIdArray(filters.subjectId)
  );
  if (!body.schoolIds) {
    assignIf(body, 'schoolId', toSingle(filters.schoolId));
  }
  if (!body.classIds) {
    assignIf(body, 'classId', toSingle(filters.classId));
  }

  // Single-select filters. `status` stays singular because that is all
  // POST /activities/history accepts — it reads `status`, never `statuses`.
  assignIf(body, 'status', toSingle(filters.status));
  // Both creator options selected means "no filter", not "the first one".
  assignIf(body, 'creatorType', toExclusiveChoice(filters.creatorType));

  return body;
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

  /**
   * Sequence number of the newest fetch. The filter modal refetches on every
   * checkbox, so several requests are in flight at once and the network is free
   * to answer them out of order — without this, a slower earlier response would
   * overwrite the list the user is actually looking at.
   */
  const requestIdRef = useRef(0);

  const fetchActivities = useCallback(
    async (filters?: ActivityHistoryFilters) => {
      const requestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const body = buildActivityHistoryBody(
          filters as Record<string, unknown>,
          options?.activityCategory
        );
        const response = await apiClient.post<ActivitiesHistoryApiResponse>(
          '/activities/history',
          body
        );

        const { data } = response.data;

        if (requestId !== requestIdRef.current) {
          // A newer fetch has already been issued: this answer is stale.
          return;
        }

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
        if (requestId !== requestIdRef.current) {
          return;
        }
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
