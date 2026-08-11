import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  EssayTheme,
  EssayThemeFilters,
  EssayThemesApiResponse,
  EssayThemesPagination,
} from '../types/essayThemes';

/**
 * Hook state
 */
export interface UseEssayThemesState {
  themes: EssayTheme[];
  loading: boolean;
  error: string | null;
  pagination: EssayThemesPagination;
}

/**
 * Hook return type
 */
export interface UseEssayThemesReturn extends UseEssayThemesState {
  fetchThemes: (filters?: EssayThemeFilters) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_ESSAY_THEMES_PAGINATION: EssayThemesPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

/**
 * Hook implementation
 */
const useEssayThemesImpl = (apiClient: BaseApiClient): UseEssayThemesReturn => {
  const [state, setState] = useState<UseEssayThemesState>({
    themes: [],
    loading: false,
    error: null,
    pagination: DEFAULT_ESSAY_THEMES_PAGINATION,
  });

  /**
   * Sequence of the latest request. A slower earlier response must not
   * overwrite a newer list — the search box can fire overlapping requests.
   */
  const requestIdRef = useRef(0);

  /**
   * Fetch the essay theme bank. The endpoint only ever returns active themes,
   * so a theme retired after being picked stays on the activity but stops
   * showing up here.
   *
   * @param filters - Pagination and text search
   */
  const fetchThemes = useCallback(
    async (filters: EssayThemeFilters = {}) => {
      const requestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params: Record<string, unknown> = {};
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;
        // The backend rejects an empty search, so only send it when typed.
        if (filters.search?.trim()) params.search = filters.search.trim();

        const response = await apiClient.get<EssayThemesApiResponse>(
          '/essays/themes',
          { params }
        );

        if (requestId !== requestIdRef.current) return;

        setState({
          themes: response.data.data.themes,
          loading: false,
          error: null,
          pagination: response.data.data.pagination,
        });
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        console.error('Erro ao carregar temas de redação:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar temas de redação',
        }));
      }
    },
    [apiClient]
  );

  return { ...state, fetchThemes };
};

/**
 * Factory function to create the useEssayThemes hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @returns Hook for reading the essay theme bank
 *
 * @example
 * ```tsx
 * const useEssayThemes = createUseEssayThemes(api);
 * const { themes, loading, fetchThemes } = useEssayThemes();
 * ```
 */
export const createUseEssayThemes = (apiClient: BaseApiClient) => {
  return (): UseEssayThemesReturn => useEssayThemesImpl(apiClient);
};
