import { useCallback, useMemo } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  SimulationsStudentsResponse,
  SimulationsStudentsPage,
  SimulationsStudentsFilters,
  SimulationsListResponse,
  SimulationsListData,
  SimulationsListFilters,
  SimulationDetailResponse,
  SimulationDetailData,
  NoteResponse,
  NoteData,
  QuestionCommentResponse,
  QuestionCommentData,
} from '../types/simulations';
import type { PresignedUrlResponse } from '../types/activityDetails';
import { toCsv } from '../utils/queryParams';

const BASE_URL = '/performance/simulations';

/** Encode a value before interpolating it into a request path segment. */
const segment = (value: string) => encodeURIComponent(value);

/**
 * Hook return type for the teacher-facing Simulations feature.
 *
 * The hook exposes imperative fetchers (rather than holding everything in
 * state) because the UI loads data lazily across three nested levels:
 * students list -> a student's simulations -> a simulation's questions.
 */
export interface UseSimulationsReturn {
  fetchStudents: (
    filters?: SimulationsStudentsFilters
  ) => Promise<SimulationsStudentsPage>;
  fetchStudentSimulations: (
    userInstitutionId: string,
    filters?: SimulationsListFilters
  ) => Promise<SimulationsListData>;
  fetchSimulationDetail: (
    userInstitutionId: string,
    simulationId: string
  ) => Promise<SimulationDetailData>;
  fetchNote: (
    userInstitutionId: string,
    simulationId: string
  ) => Promise<NoteData | null>;
  /**
   * Upload a file to attach to a note and return its public URL.
   *
   * Same pre-signed flow the activity feedback attachment uses: the backend
   * hands out a signed PUT URL, the bytes go straight to storage, and only the
   * resulting public URL is sent back with the note.
   */
  uploadNoteAttachment: (file: File) => Promise<string>;
  /**
   * Create or replace the observation. `attachment` is the public URL of an
   * uploaded file, or null to save the note without one (removing a file
   * attached earlier).
   */
  saveNote: (
    userInstitutionId: string,
    simulationId: string,
    note: string,
    attachment: string | null
  ) => Promise<NoteData | null>;
  /**
   * Save the teacher comment on a single question of a student's simulation.
   * An empty string clears it.
   */
  saveQuestionComment: (
    userInstitutionId: string,
    simulationId: string,
    questionId: string,
    comment: string
  ) => Promise<QuestionCommentData | null>;
}

/**
 * Factory that binds an API client to the Simulations hook.
 *
 * @example
 * ```tsx
 * const useSimulations = createUseSimulations(api);
 * const { fetchStudents } = useSimulations();
 * ```
 */
export const createUseSimulations =
  (apiClient: BaseApiClient) => (): UseSimulationsReturn => {
    const fetchStudents = useCallback(
      async (
        filters: SimulationsStudentsFilters = {}
      ): Promise<SimulationsStudentsPage> => {
        const { page = 1, limit = 20, search, classIds } = filters;
        const response = await apiClient.get<SimulationsStudentsResponse>(
          `${BASE_URL}/students`,
          // classIds goes as CSV, never as a raw array: axios would serialize
          // it as `classIds[]=…`, a key the backend schema does not know, so
          // the class filter would be silently dropped.
          { params: { page, limit, search, classIds: toCsv(classIds) } }
        );
        return response.data.data.students;
      },
      []
    );

    const fetchStudentSimulations = useCallback(
      async (
        userInstitutionId: string,
        filters: SimulationsListFilters = {}
      ): Promise<SimulationsListData> => {
        const { page = 1, limit = 20 } = filters;
        const response = await apiClient.get<SimulationsListResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}`,
          { params: { page, limit } }
        );
        return response.data.data;
      },
      []
    );

    const fetchSimulationDetail = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string
      ): Promise<SimulationDetailData> => {
        const response = await apiClient.get<SimulationDetailResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}`
        );
        return response.data.data;
      },
      []
    );

    const fetchNote = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string
      ): Promise<NoteData | null> => {
        const response = await apiClient.get<NoteResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}/note`
        );
        return response.data.data;
      },
      []
    );

    const uploadNoteAttachment = useCallback(
      async (file: File): Promise<string> => {
        const presigned = await apiClient.post<PresignedUrlResponse>(
          '/user/get-pre-signed-url',
          { fileName: file.name, mimeType: file.type, fileSize: file.size }
        );
        const { signedUrl, publicUrl } = presigned.data.data;

        const upload = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!upload.ok) {
          throw new Error('Falha ao fazer upload do arquivo');
        }

        return publicUrl;
      },
      []
    );

    const saveNote = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string,
        note: string,
        attachment: string | null
      ): Promise<NoteData | null> => {
        const response = await apiClient.post<NoteResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}/note`,
          { note, attachment }
        );
        return response.data.data;
      },
      []
    );

    const saveQuestionComment = useCallback(
      async (
        userInstitutionId: string,
        simulationId: string,
        questionId: string,
        comment: string
      ): Promise<QuestionCommentData | null> => {
        const response = await apiClient.post<QuestionCommentResponse>(
          `${BASE_URL}/students/${segment(userInstitutionId)}/${segment(simulationId)}/questions/${segment(questionId)}/comment`,
          { comment }
        );
        return response.data.data;
      },
      []
    );

    return useMemo(
      () => ({
        fetchStudents,
        fetchStudentSimulations,
        fetchSimulationDetail,
        fetchNote,
        uploadNoteAttachment,
        saveNote,
        saveQuestionComment,
      }),
      [
        fetchStudents,
        fetchStudentSimulations,
        fetchSimulationDetail,
        fetchNote,
        uploadNoteAttachment,
        saveNote,
        saveQuestionComment,
      ]
    );
  };
