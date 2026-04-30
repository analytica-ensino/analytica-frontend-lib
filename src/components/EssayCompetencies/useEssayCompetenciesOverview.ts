import { useState, useCallback } from 'react';
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

  const fetchOverview = useCallback(
    async (params: EssayCompetenciesOverviewParams) => {
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

        setData(response.data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o resumo das competências';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetchOverview, reset };
}
