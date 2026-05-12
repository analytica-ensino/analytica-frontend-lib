import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import {
  ExamStatus,
  mapExamStatusToDisplay,
} from '../types/examsHistory';
import type {
  ExamHistoryResponse,
  ExamTableItem,
  ExamsHistoryApiResponse,
  ExamHistoryFilters,
  ExamPagination,
  ExamApiFilterOptions,
  ExamFilterOption,
  ExamBreakdownItem,
} from '../types/examsHistory';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Zod schema for subject object from backend
 */
const examSubjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  areaKnowledgeId: z.string().uuid(),
});

/**
 * Zod schema for breakdown item per school/class
 */
const examBreakdownItemSchema = z.object({
  school: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  schoolYear: z
    .object({ id: z.string(), name: z.string() })
    .nullable()
    .optional(),
  class: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  totalStudents: z.number(),
  answeredStudents: z.number(),
  completionPercentage: z.number(),
});

/**
 * Zod schema for exam history API response validation
 */
const examHistoryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startDate: z.string().nullable(),
  status: z.nativeEnum(ExamStatus),
  completionPercentage: z.number().min(0).max(100),
  questionCount: z.number().int().min(0),
  createdAt: z.string(),
  subject: examSubjectSchema.nullable(),
  creator: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  totalStudents: z.number().optional(),
  answeredStudents: z.number().optional(),
  breakdown: z.array(examBreakdownItemSchema).optional(),
});

export const examsHistoryApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    exams: z.array(z.unknown()).transform((items) =>
      items
        .map((item) => examHistoryResponseSchema.safeParse(item))
        .filter(
          (
            result
          ): result is {
            success: true;
            data: z.infer<typeof examHistoryResponseSchema>;
          } => result.success
        )
        .map((result) => result.data)
    ),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

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

type ExamFilterMaps = {
  schoolsMap: Map<string, string>;
  classesMap: Map<string, string>;
  subjectsMap: Map<string, string>;
  schoolYearsMap: Map<string, string>;
};

/**
 * Populate filter maps from a single breakdown item.
 */
const populateBreakdownMaps = (
  item: ExamBreakdownItem,
  maps: ExamFilterMaps
): void => {
  if (item.school?.id && item.school?.name) {
    maps.schoolsMap.set(item.school.id, item.school.name);
  }
  if (item.class?.id && item.class?.name) {
    maps.classesMap.set(item.class.id, item.class.name);
  }
  if (item.schoolYear?.id && item.schoolYear?.name) {
    maps.schoolYearsMap.set(item.schoolYear.id, item.schoolYear.name);
  }
};

/**
 * Extract unique school, class, and subject filter options from exams API response
 */
export const extractExamFilterOptions = (
  exams: ExamHistoryResponse[]
): ExamApiFilterOptions => {
  const maps: ExamFilterMaps = {
    schoolsMap: new Map<string, string>(),
    classesMap: new Map<string, string>(),
    subjectsMap: new Map<string, string>(),
    schoolYearsMap: new Map<string, string>(),
  };

  for (const exam of exams) {
    if (exam.subject?.id && exam.subject?.name) {
      maps.subjectsMap.set(exam.subject.id, exam.subject.name);
    }
    exam.breakdown?.forEach((item) => populateBreakdownMaps(item, maps));
  }

  const toOptions = (map: Map<string, string>): ExamFilterOption[] =>
    Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return {
    schools: toOptions(maps.schoolsMap),
    classes: toOptions(maps.classesMap),
    subjects: toOptions(maps.subjectsMap),
    schoolYears: toOptions(maps.schoolYearsMap),
  };
};

/**
 * Merge two filter option arrays, deduplicating by ID
 */
export const mergeExamFilterOptions = (
  base: ExamFilterOption[],
  extra: ExamFilterOption[]
): ExamFilterOption[] => {
  if (extra.length === 0) return base;
  const baseIds = new Set(base.map((item) => item.id));
  const hasNew = extra.some((item) => !baseIds.has(item.id));
  if (!hasNew) return base;
  const map = new Map(base.map((item) => [item.id, item.name] as const));
  extra.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item.name);
  });
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

/**
 * Build query params from filters
 */
const buildQueryParams = (
  filters?: ExamHistoryFilters
): Record<string, unknown> => {
  if (!filters) return {};

  const params: Record<string, unknown> = {};
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
        const response = await apiClient.get<ExamsHistoryApiResponse>(
          '/exams/history',
          { params }
        );

        const responseData = response.data;

        // Validate response with Zod
        const validatedData =
          examsHistoryApiResponseSchema.parse(responseData);

        // Transform exams to table format
        const tableItems = validatedData.data.exams.map((exam) =>
          transformExamToTableItem(exam as ExamHistoryResponse)
        );

        // Extract filter options from response
        const extracted = extractExamFilterOptions(
          responseData.data.exams as ExamHistoryResponse[]
        );

        // Update state with validated and transformed data
        setState((prev) => ({
          exams: tableItems,
          loading: false,
          error: null,
          pagination: validatedData.data.pagination,
          apiFilterOptions: {
            schools: mergeExamFilterOptions(
              prev.apiFilterOptions.schools,
              extracted.schools
            ),
            classes: mergeExamFilterOptions(
              prev.apiFilterOptions.classes,
              extracted.classes
            ),
            subjects: mergeExamFilterOptions(
              prev.apiFilterOptions.subjects,
              extracted.subjects
            ),
            schoolYears: mergeExamFilterOptions(
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
