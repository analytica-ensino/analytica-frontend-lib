import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import { ActivityDraftType } from '../types/activitiesHistory';
import { ActivityType } from '../components/ActivityCreate/ActivityCreate.types';
import type {
  ActivityModelResponse,
  ActivityModelTableItem,
  ActivityModelsApiResponse,
  ActivityModelFilters,
  ActivityPagination,
} from '../types/activitiesHistory';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Zod schema for activity draft filters
 */
const activityDraftFiltersSchema = z
  .object({
    questionTypes: z.array(z.string()).optional(),
    questionBanks: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    subtopics: z.array(z.string()).optional(),
    contents: z.array(z.string()).optional(),
  })
  .nullable();

/**
 * Zod schema for activity model response validation
 */
const activityModelResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ActivityDraftType),
  title: z.string().nullable(),
  creatorUserInstitutionId: z.string().uuid().nullable(),
  subjectId: z.string().uuid().nullable(),
  filters: activityDraftFiltersSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Zod schema for activity models API response validation
 */
export const activityModelsApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    activityDrafts: z.array(activityModelResponseSchema),
    total: z.number(),
  }),
});

/**
 * Hook state interface
 */
export interface UseActivityModelsState {
  models: ActivityModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ActivityPagination;
}

/**
 * Hook return type
 */
export interface UseActivityModelsReturn extends UseActivityModelsState {
  fetchModels: (
    filters?: ActivityModelFilters,
    subjectsMap?: Map<string, string>
  ) => Promise<void>;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Default pagination values
 */
export const DEFAULT_MODELS_PAGINATION: ActivityPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Transform API response to table item format
 * @param model - Activity model from API response
 * @param subjectsMap - Map of subject IDs to subject names (fallback if subject is not in response)
 * @returns Formatted model for table display
 */
export const transformModelToTableItem = (
  model: ActivityModelResponse,
  subjectsMap?: Map<string, string>
): ActivityModelTableItem => {
  // Use subject from API response if available
  // If not available and subjectsMap is provided, create a basic subject object
  let subject = model.subject;
  if (!subject && model.subjectId && subjectsMap) {
    const subjectName = subjectsMap.get(model.subjectId);
    if (subjectName) {
      subject = {
        id: model.subjectId,
        name: subjectName,
        icon: 'BookOpen',
        color: '#6B7280',
      };
    }
  }

  // Map ActivityDraftType to ActivityType
  const activityType =
    model.type === ActivityDraftType.MODELO
      ? ActivityType.MODELO
      : ActivityType.RASCUNHO;

  return {
    id: model.id,
    type: activityType,
    title: model.title || 'Sem título',
    savedAt: dayjs(model.createdAt).format('DD/MM/YYYY'),
    subject: subject || null,
    subjectId: model.subjectId,
  };
};

/**
 * Handle errors during model fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleModelFetchError = createFetchErrorHandler(
  'Erro ao validar dados de modelos de atividades',
  'Erro ao carregar modelos de atividades'
);

/**
 * Factory function to create useActivityModels hook
 *
 * @param fetchActivityModels - Function to fetch models from API
 * @param deleteActivityModel - Function to delete a model
 * @returns Hook for managing activity models
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchActivityModels = async (filters) => {
 *   const response = await api.get('/activity-drafts', { params: { ...filters, type: 'MODELO' } });
 *   return response.data;
 * };
 *
 * const deleteActivityModel = async (id) => {
 *   await api.delete(`/activity-drafts/${id}`);
 * };
 *
 * const useActivityModels = createUseActivityModels(fetchActivityModels, deleteActivityModel);
 *
 * // In your component
 * const { models, loading, error, pagination, fetchModels, deleteModel } = useActivityModels();
 * ```
 */
export const createUseActivityModels = (
  fetchActivityModels: (
    filters?: ActivityModelFilters
  ) => Promise<ActivityModelsApiResponse>,
  deleteActivityModel: (id: string) => Promise<void>
) => {
  return (): UseActivityModelsReturn => {
    const [state, setState] = useState<UseActivityModelsState>({
      models: [],
      loading: false,
      error: null,
      pagination: DEFAULT_MODELS_PAGINATION,
    });

    /**
     * Fetch activity models from API
     * @param filters - Optional filters for pagination, search, etc.
     * @param subjectsMap - Map of subject IDs to subject names for display
     */
    const fetchModels = useCallback(
      async (
        filters?: ActivityModelFilters,
        subjectsMap?: Map<string, string>
      ) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchActivityModels(filters);

          // Validate response with Zod
          const validatedData =
            activityModelsApiResponseSchema.parse(responseData);

          // Transform models to table format
          const tableItems = validatedData.data.activityDrafts.map((model) =>
            transformModelToTableItem(model, subjectsMap)
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
          const errorMessage = handleModelFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchActivityModels]
    );

    /**
     * Delete an activity model
     * @param id - Model ID to delete
     * @returns True if deletion was successful
     */
    const deleteModel = useCallback(
      async (id: string): Promise<boolean> => {
        try {
          await deleteActivityModel(id);
          return true;
        } catch (error) {
          console.error('Erro ao deletar modelo:', error);
          return false;
        }
      },
      [deleteActivityModel]
    );

    return {
      ...state,
      fetchModels,
      deleteModel,
    };
  };
};

/**
 * Alias for createUseActivityModels
 */
export const createActivityModelsHook = createUseActivityModels;
