import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import {
  buildContentDetailsBody,
  buildContentDetailsEndpoint,
} from './contentDetailsRequest';
import type {
  ContentDetailsData,
  ContentDetailsParams,
  ContentDetailsApiResponse,
  UseSimulatedContentDetailsReturn,
} from './types';

/** Página e tamanho de página quando o chamador não os informa. */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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
  const requestVersionRef = useRef(0);

  const fetchDetails = useCallback(
    async (params: ContentDetailsParams) => {
      const currentRequestVersion = ++requestVersionRef.current;

      try {
        if (currentRequestVersion === requestVersionRef.current) {
          setLoading(true);
          setError(null);
        }

        const endpoint = buildContentDetailsEndpoint(params.activityFilters);

        const response = await api.post<ContentDetailsApiResponse>(
          endpoint,
          buildContentDetailsBody(params, {
            page: params.page ?? DEFAULT_PAGE,
            limit: params.limit ?? DEFAULT_LIMIT,
          })
        );

        if (currentRequestVersion === requestVersionRef.current) {
          setData(response.data.data);
        }
      } catch (err) {
        if (currentRequestVersion !== requestVersionRef.current) {
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes da habilidade';
        setError(errorMessage);
      } finally {
        if (currentRequestVersion === requestVersionRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    requestVersionRef.current++;
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetchDetails, reset };
}
