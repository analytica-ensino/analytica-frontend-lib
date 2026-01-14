import { useState, useCallback } from 'react';
import {
  goalModelsApiResponseSchema,
  transformGoalModelToTableItem,
} from './useGoalModels';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';
import type {
  GoalModelTableItem,
  GoalModelsApiResponse,
  GoalModelFilters,
  GoalModelPagination,
} from '../types/recommendedLessons';

/**
 * Hook state interface for goal drafts
 */
export interface UseGoalDraftsState {
  models: GoalModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: GoalModelPagination;
}

/**
 * Hook return type for goal drafts
 */
export interface UseGoalDraftsReturn extends UseGoalDraftsState {
  fetchModels: (
    filters?: GoalModelFilters,
    subjectsMap?: Map<string, string>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Default pagination values for drafts
 */
export const DEFAULT_GOAL_DRAFTS_PAGINATION: GoalModelPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Handle errors during draft fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleGoalDraftFetchError = createFetchErrorHandler(
  'Erro ao validar dados de rascunhos de aulas',
  'Erro ao carregar rascunhos de aulas'
);

/**
 * Factory function to create useGoalDrafts hook
 *
 * @param fetchGoalDrafts - Function to fetch drafts from API
 * @param deleteGoalDraft - Function to delete a draft
 * @returns Hook for managing goal drafts
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchGoalDrafts = async (filters) => {
 *   const response = await api.get('/recommended-class/drafts', { params: { ...filters, type: 'RASCUNHO' } });
 *   return response.data;
 * };
 *
 * const deleteGoalDraft = async (id) => {
 *   await api.delete(`/recommended-class/drafts/${id}`);
 * };
 *
 * const useGoalDrafts = createUseGoalDrafts(fetchGoalDrafts, deleteGoalDraft);
 *
 * // In your component
 * const { models, loading, error, pagination, fetchModels, deleteModel } = useGoalDrafts();
 * ```
 */
export const createUseGoalDrafts = (
  fetchGoalDrafts: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>,
  deleteGoalDraft: (id: string) => Promise<void>
) => {
  return (): UseGoalDraftsReturn => {
    const [state, setState] = useState<UseGoalDraftsState>({
      models: [],
      loading: false,
      error: null,
      pagination: DEFAULT_GOAL_DRAFTS_PAGINATION,
    });

    /**
     * Fetch goal drafts from API
     * @param filters - Optional filters for pagination, search, etc.
     * @param subjectsMap - Map of subject IDs to subject names for display
     */
    const fetchModels = useCallback(
      async (filters?: GoalModelFilters, subjectsMap?: Map<string, string>) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchGoalDrafts(filters);

          // Validate response with Zod
          const validatedData = goalModelsApiResponseSchema.parse(responseData);

          // Transform drafts to table format
          const tableItems = validatedData.data.drafts.map((draft) =>
            transformGoalModelToTableItem(draft, subjectsMap)
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
          const errorMessage = handleGoalDraftFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchGoalDrafts]
    );

    /**
     * Delete a goal draft
     * @param id - Draft ID to delete
     * @returns True if deletion was successful
     */
    const deleteModel = useCallback(
      async (id: string): Promise<boolean> => {
        try {
          await deleteGoalDraft(id);
          return true;
        } catch (error) {
          console.error('Erro ao deletar rascunho:', error);
          return false;
        }
      },
      [deleteGoalDraft]
    );

    return {
      ...state,
      fetchModels,
      deleteModel,
    };
  };
};

/**
 * Alias for createUseGoalDrafts
 */
export const createGoalDraftsHook = createUseGoalDrafts;
