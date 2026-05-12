import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import type { BaseApiClient } from '../types/api';
import {
  StudentAnswerStatus,
  type ExamDetailsData,
  type ExamStudentResult,
  type ExamStats,
  type ExamDetailsPagination,
  type ExamDetailsFilters,
} from '../types/examDetails';
import { createFetchErrorHandler } from '../utils/hookErrorHandler';

/**
 * Student activity status from backend
 */
enum StudentActivityStatus {
  AGUARDANDO_RESPOSTA = 'AGUARDANDO_RESPOSTA',
  NAO_ENTREGUE = 'NAO_ENTREGUE',
  CONCLUIDO = 'CONCLUIDO',
  AGUARDANDO_CORRECAO = 'AGUARDANDO_CORRECAO',
}

/**
 * Zod schema for student in exam details
 */
const examStudentSchema = z.object({
  studentId: z.string().uuid(),
  studentName: z.string(),
  answeredAt: z.string().nullable(),
  timeSpent: z.number(),
  score: z.number().nullable(),
  status: z.nativeEnum(StudentActivityStatus),
});

/**
 * Zod schema for breakdown item
 */
const breakdownItemSchema = z.object({
  school: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
  schoolYear: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
  class: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
  totalStudents: z.number(),
  answeredStudents: z.number(),
  completionPercentage: z.number(),
});

/**
 * Zod schema for exam details API response
 */
export const examDetailsApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    students: z.array(examStudentSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
    generalStats: z.object({
      averageScore: z.number(),
      completionPercentage: z.number(),
    }),
    questionStats: z.object({
      mostCorrect: z.array(z.number()),
      mostIncorrect: z.array(z.number()),
      notAnswered: z.array(z.number()),
    }),
    breakdown: z.array(breakdownItemSchema),
  }),
});

/**
 * Zod schema for exam info (basic data)
 */
const examInfoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startDate: z.string().nullable(),
  createdAt: z.string(),
});

export const examInfoResponseSchema = z.object({
  message: z.string(),
  data: examInfoSchema,
});

/**
 * Hook state interface
 */
export interface UseExamDetailsState {
  examData: ExamDetailsData | null;
  loading: boolean;
  error: string | null;
  pagination: ExamDetailsPagination;
}

/**
 * Hook return type
 */
export interface UseExamDetailsReturn extends UseExamDetailsState {
  fetchExamDetails: (
    examId: string,
    filters?: ExamDetailsFilters
  ) => Promise<void>;
}

/**
 * Default pagination values
 */
export const DEFAULT_EXAM_DETAILS_PAGINATION: ExamDetailsPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

/**
 * Inferred types
 */
type ValidatedStudent = z.infer<typeof examStudentSchema>;

/**
 * Map backend status to frontend status
 */
export const mapBackendStatusToFrontend = (
  status: StudentActivityStatus
): StudentAnswerStatus => {
  // If student completed or is awaiting correction, gabarito was received
  // If awaiting response or not delivered, still waiting for gabarito
  if (
    status === StudentActivityStatus.CONCLUIDO ||
    status === StudentActivityStatus.AGUARDANDO_CORRECAO
  ) {
    return StudentAnswerStatus.GABARITO_RECEBIDO;
  }
  return StudentAnswerStatus.AGUARDANDO_GABARITO;
};

/**
 * Transform API student to frontend format
 */
export const transformStudent = (
  student: ValidatedStudent
): ExamStudentResult => ({
  id: student.studentId,
  studentId: student.studentId,
  studentName: student.studentName,
  status: mapBackendStatusToFrontend(student.status),
  answerReceivedAt: student.answeredAt
    ? dayjs(student.answeredAt).format('DD MMM YYYY')
    : null,
  score: student.score,
});

/**
 * Handle errors during exam fetch
 */
export const handleExamDetailsFetchError = createFetchErrorHandler(
  'Erro ao validar dados de detalhes da prova',
  'Erro ao carregar detalhes da prova'
);

/**
 * Build query params from filters
 */
const buildQueryParams = (
  filters?: ExamDetailsFilters
): Record<string, unknown> => {
  if (!filters) return {};

  const params: Record<string, unknown> = {};
  for (const key in filters) {
    const value = filters[key as keyof ExamDetailsFilters];
    if (value !== undefined && value !== null) {
      params[key] = value;
    }
  }
  return params;
};

/**
 * Hook implementation
 */
const useExamDetailsImpl = (apiClient: BaseApiClient): UseExamDetailsReturn => {
  const [state, setState] = useState<UseExamDetailsState>({
    examData: null,
    loading: false,
    error: null,
    pagination: DEFAULT_EXAM_DETAILS_PAGINATION,
  });

  /**
   * Fetch exam details from API
   */
  const fetchExamDetails = useCallback(
    async (examId: string, filters?: ExamDetailsFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = buildQueryParams(filters);

        // Fetch exam info and details in parallel
        const [examInfoResponse, examDetailsResponse] = await Promise.all([
          apiClient.get<z.infer<typeof examInfoResponseSchema>>(
            `/exams/${examId}`
          ),
          apiClient.get<z.infer<typeof examDetailsApiResponseSchema>>(
            `/exams/${examId}/details`,
            { params }
          ),
        ]);

        const validatedInfo = examInfoResponseSchema.parse(
          examInfoResponse.data
        );
        const validatedDetails = examDetailsApiResponseSchema.parse(
          examDetailsResponse.data
        );

        // Transform students
        const students = validatedDetails.data.students.map(transformStudent);

        // Build exam stats
        const stats: ExamStats = {
          averageScore: validatedDetails.data.generalStats.averageScore,
          mostCorrectQuestions: validatedDetails.data.questionStats.mostCorrect,
          mostIncorrectQuestions:
            validatedDetails.data.questionStats.mostIncorrect,
          unansweredQuestions: validatedDetails.data.questionStats.notAnswered,
        };

        // Extract school and class from breakdown
        const breakdown = validatedDetails.data.breakdown;

        // Get unique school names from breakdown
        const schoolNames = [
          ...new Set(
            breakdown
              .map((b) => b.school?.name)
              .filter((name): name is string => !!name)
          ),
        ];

        // Get unique class names from breakdown
        const classNames = [
          ...new Set(
            breakdown
              .map((b) => b.class?.name)
              .filter((name): name is string => !!name)
          ),
        ];

        // Build exam data
        const examData: ExamDetailsData = {
          id: validatedInfo.data.id,
          title: validatedInfo.data.title,
          startDate: validatedInfo.data.startDate
            ? dayjs(validatedInfo.data.startDate).format('DD/MM/YYYY')
            : '-',
          school: schoolNames.length > 0 ? schoolNames.join(', ') : '-',
          className: classNames.length > 0 ? classNames.join(', ') : '-',
          createdAt: dayjs(validatedInfo.data.createdAt).format('DD/MM/YYYY'),
          stats,
          students,
        };

        setState({
          examData,
          loading: false,
          error: null,
          pagination: validatedDetails.data.pagination,
        });
      } catch (error) {
        const errorMessage = handleExamDetailsFetchError(error);
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
    fetchExamDetails,
  };
};

/**
 * Factory function to create useExamDetails hook
 *
 * @param apiClient - API client instance (axios, fetch wrapper, etc.)
 * @returns Hook for managing exam details
 *
 * @example
 * ```tsx
 * // In your app setup
 * import { createUseExamDetails } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * export const useExamDetails = createUseExamDetails(api);
 *
 * // In your component
 * const { examData, loading, error, pagination, fetchExamDetails } = useExamDetails();
 *
 * useEffect(() => {
 *   if (examId) {
 *     fetchExamDetails(examId, { page: 1, limit: 10 });
 *   }
 * }, [examId]);
 * ```
 */
export const createUseExamDetails = (apiClient: BaseApiClient) => {
  return (): UseExamDetailsReturn => useExamDetailsImpl(apiClient);
};

/**
 * Alias for createUseExamDetails
 */
export const createExamDetailsHook = createUseExamDetails;
