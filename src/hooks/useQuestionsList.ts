import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  QuestionsFilterBody,
  QuestionsListResponseActivity,
  QuestionsByIdsBody,
  QuestionsByIdsResponse,
  Question,
  Pagination,
  PaginationActivity,
} from '../types/questions';

// ============================================================================
// Hook State Types
// ============================================================================

/**
 * Hook state interface
 */
interface UseQuestionsListState {
  questions: Question[];
  pagination: Pagination | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  currentFilters: Partial<QuestionsFilterBody> | null;
}

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Hook return type
 */
export interface UseQuestionsListReturn extends UseQuestionsListState {
  fetchQuestions: (
    filters?: Partial<QuestionsFilterBody>,
    append?: boolean
  ) => Promise<void>;
  fetchRandomQuestions: (
    count: number,
    filters?: Partial<QuestionsFilterBody>
  ) => Promise<Question[]>;
  fetchQuestionsByIds: (questionIds: string[]) => Promise<Question[]>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Main Hook Implementation
// ============================================================================

const useQuestionsListImpl = (
  apiClient: BaseApiClient
): UseQuestionsListReturn => {
  const [state, setState] = useState<UseQuestionsListState>({
    questions: [],
    pagination: null,
    loading: false,
    loadingMore: false,
    error: null,
    currentFilters: null,
  });

  const updateState = useCallback((updates: Partial<UseQuestionsListState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      console.error('Erro ao carregar questões:', error);
      let errorMessage = 'Erro ao carregar questões';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMessage =
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      updateState({
        loading: false,
        loadingMore: false,
        error: errorMessage,
      });
    },
    [updateState]
  );

  /**
   * Convert PaginationActivity to Pagination format
   */
  const convertPagination = (
    pagination: PaginationActivity | undefined
  ): Pagination | null => {
    if (!pagination) return null;
    return {
      page: pagination.page,
      pageSize: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrevious: pagination.hasPrev,
    };
  };

  /**
   * Fetch questions from API with filters
   * @param filters - Filters to apply
   * @param append - If true, appends results to existing questions; if false, replaces them
   */
  const fetchQuestions = useCallback(
    async (filters?: Partial<QuestionsFilterBody>, append: boolean = false) => {
      if (append) {
        setState((prev) => ({ ...prev, loadingMore: true, error: null }));
      } else {
        updateState({ loading: true, error: null, questions: [] });
      }

      try {
        const validatedFilters: QuestionsFilterBody = {
          ...filters,
        };

        const response = await apiClient.post<QuestionsListResponseActivity>(
          '/questions/list',
          validatedFilters
        );

        setState((prev) => ({
          loading: false,
          loadingMore: false,
          questions: append
            ? [...prev.questions, ...response.data.data.questions]
            : response.data.data.questions,
          pagination: convertPagination(response.data.data.pagination),
          error: null,
          currentFilters: validatedFilters,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
        }));
        handleError(error);
      }
    },
    [apiClient, updateState, handleError]
  );

  /**
   * Fetch random questions from API
   * @param count - Number of random questions to fetch
   * @param filters - Optional filters to apply
   * @returns Promise with array of questions
   */
  const fetchRandomQuestions = useCallback(
    async (
      count: number,
      filters?: Partial<QuestionsFilterBody>
    ): Promise<Question[]> => {
      try {
        const validatedFilters: QuestionsFilterBody = {
          ...filters,
          randomQuestions: count,
        };

        const response = await apiClient.post<QuestionsListResponseActivity>(
          '/questions/list',
          validatedFilters
        );

        return response.data.data.questions;
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [apiClient, handleError]
  );

  /**
   * Fetch questions by their IDs
   * @param questionIds - Array of question IDs to fetch
   * @returns Promise with array of questions
   */
  const fetchQuestionsByIds = useCallback(
    async (questionIds: string[]): Promise<Question[]> => {
      try {
        const body: QuestionsByIdsBody & Record<string, unknown> = {
          questionsIds: questionIds,
        };

        const response = await apiClient.post<QuestionsByIdsResponse>(
          '/questions/by-ids',
          body
        );

        return response.data.data.questions;
      } catch (error) {
        handleError(error);
        return [];
      }
    },
    [apiClient, handleError]
  );

  const loadMore = useCallback(async () => {
    setState((prev) => {
      const { currentFilters, pagination, loadingMore: isLoadingMore } = prev;

      if (isLoadingMore || !currentFilters || !pagination?.hasNext) {
        return prev;
      }

      const nextPageFilters = {
        ...currentFilters,
        page: pagination.page + 1,
      };

      fetchQuestions(nextPageFilters, true).catch((error) => {
        console.error('Erro ao carregar mais questões:', error);
      });

      return {
        ...prev,
        loadingMore: true,
      };
    });
  }, [fetchQuestions]);

  /**
   * Reset questions list
   */
  const reset = useCallback(() => {
    setState({
      questions: [],
      pagination: null,
      loading: false,
      loadingMore: false,
      error: null,
      currentFilters: null,
    });
  }, []);

  return {
    ...state,
    fetchQuestions,
    fetchRandomQuestions,
    fetchQuestionsByIds,
    loadMore,
    reset,
  };
};

// ============================================================================
// Hook Factory
// ============================================================================

/**
 * Create a questions list hook with API client injection.
 * @param apiClient - API client instance
 * @returns Pre-configured useQuestionsList hook
 *
 * @example
 * // In your app setup
 * import { createUseQuestionsList } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useQuestionsList = createUseQuestionsList(api);
 *
 * // Then use directly in components
 * const { questions, fetchQuestions, loadMore } = useQuestionsList();
 */
export const createUseQuestionsList = (apiClient: BaseApiClient) => {
  return (): UseQuestionsListReturn => useQuestionsListImpl(apiClient);
};

/**
 * Create a pre-configured questions list hook
 * This is a convenience function that returns a hook ready to use
 *
 * @param apiClient - API client instance
 * @returns Pre-configured useQuestionsList hook
 *
 * @example
 * // In your app setup
 * import { createQuestionsListHook } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useQuestionsList = createQuestionsListHook(api);
 *
 * // Then use directly in components
 * const { questions, fetchQuestions, loadMore } = useQuestionsList();
 */
export const createQuestionsListHook = (apiClient: BaseApiClient) => {
  return createUseQuestionsList(apiClient);
};
