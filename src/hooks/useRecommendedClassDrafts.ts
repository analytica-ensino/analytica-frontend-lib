import { useState, useCallback } from 'react';
import {
  recommendedClassModelsApiResponseSchema,
  transformRecommendedClassModelToTableItem,
} from './useRecommendedClassModels';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';
import type {
  RecommendedClassModelTableItem,
  RecommendedClassModelsApiResponse,
  RecommendedClassModelFilters,
  RecommendedClassModelPagination,
} from '../types/recommendedLessons';

/**
 * Hook state interface for recommendedClass drafts
 */
export interface UseRecommendedClassDraftsState {
  models: RecommendedClassModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: RecommendedClassModelPagination;
}

/**
 * Hook return type for recommendedClass drafts
 */
export interface UseRecommendedClassDraftsReturn
  extends UseRecommendedClassDraftsState {
  fetchModels: (
    filters?: RecommendedClassModelFilters,
    subjectsMap?: Map<string, string>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Default pagination values for drafts
 */
export const DEFAULT_RECOMMENDED_CLASS_DRAFTS_PAGINATION: RecommendedClassModelPagination =
  {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

/**
 * Handle errors during draft fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleRecommendedClassDraftFetchError = createFetchErrorHandler(
  'Erro ao validar dados de rascunhos de aulas',
  'Erro ao carregar rascunhos de aulas'
);

/**
 * Factory function to create useRecommendedClassDrafts hook
 *
 * @param fetchRecommendedClassDrafts - Function to fetch drafts from API
 * @param deleteRecommendedClassDraft - Function to delete a draft
 * @returns Hook for managing recommendedClass drafts
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchRecommendedClassDrafts = async (filters) => {
 *   const response = await api.get('/recommended-class/drafts', { params: { ...filters, type: 'RASCUNHO' } });
 *   return response.data;
 * };
 *
 * const deleteRecommendedClassDraft = async (id) => {
 *   await api.delete(`/recommended-class/drafts/${id}`);
 * };
 *
 * const useRecommendedClassDrafts = createUseRecommendedClassDrafts(fetchRecommendedClassDrafts, deleteRecommendedClassDraft);
 *
 * // In your component
 * const { models, loading, error, pagination, fetchModels, deleteModel } = useRecommendedClassDrafts();
 * ```
 */
export const createUseRecommendedClassDrafts = (
  fetchRecommendedClassDrafts: (
    filters?: RecommendedClassModelFilters
  ) => Promise<RecommendedClassModelsApiResponse>,
  deleteRecommendedClassDraft: (id: string) => Promise<void>
) => {
  return (): UseRecommendedClassDraftsReturn => {
    const [state, setState] = useState<UseRecommendedClassDraftsState>({
      models: [],
      loading: false,
      error: null,
      pagination: DEFAULT_RECOMMENDED_CLASS_DRAFTS_PAGINATION,
    });

    /**
     * Fetch recommendedClass drafts from API
     * @param filters - Optional filters for pagination, search, etc.
     * @param subjectsMap - Map of subject IDs to subject names for display
     */
    const fetchModels = useCallback(
      async (
        filters?: RecommendedClassModelFilters,
        subjectsMap?: Map<string, string>
      ) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchRecommendedClassDrafts(filters);

          // Validate response with Zod
          const validatedData =
            recommendedClassModelsApiResponseSchema.parse(responseData);

          // Transform drafts to table format
          const tableItems = validatedData.data.drafts.map((draft) =>
            transformRecommendedClassModelToTableItem(draft, subjectsMap)
          );

          // Calculate pagination
          const limit = filters?.limit || 10;
          const page = filters?.page || 1;
          const total = validatedData.data.total;
          const totalPages = Math.ceil(total / limit);

          // Update state with validated and transformed data
          setState({
            models: tableItems,
            loading: false,
            error: null,
            pagination: {
              total,
              page,
              limit,
              totalPages,
            },
          });
        } catch (error) {
          const errorMessage = handleRecommendedClassDraftFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchRecommendedClassDrafts]
    );

    /**
     * Delete a recommendedClass draft
     * @param id - Draft ID to delete
     * @returns True if deletion was successful
     */
    const deleteModel = useCallback(
      async (id: string): Promise<boolean> => {
        try {
          await deleteRecommendedClassDraft(id);
          return true;
        } catch (error) {
          console.error('Erro ao deletar rascunho:', error);
          return false;
        }
      },
      [deleteRecommendedClassDraft]
    );

    return {
      ...state,
      fetchModels,
      deleteModel,
    };
  };
};

/**
 * Alias for createUseRecommendedClassDrafts
 */
export const createRecommendedClassDraftsHook = createUseRecommendedClassDrafts;
