import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  ContentDetailsData,
  ContentDetailsParams,
  ContentDetailsApiResponse,
  UseSimulatedContentDetailsReturn,
  ActivityFilters,
} from './types';

/**
 * Build the API endpoint with activity filters as query params
 */
function buildEndpoint(activityFilters: ActivityFilters): string {
  const params = new URLSearchParams();

  activityFilters.types?.forEach((t) => params.append('types', t));
  activityFilters.subtypes?.forEach((s) => params.append('subtypes', s));
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  const queryString = params.toString();
  return `/performance/simulated/activities/content-details${queryString ? `?${queryString}` : ''}`;
}

/**
 * Hook for fetching content details in simulated exams
 * Shows list of students with their performance for a specific content/habilidade
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchDetails, reset } = useSimulatedContentDetails(api);
 *
 * fetchDetails({
 *   activityFilters: { types: ['SIMULADO'], statuses: ['CONCLUIDA'] },
 *   contentId: 'content-uuid',
 *   period: '1_MONTH',
 * });
 * ```
 */
export function useSimulatedContentDetails(
  api: BaseApiClient
): UseSimulatedContentDetailsReturn {
  const [data, setData] = useState<ContentDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(
    async (params: ContentDetailsParams) => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = buildEndpoint(params.activityFilters);

        const response = await api.post<ContentDetailsApiResponse>(endpoint, {
          contentId: params.contentId,
          period: params.period,
          schoolIds: params.schoolIds,
          schoolYearIds: params.schoolYearIds,
          classIds: params.classIds,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          orderBy: params.orderBy,
          order: params.order,
        });

        setData(response.data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes da habilidade';
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
