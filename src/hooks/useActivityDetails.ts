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
   * Submit observation for student activity
   * @param actId - Activity ID
   * @param studentId - Student ID
   * @param observation - Observation text
   * @param files - Attached files
   */
  submitObservation: (
    actId: string,
    studentId: string,
    observation: string,
    files: File[]
  ) => Promise<void>;
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
      } as ActivityDetailsData;
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
   * Submit observation for student activity
   * @param actId - Activity ID
   * @param studentId - Student ID
   * @param observation - Observation text
   * @param files - Attached files
   */
  const submitObservation = useCallback(
    async (
      actId: string,
      studentId: string,
      observation: string,
      files: File[]
    ): Promise<void> => {
      let attachmentUrl: string | null = null;

      if (files.length > 0) {
        const file = files[0];
        const presignedRes = await apiClient.post<PresignedUrlResponse>(
          '/user/get-pre-signed-url',
          {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }
        );

        const { url, fields } = presignedRes.data.data;
        const formData = new FormData();

        for (const [key, value] of Object.entries(fields)) {
          formData.append(key, value);
        }
        formData.append('file', file);

        await fetch(url, {
          method: 'POST',
          body: formData,
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Falha ao fazer upload do arquivo');
          }
        });

        // Ensure proper URL construction
        const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        const key = fields.key.startsWith('/')
          ? fields.key.slice(1)
          : fields.key;
        attachmentUrl = `${baseUrl}/${key}`;
      }

      await apiClient.post(
        `/activities/${actId}/students/${studentId}/feedback/observation`,
        {
          observation,
          attachmentUrl,
        }
      );
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
    submitObservation,
    submitQuestionCorrection,
  };
};
