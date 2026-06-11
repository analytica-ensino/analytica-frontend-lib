import { useCallback, useMemo } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  SimulationsStudentsResponse,
  SimulationsStudentsPage,
  SimulationsStudentsFilters,
  SimulationsListResponse,
  SimulationsListData,
  SimulationsListFilters,
  SimulationDetailResponse,
  SimulationDetailData,
  NoteResponse,
  NoteData,
} from '../types/simulations';

const BASE_URL = '/performance/simulations';

/** Encode a value before interpolating it into a request path segment. */
const segment = (value: string) => encodeURIComponent(value);

/**
 * Hook return type for the teacher-facing Simulations feature.
 *
 * The hook exposes imperative fetchers (rather than holding everything in
 * state) because the UI loads data lazily across three nested levels:
 * students list -> a student's simulations -> a simulation's questions.
 */
export interface UseSimulationsReturn {
  fetchStudents: (
    filters?: SimulationsStudentsFilters
  ) => Promise<SimulationsStudentsPage>;
  fetchStudentSimulations: (
    userInstitutionId: string,
    filters?: SimulationsListFilters
  ) => Promise<SimulationsListData>;
  fetchSimulationDetail: (
    userInstitutionId: string,
    simulationId: string
  ) => Promise<SimulationDetailData>;
  fetchNote: (
    userInstitutionId: string,
    simulationId: string
  ) => Promise<NoteData | null>;
  saveNote: (
    userInstitutionId: string,
    simulationId: string,
    note: string
  ) => Promise<NoteData | null>;
}

/**
 * Factory that binds an API client to the Simulations hook.
 *
 * @example
 * ```tsx
 * const useSimulations = createUseSimulations(api);
 * const { fetchStudents } = useSimulations();
 * ```
 */
export const createUseSimulations =
  (apiClient: BaseApiClient) => (): UseSimulationsReturn => {
    const fetchStudents = useCallback(
      async (
        filters: SimulationsStudentsFilters = {}
      ): Promise<SimulationsStudentsPage> => {
        const { page = 1, limit = 20, search, classIds } = filters;
        const response = await apiClient.get<SimulationsStudentsResponse>(
          `${BASE_URL}/students`,
          { params: { page, limit, search, classIds } }
        );
        return response.data.data.students;
      },
      []
    );

    const fetchStudentSimulations = useCallback(
      async (
        userInstitutionId: string,
        filters: SimulationsListFilters = {}
      ): Promise<SimulationsListData> => {
        const { page = 1, limit = 20 } = filters;
        const response = await apiClient.get<SimulationsListResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}`,
          { params: { page, limit } }
        );
        return response.data.data;
      },
      []
    );

    const fetchSimulationDetail = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string
      ): Promise<SimulationDetailData> => {
        const response = await apiClient.get<SimulationDetailResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}`
        );
        return response.data.data;
      },
      []
    );

    const fetchNote = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string
      ): Promise<NoteData | null> => {
        const response = await apiClient.get<NoteResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}/note`
        );
        return response.data.data;
      },
      []
    );

    const saveNote = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string,
        note: string
      ): Promise<NoteData | null> => {
        const response = await apiClient.post<NoteResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}/note`,
          { note }
        );
        return response.data.data;
      },
      []
    );

    return useMemo(
      () => ({
        fetchStudents,
        fetchStudentSimulations,
        fetchSimulationDetail,
        fetchNote,
        saveNote,
      }),
      [
        fetchStudents,
        fetchStudentSimulations,
        fetchSimulationDetail,
        fetchNote,
        saveNote,
      ]
    );
  };
