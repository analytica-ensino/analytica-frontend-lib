import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import {
  ReportSimulationType,
  simulationTypeToActivityFilters,
  type SimulationType,
  type StudentDetailsData,
  type StudentDetailsParams,
  type StudentDetailsApiResponse,
  type UseSimulatedStudentDetailsReturn,
} from './types';
import { paramsToBody } from './utils';

/**
 * Build the API endpoint with activity filters as query params
 */
function buildEndpoint(simulationType: SimulationType): string {
  if (simulationType === ReportSimulationType.ESSAYS) {
    return '/performance/simulated/essays/student-details';
  }

  const activityFilters = simulationTypeToActivityFilters(simulationType);
  const params = new URLSearchParams();

  activityFilters.types?.forEach((t) => params.append('types', t));
  activityFilters.subtypes?.forEach((s) => params.append('subtypes', s));
  activityFilters.statuses?.forEach((s) => params.append('statuses', s));

  const queryString = params.toString();
  const endpoint = '/performance/simulated/activities/student-details';

  if (!queryString) {
    return endpoint;
  }

  return `${endpoint}?${queryString}`;
}

/**
 * Hook for fetching student details in simulated exams
 * Supports cascading navigation: Subjects (level 1) -> Contents (level 2)
 *
 * @param api - API client with post method
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchDetails, reset } = useSimulatedStudentDetails(api);
 *
 * // Fetch subjects list (level 1)
 * fetchDetails({
 *   simulationType: 'enem-1',
 *   userInstitutionId: 'institution-uuid',
 *   period: '1_MONTH',
 * });
 *
 * // Fetch contents list (level 2)
 * fetchDetails({
 *   simulationType: 'enem-1',
 *   userInstitutionId: 'institution-uuid',
 *   period: '1_MONTH',
 *   subjectId: 'subject-uuid',
 * });
 * ```
 */
export function useSimulatedStudentDetails(
  api: BaseApiClient
): UseSimulatedStudentDetailsReturn {
  const [data, setData] = useState<StudentDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track request ID to ignore stale responses
  const requestIdRef = useRef(0);

  const fetchDetails = useCallback(
    async (params: StudentDetailsParams) => {
      const currentRequestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);

        const endpoint = buildEndpoint(params.simulationType);
        const body = paramsToBody(params);

        const response = await api.post<StudentDetailsApiResponse>(
          endpoint,
          body
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
            : 'Não foi possível carregar os detalhes do estudante';
        setError(errorMessage);
      } finally {
        // Only update loading state for current request
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

  return { data, loading, error, fetchDetails, reset };
}
