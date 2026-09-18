import { useState, useCallback, useRef } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  ApiLessonData,
  LessonDetails,
  LessonProgress,
  LessonsApiResponse,
  LessonsBySubtopicResponse,
  LessonsMode,
} from '../types/lessonsCatalog';
import { mapApiLessonToLessonDetails } from '../utils/lessonsCatalog';
import { useLessonsStore } from '../store/lessonsStore';

/** How often, in milliseconds, the playback position is pushed to the store. */
export const TIMESTAMP_THROTTLE_MS = 2000;

/**
 * Throttle without setTimeout, so nothing is scheduled on the playback path.
 * Calls that arrive inside the window are dropped rather than deferred.
 */
function simpleThrottle<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = -1; // -1 allows the first call through

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (lastCall === -1 || now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Mirror the progress the backend reported into the store.
 *
 * @param lessons - Lessons just loaded for the subtopic
 * @param updateLessonProgress - Store action that records one lesson's progress
 */
function seedProgressFromLessons(
  lessons: LessonDetails[],
  updateLessonProgress: (lessonId: string, progress: LessonProgress) => void
): void {
  for (const lesson of lessons) {
    if (lesson.progress) {
      updateLessonProgress(lesson.id, lesson.progress);
    }
  }
}

/**
 * Decide which lesson becomes the current one after a successful fetch.
 *
 * Reads the current lesson FRESH from the store via getState(): the value
 * captured by the hook's closure is frozen at its first render and goes stale
 * after navigating between topics. The stale value used to send us into the
 * "keep current" branch, where it failed to find a match in the new topic and
 * selected nothing, leaving lessons loaded but no current lesson ("Nenhuma
 * lição disponível").
 *
 * Falls back to the first lesson whenever the previous selection is not part of
 * this topic, so a successful fetch always selects something.
 *
 * @param sortedLessons - Lessons of the topic, in display order
 * @returns The lesson to select, or null when the topic has none
 */
function pickCurrentLesson(
  sortedLessons: LessonDetails[]
): LessonDetails | null {
  const existing = useLessonsStore.getState().currentLesson;
  const matched = existing
    ? sortedLessons.find((lesson) => lesson.id === existing.id)
    : undefined;

  return matched ?? sortedLessons[0] ?? null;
}

export interface UseClassLessonsReturn {
  currentLesson: LessonDetails | null;
  lessons: LessonDetails[];
  lessonsProgress: ReturnType<
    typeof useLessonsStore.getState
  >['lessonsProgress'];
  rawApiData: ApiLessonData[];
  loading: boolean;
  error: string | null;

  fetchLessonsBySubtopic: (subtopicId: string) => Promise<void>;
  updateLastViewedLesson: (lessonId: string) => Promise<void>;
  handleVideoTimeUpdate: (seconds: number, videoDuration?: number) => void;
  selectLesson: (lesson: LessonDetails) => void;
  getInitialTimestamp: (lessonId: string) => number;
  updateLessonDuration: (lessonId: string, duration: number) => void;
  getNextLesson: () => LessonDetails | null;
  getPreviousLesson: () => LessonDetails | null;
  clearError: () => void;
  clearLessonsData: () => void;

  registerLessonDownload: (lessonId: string) => Promise<void>;
  getDownloadContent: (lesson: LessonDetails | null) => {
    urlInitialFrame?: string;
    urlFinalFrame?: string;
    urlPodcast?: string;
    urlVideo?: string;
  };
  getBoardImages: (
    lesson: LessonDetails | null
  ) => { id: string; imageUrl: string; title: string }[];
  getPodcastData: (
    lesson: LessonDetails | null
  ) => { src: string; title: string } | null;
}

/**
 * Build the hook that loads and drives the lessons of a subtopic.
 *
 * Reading (`fetchLessonsBySubtopic` and the media accessors) works for every
 * profile. Writing — last-viewed and download registration — only happens in
 * `student` mode; both endpoints are student-only on the backend, and a
 * previewing teacher has no "last viewed lesson" to record.
 *
 * Progress itself is NOT written here. The `video` criterion has exactly one
 * writer, `createUseLessonProgressTracker().markVideoComplete`, fired by the
 * player at 95%. This hook only keeps the local watched-seconds and resume
 * position in the store.
 *
 * @param apiClient - HTTP client used to reach the API
 * @param mode - `student` performs the student-only writes; `preview` skips them
 * @returns A hook exposing the lessons state and the lesson-page operations
 *
 * @example
 * ```typescript
 * const useClassLessons = useMemo(
 *   () => createUseClassLessons(api, mode),
 *   [api, mode]
 * );
 * const { lessons, fetchLessonsBySubtopic } = useClassLessons();
 * ```
 */
export const createUseClassLessons =
  (
    apiClient: BaseApiClient,
    mode: LessonsMode = 'student'
  ): (() => UseClassLessonsReturn) =>
  () => {
    // Starts as `true`: the page always fetches on mount, so the very first
    // render must show the skeleton, never the "no lessons" empty state.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rawApiData, setRawApiData] = useState<ApiLessonData[]>([]);
    const isPreview = mode === 'preview';

    // Tracks the in-flight subtopic request so stale/overlapping responses
    // (e.g. delayed by a 401 token refresh, or a quick topic change) are ignored
    // instead of clobbering the current lesson and leaving the page empty.
    // Monotonic request token. Keying staleness on the subtopic id instead
    // breaks on A -> B -> A: the ref reads 'A' again, so A's first, obsolete
    // request passes the guard and writes over the newer one.
    const requestIdRef = useRef(0);

    const {
      currentLesson,
      lessons,
      lessonsProgress,
      lastWatchedTimestamps,
      setCurrentLesson,
      setLessons,
      updateLessonProgress,
      updateLessonDuration,
      updateTimestamp,
      getNextLesson,
      getPreviousLesson,
      clearLessonsData,
    } = useLessonsStore();

    /**
     * Fetch lessons for a specific subtopic
     * @param {string} subtopicId - The subtopic ID
     * @returns {Promise<void>}
     */
    const fetchLessonsBySubtopic = useCallback(
      async (subtopicId: string): Promise<void> => {
        // Claim this call as the active one before anything else, the invalid
        // id below included: that branch is a navigation too, and whatever is
        // in flight must not be allowed to overwrite its error afterwards.
        const requestId = ++requestIdRef.current;

        // The id comes from `useParams`, i.e. from the URL, so the `string`
        // type guarantees nothing at runtime. When a route was built with a
        // missing id, the STRING 'undefined' arrived here, passed any
        // truthiness guard and became `/lesson/by-subtopic/undefined` on the
        // backend (158 occurrences in 30 days, 21 users). The origin was fixed
        // in the QuestionnaireResult breadcrumbs; this guard exists so no other
        // badly built route can fire that call again.
        const invalidId =
          !subtopicId || subtopicId === 'undefined' || subtopicId === 'null';
        if (invalidId) {
          setLessons([]);
          setError('Não foi possível identificar o tópico desta aula.');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response = await apiClient.get<LessonsBySubtopicResponse>(
            `/lesson/by-subtopic/${subtopicId}`
          );

          // Stale guard: a newer fetch started while we awaited. Drop this
          // response so it can't overwrite the current topic's data.
          if (requestIdRef.current !== requestId) {
            return;
          }

          if (!response.data.data || !Array.isArray(response.data.data)) {
            // Genuine empty result for this topic. Drop the selection too: the
            // page keys its empty state on `currentLesson`, so leaving the
            // previous topic's lesson here renders it as if it belonged to
            // this one.
            setRawApiData([]);
            setLessons([]);
            setCurrentLesson(null);
            return;
          }

          // Store raw API data for navigation data extraction
          setRawApiData(response.data.data);

          const mappedLessons = response.data.data.map((apiLesson, index) =>
            mapApiLessonToLessonDetails(apiLesson, index)
          );

          const sortedLessons = [...mappedLessons].sort(
            (a, b) => a.order - b.order
          );
          setLessons(sortedLessons);

          // Seed the store with the progress the backend reported. In preview
          // mode there is none, so nothing is seeded.
          if (!isPreview) {
            seedProgressFromLessons(sortedLessons, updateLessonProgress);
          }

          // Unconditional: `pickCurrentLesson` returns null to mean "nothing to
          // select here", and that has to reach the store. Guarding on
          // truthiness kept the previous topic's lesson selected.
          setCurrentLesson(pickCurrentLesson(sortedLessons));
        } catch (err) {
          // Ignore errors from a request that is no longer the active one.
          if (requestIdRef.current !== requestId) {
            return;
          }
          const errorMessage =
            err instanceof Error ? err.message : 'Erro ao carregar aulas';
          setError(errorMessage);
        } finally {
          // Only the active request controls the loading flag, so a stale
          // response can't flip it off while the current fetch is still running.
          if (requestIdRef.current === requestId) {
            setLoading(false);
          }
        }
      },
      [apiClient, isPreview, setLessons, setCurrentLesson, updateLessonProgress]
    );

    // Throttled timestamp update to prevent UI lag
    const throttledTimestampUpdate = useRef(
      simpleThrottle((lessonId: string, seconds: number) => {
        updateTimestamp(lessonId, seconds);
      }, TIMESTAMP_THROTTLE_MS)
    ).current;

    /**
     * Record that this lesson was the last one the student opened.
     * @param {string} lessonId - The lesson ID
     * @returns {Promise<void>}
     */
    const updateLastViewedLesson = useCallback(
      async (lessonId: string): Promise<void> => {
        if (isPreview) return;

        try {
          await apiClient.patch(`/lesson/last/viewed/${lessonId}`);
        } catch {
          // Best-effort: failing to record the last viewed lesson must not
          // block opening it.
        }
      },
      [apiClient, isPreview]
    );

    /**
     * Video time update handler - optimized by VideoPlayer component
     * @param {number} seconds - Current playback time in seconds
     * @returns {void}
     */
    const handleVideoTimeUpdate = useCallback(
      (seconds: number, videoDuration?: number): void => {
        if (!currentLesson) return;

        // In preview mode nothing about playback is remembered — not even the
        // duration, because the store entry it would create is persisted to
        // localStorage as lesson progress the viewer does not own.
        if (isPreview) return;

        const duration = videoDuration || currentLesson.videoDuration;

        // Update lesson duration if provided and different from current
        if (videoDuration && videoDuration !== currentLesson.videoDuration) {
          updateLessonDuration(currentLesson.id, videoDuration);
        }

        // Update watched seconds for tracking, but don't touch the percentage:
        // that is owned by the backend and mirrored by the progress tracker.
        if (duration > 0) {
          const existingProgress = lessonsProgress[currentLesson.id];
          // The store replaces the entry rather than merging it, so carry the
          // previous one over first: rebuilding the object from scratch drops
          // every field not listed below — `completedAt` among them, leaving a
          // lesson flagged complete with no completion date.
          updateLessonProgress(currentLesson.id, {
            ...existingProgress,
            lessonId: currentLesson.id,
            watchedSeconds: seconds,
            totalSeconds: duration,
            completed: existingProgress?.completed || false,
            lastWatchedAt: new Date().toISOString(),
            progressPercentage: existingProgress?.progressPercentage || 0,
          });
        }

        // Update timestamp for UI reactivity (throttled)
        throttledTimestampUpdate(currentLesson.id, seconds);
      },
      [
        currentLesson,
        isPreview,
        lessonsProgress,
        updateLessonDuration,
        updateLessonProgress,
        throttledTimestampUpdate,
      ]
    );

    /**
     * Select a lesson to play
     * @param {LessonDetails} lesson - The lesson to select
     * @returns {void}
     */
    const selectLesson = useCallback(
      (lesson: LessonDetails): void => {
        setCurrentLesson(lesson);
        updateLastViewedLesson(lesson.id);
      },
      [setCurrentLesson, updateLastViewedLesson]
    );

    /**
     * Get the initial timestamp for a lesson
     * @param {string} lessonId - The lesson ID
     * @returns {number} The timestamp in seconds, always 0 in preview mode
     */
    const getInitialTimestamp = useCallback(
      (lessonId: string): number => {
        if (isPreview) return 0;
        return lastWatchedTimestamps[lessonId] || 0;
      },
      [isPreview, lastWatchedTimestamps]
    );

    /**
     * Register that the lesson's complete content was downloaded.
     * @param {string} targetLessonId - The lesson ID for download registration
     * @returns {Promise<void>}
     */
    const registerLessonDownload = useCallback(
      async (targetLessonId: string): Promise<void> => {
        if (isPreview) return;

        try {
          await apiClient.patch('/lesson/download/register', {
            lessonId: targetLessonId,
          });
        } catch {
          // Best-effort: the download already happened client-side.
        }
      },
      [apiClient, isPreview]
    );

    /**
     * Get download content URLs from lesson data
     * @param {LessonDetails | null} lesson - The lesson to read URLs from
     * @returns {object} Download content object with URLs
     */
    const getDownloadContent = useCallback((lesson: LessonDetails | null) => {
      if (!lesson) return {};

      return {
        urlInitialFrame: lesson.urlInitialFrame,
        urlFinalFrame: lesson.urlFinalFrame,
        urlPodcast: lesson.urlPodCast,
        urlVideo: lesson.videoUrl,
      };
    }, []);

    /**
     * Get board images from lesson data
     * @param {LessonDetails | null} lesson - The lesson to read boards from
     * @returns {Array} Array of board images
     */
    const getBoardImages = useCallback((lesson: LessonDetails | null) => {
      if (!lesson) return [];

      return (
        lesson.boardImages?.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          title: image.title || `Quadro ${image.order}`,
        })) || []
      );
    }, []);

    /**
     * Get podcast data from lesson
     * @param {LessonDetails | null} lesson - The lesson to read the podcast from
     * @returns {object | null} Podcast data or null
     */
    const getPodcastData = useCallback((lesson: LessonDetails | null) => {
      if (!lesson?.podcast) return null;

      return {
        src: lesson.podcast.audioUrl,
        title: lesson.podcast.title,
      };
    }, []);

    const clearError = useCallback((): void => {
      setError(null);
    }, []);

    return {
      currentLesson,
      lessons,
      lessonsProgress,
      rawApiData,
      loading,
      error,

      fetchLessonsBySubtopic,
      updateLastViewedLesson,
      handleVideoTimeUpdate,
      selectLesson,
      getInitialTimestamp,
      updateLessonDuration,
      getNextLesson,
      getPreviousLesson,
      clearError,
      clearLessonsData,

      registerLessonDownload,
      getDownloadContent,
      getBoardImages,
      getPodcastData,
    };
  };

/**
 * Fetch a single lesson by id. Used by entry points that land directly on a
 * lesson rather than on a subtopic listing.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns The lesson, or null when it could not be loaded
 */
export async function fetchLessonById(
  apiClient: BaseApiClient,
  lessonId: string
): Promise<LessonDetails | null> {
  const response = await apiClient.get<LessonsApiResponse<ApiLessonData>>(
    `/lesson/${lessonId}`
  );

  if (!response.data?.data) return null;
  return mapApiLessonToLessonDetails(response.data.data, 0);
}
