import { useState, useCallback } from 'react';
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
 * API student type
 */
interface ApiExamStudent {
  studentId: string;
  studentName: string;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
  status: StudentActivityStatus;
}

/**
 * API breakdown item type
 */
interface ApiBreakdownItem {
  school: { id: string; name: string } | null;
  schoolYear: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
  totalStudents: number;
  answeredStudents: number;
  completionPercentage: number;
}

/**
 * Exam details API response type
 */
export interface ExamDetailsApiResponse {
  message: string;
  data: {
    students: ApiExamStudent[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    generalStats: {
      averageScore: number;
      completionPercentage: number;
    };
    questionStats: {
      mostCorrect: number[];
      mostIncorrect: number[];
      notAnswered: number[];
    };
    breakdown: ApiBreakdownItem[];
  };
}

/**
 * Exam info API response type
 */
export interface ExamInfoApiResponse {
  message: string;
  data: {
    id: string;
    title: string;
    startDate: string | null;
    createdAt: string;
    [key: string]: unknown;
  };
}

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
  student: ApiExamStudent
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

        // Fetch exam info and details in parallel using activities endpoints
        // Use /quiz endpoint instead of /:id to support all user profiles (teachers, managers)
        const [examInfoResponse, examDetailsResponse] = await Promise.all([
          apiClient.get<ExamInfoApiResponse>(`/activities/${examId}/quiz`),
          apiClient.get<ExamDetailsApiResponse>(
            `/activities/${examId}/details`,
            {
              params,
            }
          ),
        ]);

        const examInfo = examInfoResponse.data;
        const examDetails = examDetailsResponse.data;

        // Transform students
        const students = examDetails.data.students.map(transformStudent);

        // Build exam stats
        const stats: ExamStats = {
          averageScore: examDetails.data.generalStats.averageScore,
          mostCorrectQuestions: examDetails.data.questionStats.mostCorrect,
          mostIncorrectQuestions: examDetails.data.questionStats.mostIncorrect,
          unansweredQuestions: examDetails.data.questionStats.notAnswered,
        };

        // Extract school and class from breakdown
        const breakdown = examDetails.data.breakdown;

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
          id: examInfo.data.id,
          title: examInfo.data.title,
          startDate: examInfo.data.startDate
            ? dayjs(examInfo.data.startDate).format('DD/MM/YYYY')
            : '-',
          school: schoolNames.length > 0 ? schoolNames.join(', ') : '-',
          className: classNames.length > 0 ? classNames.join(', ') : '-',
          createdAt: dayjs(examInfo.data.createdAt).format('DD/MM/YYYY'),
          stats,
          students,
        };

        setState({
          examData,
          loading: false,
          error: null,
          pagination: examDetails.data.pagination,
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
