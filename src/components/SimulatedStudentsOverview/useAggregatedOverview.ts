import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  AggregatedOverviewData,
  AggregatedOverviewParams,
  StudentsOverviewApiResponse,
  ClassesOverviewApiResponse,
  MunicipalitiesOverviewApiResponse,
  UseAggregatedOverviewState,
  UseAggregatedOverviewReturn,
  OverviewAggregationType,
} from './types';
import {
  simulationTypeToActivityFilters,
  SimulationType,
} from '../SimulatedStudentDetailsModal/types';
import { getErrorMessage } from './utils';

/**
 * Body type for POST endpoints
 */
interface AggregatedOverviewBody {
  period?: string;
  subjectId?: string;
  areaKnowledgeId?: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
}

/**
 * Build the API endpoint based on aggregation type
 */
function buildEndpoint(
  aggregationType: OverviewAggregationType,
  simulationType: SimulationType,
  scoreType?: string
): string {
  // Essays use the legacy endpoint
  if (simulationType === 'essays') {
    return '/performance/simulated/essays/students-overview';
  }

  const activityFilters = simulationTypeToActivityFilters(simulationType);
  const params = new URLSearchParams();

  // Add aggregationType as query param (unified endpoint)
  params.append('aggregationType', aggregationType);

  activityFilters.types?.forEach((t) => params.append('types', t));
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  if (scoreType && scoreType !== 'percentage') {
    params.append('scoreType', scoreType);
  }

  const basePath = '/performance/simulated/activities/overview';
  return `${basePath}?${params.toString()}`;
}

/**
 * Initial state for the hook
 */
const initialState: UseAggregatedOverviewState = {
  data: null,
  loading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Hook for fetching aggregated overview data (without students list)
 * Supports different aggregation types: students, classes, municipalities
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchOverview } = useAggregatedOverview(api);
 *
 * // For students overview
 * fetchOverview({
 *   aggregationType: 'students',
 *   simulationType: 'enem-1',
 *   period: '1_MONTH',
 * });
 *
 * // For classes overview (UNIT_MANAGER)
 * fetchOverview({
 *   aggregationType: 'classes',
 *   simulationType: 'enem-1',
 *   period: '1_MONTH',
 * });
 *
 * // For municipalities overview (REGIONAL_MANAGER)
 * fetchOverview({
 *   aggregationType: 'municipalities',
 *   simulationType: 'enem-1',
 *   period: '1_MONTH',
 * });
 * ```
 */
export function useAggregatedOverview(
  api: BaseApiClient
): UseAggregatedOverviewReturn {
  const [data, setData] = useState<AggregatedOverviewData | null>(
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
    params: AggregatedOverviewParams
  ): AggregatedOverviewBody => {
    return {
      period: params.period,
      subjectId: params.subjectId,
      areaKnowledgeId: params.areaKnowledgeId,
      schoolIds: params.schoolIds,
      schoolYearIds: params.schoolYearIds,
      classIds: params.classIds,
      studentsIds: params.studentsIds,
    };
  };

  const fetchOverview = useCallback(
    async (params: AggregatedOverviewParams, refresh = false) => {
      const currentRequestId = ++requestIdRef.current;

      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const endpoint = buildEndpoint(
          params.aggregationType,
          params.simulationType,
          params.scoreType
        );
        const body = paramsToBody(params);

        let responseData: AggregatedOverviewData;

        switch (params.aggregationType) {
          case 'classes': {
            const response = await api.post<ClassesOverviewApiResponse>(
              endpoint,
              body
            );
            responseData = response.data.data;
            break;
          }
          case 'municipalities': {
            const response = await api.post<MunicipalitiesOverviewApiResponse>(
              endpoint,
              body
            );
            responseData = response.data.data;
            break;
          }
          case 'students':
          default: {
            const response = await api.post<StudentsOverviewApiResponse>(
              endpoint,
              body
            );
            responseData = response.data.data;
            break;
          }
        }

        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) return;

        setData(responseData);
      } catch (err) {
        // Ignore errors from stale requests
        if (currentRequestId !== requestIdRef.current) return;

        setError(
          getErrorMessage(err, 'Não foi possível carregar os dados de overview')
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
