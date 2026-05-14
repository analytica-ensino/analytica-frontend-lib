import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { ApiClientWithGet } from '../types/api';
import { mapApiStatusToDisplay } from '../types/common';
import type {
  ActivityHistoryResponse,
  ActivityTableItem,
  ActivitiesHistoryApiResponse,
  ActivityHistoryFilters,
  ActivityPagination,
  ActivityFilterOption,
} from '../types/activitiesHistory';

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
  return {
    id: activity.id,
    startDate: activity.startDate
      ? dayjs(activity.startDate).format('DD/MM')
      : '-',
    deadline: activity.finalDate
      ? dayjs(activity.finalDate).format('DD/MM')
      : '-',
    creator: activity.creator?.name?.trim() ? activity.creator.name : '-',
    title: activity.title,
    school: activity.schoolName || '-',
    year: activity.year || '-',
    subject: activity.subjectName || '-',
    class: activity.className || '-',
    status: mapApiStatusToDisplay(activity.status),
    completionPercentage: activity.completionPercentage,
  };
};

/**
 * Extract unique filter options from activities API response
 */
export const extractActivityFilterOptions = (
  activities: ActivityHistoryResponse[]
): ActivityApiFilterOptions => {
  const schoolsMap = new Map<string, string>();
  const classesMap = new Map<string, string>();
  const subjectsMap = new Map<string, string>();
  const schoolYearsMap = new Map<string, string>();

  for (const activity of activities) {
    if (activity.schoolId && activity.schoolName) {
      schoolsMap.set(activity.schoolId, activity.schoolName);
    }
    if (activity.subjectId && activity.subjectName) {
      subjectsMap.set(activity.subjectId, activity.subjectName);
    }
    if (activity.className) {
      // Use className as ID if no classId available
      classesMap.set(activity.className, activity.className);
    }
    if (activity.year) {
      schoolYearsMap.set(activity.year, activity.year);
    }
  }

  const toOptions = (map: Map<string, string>): ActivityFilterOption[] =>
    Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return {
    schools: toOptions(schoolsMap),
    classes: toOptions(classesMap),
    subjects: toOptions(subjectsMap),
    schoolYears: toOptions(schoolYearsMap),
  };
};

/**
 * Merge two filter option arrays, deduplicating by ID
 */
export const mergeActivityFilterOptions = (
  base: ActivityFilterOption[],
  extra: ActivityFilterOption[]
): ActivityFilterOption[] => {
  if (extra.length === 0) return base;
  const baseIds = new Set(base.map((item) => item.id));
  const hasNew = extra.some((item) => !baseIds.has(item.id));
  if (!hasNew) return base;
  const map = new Map(base.map((item) => [item.id, item.name] as const));
  extra.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item.name);
  });
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
  apiClient: ApiClientWithGet,
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
            schools: mergeActivityFilterOptions(
              prev.apiFilterOptions.schools,
              extracted.schools
            ),
            classes: mergeActivityFilterOptions(
              prev.apiFilterOptions.classes,
              extracted.classes
            ),
            subjects: mergeActivityFilterOptions(
              prev.apiFilterOptions.subjects,
              extracted.subjects
            ),
            schoolYears: mergeActivityFilterOptions(
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
  apiClient: ApiClientWithGet,
  options?: UseActivitiesHistoryOptions
) => {
  return (): UseActivitiesHistoryReturn =>
    useActivitiesHistoryImpl(apiClient, options);
};

/**
 * Alias for createUseActivitiesHistory
 */
export const createActivitiesHistoryHook = createUseActivitiesHistory;
