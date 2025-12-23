import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import {
  ActivityApiStatus,
  mapActivityStatusToDisplay,
} from '../types/activitiesHistory';
import type {
  ActivityHistoryResponse,
  ActivityTableItem,
  ActivitiesHistoryApiResponse,
  ActivityHistoryFilters,
  ActivityPagination,
} from '../types/activitiesHistory';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Zod schema for activity history API response validation
 * Based on /activities/history endpoint
 */
const activityHistoryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startDate: z.string().nullable(),
  finalDate: z.string().nullable(),
  status: z.nativeEnum(ActivityApiStatus),
  completionPercentage: z.number().min(0).max(100),
  subjectId: z.string().uuid().nullable(),
  schoolId: z.string().optional(),
  schoolName: z.string().optional(),
  year: z.string().optional(),
  className: z.string().optional(),
  subjectName: z.string().optional(),
});

export const activitiesHistoryApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    activities: z.array(activityHistoryResponseSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

/**
 * Hook state interface
 */
export interface UseActivitiesHistoryState {
  activities: ActivityTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ActivityPagination;
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
    title: activity.title,
    school: activity.schoolName || '-',
    year: activity.year || '-',
    subject: activity.subjectName || '-',
    class: activity.className || '-',
    status: mapActivityStatusToDisplay(activity.status),
    completionPercentage: activity.completionPercentage,
  };
};

/**
 * Handle errors during activity fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleActivityFetchError = createFetchErrorHandler(
  'Erro ao validar dados de histórico de atividades',
  'Erro ao carregar histórico de atividades'
);

/**
 * Factory function to create useActivitiesHistory hook
 *
 * @param fetchActivitiesHistory - Function to fetch activities from API
 * @returns Hook for managing activities history
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchActivitiesHistory = async (filters) => {
 *   const response = await api.get('/activities/history', { params: filters });
 *   return response.data;
 * };
 *
 * const useActivitiesHistory = createUseActivitiesHistory(fetchActivitiesHistory);
 *
 * // In your component
 * const { activities, loading, error, pagination, fetchActivities } = useActivitiesHistory();
 * ```
 */
export const createUseActivitiesHistory = (
  fetchActivitiesHistory: (
    filters?: ActivityHistoryFilters
  ) => Promise<ActivitiesHistoryApiResponse>
) => {
  return (): UseActivitiesHistoryReturn => {
    const [state, setState] = useState<UseActivitiesHistoryState>({
      activities: [],
      loading: false,
      error: null,
      pagination: DEFAULT_ACTIVITIES_PAGINATION,
    });

    /**
     * Fetch activities history from API
     * @param filters - Optional filters for pagination, search, sorting, etc.
     */
    const fetchActivities = useCallback(
      async (filters?: ActivityHistoryFilters) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchActivitiesHistory(filters);

          // Validate response with Zod
          const validatedData =
            activitiesHistoryApiResponseSchema.parse(responseData);

          // Transform activities to table format
          const tableItems = validatedData.data.activities.map(
            transformActivityToTableItem
          );

          // Update state with validated and transformed data
          setState({
            activities: tableItems,
            loading: false,
            error: null,
            pagination: validatedData.data.pagination,
          });
        } catch (error) {
          const errorMessage = handleActivityFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchActivitiesHistory]
    );

    return {
      ...state,
      fetchActivities,
    };
  };
};

/**
 * Alias for createUseActivitiesHistory
 */
export const createActivitiesHistoryHook = createUseActivitiesHistory;
