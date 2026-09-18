import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  KnowledgeArea,
  LessonsApiResponse,
  SubjectWithProgress,
} from '../types/lessonsCatalog';

export interface UseClassesCatalogState {
  knowledgeAreas: KnowledgeArea[];
  loading: boolean;
  error: string | null;
}

export interface UseClassesCatalogReturn extends UseClassesCatalogState {
  getKnowledgeAreas: () => Promise<void>;
  searchSubjects: (searchTerm: string) => SubjectWithProgress[];
  clearError: () => void;
  resetState: () => void;
}

const initialState: UseClassesCatalogState = {
  knowledgeAreas: [],
  loading: false,
  error: null,
};

/**
 * Build the hook that loads the knowledge areas and their subjects.
 *
 * Backed by `GET /knowledge`, which returns the matrix scoped to the caller's
 * profile: the student's trail with progress, the teacher's assigned subjects
 * without progress, and the manager's school/institution matrix without
 * progress. The hook is profile-agnostic — it renders whatever the backend
 * scopes for the caller.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns A hook exposing the areas, loading/error state and a local search
 *
 * @example
 * ```typescript
 * const useClassesCatalog = useMemo(() => createUseClassesCatalog(api), [api]);
 * const { knowledgeAreas, getKnowledgeAreas } = useClassesCatalog();
 * ```
 */
export const createUseClassesCatalog =
  (apiClient: BaseApiClient) => (): UseClassesCatalogReturn => {
    const [state, setState] = useState<UseClassesCatalogState>(initialState);

    const updateState = useCallback(
      (updates: Partial<UseClassesCatalogState>) => {
        setState((prev) => ({ ...prev, ...updates }));
      },
      []
    );

    const handleError = useCallback(
      (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
        updateState({ loading: false, error: errorMessage });
      },
      [updateState]
    );

    const getKnowledgeAreas = useCallback(async (): Promise<void> => {
      updateState({ loading: true, error: null });

      try {
        const response =
          await apiClient.get<LessonsApiResponse<KnowledgeArea[]>>(
            '/knowledge'
          );

        updateState({
          loading: false,
          knowledgeAreas: response.data.data,
          error: null,
        });
      } catch (error) {
        handleError(error);
      }
    }, [apiClient, updateState, handleError]);

    /**
     * Filter the already-loaded subjects by name. Client-side on purpose: the
     * subject list is small and already in memory, so there is no request.
     */
    const searchSubjects = useCallback(
      (searchTerm: string): SubjectWithProgress[] => {
        if (!searchTerm.trim()) {
          return [];
        }

        const normalizedSearch = searchTerm.toLowerCase().trim();
        const allSubjects: SubjectWithProgress[] = [];

        for (const area of state.knowledgeAreas) {
          for (const subject of area.subjects) {
            if (subject.name.toLowerCase().includes(normalizedSearch)) {
              allSubjects.push(subject);
            }
          }
        }

        return allSubjects;
      },
      [state.knowledgeAreas]
    );

    const clearError = useCallback(() => {
      updateState({ error: null });
    }, [updateState]);

    const resetState = useCallback(() => {
      setState(initialState);
    }, []);

    return {
      ...state,
      getKnowledgeAreas,
      searchSubjects,
      clearError,
      resetState,
    };
  };
