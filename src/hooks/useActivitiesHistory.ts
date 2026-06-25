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
  ActivityBreakdownItem,
} from '../types/activitiesHistory';
import { mergeFilterOptions } from '../utils/filterHelpers';

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

type ActivityFilterMaps = {
  schoolsMap: Map<string, string>;
  classesMap: Map<string, string>;
  subjectsMap: Map<string, string>;
  schoolYearsMap: Map<string, string>;
};

/**
 * Populate filter maps from a single breakdown item.
 */
const populateBreakdownMaps = (
  item: ActivityBreakdownItem,
  maps: ActivityFilterMaps
): void => {
  if (item.school?.id && item.school?.name) {
    maps.schoolsMap.set(item.school.id, item.school.name);
  }
  if (item.class?.id && item.class?.name) {
    maps.classesMap.set(item.class.id, item.class.name);
  }
  if (item.schoolYear?.id && item.schoolYear?.name) {
    maps.schoolYearsMap.set(item.schoolYear.id, item.schoolYear.name);
  }
};

/**
 * Extract unique filter options from activities API response
 */
export const extractActivityFilterOptions = (
  activities: ActivityHistoryResponse[]
): ActivityApiFilterOptions => {
  const maps: ActivityFilterMaps = {
    schoolsMap: new Map<string, string>(),
    classesMap: new Map<string, string>(),
    subjectsMap: new Map<string, string>(),
    schoolYearsMap: new Map<string, string>(),
  };

  for (const activity of activities) {
    if (activity.subject?.id && activity.subject?.name) {
      maps.subjectsMap.set(activity.subject.id, activity.subject.name);
    }
    activity.breakdown?.forEach((item) => populateBreakdownMaps(item, maps));
  }

  const toOptions = (map: Map<string, string>): ActivityFilterOption[] =>
    Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return {
    schools: toOptions(maps.schoolsMap),
    classes: toOptions(maps.classesMap),
    subjects: toOptions(maps.subjectsMap),
    schoolYears: toOptions(maps.schoolYearsMap),
  };
};

/**
 * Build query params from filters
 * @param filters - User filters
 * @param activityCategory - Optional activity category filter
 * @returns Query params object
 */
const buildQueryParams = (
  filters?: ActivityHistoryFilters,
  activityCategory?: string
): Record<string, unknown> => {
  const params: Record<string, unknown> = {};

  // Add activityCategory filter (type param for /activities/history)
  if (activityCategory) {
    params.type = activityCategory;
  }

  if (filters) {
    for (const key in filters) {
      const value = filters[key as keyof ActivityHistoryFilters];
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    }
  }

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
        const params = buildQueryParams(filters, options?.activityCategory);
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
