import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import { ExamDraftType } from '../types/examDrafts';
import type {
  ExamModelFilters,
  ExamModelsApiResponse,
  ExamModelResponse,
  ExamModelTableItem,
  ExamModelsPagination,
} from '../types/examDrafts';

/**
 * Hook state interface
 */
export interface UseExamModelsState {
  models: ExamModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ExamModelsPagination;
}

/**
 * Hook return type
 */
export interface UseExamModelsReturn extends UseExamModelsState {
  fetchModels: (filters?: ExamModelFilters) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_EXAM_MODELS_PAGINATION: ExamModelsPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Transform API response to table item format
 * @param model - Model from API response
 * @returns Formatted model for table display
 */
export const transformModelToTableItem = (
  model: ExamModelResponse
): ExamModelTableItem => {
  return {
    id: model.id,
    title: model.title || 'Sem titulo',
    savedAt: model.updatedAt
      ? dayjs(model.updatedAt).format('DD/MM/YYYY')
      : '-',
    subject: model.subject?.name || '-',
    subjectId: model.subjectId,
  };
};

/**
 * Build query params from filters
 */
const buildQueryParams = (
  filters?: ExamModelFilters
): Record<string, unknown> => {
  if (!filters) return { type: ExamDraftType.MODELO };

  const params: Record<string, unknown> = { type: ExamDraftType.MODELO };
  for (const key in filters) {
    const value = filters[key as keyof ExamModelFilters];
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  }
  return params;
};

/**
 * Hook implementation
 */
const useExamModelsImpl = (apiClient: BaseApiClient): UseExamModelsReturn => {
  const [state, setState] = useState<UseExamModelsState>({
    models: [],
    loading: false,
    error: null,
    pagination: DEFAULT_EXAM_MODELS_PAGINATION,
  });

  /**
   * Fetch exam models from API
   */
  const fetchModels = useCallback(
    async (filters: ExamModelFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters);
        const response = await apiClient.get<ExamModelsApiResponse>(
          '/exam-drafts',
          { params }
        );

        const tableItems = response.data.data.examDrafts.map(
          transformModelToTableItem
        );

        const limit = filters.limit || 10;
        const total = response.data.data.total;

        setState({
          models: tableItems,
          loading: false,
          error: null,
          pagination: {
            total,
            page: filters.page || 1,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Erro ao carregar modelos de provas:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar modelos de provas',
        }));
      }
    },
    [apiClient]
  );

  /**
   * Delete an exam model
   */
  const deleteModel = useCallback(
    async (id: string): Promise<void> => {
      await apiClient.delete(`/exam-drafts/${id}`);
    },
    [apiClient]
  );

  return {
    ...state,
    fetchModels,
    deleteModel,
  };
};

/**
 * Factory function to create useExamModels hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @returns Hook for managing exam models
 *
 * @example
 * ```tsx
 * // In your app setup
 * import { createUseExamModels } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * export const useExamModels = createUseExamModels(api);
 *
 * // In your component
 * const { models, loading, fetchModels, deleteModel } = useExamModels();
 * ```
 */
export const createUseExamModels = (apiClient: BaseApiClient) => {
  return (): UseExamModelsReturn => useExamModelsImpl(apiClient);
};

/**
 * Alias for createUseExamModels
 */
export const createExamModelsHook = createUseExamModels;
