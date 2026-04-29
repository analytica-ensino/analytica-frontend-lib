import { useState, useCallback } from 'react';
import type {
  EssayCompetenceDetailsData,
  EssayCompetenceDetailsParams,
  EssayCompetenceDetailsApiResponse,
  EssayCompetenciesApiClient,
  UseEssayCompetenceDetailsReturn,
} from './types';

/**
 * Hook for fetching essay competence details
 * Returns competence info, class average, counters, and paginated students list
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchDetails, reset } = useEssayCompetenceDetails(api);
 *
 * fetchDetails({
 *   competenceNumber: 1,
 *   period: '1_MONTH',
 *   page: 1,
 *   limit: 20,
 * });
 * ```
 */
export function useEssayCompetenceDetails(
  api: EssayCompetenciesApiClient
): UseEssayCompetenceDetailsReturn {
  const [data, setData] = useState<EssayCompetenceDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(
    async (params: EssayCompetenceDetailsParams) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<EssayCompetenceDetailsApiResponse>(
          '/performance/simulated/essays/competence-details',
          {
            competenceNumber: params.competenceNumber,
            period: params.period,
            schoolIds: params.schoolIds ?? [],
            schoolYearIds: params.schoolYearIds ?? [],
            classIds: params.classIds ?? [],
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            orderBy: params.orderBy ?? 'averageScore',
            order: params.order ?? 'desc',
          }
        );

        setData(response.data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes da competência';
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

  return { data, loading, error, fetchDetails, reset };
}
