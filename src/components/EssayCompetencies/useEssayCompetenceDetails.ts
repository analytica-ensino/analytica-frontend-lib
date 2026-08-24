import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../../types/api';
import {
  COMPETENCE_DETAILS_ENDPOINT,
  buildCompetenceDetailsBody,
} from './competenceDetailsRequest';
import type {
  EssayCompetenceDetailsData,
  EssayCompetenceDetailsParams,
  EssayCompetenceDetailsApiResponse,
  UseEssayCompetenceDetailsReturn,
} from './types';

/** Página e tamanho de página quando o chamador não os informa. */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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
  api: BaseApiClient
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
          COMPETENCE_DETAILS_ENDPOINT,
          buildCompetenceDetailsBody(params, {
            page: params.page ?? DEFAULT_PAGE,
            limit: params.limit ?? DEFAULT_LIMIT,
          })
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
