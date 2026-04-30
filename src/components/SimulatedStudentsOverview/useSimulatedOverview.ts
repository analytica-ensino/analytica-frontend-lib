import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  SimulatedOverviewData,
  SimulatedOverviewParams,
  SimulatedOverviewApiResponse,
  UseSimulatedOverviewState,
  UseSimulatedOverviewReturn,
  SimulationType,
} from './types';
import { simulationTypeToActivityFilters } from './types';

/**
 * Body type for POST endpoints
 */
interface SimulatedOverviewBody {
  period?: string;
  subjectId?: string;
  areaKnowledgeId?: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Build the API endpoint with activity filters and scoreType as query params
 */
function buildEndpoint(
  simulationType: SimulationType,
  scoreType?: string
): string {
  // Essays still use the legacy endpoint since they don't have activity filters
  if (simulationType === 'essays') {
    const params = new URLSearchParams();
    if (scoreType && scoreType !== 'percentage') {
      params.append('scoreType', scoreType);
    }
    const queryString = params.toString();
    return `/performance/simulated/essays/students-overview${queryString ? `?${queryString}` : ''}`;
  }

  const activityFilters = simulationTypeToActivityFilters(simulationType);
  const params = new URLSearchParams();

  activityFilters.types?.forEach((t) => params.append('types', t));
  // Note: subtypes are not sent - the backend filters by areaKnowledgeId/subjectId in the body
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  // Add scoreType if not default (percentage)
  if (scoreType && scoreType !== 'percentage') {
    params.append('scoreType', scoreType);
  }

  const queryString = params.toString();
  return `/performance/simulated/activities/students-overview${queryString ? `?${queryString}` : ''}`;
}

/**
 * Initial state for the hook
 */
const initialState: UseSimulatedOverviewState = {
  data: null,
  loading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Hook for fetching simulated exams overview data
 * Supports ENEM Prova 1, ENEM Prova 2, and Essays
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchOverview } = useSimulatedOverview(api);
 *
 * fetchOverview({
 *   simulationType: 'enem-1',
 *   period: '1_MONTH',
 *   subjectId: 'subject-uuid',
 *   page: 1,
 *   limit: 10,
 * });
 * ```
 */
export function useSimulatedOverview(
  api: BaseApiClient
): UseSimulatedOverviewReturn {
  const [data, setData] = useState<SimulatedOverviewData | null>(
    initialState.data
  );
  const [loading, setLoading] = useState(initialState.loading);
  const [isRefreshing, setIsRefreshing] = useState(initialState.isRefreshing);
  const [error, setError] = useState<string | null>(initialState.error);

  /**
   * Convert params to POST body format
   */
  const paramsToBody = (
    params: SimulatedOverviewParams
  ): SimulatedOverviewBody => {
    return {
      period: params.period,
      subjectId: params.subjectId,
      areaKnowledgeId: params.areaKnowledgeId,
      schoolIds: params.schoolIds,
      schoolYearIds: params.schoolYearIds,
      classIds: params.classIds,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      orderBy: params.orderBy ?? 'name',
      order: params.order ?? 'asc',
    };
  };

  const fetchOverview = useCallback(
    async (params: SimulatedOverviewParams, refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const endpoint = buildEndpoint(params.simulationType, params.scoreType);
        const body = paramsToBody(params);

        const response = await api.post<SimulatedOverviewApiResponse>(
          endpoint,
          body
        );

        setData(response.data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os dados de simulados';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    setData(initialState.data);
    setLoading(initialState.loading);
    setIsRefreshing(initialState.isRefreshing);
    setError(initialState.error);
  }, []);

  return { data, loading, isRefreshing, error, fetchOverview, reset };
}
