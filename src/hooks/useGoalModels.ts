import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import { GoalDraftType } from '../types/recommendedLessons';
import type {
  GoalModelResponse,
  GoalModelTableItem,
  GoalModelsApiResponse,
  GoalModelFilters,
  GoalModelPagination,
} from '../types/recommendedLessons';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Zod schema for goal model response validation
 */
const goalModelResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(GoalDraftType),
  title: z.string(),
  description: z.string().nullable(),
  creatorUserInstitutionId: z.string().uuid(),
  subjectId: z.string().uuid().nullable(),
  startDate: z.string().nullable(),
  finalDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Zod schema for goal models API response validation
 */
export const goalModelsApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    drafts: z.array(goalModelResponseSchema),
    total: z.number(),
  }),
});

/**
 * Hook state interface
 */
export interface UseGoalModelsState {
  models: GoalModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: GoalModelPagination;
}

/**
 * Hook return type
 */
export interface UseGoalModelsReturn extends UseGoalModelsState {
  fetchModels: (
    filters?: GoalModelFilters,
    subjectsMap?: Map<string, string>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Default pagination values
 */
export const DEFAULT_GOAL_MODELS_PAGINATION: GoalModelPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Transform API response to table item format
 * @param model - Goal model from API response
 * @param subjectsMap - Map of subject IDs to subject names
 * @returns Formatted model for table display
 */
export const transformGoalModelToTableItem = (
  model: GoalModelResponse,
  subjectsMap?: Map<string, string>
): GoalModelTableItem => {
  const subjectName = model.subjectId
    ? subjectsMap?.get(model.subjectId) || ''
    : '';

  return {
    id: model.id,
    title: model.title || 'Sem título',
    savedAt: dayjs(model.createdAt).format('DD/MM/YYYY'),
    subject: subjectName,
    subjectId: model.subjectId,
  };
};

/**
 * Handle errors during model fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleGoalModelFetchError = createFetchErrorHandler(
  'Erro ao validar dados de modelos de aulas',
  'Erro ao carregar modelos de aulas'
);

/**
 * Factory function to create useGoalModels hook
 *
 * @param fetchGoalModels - Function to fetch models from API
 * @param deleteGoalModel - Function to delete a model
 * @returns Hook for managing goal models
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchGoalModels = async (filters) => {
 *   const response = await api.get('/recommended-class/drafts', { params: { ...filters, type: 'MODELO' } });
 *   return response.data;
 * };
 *
 * const deleteGoalModel = async (id) => {
 *   await api.delete(`/recommended-class/drafts/${id}`);
 * };
 *
 * const useGoalModels = createUseGoalModels(fetchGoalModels, deleteGoalModel);
 *
 * // In your component
 * const { models, loading, error, pagination, fetchModels, deleteModel } = useGoalModels();
 * ```
 */
export const createUseGoalModels = (
  fetchGoalModels: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>,
  deleteGoalModel: (id: string) => Promise<void>
) => {
  return (): UseGoalModelsReturn => {
    const [state, setState] = useState<UseGoalModelsState>({
      models: [],
      loading: false,
      error: null,
      pagination: DEFAULT_GOAL_MODELS_PAGINATION,
    });

    /**
     * Fetch goal models from API
     * @param filters - Optional filters for pagination, search, etc.
     * @param subjectsMap - Map of subject IDs to subject names for display
     */
    const fetchModels = useCallback(
      async (filters?: GoalModelFilters, subjectsMap?: Map<string, string>) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchGoalModels(filters);

          // Validate response with Zod
          const validatedData = goalModelsApiResponseSchema.parse(responseData);

          // Transform models to table format
          const tableItems = validatedData.data.drafts.map((model) =>
            transformGoalModelToTableItem(model, subjectsMap)
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
          const errorMessage = handleGoalModelFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchGoalModels]
    );

    /**
     * Delete a goal model
     * @param id - Model ID to delete
     * @returns True if deletion was successful
     */
    const deleteModel = useCallback(
      async (id: string): Promise<boolean> => {
        try {
          await deleteGoalModel(id);
          return true;
        } catch (error) {
          console.error('Erro ao deletar modelo:', error);
          return false;
        }
      },
      [deleteGoalModel]
    );

    return {
      ...state,
      fetchModels,
      deleteModel,
    };
  };
};

/**
 * Alias for createUseGoalModels
 */
export const createGoalModelsHook = createUseGoalModels;
