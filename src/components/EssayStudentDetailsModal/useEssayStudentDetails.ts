import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  EssayStudentDetailsData,
  EssayStudentDetailsParams,
  EssayStudentDetailsApiResponse,
  UseEssayStudentDetailsState,
  UseEssayStudentDetailsReturn,
} from './types';

/**
 * Initial state for the hook
 */
const initialState: UseEssayStudentDetailsState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Hook for fetching essay student details
 * Returns student info, overall average, performance classification, and 5 competencies
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchDetails, reset } = useEssayStudentDetails(api);
 *
 * fetchDetails({
 *   userInstitutionId: 'uuid',
 *   period: '1_MONTH',
 * });
 * ```
 */
export function useEssayStudentDetails(
  api: BaseApiClient
): UseEssayStudentDetailsReturn {
  const [data, setData] = useState<EssayStudentDetailsData | null>(
    initialState.data
  );
  const [loading, setLoading] = useState(initialState.loading);
  const [error, setError] = useState<string | null>(initialState.error);

  const fetchDetails = useCallback(
    async (params: EssayStudentDetailsParams) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<EssayStudentDetailsApiResponse>(
          '/performance/simulated/essays/student-details',
          {
            userInstitutionId: params.userInstitutionId,
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
            : 'Não foi possível carregar os detalhes do estudante';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const reset = useCallback(() => {
    setData(initialState.data);
    setLoading(initialState.loading);
    setError(initialState.error);
  }, []);

  return { data, loading, error, fetchDetails, reset };
}
