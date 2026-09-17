import { useCallback, useRef, useEffect } from 'react';
import type { BaseApiClient } from '../types/api';
import type { LessonsMode } from '../types/lessonsCatalog';

/** How often, in milliseconds, a watching session pings the backend. */
export const TELEMETRY_INTERVAL_MS = 60000;

export interface UseLessonTelemetryReturn {
  sendTelemetry: () => Promise<void>;
  startTelemetryTracking: () => void;
  stopTelemetryTracking: () => void;
}

/**
 * Build the hook that reports a student's watching session for a lesson.
 *
 * Pings `GET /lesson/:id/telemetry` every TELEMETRY_INTERVAL_MS while tracking
 * is active. In `preview` mode nothing is ever sent and no interval is started:
 * the route is student-only and a teacher browsing the catalogue is not a
 * watching session.
 *
 * @param apiClient - HTTP client used to reach the API
 * @param mode - `student` reports telemetry; `preview` reports nothing
 * @returns A hook taking the lesson id being watched
 *
 * @example
 * ```typescript
 * const useTelemetry = useMemo(
 *   () => createUseLessonTelemetry(api, mode),
 *   [api, mode]
 * );
 * const { startTelemetryTracking } = useTelemetry(lessonId);
 * ```
 */
export const createUseLessonTelemetry =
  (apiClient: BaseApiClient, mode: LessonsMode = 'student') =>
  (lessonId?: string): UseLessonTelemetryReturn => {
    const telemetryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
      null
    );
    const isPreview = mode === 'preview';

    const sendTelemetry = useCallback(async (): Promise<void> => {
      if (!lessonId || isPreview) return;

      try {
        await apiClient.get(`/lesson/${lessonId}/telemetry`);
      } catch {
        // Telemetry is best-effort: a failed ping must never surface to the
        // student or interrupt playback.
      }
    }, [lessonId, isPreview]);

    const startTelemetryTracking = useCallback((): void => {
      if (isPreview || !lessonId || telemetryIntervalRef.current) return;

      telemetryIntervalRef.current = setInterval(() => {
        sendTelemetry();
      }, TELEMETRY_INTERVAL_MS);
    }, [isPreview, lessonId, sendTelemetry]);

    const stopTelemetryTracking = useCallback((): void => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
        telemetryIntervalRef.current = null;
      }
    }, []);

    // Stop tracking when the lesson changes.
    useEffect(() => {
      stopTelemetryTracking();
    }, [lessonId, stopTelemetryTracking]);

    // Cleanup telemetry on unmount.
    useEffect(() => stopTelemetryTracking, [stopTelemetryTracking]);

    return {
      sendTelemetry,
      startTelemetryTracking,
      stopTelemetryTracking,
    };
  };
