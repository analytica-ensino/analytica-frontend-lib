import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseClassLessons, fetchLessonById } from './useClassLessons';
import { useLessonsStore } from '../store/lessonsStore';
import type { BaseApiClient } from '../types/api';
import type { ApiLessonData } from '../types/lessonsCatalog';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

function apiLesson(overrides: Partial<ApiLessonData> = {}): ApiLessonData {
  return {
    id: 'lesson-1',
    areaKnowledgeId: 'area-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    subtopicId: 'subtopic-1',
    contentId: 'content-1',
    urlVideo: 'https://cdn.test/v.mp4',
    urlPodCast: '',
    urlCover: 'https://cdn.test/c.png',
    urlInitialFrame: '',
    urlFinalFrame: '',
    urlDoc: '',
    urlSubtitle: '',
    videoTitle: 'Aula 1',
    podCastTitle: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    questionnaire: null,
    areaKnowledge: { id: 'area-1', name: 'Ciências' },
    subject: {
      id: 'subject-1',
      name: 'Biologia',
      color: '#fff',
      icon: 'Dna',
    },
    topic: { id: 'topic-1', name: 'Genética' },
    subtopic: { id: 'subtopic-1', name: 'DNA' },
    content: { id: 'content-1', name: 'Estrutura do DNA', bnccCode: 'EM13' },
    ...overrides,
  };
}

describe('createUseClassLessons', () => {
  beforeEach(() => {
    useLessonsStore.getState().clearLessonsData();
  });

  it('loads the subtopic lessons and selects the first one', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({
      data: { message: 'ok', data: [apiLesson(), apiLesson({ id: 'lesson-2' })] },
    });
    const { result } = renderHook(() => createUseClassLessons(api)());

    await act(async () => {
      await result.current.fetchLessonsBySubtopic('subtopic-1');
    });

    expect(api.get).toHaveBeenCalledWith('/lesson/by-subtopic/subtopic-1');
    await waitFor(() => expect(result.current.lessons).toHaveLength(2));
    expect(result.current.currentLesson?.id).toBe('lesson-1');
    expect(result.current.loading).toBe(false);
  });

  it.each(['undefined', 'null', ''])(
    'refuses to request a subtopic id of %p',
    async (badId) => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api)());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic(badId);
      });

      // A badly built route once produced `/lesson/by-subtopic/undefined` in
      // production; the guard keeps that request from ever being made.
      expect(api.get).not.toHaveBeenCalled();
      expect(result.current.error).toBe(
        'Não foi possível identificar o tópico desta aula.'
      );
    }
  );

  it('drops a stale response when the subtopic changed mid-flight', async () => {
    const api = makeApi();
    let resolveFirst: (value: { data: unknown }) => void = () => {};
    api.get
      .mockImplementationOnce(
        () =>
          new Promise<{ data: unknown }>((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({
        data: { message: 'ok', data: [apiLesson({ id: 'from-second' })] },
      });

    const { result } = renderHook(() => createUseClassLessons(api)());

    let firstCall: Promise<void>;
    act(() => {
      firstCall = result.current.fetchLessonsBySubtopic('subtopic-1');
    });
    await act(async () => {
      await result.current.fetchLessonsBySubtopic('subtopic-2');
    });

    await act(async () => {
      resolveFirst({
        data: { message: 'ok', data: [apiLesson({ id: 'from-first' })] },
      });
      await firstCall!;
    });

    // The slower first request must not overwrite the topic the user is on.
    expect(result.current.lessons.map((l) => l.id)).toEqual(['from-second']);
  });

  it('surfaces a failed request', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('500'));
    const { result } = renderHook(() => createUseClassLessons(api)());

    await act(async () => {
      await result.current.fetchLessonsBySubtopic('subtopic-1');
    });

    expect(result.current.error).toBe('500');
  });

  it('handles a response without an array payload', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: { message: 'ok', data: null } });
    const { result } = renderHook(() => createUseClassLessons(api)());

    await act(async () => {
      await result.current.fetchLessonsBySubtopic('subtopic-1');
    });

    expect(result.current.lessons).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  describe('student mode', () => {
    it('records the lesson as last viewed when selected', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: { message: 'ok', data: [apiLesson()] },
      });
      const { result } = renderHook(() => createUseClassLessons(api, 'student')());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic('subtopic-1');
      });
      await act(async () => {
        result.current.selectLesson(result.current.lessons[0]);
      });

      expect(api.patch).toHaveBeenCalledWith('/lesson/last/viewed/lesson-1');
    });

    it('registers a completed download', async () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api, 'student')());

      await act(async () => {
        await result.current.registerLessonDownload('lesson-1');
      });

      expect(api.patch).toHaveBeenCalledWith('/lesson/download/register', {
        lessonId: 'lesson-1',
      });
    });

    it('resumes from the stored timestamp', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api, 'student')());

      act(() => {
        useLessonsStore.getState().updateTimestamp('lesson-1', 75);
      });

      expect(result.current.getInitialTimestamp('lesson-1')).toBe(75);
    });

    it('seeds the store with the progress the backend reported', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: {
          message: 'ok',
          data: [
            apiLesson({
              progress: {
                id: 'p-1',
                userId: 'u-1',
                lessonId: 'lesson-1',
                progress: 55,
                video: false,
                audio: false,
                initialFrame: false,
                finalFrame: false,
                lessonDoc: false,
                coin: null,
                scoreCoin: null,
                timeSpent: 0,
                lastInteraction: null,
                contentDownloaded: false,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            }),
          ],
        },
      });
      const { result } = renderHook(() => createUseClassLessons(api, 'student')());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic('subtopic-1');
      });

      expect(
        useLessonsStore.getState().lessonsProgress['lesson-1']
          .progressPercentage
      ).toBe(55);
    });
  });

  describe('preview mode', () => {
    it('never records the last viewed lesson', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: { message: 'ok', data: [apiLesson()] },
      });
      const { result } = renderHook(() => createUseClassLessons(api, 'preview')());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic('subtopic-1');
      });
      await act(async () => {
        result.current.selectLesson(result.current.lessons[0]);
      });

      expect(api.patch).not.toHaveBeenCalled();
    });

    it('never registers a download', async () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api, 'preview')());

      await act(async () => {
        await result.current.registerLessonDownload('lesson-1');
      });

      expect(api.patch).not.toHaveBeenCalled();
    });

    it('never resumes playback, even with a stored timestamp', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api, 'preview')());

      act(() => {
        useLessonsStore.getState().updateTimestamp('lesson-1', 75);
      });

      expect(result.current.getInitialTimestamp('lesson-1')).toBe(0);
    });

    it('does not seed the store with progress', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: { message: 'ok', data: [apiLesson()] },
      });
      const { result } = renderHook(() => createUseClassLessons(api, 'preview')());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic('subtopic-1');
      });

      expect(useLessonsStore.getState().lessonsProgress).toEqual({});
    });
  });

  describe('handleVideoTimeUpdate', () => {
    async function loadOne(mode: 'student' | 'preview') {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: { message: 'ok', data: [apiLesson()] },
      });
      const hook = renderHook(() => createUseClassLessons(api, mode)());

      await act(async () => {
        await hook.result.current.fetchLessonsBySubtopic('subtopic-1');
      });

      return { api, hook };
    }

    it('records the watched seconds and the duration for a student', async () => {
      const { hook } = await loadOne('student');

      act(() => {
        hook.result.current.handleVideoTimeUpdate(30, 600);
      });

      const stored = useLessonsStore.getState().lessonsProgress['lesson-1'];
      expect(stored.watchedSeconds).toBe(30);
      expect(stored.totalSeconds).toBe(600);
      expect(useLessonsStore.getState().lastWatchedTimestamps['lesson-1']).toBe(
        30
      );
    });

    it('leaves the percentage to the backend', async () => {
      const { hook } = await loadOne('student');

      act(() => {
        useLessonsStore.getState().updateLessonProgress('lesson-1', {
          lessonId: 'lesson-1',
          watchedSeconds: 0,
          totalSeconds: 0,
          completed: false,
          progressPercentage: 65,
        });
      });
      act(() => {
        hook.result.current.handleVideoTimeUpdate(30, 600);
      });

      // Playback position must never overwrite the consolidated percentage the
      // backend computes from its criteria.
      expect(
        useLessonsStore.getState().lessonsProgress['lesson-1']
          .progressPercentage
      ).toBe(65);
    });

    it('remembers nothing about playback in preview mode', async () => {
      const { hook } = await loadOne('preview');

      act(() => {
        hook.result.current.handleVideoTimeUpdate(30, 600);
      });

      expect(useLessonsStore.getState().lessonsProgress).toEqual({});
      expect(useLessonsStore.getState().lastWatchedTimestamps).toEqual({});
    });

    it('does nothing without a current lesson', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api)());

      act(() => {
        result.current.handleVideoTimeUpdate(30, 600);
      });

      expect(useLessonsStore.getState().lessonsProgress).toEqual({});
    });
  });

  describe('media accessors', () => {
    it('returns empty values for a null lesson', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassLessons(api)());

      expect(result.current.getDownloadContent(null)).toEqual({});
      expect(result.current.getBoardImages(null)).toEqual([]);
      expect(result.current.getPodcastData(null)).toBeNull();
    });

    it('exposes the lesson media', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({
        data: {
          message: 'ok',
          data: [
            apiLesson({
              urlPodCast: 'https://cdn.test/p.mp3',
              podCastTitle: 'Episódio 1',
              urlInitialFrame: 'https://cdn.test/i.png',
            }),
          ],
        },
      });
      const { result } = renderHook(() => createUseClassLessons(api)());

      await act(async () => {
        await result.current.fetchLessonsBySubtopic('subtopic-1');
      });

      const lesson = result.current.lessons[0];
      expect(result.current.getPodcastData(lesson)).toEqual({
        src: 'https://cdn.test/p.mp3',
        title: 'Episódio 1',
      });
      expect(result.current.getBoardImages(lesson)).toEqual([
        {
          id: 'lesson-1-initial',
          imageUrl: 'https://cdn.test/i.png',
          title: 'Quadro Inicial',
        },
      ]);
      expect(result.current.getDownloadContent(lesson).urlVideo).toBe(
        'https://cdn.test/v.mp4'
      );
    });
  });
});

describe('fetchLessonById', () => {
  it('maps a single lesson', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: { message: 'ok', data: apiLesson() } });

    const lesson = await fetchLessonById(api, 'lesson-1');

    expect(api.get).toHaveBeenCalledWith('/lesson/lesson-1');
    expect(lesson?.title).toBe('Aula 1');
  });

  it('returns null when the response carries no lesson', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: { message: 'ok', data: null } });

    await expect(fetchLessonById(api, 'lesson-1')).resolves.toBeNull();
  });
});
