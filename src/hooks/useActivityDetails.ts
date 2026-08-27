import { useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  ActivityDetailsData,
  ActivityDetailsQueryParams,
  ActivityDetailsApiResponse,
  QuizResponse,
  ActivityMetadata,
  PresignedUrlResponse,
  PresencialDeliveryStatus,
  Pagination,
  GeneralStats,
  QuestionStats,
  StudentActivityStatus,
} from '../types/activityDetails';
import type {
  QuestionsAnswersByStudentResponse,
  SaveQuestionCorrectionPayload,
} from '../utils/studentActivityCorrection';
import {
  PRESENCIAL_DELIVERY_STATUS,
  STUDENT_ACTIVITY_STATUS,
} from '../types/activityDetails';
import { ActivitySubtype } from '../components/SendActivityModal/types';

/**
 * Response of `GET /exams/:id/results`.
 *
 * The in-person results table is served by its own endpoint: the delivery of
 * each physical artifact has no column in the database, so the backend derives
 * it (answer sheet: QR token consumed; essay: `submitted_at` written) and
 * states it here plainly.
 */
interface ExamResultsResponse {
  data: {
    requiresEssay: boolean;
    students: Array<{
      studentId: string;
      studentName: string;
      answerSheetStatus: PresencialDeliveryStatus;
      answerSheetReceivedAt: string | null;
      essayStatus: PresencialDeliveryStatus;
      essayReceivedAt: string | null;
      score: number | null;
      essayScore: number | null;
    }>;
    pagination: Pagination;
    generalStats: GeneralStats;
    questionStats: QuestionStats;
  };
}

/**
 * The status `/activities/:id/details` would report for the same row.
 *
 * The results endpoint has no `status` field, but the correction modal and the
 * row remapping still read one. The gabarito flow never writes `graded_at`, so
 * a received sheet stays awaiting correction — which is exactly what lets the
 * teacher open the modal to grade it.
 *
 * @param answerSheetStatus - Delivery state of the answer sheet
 * @returns The equivalent student activity status
 */
const toStudentActivityStatus = (
  answerSheetStatus: PresencialDeliveryStatus
): StudentActivityStatus =>
  answerSheetStatus === PRESENCIAL_DELIVERY_STATUS.RECEIVED
    ? STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO
    : STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA;

/**
 * Read the results table of an in-person exam.
 *
 * Replaces `/activities/:id/details` entirely for these exams: it is the only
 * source that knows whether each printed sheet came back, and when.
 *
 * @param apiClient - API client instance
 * @param activityId - Exam whose results are being read
 * @param queryParams - Pagination and sorting, same names as the details route
 * @returns Activity details data, minus the activity metadata
 */
const fetchExamResults = async (
  apiClient: BaseApiClient,
  activityId: string,
  queryParams: Record<string, unknown>
): Promise<Omit<ActivityDetailsData, 'activity'>> => {
  const response = await apiClient.get<ExamResultsResponse>(
    `/exams/${activityId}/results`,
    { params: queryParams }
  );

  const { requiresEssay, students, pagination, generalStats, questionStats } =
    response.data.data;

  return {
    requiresEssay,
    pagination,
    generalStats,
    questionStats,
    students: students.map((student) => ({
      studentId: student.studentId,
      studentName: student.studentName,
      status: toStudentActivityStatus(student.answerSheetStatus),
      answerSheetStatus: student.answerSheetStatus,
      // The column reads `answeredAt`; for a printed exam what it shows is the
      // moment the answer sheet was scanned.
      answeredAt: student.answerSheetReceivedAt,
      // Nothing to measure: the booklet is answered on paper.
      timeSpent: 0,
      score: student.score,
      essayStatus: student.essayStatus,
      essayReceivedAt: student.essayReceivedAt,
      essayScore: student.essayScore,
    })),
  };
};

/**
 * Hook return type for activity details
 */
export interface StudentFeedbackResponse {
  teacherFeedback: string | null;
  attachment: string | null;
}

export interface UseActivityDetailsReturn {
  /**
   * Fetch activity details from API
   * @param id - Activity ID
   * @param params - Query parameters for pagination
   * @returns Activity details data
   */
  fetchActivityDetails: (
    id: string,
    params?: ActivityDetailsQueryParams
  ) => Promise<ActivityDetailsData>;
  /**
   * Fetch student correction data from API
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @returns Student answers response data
   */
  fetchStudentCorrection: (
    activityId: string,
    studentId: string
  ) => Promise<QuestionsAnswersByStudentResponse>;
  /**
   * Fetch teacher feedback for a student activity
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @returns Teacher feedback and attachment
   */
  fetchStudentFeedback: (
    activityId: string,
    studentId: string
  ) => Promise<StudentFeedbackResponse>;
  /**
   * Fetch teacher feedback for a student activity, returning null on error
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @returns Teacher feedback and attachment, or null if fetch fails
   */
  safeFetchStudentFeedback: (
    activityId: string,
    studentId: string
  ) => Promise<StudentFeedbackResponse | null>;
  /**
   * Submit observation for student activity
   * @param actId - Activity ID
   * @param studentId - Student ID
   * @param observation - Observation text
   * @param file - Attached file (optional)
   * @returns The attachment URL if a file was uploaded, null otherwise
   */
  submitObservation: (
    actId: string,
    studentId: string,
    observation: string,
    file: File | null,
    existingAttachment: string | null
  ) => Promise<string | null>;
  /**
   * Submit question correction for student activity
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @param payload - Question correction payload
   */
  submitQuestionCorrection: (
    activityId: string,
    studentId: string,
    payload: SaveQuestionCorrectionPayload
  ) => Promise<void>;
}

/**
 * Build query parameters for API request
 */
const buildQueryParams = (
  params?: ActivityDetailsQueryParams
): Record<string, unknown> => {
  const paramsObj: Record<string, unknown> = {};
  if (params?.page) paramsObj.page = params.page;
  if (params?.limit) paramsObj.limit = params.limit;
  if (params?.sortBy) paramsObj.sortBy = params.sortBy;
  if (params?.sortOrder) paramsObj.sortOrder = params.sortOrder;
  if (params?.status) paramsObj.status = params.status;
  return paramsObj;
};

/**
 * Hook for managing activity details API calls
 * Provides functions to fetch activity details, student corrections, and submit observations/corrections
 *
 * @param apiClient - API client instance for making requests
 * @returns Hook return object with API functions
 *
 * @example
 * ```tsx
 * import { useActivityDetails } from 'analytica-frontend-lib';
 * import { useApi } from './services/apiService';
 *
 * function ActivityDetailsPage() {
 *   const api = useApi();
 *   const { fetchActivityDetails, fetchStudentCorrection } = useActivityDetails(api);
 *
 *   // Use functions...
 * }
 * ```
 */
/**
 * Attach the subjects an activity covers, derived from its questions
 *
 * @param activity - Activity metadata from the quiz endpoint
 * @returns The same metadata with `subjects` filled in, or undefined
 */
export const withDerivedSubjects = (
  activity: ActivityMetadata | undefined
): ActivityMetadata | undefined => {
  if (!activity) return activity;

  const names = new Set<string>();
  for (const question of activity.questions ?? []) {
    for (const matrix of question.knowledgeMatrix ?? []) {
      if (matrix.subject?.name) names.add(matrix.subject.name);
    }
  }

  return {
    ...activity,
    subjects: [...names].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  };
};

export const useActivityDetails = (
  apiClient: BaseApiClient
): UseActivityDetailsReturn => {
  /**
   * Fetch activity details from API
   * @param id - Activity ID
   * @param params - Query parameters for pagination
   * @returns Activity details data
   */
  const fetchActivityDetails = useCallback(
    async (
      id: string,
      params?: ActivityDetailsQueryParams
    ): Promise<ActivityDetailsData> => {
      const queryParams = buildQueryParams(params);

      const [detailsResponse, quizResponse] = await Promise.all([
        apiClient.get<ActivityDetailsApiResponse>(`/activities/${id}/details`, {
          params: queryParams,
        }),
        apiClient.get<QuizResponse>(`/activities/${id}/quiz`).catch(() => null),
      ]);

      const activity = withDerivedSubjects(quizResponse?.data?.data);
      const details = detailsResponse.data.data;

      // An in-person exam is answered on paper, so its table is about which
      // printed sheets came back — something `/activities/:id/details` cannot
      // know. `/exams/:id/results` owns that screen, and replaces the details
      // response entirely for these exams.
      const isPresencialExam =
        activity?.isDigital === false &&
        activity?.subtype === ActivitySubtype.PROVA;

      if (!isPresencialExam) {
        return { ...details, activity };
      }

      return {
        ...(await fetchExamResults(apiClient, id, queryParams)),
        activity,
      };
    },
    [apiClient]
  );

  /**
   * Fetch student correction data from API
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @returns Student answers response data
   */
  const fetchStudentCorrection = useCallback(
    async (
      activityId: string,
      studentId: string
    ): Promise<QuestionsAnswersByStudentResponse> => {
      const response = await apiClient.get<QuestionsAnswersByStudentResponse>(
        `/questions/activity/${activityId}/user/${studentId}/answers`
      );
      return response.data;
    },
    [apiClient]
  );

  /**
   * Fetch teacher feedback for a student activity
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @returns Teacher feedback and attachment
   */
  const fetchStudentFeedback = useCallback(
    async (
      activityId: string,
      studentId: string
    ): Promise<StudentFeedbackResponse> => {
      const response = await apiClient.get<{
        data: {
          feedback: {
            teacherFeedback: string | null;
            attachment: string | null;
          };
        };
      }>(`/activities/${activityId}/students/${studentId}/feedback`);
      return response.data.data.feedback;
    },
    [apiClient]
  );

  const safeFetchStudentFeedback = useCallback(
    async (
      activityId: string,
      studentId: string
    ): Promise<StudentFeedbackResponse | null> => {
      try {
        return await fetchStudentFeedback(activityId, studentId);
      } catch (err) {
        console.warn('Failed to fetch student feedback:', err);
        return null;
      }
    },
    [fetchStudentFeedback]
  );

  /**
   * Submit observation for student activity
   * @param actId - Activity ID
   * @param studentId - Student ID
   * @param observation - Observation text
   * @param file - Attached file (optional)
   * @returns The attachment URL if a file was uploaded, null otherwise
   */
  const submitObservation = useCallback(
    async (
      actId: string,
      studentId: string,
      observation: string,
      file: File | null,
      existingAttachment: string | null
    ): Promise<string | null> => {
      let attachmentUrl: string | null = existingAttachment;

      if (file) {
        const presignedRes = await apiClient.post<PresignedUrlResponse>(
          '/user/get-pre-signed-url',
          {
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
          }
        );

        const { signedUrl, publicUrl } = presignedRes.data.data;

        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Falha ao fazer upload do arquivo');
          }
        });

        attachmentUrl = publicUrl;
      }

      await apiClient.patch(
        `/activities/${actId}/students/${studentId}/feedback`,
        {
          teacherFeedback: observation,
          attachment: attachmentUrl,
        }
      );

      return attachmentUrl;
    },
    [apiClient]
  );

  /**
   * Submit question correction for student activity
   * @param activityId - Activity ID
   * @param studentId - Student ID
   * @param payload - Question correction payload
   */
  const submitQuestionCorrection = useCallback(
    async (
      activityId: string,
      studentId: string,
      payload: SaveQuestionCorrectionPayload
    ): Promise<void> => {
      await apiClient.post(
        `/activities/${activityId}/students/${studentId}/questions/correction`,
        payload
      );
    },
    [apiClient]
  );

  return {
    fetchActivityDetails,
    fetchStudentCorrection,
    fetchStudentFeedback,
    safeFetchStudentFeedback,
    submitObservation,
    submitQuestionCorrection,
  };
};
