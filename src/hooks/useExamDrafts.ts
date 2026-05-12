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
export interface UseExamDraftsState {
  drafts: ExamModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ExamModelsPagination;
}

/**
 * Hook return type
 */
export interface UseExamDraftsReturn extends UseExamDraftsState {
  fetchDrafts: (filters?: ExamModelFilters) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_EXAM_DRAFTS_PAGINATION: ExamModelsPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Transform API response to table item format
 * @param draft - Draft from API response
 * @returns Formatted draft for table display
 */
export const transformDraftToTableItem = (
  draft: ExamModelResponse
): ExamModelTableItem => {
  return {
    id: draft.id,
    title: draft.title || 'Sem titulo',
    savedAt: draft.updatedAt
      ? dayjs(draft.updatedAt).format('DD/MM/YYYY')
      : '-',
    subject: draft.subject?.name || '-',
    subjectId: draft.subjectId,
  };
};

/**
 * Build query params from filters
 */
const buildQueryParams = (
  filters?: ExamModelFilters
): Record<string, unknown> => {
  if (!filters) return { type: ExamDraftType.RASCUNHO };

  const params: Record<string, unknown> = { type: ExamDraftType.RASCUNHO };
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
const useExamDraftsImpl = (apiClient: BaseApiClient): UseExamDraftsReturn => {
  const [state, setState] = useState<UseExamDraftsState>({
    drafts: [],
    loading: false,
    error: null,
    pagination: DEFAULT_EXAM_DRAFTS_PAGINATION,
  });

  /**
   * Fetch exam drafts from API
   */
  const fetchDrafts = useCallback(
    async (filters: ExamModelFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters);
        const response = await apiClient.get<ExamModelsApiResponse>(
          '/exam-drafts',
          { params }
        );

        const tableItems =
          response.data.data.examDrafts.map(transformDraftToTableItem);

        const limit = filters.limit || 10;
        const total = response.data.data.total;

        setState({
          drafts: tableItems,
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
        console.error('Erro ao carregar rascunhos de provas:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar rascunhos de provas',
        }));
      }
    },
    [apiClient]
  );

  /**
   * Delete an exam draft
   */
  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      await apiClient.delete(`/exam-drafts/${id}`);
    },
    [apiClient]
  );

  return {
    ...state,
    fetchDrafts,
    deleteDraft,
  };
};

/**
 * Factory function to create useExamDrafts hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @returns Hook for managing exam drafts
 *
 * @example
 * ```tsx
 * // In your app setup
 * import { createUseExamDrafts } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * export const useExamDrafts = createUseExamDrafts(api);
 *
 * // In your component
 * const { drafts, loading, fetchDrafts, deleteDraft } = useExamDrafts();
 * ```
 */
export const createUseExamDrafts = (apiClient: BaseApiClient) => {
  return (): UseExamDraftsReturn => useExamDraftsImpl(apiClient);
};

/**
 * Alias for createUseExamDrafts
 */
export const createExamDraftsHook = createUseExamDrafts;
