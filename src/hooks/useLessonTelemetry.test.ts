import { renderHook, act } from '@testing-library/react';
import {
  createUseLessonTelemetry,
  TELEMETRY_INTERVAL_MS,
} from './useLessonTelemetry';
import type { BaseApiClient } from '../types/api';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

describe('createUseLessonTelemetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('pings the telemetry endpoint on each interval while tracking', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'student')('lesson-1')
    );

    act(() => {
      result.current.startTelemetryTracking();
    });
    expect(api.get).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS);
    });
    expect(api.get).toHaveBeenCalledWith('/lesson/lesson-1/telemetry');

    act(() => {
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS);
    });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('stops pinging once tracking is stopped', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'student')('lesson-1')
    );

    act(() => {
      result.current.startTelemetryTracking();
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS);
      result.current.stopTelemetryTracking();
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 3);
    });

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('does not start a second interval when already tracking', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'student')('lesson-1')
    );

    act(() => {
      result.current.startTelemetryTracking();
      result.current.startTelemetryTracking();
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS);
    });

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a lesson id', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'student')(undefined)
    );

    act(() => {
      result.current.startTelemetryTracking();
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 2);
    });

    expect(api.get).not.toHaveBeenCalled();
  });

  it('swallows a failed ping', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'student')('lesson-1')
    );

    // Telemetry is best-effort: a rejection must never propagate to the page.
    await expect(result.current.sendTelemetry()).resolves.toBeUndefined();
  });

  it('never reports telemetry in preview mode', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      createUseLessonTelemetry(api, 'preview')('lesson-1')
    );

    act(() => {
      result.current.startTelemetryTracking();
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 5);
    });

    // The endpoint is student-only, and browsing a catalogue is not a watching
    // session.
    expect(api.get).not.toHaveBeenCalled();
  });

  it('stops tracking when the lesson changes', () => {
    const api = makeApi();
    const { result, rerender } = renderHook(
      ({ lessonId }) => createUseLessonTelemetry(api, 'student')(lessonId),
      { initialProps: { lessonId: 'lesson-1' } }
    );

    act(() => {
      result.current.startTelemetryTracking();
    });

    rerender({ lessonId: 'lesson-2' });

    act(() => {
      jest.advanceTimersByTime(TELEMETRY_INTERVAL_MS * 2);
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});
