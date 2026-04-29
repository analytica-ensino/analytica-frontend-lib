import { useState, useCallback } from 'react';
import type {
  GeneralOverviewApiClient,
  GeneralOverviewParams,
  GeneralOverviewApiResponse,
  UseGeneralOverviewState,
  UseGeneralOverviewReturn,
} from './types';

/**
 * Initial state for the hook
 */
const initialState: UseGeneralOverviewState = {
  data: null,
  loading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Hook for fetching general overview data for simulated exams
 *
 * Receives the API client and calls the endpoint directly.
 * Endpoint: POST /performance/simulated/general-overview
 *
 * @param api - API client instance (axios-like)
 * @returns Hook state and methods
 *
 * @example
 * ```tsx
 * import api from '@/services/apiService';
 *
 * const { data, loading, error, fetchOverview } = useGeneralOverview(api);
 *
 * useEffect(() => {
 *   fetchOverview({
 *     period: '1_MONTH',
 *     schoolIds: ['school-id'],
 *     scoreType: 'tri',
 *   });
 * }, []);
 * ```
 */
export function useGeneralOverview(
  api: GeneralOverviewApiClient
): UseGeneralOverviewReturn {
  const [state, setState] = useState<UseGeneralOverviewState>(initialState);

  /**
   * Fetch general overview data
   * @param params - Request parameters
   * @param refresh - If true, sets isRefreshing instead of loading
   */
  const fetchOverview = useCallback(
    async (params: GeneralOverviewParams, refresh = false) => {
      // Set loading or refreshing state
      setState((prev) => ({
        ...prev,
        loading: !refresh,
        isRefreshing: refresh,
        error: null,
      }));

      try {
        // Build URL with optional scoreType query param
        let url = '/performance/simulated/general-overview';
        if (params.scoreType && params.scoreType !== 'percentage') {
          url += `?scoreType=${params.scoreType}`;
        }

        // Build request body (excludes scoreType and studentsIds)
        const body = {
          period: params.period,
          schoolIds: params.schoolIds || [],
          schoolYearIds: params.schoolYearIds || [],
          classIds: params.classIds || [],
        };

        const response = await api.post<GeneralOverviewApiResponse>(url, body);

        setState({
          data: response.data.data,
          loading: false,
          isRefreshing: false,
          error: null,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar dados gerais de desempenho';

        console.error('Error fetching general overview:', err);

        setState((prev) => ({
          ...prev,
          loading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    },
    [api]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    fetchOverview,
    reset,
  };
}

export default useGeneralOverview;
