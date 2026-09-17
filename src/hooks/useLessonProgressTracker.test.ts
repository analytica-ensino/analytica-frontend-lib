import { renderHook, act } from '@testing-library/react';
import { createUseLessonProgressTracker } from './useLessonProgressTracker';
import { useLessonsStore } from '../store/lessonsStore';
import type { BaseApiClient } from '../types/api';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

function progressResponse(progress: number) {
  return {
    data: {
      message: 'ok',
      data: {
        lessonId: 'lesson-1',
        progress,
        lastInteraction: '2026-01-10T10:00:00.000Z',
      },
    },
  };
}

describe('createUseLessonProgressTracker', () => {
  beforeEach(() => {
    useLessonsStore.getState().clearLessonsData();
  });

  describe('student mode', () => {
    it('marks the video criterion and mirrors the percentage into the store', async () => {
      const api = makeApi();
      api.patch.mockResolvedValue(progressResponse(40));
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'student')()
      );

      let returned: number | null = null;
      await act(async () => {
        returned = await result.current.markVideoComplete('lesson-1');
      });

      expect(api.patch).toHaveBeenCalledWith('/lesson/lesson-1/progress', {
        video: true,
      });
      expect(returned).toBe(40);
      expect(
        useLessonsStore.getState().lessonsProgress['lesson-1']
          .progressPercentage
      ).toBe(40);
    });

    it('flags the lesson as completed once the backend reports 100', async () => {
      const api = makeApi();
      api.patch.mockResolvedValue(progressResponse(100));
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'student')()
      );

      await act(async () => {
        await result.current.markQuizComplete('lesson-1');
      });

      const stored = useLessonsStore.getState().lessonsProgress['lesson-1'];
      expect(stored.completed).toBe(true);
      expect(stored.completedAt).toBe('2026-01-10T10:00:00.000Z');
    });

    it.each([
      ['markPodcastComplete', { audio: true }],
      ['markQuizComplete', { allQuestionsAnswered: true }],
      ['markInitialFrameViewed', { initialFrame: true }],
      ['markFinalFrameViewed', { finalFrame: true }],
      ['markDocViewed', { lessonDoc: true }],
    ] as const)('%s sends its own criterion', async (method, payload) => {
      const api = makeApi();
      api.patch.mockResolvedValue(progressResponse(10));
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'student')()
      );

      await act(async () => {
        await result.current[method]('lesson-1');
      });

      expect(api.patch).toHaveBeenCalledWith(
        '/lesson/lesson-1/progress',
        payload
      );
    });

    it('returns null and exposes the error when the request fails', async () => {
      const api = makeApi();
      api.patch.mockRejectedValue(new Error('boom'));
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'student')()
      );

      let returned: number | null = 1;
      await act(async () => {
        returned = await result.current.markVideoComplete('lesson-1');
      });

      // Callers use the null to roll back their "already marked" flag.
      expect(returned).toBeNull();
      expect(result.current.error).toBe('boom');
    });

    it('returns null when the response carries no data', async () => {
      const api = makeApi();
      api.patch.mockResolvedValue({ data: {} });
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'student')()
      );

      let returned: number | null = 1;
      await act(async () => {
        returned = await result.current.markVideoComplete('lesson-1');
      });

      expect(returned).toBeNull();
    });
  });

  describe('preview mode', () => {
    it.each([
      'markVideoComplete',
      'markPodcastComplete',
      'markQuizComplete',
      'markInitialFrameViewed',
      'markFinalFrameViewed',
      'markDocViewed',
    ] as const)('%s never reaches the backend', async (method) => {
      const api = makeApi();
      const { result } = renderHook(() =>
        createUseLessonProgressTracker(api, 'preview')()
      );

      let returned: number | null = 1;
      await act(async () => {
        returned = await result.current[method]('lesson-1');
      });

      // A previewing teacher owns no progress: nothing is sent, nothing stored.
      expect(api.patch).not.toHaveBeenCalled();
      expect(returned).toBeNull();
      expect(useLessonsStore.getState().lessonsProgress).toEqual({});
    });
  });

  it('defaults to student mode', async () => {
    const api = makeApi();
    api.patch.mockResolvedValue(progressResponse(5));
    const { result } = renderHook(() => createUseLessonProgressTracker(api)());

    await act(async () => {
      await result.current.markVideoComplete('lesson-1');
    });

    expect(api.patch).toHaveBeenCalled();
  });
});
