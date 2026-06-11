import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  SimulatedOverviewData,
  SimulatedOverviewParams,
  SimulatedOverviewApiResponse,
  UseSimulatedOverviewState,
  UseSimulatedOverviewReturn,
} from './types';
import {
  simulationTypeToActivityFilters,
  SimulationType,
} from '../SimulatedStudentDetailsModal/types';
import { getErrorMessage } from './utils';

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
  studentsIds?: string[];
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
    const endpoint = '/performance/simulated/essays/students-overview';

    if (!queryString) {
      return endpoint;
    }

    return `${endpoint}?${queryString}`;
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
  const endpoint = '/performance/simulated/activities/students-overview';

  if (!queryString) {
    return endpoint;
  }

  return `${endpoint}?${queryString}`;
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

  // Track request ID to ignore stale responses
  const requestIdRef = useRef(0);

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
      studentsIds: params.studentsIds,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      orderBy: params.orderBy ?? 'name',
      order: params.order ?? 'asc',
    };
  };

  const fetchOverview = useCallback(
    async (params: SimulatedOverviewParams, refresh = false) => {
      const currentRequestId = ++requestIdRef.current;

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

        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) return;

        setData(response.data.data);
      } catch (err) {
        // Ignore errors from stale requests
        if (currentRequestId !== requestIdRef.current) return;

        setError(
          getErrorMessage(
            err,
            'Não foi possível carregar os dados de simulados'
          )
        );
      } finally {
        // Only update loading state for current request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    // Invalidate any in-flight requests
    requestIdRef.current++;
    setData(initialState.data);
    setLoading(initialState.loading);
    setIsRefreshing(initialState.isRefreshing);
    setError(initialState.error);
  }, []);

  return { data, loading, isRefreshing, error, fetchOverview, reset };
}
