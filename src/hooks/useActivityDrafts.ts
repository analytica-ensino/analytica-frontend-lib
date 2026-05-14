import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import { ActivityDraftType } from '../types/activitiesHistory';
import { ActivityType } from '../components/ActivityCreate/ActivityCreate.types';
import type {
  ActivityModelFilters,
  ActivityModelsApiResponse,
  ActivityModelResponse,
  ActivityModelTableItem,
  ActivityPagination,
} from '../types/activitiesHistory';

/**
 * Options for configuring the useActivityDrafts hook
 */
export interface UseActivityDraftsOptions {
  /** Filter by activity category (PROVA, ATIVIDADE, etc.) */
  activityCategory?: 'PROVA' | 'ATIVIDADE';
}

/**
 * Hook state interface
 */
export interface UseActivityDraftsState {
  drafts: ActivityModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ActivityPagination;
}

/**
 * Hook return type
 */
export interface UseActivityDraftsReturn extends UseActivityDraftsState {
  fetchDrafts: (filters?: ActivityModelFilters) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_DRAFTS_PAGINATION: ActivityPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Transform API response to table item format
 * @param draft - Draft from API response
 * @param subjectsMap - Optional map of subject IDs to names
 * @returns Formatted draft for table display
 */
export const transformDraftToTableItem = (
  draft: ActivityModelResponse,
  subjectsMap?: Map<string, string>
): ActivityModelTableItem => {
  // Use subject from API response if available
  let subject = draft.subject;
  if (!subject && draft.subjectId && subjectsMap) {
    const subjectName = subjectsMap.get(draft.subjectId);
    if (subjectName) {
      subject = {
        id: draft.subjectId,
        name: subjectName,
        icon: 'BookOpen',
        color: '#6B7280',
      };
    }
  }

  // Map ActivityDraftType to ActivityType
  const activityType =
    draft.type === ActivityDraftType.MODELO
      ? ActivityType.MODELO
      : ActivityType.RASCUNHO;

  return {
    id: draft.id,
    type: activityType,
    title: draft.title || 'Sem título',
    savedAt: draft.updatedAt
      ? dayjs(draft.updatedAt).format('DD/MM/YYYY')
      : '-',
    subject: subject || null,
    subjectId: draft.subjectId,
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
    type: ActivityDraftType.RASCUNHO, // drafts = RASCUNHO
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
const useActivityDraftsImpl = (
  apiClient: BaseApiClient,
  options?: UseActivityDraftsOptions
): UseActivityDraftsReturn => {
  const [state, setState] = useState<UseActivityDraftsState>({
    drafts: [],
    loading: false,
    error: null,
    pagination: DEFAULT_DRAFTS_PAGINATION,
  });

  /**
   * Fetch activity drafts from API
   * @param filters - Optional filters for pagination, search, etc.
   */
  const fetchDrafts = useCallback(
    async (filters: ActivityModelFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters, options?.activityCategory);
        const response = await apiClient.get<ActivityModelsApiResponse>(
          '/activity-drafts',
          { params }
        );

        const tableItems = response.data.data.activityDrafts.map((draft) =>
          transformDraftToTableItem(draft)
        );

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
        console.error('Erro ao carregar rascunhos:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar rascunhos',
        }));
      }
    },
    [apiClient, options?.activityCategory]
  );

  /**
   * Delete an activity draft
   * @param id - Draft ID to delete
   */
  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.delete(`/activity-drafts/${id}`);
        // Update local state on success
        setState((prev) => ({
          ...prev,
          drafts: prev.drafts.filter((d) => d.id !== id),
          pagination: {
            ...prev.pagination,
            total: Math.max(0, prev.pagination.total - 1),
          },
        }));
      } catch (error) {
        console.error('Erro ao deletar rascunho:', error);
        throw error;
      }
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
 * Factory function to create useActivityDrafts hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @param options - Hook configuration options
 * @returns Hook for managing activity drafts
 *
 * @example
 * ```tsx
 * // For activities
 * import { createUseActivityDrafts } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * const useActivityDrafts = createUseActivityDrafts(api, { activityCategory: 'ATIVIDADE' });
 *
 * // For exams (provas)
 * const useExamDrafts = createUseActivityDrafts(api, { activityCategory: 'PROVA' });
 *
 * // In your component
 * const { drafts, loading, fetchDrafts, deleteDraft } = useActivityDrafts();
 * ```
 */
export const createUseActivityDrafts = (
  apiClient: BaseApiClient,
  options?: UseActivityDraftsOptions
) => {
  return (): UseActivityDraftsReturn => useActivityDraftsImpl(apiClient, options);
};

/**
 * Alias for createUseActivityDrafts
 */
export const createActivityDraftsHook = createUseActivityDrafts;
