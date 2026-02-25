import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import { RecommendedClassDraftType } from '../types/recommendedLessons';
import type {
  RecommendedClassModelResponse,
  RecommendedClassModelTableItem,
  RecommendedClassModelsApiResponse,
  RecommendedClassModelFilters,
  RecommendedClassModelPagination,
} from '../types/recommendedLessons';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Zod schema for recommendedClass model response validation
 */
const recommendedClassModelResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(RecommendedClassDraftType),
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
 * Zod schema for recommendedClass models API response validation
 */
export const recommendedClassModelsApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    drafts: z.array(recommendedClassModelResponseSchema),
    total: z.number(),
  }),
});

/**
 * Hook state interface
 */
export interface UseRecommendedClassModelsState {
  models: RecommendedClassModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: RecommendedClassModelPagination;
}

/**
 * Hook return type
 */
export interface UseRecommendedClassModelsReturn
  extends UseRecommendedClassModelsState {
  fetchModels: (
    filters?: RecommendedClassModelFilters,
    subjectsMap?: Map<string, string>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Default pagination values
 */
export const DEFAULT_RECOMMENDED_CLASS_MODELS_PAGINATION: RecommendedClassModelPagination =
  {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

/**
 * Transform API response to table item format
 * @param model - RecommendedClass model from API response
 * @param subjectsMap - Map of subject IDs to subject names
 * @returns Formatted model for table display
 */
export const transformRecommendedClassModelToTableItem = (
  model: RecommendedClassModelResponse,
  subjectsMap?: Map<string, string>
): RecommendedClassModelTableItem => {
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
export const handleRecommendedClassModelFetchError = createFetchErrorHandler(
  'Erro ao validar dados de modelos de aulas',
  'Erro ao carregar modelos de aulas'
);

/**
 * Factory function to create useRecommendedClassModels hook
 *
 * @param fetchRecommendedClassModels - Function to fetch models from API
 * @param deleteRecommendedClassModel - Function to delete a model
 * @returns Hook for managing recommendedClass models
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchRecommendedClassModels = async (filters) => {
 *   const response = await api.get('/recommended-class/drafts', { params: { ...filters, type: 'MODELO' } });
 *   return response.data;
 * };
 *
 * const deleteRecommendedClassModel = async (id) => {
 *   await api.delete(`/recommended-class/drafts/${id}`);
 * };
 *
 * const useRecommendedClassModels = createUseRecommendedClassModels(fetchRecommendedClassModels, deleteRecommendedClassModel);
 *
 * // In your component
 * const { models, loading, error, pagination, fetchModels, deleteModel } = useRecommendedClassModels();
 * ```
 */
export const createUseRecommendedClassModels = (
  fetchRecommendedClassModels: (
    filters?: RecommendedClassModelFilters
  ) => Promise<RecommendedClassModelsApiResponse>,
  deleteRecommendedClassModel: (id: string) => Promise<void>
) => {
  return (): UseRecommendedClassModelsReturn => {
    const [state, setState] = useState<UseRecommendedClassModelsState>({
      models: [],
      loading: false,
      error: null,
      pagination: DEFAULT_RECOMMENDED_CLASS_MODELS_PAGINATION,
    });

    /**
     * Fetch recommendedClass models from API
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
          const responseData = await fetchRecommendedClassModels(filters);

          // Validate response with Zod
          const validatedData =
            recommendedClassModelsApiResponseSchema.parse(responseData);

          // Transform models to table format
          const tableItems = validatedData.data.drafts.map((model) =>
            transformRecommendedClassModelToTableItem(model, subjectsMap)
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
          const errorMessage = handleRecommendedClassModelFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchRecommendedClassModels]
    );

    /**
     * Delete a recommendedClass model
     * @param id - Model ID to delete
     * @returns True if deletion was successful
     */
    const deleteModel = useCallback(
      async (id: string): Promise<boolean> => {
        try {
          await deleteRecommendedClassModel(id);
          return true;
        } catch (error) {
          console.error('Erro ao deletar modelo:', error);
          return false;
        }
      },
      [deleteRecommendedClassModel]
    );

    return {
      ...state,
      fetchModels,
      deleteModel,
    };
  };
};

/**
 * Alias for createUseRecommendedClassModels
 */
export const createRecommendedClassModelsHook = createUseRecommendedClassModels;
