import { useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  ActivityDetailsData,
  ActivityDetailsQueryParams,
  ActivityDetailsApiResponse,
  QuizResponse,
  PresignedUrlResponse,
} from '../types/activityDetails';
import type {
  QuestionsAnswersByStudentResponse,
  SaveQuestionCorrectionPayload,
} from '../utils/studentActivityCorrection';

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

      return {
        ...detailsResponse.data.data,
        activity: quizResponse?.data?.data,
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
