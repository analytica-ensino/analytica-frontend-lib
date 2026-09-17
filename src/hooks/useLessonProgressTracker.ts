import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type { LessonsMode } from '../types/lessonsCatalog';
import { useLessonsStore } from '../store/lessonsStore';

/**
 * Response from backend when updating lesson progress
 */
interface UpdateProgressBackendResponse {
  message: string;
  data: {
    id: string;
    userId: string;
    lessonId: string;
    progress: number;
    video: boolean;
    audio: boolean;
    allQuestionsAnswered: boolean;
    initialFrame: boolean;
    finalFrame: boolean;
    lessonDoc: boolean;
    timeSpent: number;
    contentDownloaded: boolean;
    lastInteraction: string;
    createdAt: string;
    updatedAt: string;
    lesson: {
      id: string;
      videoTitle: string;
      podCastTitle: string;
      urlVideo: string;
      urlCover: string;
    };
    institutionRules: {
      video: boolean;
      audio: boolean;
      initialFrame: boolean;
      finalFrame: boolean;
      lessonDoc: boolean;
      allQuestionsAnswered: boolean;
      totalCriteria: number;
    };
  };
}

/**
 * Progress update payload for backend
 */
interface ProgressUpdatePayload {
  video?: boolean;
  audio?: boolean;
  initialFrame?: boolean;
  finalFrame?: boolean;
  allQuestionsAnswered?: boolean;
  lessonDoc?: boolean;
  timeSpent?: number;
  contentDownloaded?: boolean;
}

export interface UseLessonProgressTrackerReturn {
  loading: boolean;
  error: string | null;
  markVideoComplete: (lessonId: string) => Promise<number | null>;
  markPodcastComplete: (lessonId: string) => Promise<number | null>;
  markQuizComplete: (lessonId: string) => Promise<number | null>;
  markInitialFrameViewed: (lessonId: string) => Promise<number | null>;
  markFinalFrameViewed: (lessonId: string) => Promise<number | null>;
  markDocViewed: (lessonId: string) => Promise<number | null>;
}

/**
 * Build the hook that records a student's progress on a lesson.
 *
 * The backend models progress as a set of criteria (video, audio, boards,
 * questionnaire, document) and returns the consolidated percentage, which is
 * mirrored into the lessons store.
 *
 * In `preview` mode every mark is a no-op that resolves to `null`: teachers and
 * managers browse the catalogue without owning progress, so nothing is sent and
 * nothing is stored. Gating here rather than at each call site means a caller
 * cannot forget it.
 *
 * @param apiClient - HTTP client used to reach the API
 * @param mode - `student` records progress; `preview` records nothing
 * @returns A hook exposing one marker per progress criterion
 *
 * @example
 * ```typescript
 * const useTracker = useMemo(
 *   () => createUseLessonProgressTracker(api, mode),
 *   [api, mode]
 * );
 * const { markVideoComplete } = useTracker();
 * ```
 */
export const createUseLessonProgressTracker =
  (
    apiClient: BaseApiClient,
    mode: LessonsMode = 'student'
  ): (() => UseLessonProgressTrackerReturn) =>
  () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { updateLessonProgress } = useLessonsStore();
    const isPreview = mode === 'preview';

    /**
     * Internal function to update lesson progress on backend
     * @param lessonId - The lesson ID
     * @param payload - Progress data to update
     * @returns Promise with updated progress percentage, or null in preview
     */
    const updateProgressBackend = useCallback(
      async (
        lessonId: string,
        payload: ProgressUpdatePayload
      ): Promise<number | null> => {
        if (isPreview) {
          return null;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await apiClient.patch<UpdateProgressBackendResponse>(
            `/lesson/${lessonId}/progress`,
            payload
          );

          if (response.data?.data) {
            const { progress, lastInteraction } = response.data.data;

            // Merge with existing entry, preserving duration and prior fields
            const prev = useLessonsStore.getState().lessonsProgress[
              lessonId
            ] ?? {
              lessonId,
              watchedSeconds: 0,
              totalSeconds: 0,
              completed: false,
              lastWatchedAt: undefined,
              progressPercentage: 0,
            };

            updateLessonProgress(lessonId, {
              ...prev,
              completed: progress >= 100,
              lastWatchedAt: lastInteraction,
              completedAt: progress >= 100 ? lastInteraction : undefined,
              progressPercentage: progress,
            });

            return progress;
          }

          return null;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Erro ao atualizar progresso da aula';
          setError(errorMessage);
          return null;
        } finally {
          setLoading(false);
        }
      },
      [isPreview, updateLessonProgress]
    );

    const markVideoComplete = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { video: true }),
      [updateProgressBackend]
    );

    const markPodcastComplete = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { audio: true }),
      [updateProgressBackend]
    );

    const markQuizComplete = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { allQuestionsAnswered: true }),
      [updateProgressBackend]
    );

    const markInitialFrameViewed = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { initialFrame: true }),
      [updateProgressBackend]
    );

    const markFinalFrameViewed = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { finalFrame: true }),
      [updateProgressBackend]
    );

    const markDocViewed = useCallback(
      async (lessonId: string): Promise<number | null> =>
        updateProgressBackend(lessonId, { lessonDoc: true }),
      [updateProgressBackend]
    );

    return {
      loading,
      error,
      markVideoComplete,
      markPodcastComplete,
      markQuizComplete,
      markInitialFrameViewed,
      markFinalFrameViewed,
      markDocViewed,
    };
  };
