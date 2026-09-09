import { useState, useCallback, useRef } from 'react';
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
} from '../types/examsHistory';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';
import { buildActivityHistoryBody } from './useActivitiesHistory';
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
 * Build the `POST /activities/history` request body from exam filters.
 * Always includes type=PROVA to filter for exams.
 *
 * Exams answer from the same `/activities/history` endpoint, so they share the
 * activities adapter. Copying the filters over verbatim instead forwarded the
 * raw TableProvider keys — `subject`, `school`, `class`, `schoolYear` — which
 * are not part of the endpoint contract at all, so the backend dropped them and
 * every exam filter silently answered as if nothing had been selected.
 *
 * A JSON body rather than a querystring, so `subjectIds` travels as a real
 * array. As a querystring it used to be bracket-serialized
 * (`subjectIds[]=a&subjectIds[]=b`), which the backend dropped just as silently.
 */
export const buildExamHistoryBody = (
  filters?: ExamHistoryFilters
): Record<string, unknown> =>
  buildActivityHistoryBody(
    filters as Record<string, unknown> | undefined,
    'PROVA'
  );

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
   * Sequence number of the newest fetch. The filter modal refetches on every
   * checkbox, so several requests are in flight at once and the network is free
   * to answer them out of order — without this, a slower earlier response would
   * overwrite the list the user is actually looking at.
   */
  const requestIdRef = useRef(0);

  /**
   * Fetch exams history from API
   * @param filters - Optional filters for pagination, search, sorting, etc.
   */
  const fetchExams = useCallback(
    async (filters?: ExamHistoryFilters) => {
      const requestId = ++requestIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const body = buildExamHistoryBody(filters);
        // Use activities/history endpoint with type=PROVA
        const response = await apiClient.post<ExamsHistoryApiResponse>(
          '/activities/history',
          body
        );

        if (requestId !== requestIdRef.current) {
          // A newer fetch has already been issued: this answer is stale.
          return;
        }

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
        if (requestId !== requestIdRef.current) {
          return;
        }
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
