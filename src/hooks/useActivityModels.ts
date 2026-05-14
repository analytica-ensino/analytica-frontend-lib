import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import { ActivityDraftType } from '../types/activitiesHistory';
import { ActivityType } from '../components/ActivityCreate/ActivityCreate.types';
import type {
  ActivityModelResponse,
  ActivityModelTableItem,
  ActivityModelsApiResponse,
  ActivityModelFilters,
  ActivityPagination,
} from '../types/activitiesHistory';

/**
 * Options for configuring the useActivityModels hook
 */
export interface UseActivityModelsOptions {
  /** Filter by activity category (PROVA, ATIVIDADE, etc.) */
  activityCategory?: 'PROVA' | 'ATIVIDADE';
}

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
 * Build query params from filters
 * @param filters - User filters
 * @param activityCategory - Optional activity category filter
 * @returns Query params object
 */
const buildQueryParams = (
  filters?: ActivityModelFilters,
  activityCategory?: string
): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    type: ActivityDraftType.MODELO, // models = MODELO
  };

  // Add activityCategory filter if provided
  if (activityCategory) {
    params.activityType = activityCategory;
  }

  if (filters) {
    for (const key in filters) {
      const value = filters[key as keyof ActivityModelFilters];
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    }
  }

  return params;
};

/**
 * Hook implementation
 */
const useActivityModelsImpl = (
  apiClient: BaseApiClient,
  options?: UseActivityModelsOptions
): UseActivityModelsReturn => {
  const [state, setState] = useState<UseActivityModelsState>({
    models: [],
    loading: false,
    error: null,
    pagination: DEFAULT_MODELS_PAGINATION,
  });

  const fetchModels = useCallback(
    async (
      filters?: ActivityModelFilters,
      subjectsMap?: Map<string, string>
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters, options?.activityCategory);
        const response = await apiClient.get<ActivityModelsApiResponse>(
          '/activity-drafts',
          { params }
        );

        const tableItems = response.data.data.activityDrafts.map((model) =>
          transformModelToTableItem(model, subjectsMap)
        );

        const limit = filters?.limit || 10;
        const page = filters?.page || 1;
        const total = response.data.data.total;
        const totalPages = Math.ceil(total / limit);

        setState({
          models: tableItems,
          loading: false,
          error: null,
          pagination: { total, page, limit, totalPages },
        });
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar modelos de atividades',
        }));
      }
    },
    [apiClient, options?.activityCategory]
  );

  const deleteModel = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/activity-drafts/${id}`);
        setState((prev) => ({
          ...prev,
          models: prev.models.filter((m) => m.id !== id),
          pagination: {
            ...prev.pagination,
            total: Math.max(0, prev.pagination.total - 1),
          },
        }));
        return true;
      } catch (error) {
        console.error('Erro ao deletar modelo:', error);
        return false;
      }
    },
    [apiClient]
  );

  return { ...state, fetchModels, deleteModel };
};

/**
 * Factory function to create useActivityModels hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @param options - Hook configuration options
 * @returns Hook for managing activity models
 *
 * @example
 * ```tsx
 * import { createUseActivityModels } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * const useActivityModels = createUseActivityModels(api, { activityCategory: 'ATIVIDADE' });
 *
 * // In your component
 * const { models, loading, fetchModels, deleteModel } = useActivityModels();
 * ```
 */
export const createUseActivityModels = (
  apiClient: BaseApiClient,
  options?: UseActivityModelsOptions
) => {
  return (): UseActivityModelsReturn =>
    useActivityModelsImpl(apiClient, options);
};

/**
 * Alias for createUseActivityModels
 */
export const createActivityModelsHook = createUseActivityModels;
