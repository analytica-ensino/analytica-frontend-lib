import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import { mapExamStatusToDisplay } from '../types/examsHistory';
import type {
  ExamHistoryResponse,
  ExamTableItem,
  ExamsHistoryApiResponse,
  ExamHistoryFilters,
  ExamPagination,
  ExamApiFilterOptions,
  ExamFilterOption,
} from '../types/examsHistory';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';
import {
  mergeFilterOptions,
  extractBreakdownFilterOptions,
} from '../utils/filterHelpers';

/**
 * Hook state interface
 */
export interface UseExamsHistoryState {
  exams: ExamTableItem[];
  loading: boolean;
  error: string | null;
  pagination: ExamPagination;
  apiFilterOptions: ExamApiFilterOptions;
}

/**
 * Hook return type
 */
export interface UseExamsHistoryReturn extends UseExamsHistoryState {
  fetchExams: (filters?: ExamHistoryFilters) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_EXAMS_PAGINATION: ExamPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Default API filter options
 */
export const DEFAULT_EXAM_FILTER_OPTIONS: ExamApiFilterOptions = {
  schools: [],
  classes: [],
  subjects: [],
  schoolYears: [],
};

/**
 * Transform API response to table item format
 * @param exam - Exam from API response
 * @returns Formatted exam for table display
 */
export const transformExamToTableItem = (
  exam: ExamHistoryResponse
): ExamTableItem => {
  const firstBreakdown = exam.breakdown?.[0];
  return {
    id: exam.id,
    startDate: exam.startDate
      ? dayjs(exam.startDate).format('DD/MM/YYYY')
      : '-',
    title: exam.title,
    school: firstBreakdown?.school?.name ?? '-',
    class: firstBreakdown?.class?.name ?? '-',
    status: mapExamStatusToDisplay(exam.status),
    questionCount: exam.questionCount,
    createdAt: dayjs(exam.createdAt).format('DD/MM/YYYY'),
    completionPercentage: exam.completionPercentage,
  };
};

/**
 * Handle errors during exam fetch
 * Uses the generic error handler factory to reduce code duplication
 */
export const handleExamFetchError = createFetchErrorHandler(
  'Erro ao validar dados de historico de provas',
  'Erro ao carregar historico de provas'
);

/**
 * Extract unique filter options from exams API response.
 * Delegates to the shared extractBreakdownFilterOptions helper.
 */
export const extractExamFilterOptions = (
  exams: ExamHistoryResponse[]
): ExamApiFilterOptions => extractBreakdownFilterOptions(exams);

/**
 * Build query params from filters
 * Always includes type=PROVA to filter for exams
 */
const buildQueryParams = (
  filters?: ExamHistoryFilters
): Record<string, unknown> => {
  // Always include type=PROVA for exam filtering
  if (!filters) return { type: 'PROVA' };

  const params: Record<string, unknown> = { type: 'PROVA' };
  for (const key in filters) {
    const value = filters[key as keyof ExamHistoryFilters];
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  }
  return params;
};

/**
 * Hook implementation
 */
const useExamsHistoryImpl = (
  apiClient: BaseApiClient
): UseExamsHistoryReturn => {
  const [state, setState] = useState<UseExamsHistoryState>({
    exams: [],
    loading: false,
    error: null,
    pagination: DEFAULT_EXAMS_PAGINATION,
    apiFilterOptions: DEFAULT_EXAM_FILTER_OPTIONS,
  });

  /**
   * Fetch exams history from API
   * @param filters - Optional filters for pagination, search, sorting, etc.
   */
  const fetchExams = useCallback(
    async (filters?: ExamHistoryFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters);
        // Use activities/history endpoint with type=PROVA
        const response = await apiClient.get<ExamsHistoryApiResponse>(
          '/activities/history',
          { params }
        );

        const { data } = response.data;

        // Transform activities to table format (response uses 'activities' field)
        const tableItems = data.activities.map((exam) =>
          transformExamToTableItem(exam)
        );

        // Extract filter options from response
        const extracted = extractExamFilterOptions(data.activities);

        // Update state with transformed data
        setState((prev) => ({
          exams: tableItems,
          loading: false,
          error: null,
          pagination: data.pagination,
          apiFilterOptions: {
            schools: mergeFilterOptions(
              prev.apiFilterOptions.schools,
              extracted.schools
            ),
            classes: mergeFilterOptions(
              prev.apiFilterOptions.classes,
              extracted.classes
            ),
            subjects: mergeFilterOptions(
              prev.apiFilterOptions.subjects,
              extracted.subjects
            ),
            schoolYears: mergeFilterOptions(
              prev.apiFilterOptions.schoolYears,
              extracted.schoolYears
            ),
          },
        }));
      } catch (error) {
        const errorMessage = handleExamFetchError(error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [apiClient]
  );

  return {
    ...state,
    fetchExams,
  };
};

/**
 * Factory function to create useExamsHistory hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @returns Hook for managing exams history
 *
 * @example
 * ```tsx
 * // In your app setup
 * import { createUseExamsHistory } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * export const useExamsHistory = createUseExamsHistory(api);
 *
 * // In your component
 * const { exams, loading, error, pagination, fetchExams } = useExamsHistory();
 * ```
 */
export const createUseExamsHistory = (apiClient: BaseApiClient) => {
  return (): UseExamsHistoryReturn => useExamsHistoryImpl(apiClient);
};

/**
 * Alias for createUseExamsHistory
 */
export const createExamsHistoryHook = createUseExamsHistory;
