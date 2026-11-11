import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../types/api';
import type { LessonsMode } from '../types/lessonsCatalog';
import { useAuthStore } from '../store/authStore';

/** How often, in milliseconds, the position is saved while the video plays. */
export const PLAYBACK_SYNC_INTERVAL_MS = 60000;

/**
 * Share of the video past which a lesson counts as finished: the next visit
 * starts from the beginning instead of resuming a few seconds before the end.
 * Same threshold as the video completion criterion.
 */
export const PLAYBACK_RESTART_RATIO = 0.95;

/** The most the API accepts for either value. */
const MAX_PLAYBACK_SECONDS = 86400;

interface PlaybackPositionResponse {
  data: {
    lessonId: string;
    positionSeconds: number;
    durationSeconds: number;
  } | null;
}

interface PlaybackPoint {
  lessonId: string;
  positionSeconds: number;
  durationSeconds: number;
}

export interface UseLessonPlaybackOptions {
  /**
   * The base URL the HTTP client uses (`import.meta.env.VITE_API_URL ?? ''`).
   * Only the save on closing the tab needs it: that one goes through `fetch`
   * with `keepalive`, because the browser does not finish an HTTP client
   * request while tearing the page down. An empty string means the page's own
   * origin, as it does for the HTTP client. Left out, that one save is skipped
   * and every other one still happens.
   */
  apiUrl?: string;
}

export interface UseLessonPlaybackReturn {
  /**
   * Second the player should start from, or `null` while it is still being
   * read. Mount the player only once it is a number: the player applies its
   * start position once per video, so a value arriving later is ignored.
   */
  resumeAt: number | null;
  /** Feed the player's `onTimeUpdate`. Only records; saves are timed. */
  handleTimeUpdate: (seconds: number, duration?: number) => void;
  /** Feed the player's `onPause`. Saves right away. */
  handlePause: (seconds: number, duration: number) => void;
}

/**
 * Where to start a lesson from its saved point: the point itself, or 0 when
 * there is none or the student had reached the end (`PLAYBACK_RESTART_RATIO`).
 *
 * @param point - The saved point, or null
 * @returns The second to start from
 */
export const resumeSecondsFor = (
  point: { positionSeconds: number; durationSeconds: number } | null
): number => {
  if (!point || point.durationSeconds <= 0) return 0;
  return point.positionSeconds / point.durationSeconds >= PLAYBACK_RESTART_RATIO
    ? 0
    : point.positionSeconds;
};

/**
 * Build the hook that keeps a student's position in a lesson video on the
 * backend (`GET`/`PUT /lesson/:id/playback`), so the lesson resumes there on
 * any device.
 *
 * The backend is the only source of the start position: the local copies
 * (`lastWatchedTimestamps`, the player's own localStorage key) are not read,
 * or a device that watched less would rewind the lesson.
 *
 * Saves the last position the player reported, the way `useElapsedTimeSync`
 * saves the exam stopwatch:
 * 1. every `PLAYBACK_SYNC_INTERVAL_MS` while it moves;
 * 2. when the video pauses;
 * 3. when the tab is hidden (switching tabs, navigating inside the app);
 * 4. when the student switches lessons or leaves the page;
 * 5. on `pagehide` (closing the tab), through `fetch` with `keepalive`.
 * A position already saved is not sent again.
 *
 * The position is saved as it is, even past `PLAYBACK_RESTART_RATIO`: the
 * restart is decided when reading, so a student who rewinds a finished lesson
 * still resumes where they stopped.
 *
 * In `preview` mode nothing is read or sent: the routes are student-only, and
 * a teacher browsing the catalogue has no position of their own.
 *
 * @param apiClient - HTTP client used to reach the API
 * @param mode - `student` keeps the position; `preview` starts at 0
 * @returns A hook taking the lesson id being watched
 *
 * @example
 * ```typescript
 * const useLessonPlayback = useMemo(
 *   () => createUseLessonPlayback(api, mode),
 *   [api, mode]
 * );
 * const playback = useLessonPlayback(lessonId, {
 *   apiUrl: import.meta.env.VITE_API_URL,
 * });
 * ```
 */
export const createUseLessonPlayback =
  (apiClient: BaseApiClient, mode: LessonsMode = 'student') =>
  (
    lessonId?: string,
    options: UseLessonPlaybackOptions = {}
  ): UseLessonPlaybackReturn => {
    const isPreview = mode === 'preview';
    const { apiUrl } = options;

    const [resume, setResume] = useState<{
      lessonId: string;
      seconds: number;
    } | null>(null);

    /** Last position the player reported, tagged with its lesson. */
    const latestRef = useRef<PlaybackPoint | null>(null);
    /** Last position the backend accepted, to skip repeats. */
    const savedRef = useRef<PlaybackPoint | null>(null);

    /**
     * The point to save, or null when there is nothing new. Whole seconds
     * within what the API accepts, the position never past the duration.
     */
    const pendingPoint = useCallback((): PlaybackPoint | null => {
      const latest = latestRef.current;
      if (!latest || latest.durationSeconds <= 0) return null;

      const durationSeconds = Math.min(
        Math.max(1, Math.round(latest.durationSeconds)),
        MAX_PLAYBACK_SECONDS
      );
      const positionSeconds = Math.min(
        Math.max(0, Math.floor(latest.positionSeconds)),
        durationSeconds
      );

      const saved = savedRef.current;
      if (
        saved?.lessonId === latest.lessonId &&
        saved.positionSeconds === positionSeconds
      ) {
        return null;
      }

      return { lessonId: latest.lessonId, positionSeconds, durationSeconds };
    }, []);

    /**
     * Ordinary save. Failures are swallowed: the next save carries the
     * position forward, and the student must never see one.
     */
    const save = useCallback(async (): Promise<void> => {
      if (isPreview || !apiClient.put) return;

      const point = pendingPoint();
      if (!point) return;

      try {
        await apiClient.put(`/lesson/${point.lessonId}/playback`, {
          positionSeconds: point.positionSeconds,
          durationSeconds: point.durationSeconds,
        });
        savedRef.current = point;
      } catch {
        // ignore — best-effort, the next save carries the same position
      }
    }, [apiClient, isPreview, pendingPoint]);

    /**
     * Save on closing the tab. The HTTP client cannot finish a request the
     * browser is tearing down, so this goes through `fetch` with `keepalive`,
     * which the browser delivers anyway. `sendBeacon` cannot carry the
     * Authorization header.
     */
    const saveOnUnload = useCallback((): void => {
      if (isPreview || apiUrl === undefined) return;

      const point = pendingPoint();
      const token = useAuthStore.getState().tokens?.token;
      if (!point || !token) return;

      try {
        fetch(`${apiUrl}/lesson/${point.lessonId}/playback`, {
          method: 'PUT',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            positionSeconds: point.positionSeconds,
            durationSeconds: point.durationSeconds,
          }),
        }).catch(() => {
          // ignore — the page is going away either way
        });
        savedRef.current = point;
      } catch {
        // ignore — best-effort
      }
    }, [apiUrl, isPreview, pendingPoint]);

    // Read the saved point whenever the lesson changes. Until it arrives
    // `resumeAt` is null, which keeps the player unmounted.
    useEffect(() => {
      if (isPreview || !lessonId) return;

      let isCurrent = true;
      apiClient
        .get<PlaybackPositionResponse>(`/lesson/${lessonId}/playback`)
        .then((response) => {
          if (!isCurrent) return;
          setResume({
            lessonId,
            seconds: resumeSecondsFor(response.data.data),
          });
        })
        .catch(() => {
          // Without the saved point the lesson starts from the beginning;
          // opening it must not depend on this read.
          if (isCurrent) setResume({ lessonId, seconds: 0 });
        });

      return () => {
        isCurrent = false;
      };
    }, [apiClient, isPreview, lessonId]);

    // Timers and page events for the lesson on screen. The cleanup runs when
    // the lesson changes or the page unmounts, and saves the lesson that was
    // being watched: leaving it is itself a stop.
    useEffect(() => {
      if (isPreview || !lessonId) return;

      const interval = setInterval(() => {
        void save();
      }, PLAYBACK_SYNC_INTERVAL_MS);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          void save();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      globalThis.addEventListener('pagehide', saveOnUnload);

      return () => {
        clearInterval(interval);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        globalThis.removeEventListener('pagehide', saveOnUnload);
        void save();
      };
    }, [isPreview, lessonId, save, saveOnUnload]);

    const handleTimeUpdate = useCallback(
      (seconds: number, duration?: number): void => {
        if (isPreview || !lessonId || !duration) return;
        latestRef.current = {
          lessonId,
          positionSeconds: seconds,
          durationSeconds: duration,
        };
      },
      [isPreview, lessonId]
    );

    const handlePause = useCallback(
      (seconds: number, duration: number): void => {
        if (isPreview || !lessonId || !duration) return;
        latestRef.current = {
          lessonId,
          positionSeconds: seconds,
          durationSeconds: duration,
        };
        void save();
      },
      [isPreview, lessonId, save]
    );

    let resumeAt: number | null = null;
    if (isPreview) {
      resumeAt = 0;
    } else if (resume && resume.lessonId === lessonId) {
      resumeAt = resume.seconds;
    }

    return { resumeAt, handleTimeUpdate, handlePause };
  };
