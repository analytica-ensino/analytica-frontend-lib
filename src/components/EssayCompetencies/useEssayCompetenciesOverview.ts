import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  EssayCompetenciesOverviewData,
  EssayCompetenciesOverviewParams,
  EssayCompetenciesOverviewApiResponse,
  UseEssayCompetenciesOverviewReturn,
} from './types';

/**
 * Hook for fetching essay competencies overview
 * Returns stats for all 5 ENEM competencies
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchOverview, reset } = useEssayCompetenciesOverview(api);
 *
 * fetchOverview({
 *   period: '1_MONTH',
 * });
 * ```
 */
export function useEssayCompetenciesOverview(
  api: BaseApiClient
): UseEssayCompetenciesOverviewReturn {
  const [data, setData] = useState<EssayCompetenciesOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchOverview = useCallback(
    async (params: EssayCompetenciesOverviewParams) => {
      const currentRequestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);

        const response = await api.post<EssayCompetenciesOverviewApiResponse>(
          '/performance/simulated/essays/competencies-overview',
          {
            period: params.period,
            schoolIds: params.schoolIds ?? [],
            schoolYearIds: params.schoolYearIds ?? [],
            classIds: params.classIds ?? [],
          }
        );

        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) return;

        setData(response.data.data);
      } catch (err) {
        // Ignore errors from stale requests
        if (currentRequestId !== requestIdRef.current) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o resumo das competências';
        setError(errorMessage);
      } finally {
        // Only update loading for current request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    // Invalidate any in-flight requests
    requestIdRef.current++;
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetchOverview, reset };
}
