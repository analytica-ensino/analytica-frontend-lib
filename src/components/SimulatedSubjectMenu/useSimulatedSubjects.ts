import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  SimulatedSubjectsApiResponse,
  UseSimulatedSubjectsState,
  UseSimulatedSubjectsReturn,
} from './types';

/**
 * Initial state for the hook
 */
const initialState: UseSimulatedSubjectsState = {
  subjects: [],
  loading: false,
  error: null,
};

/**
 * Build the API endpoint for subjects
 * Supports filtering by areaKnowledgeId (single) or areaKnowledgeIds (array for merged areas)
 */
function buildEndpoint(areaKnowledgeIds?: string[] | null): string {
  if (areaKnowledgeIds && areaKnowledgeIds.length > 0) {
    return `/performance/simulated/subjects?areaKnowledgeIds=${encodeURIComponent(areaKnowledgeIds.join(','))}`;
  }
  return '/performance/simulated/subjects';
}

/**
 * Hook for fetching subjects available in simulated exams
 *
 * Receives the API client and calls the endpoint directly.
 * Endpoint: GET /performance/simulated/subjects
 *
 * @param api - API client instance (axios-like)
 * @returns Hook state and methods
 *
 * @example
 * ```tsx
 * import api from '@/services/apiService';
 *
 * const { subjects, loading, error, fetchSubjects } = useSimulatedSubjects(api);
 *
 * useEffect(() => {
 *   fetchSubjects(areaKnowledgeId);
 * }, [fetchSubjects, areaKnowledgeId]);
 * ```
 */
export function useSimulatedSubjects(
  api: BaseApiClient
): UseSimulatedSubjectsReturn {
  const [state, setState] = useState<UseSimulatedSubjectsState>(initialState);

  /**
   * Fetch subjects, optionally filtered by area(s)
   * @param areaKnowledgeIds - Optional array of area knowledge IDs to filter subjects
   *                          (supports multiple IDs for merged areas)
   */
  const fetchSubjects = useCallback(
    async (areaKnowledgeIds?: string[] | null) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const endpoint = buildEndpoint(areaKnowledgeIds);
        const response = await api.get<SimulatedSubjectsApiResponse>(endpoint);

        setState({
          subjects: response.data.data,
          loading: false,
          error: null,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar disciplinas';

        console.error('Error fetching simulated subjects:', err);

        setState((prev) => ({
          ...prev,
          subjects: [],
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [api]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    fetchSubjects,
    reset,
  };
}

export default useSimulatedSubjects;
