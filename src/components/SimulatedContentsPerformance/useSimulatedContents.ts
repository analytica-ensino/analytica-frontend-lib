import { useState, useCallback, useRef } from 'react';
import {
  ReportSimulationType,
  simulationTypeToActivityFilters,
  type SimulationType,
} from '../SimulatedStudentDetailsModal/types';
import type { BaseApiClient } from '../../types/api';
import type {
  SimulatedContentsParams,
  ContentsPerformanceData,
  ContentsPerformanceApiResponse,
  UseSimulatedContentsReturn,
} from './types';

/**
 * Build the API endpoint with activity filters and scoreType as query params
 */
function buildEndpoint(
  simulationType: SimulationType,
  scoreType?: 'percentage' | 'tri'
): string | null {
  // Essays don't have contents/skills
  if (simulationType === ReportSimulationType.ESSAYS) {
    return null;
  }

  const activityFilters = simulationTypeToActivityFilters(simulationType);
  const params = new URLSearchParams();

  activityFilters.types?.forEach((t) => params.append('types', t));
  activityFilters.subtypes?.forEach((s) => params.append('subtypes', s));
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  if (scoreType && scoreType !== 'percentage') {
    params.append('scoreType', scoreType);
  }

  const queryString = params.toString();
  return `/performance/simulated/activities/contents-performance${queryString ? `?${queryString}` : ''}`;
}

/**
 * Hook for fetching contents/skills performance in simulated exams
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, fetchContents } = useSimulatedContents(api);
 *
 * useEffect(() => {
 *   fetchContents({
 *     simulationType: 'enem-1',
 *     period: 'ONE_MONTH',
 *     page: 1,
 *     limit: 10,
 *   });
 * }, [fetchContents]);
 * ```
 */
export function useSimulatedContents(
  api: BaseApiClient
): UseSimulatedContentsReturn {
  const [data, setData] = useState<ContentsPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const fetchContents = useCallback(
    async (params: SimulatedContentsParams, refresh = false) => {
      const endpoint = buildEndpoint(params.simulationType, params.scoreType);

      // Essays don't have contents
      if (!endpoint) {
        setData(null);
        setError(null);
        return;
      }

      if (isFirstLoad.current && !refresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const response = await api.post<ContentsPerformanceApiResponse>(
          endpoint,
          {
            period: params.period,
            subjectId:
              params.subjectId && params.subjectId !== 'all'
                ? params.subjectId
                : undefined,
            areaKnowledgeId:
              params.areaKnowledgeId && params.areaKnowledgeId !== 'all'
                ? params.areaKnowledgeId
                : undefined,
            schoolIds: params.schoolIds,
            schoolYearIds: params.schoolYearIds,
            classIds: params.classIds,
            studentsIds: params.studentsIds,
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            orderBy: params.orderBy ?? 'correctPercentage',
            order: params.order ?? 'asc',
          }
        );

        setData(response.data.data);
        isFirstLoad.current = false;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar dados de habilidades';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setIsRefreshing(false);
    setError(null);
    isFirstLoad.current = true;
  }, []);

  return {
    data,
    loading,
    isRefreshing,
    error,
    fetchContents,
    reset,
  };
}
