import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessonBank, type LessonFilters } from './useLessonBank';
import type { BaseApiClient } from '../../../types/api';
import type {
  Lesson,
  LessonsListResponse,
  LessonsPagination,
} from '../../../types/lessons';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';

// Mock IntersectionObserver
(globalThis as { IntersectionObserver: unknown }).IntersectionObserver = jest
  .fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .mockImplementation((callback: any) => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      trigger: (entries: IntersectionObserverEntry[]) => {
        callback(entries, {} as IntersectionObserver);
      },
    };
  }) as unknown as typeof IntersectionObserver;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLessonBank', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const buildLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
    id: 'lesson-1',
    title: 'Test Lesson',
    ...overrides,
  });

  const buildLessonWithMedia = (
    overrides: Partial<
      Lesson & {
        videoSrc?: string;
        podcastSrc?: string;
        boardImages?: WhiteboardImage[];
      }
    > = {}
  ): Lesson & {
    videoSrc?: string;
    videoPoster?: string;
    videoSubtitles?: string;
    podcastSrc?: string;
    podcastTitle?: string;
    boardImages?: WhiteboardImage[];
  } => ({
    ...buildLesson(overrides),
    videoSrc: 'https://example.com/video.mp4',
    videoPoster: 'https://example.com/poster.jpg',
    videoSubtitles: 'https://example.com/subtitles.vtt',
    podcastSrc: 'https://example.com/podcast.mp3',
    podcastTitle: 'Test Podcast',
    boardImages: [
      {
        id: 'board-1',
        imageUrl: 'https://example.com/board1.jpg',
      },
    ],
    ...overrides,
  });

  const buildPagination = (
    overrides: Partial<LessonsPagination> = {}
  ): LessonsPagination => ({
    page: 1,
    limit: 20,
    total: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should return initial state with empty data', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [],
            pagination: buildPagination({ total: 0 }),
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toMatchObject({
        lessons: [],
        pagination: expect.any(Object),
        loading: false,
        loadingMore: false,
        error: null,
        selectedLesson: null,
        isWatchModalOpen: false,
        filteredLessons: [],
        totalLessons: 0,
      });

      expect(result.current.observerTarget).toBeDefined();
      expect(result.current.firstBoardImageRef).toBeDefined();
      expect(result.current.lastBoardImageRef).toBeDefined();
      expect(result.current.handleWatch).toBeInstanceOf(Function);
      expect(result.current.handleAddToLesson).toBeInstanceOf(Function);
      expect(result.current.handleCloseModal).toBeInstanceOf(Function);
      expect(result.current.getVideoData).toBeInstanceOf(Function);
      expect(result.current.getPodcastData).toBeInstanceOf(Function);
      expect(result.current.getBoardImages).toBeInstanceOf(Function);
      expect(result.current.uniqueLesson).toBeInstanceOf(Function);
    });
  });

  describe('Fetch Lessons', () => {
    it('should fetch lessons successfully on mount when filters are provided', async () => {
      const mockLessons: Lesson[] = [
        buildLesson({ id: 'lesson-1', title: 'Lesson 1' }),
        buildLesson({ id: 'lesson-2', title: 'Lesson 2' }),
      ];

      const mockPagination = buildPagination({
        total: 2,
        hasNext: false,
      });

      const mockResponse: LessonsListResponse = {
        message: 'Success',
        data: {
          lessons: mockLessons,
          pagination: mockPagination,
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const filters: LessonFilters = {
        subjectId: ['math'],
      };

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters,
        })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toEqual(mockLessons);
      expect(result.current.pagination).toEqual(mockPagination);
      expect(result.current.error).toBeNull();
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/lessons/list',
        expect.objectContaining({
          page: 1,
          limit: 20,
          filters: {
            subjectId: ['math'],
          },
        })
      );
    });

    it('should fetch lessons without filters when filters are not provided', async () => {
      const mockLessons: Lesson[] = [buildLesson()];
      const mockPagination = buildPagination();

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: mockLessons,
            pagination: mockPagination,
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/lessons/list',
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/lessons/list',
        expect.not.objectContaining({
          filters: expect.anything(),
        })
      );
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      (mockApiClient.post as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: { subjectId: ['math'] },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erro ao carregar aulas');
      expect(result.current.lessons).toEqual([]);
    });

    it('should refetch lessons when filters change', async () => {
      const mockLessons1: Lesson[] = [buildLesson({ id: 'lesson-1' })];
      const mockLessons2: Lesson[] = [buildLesson({ id: 'lesson-2' })];

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              lessons: mockLessons1,
              pagination: buildPagination(),
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              lessons: mockLessons2,
              pagination: buildPagination(),
            },
          },
        });

      const { result, rerender } = renderHook(
        ({ filters }) =>
          useLessonBank({
            apiClient: mockApiClient,
            filters,
          }),
        {
          initialProps: { filters: { subjectId: ['math'] } as LessonFilters },
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toEqual(mockLessons1);

      rerender({ filters: { subjectId: ['science'] } as LessonFilters });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toEqual(mockLessons2);
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filters', () => {
    it('should include all filter types in request', async () => {
      const filters: LessonFilters = {
        subjectId: ['math'],
        topicIds: ['algebra'],
        subtopicIds: ['equations'],
        contentIds: ['linear-equations'],
        selectedIds: ['lesson-1', 'lesson-2'],
      };

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [],
            pagination: buildPagination(),
          },
        },
      });

      renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters,
        })
      );

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/lessons/list',
        expect.objectContaining({
          filters: {
            subjectId: ['math'],
            topicIds: ['algebra'],
            subtopicIds: ['equations'],
            contentIds: ['linear-equations'],
            selectedIds: ['lesson-1', 'lesson-2'],
          },
        })
      );
    });

    it('should not include empty filter arrays', async () => {
      const filters: LessonFilters = {
        subjectId: ['math'],
        topicIds: [],
        subtopicIds: undefined,
      };

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [],
            pagination: buildPagination(),
          },
        },
      });

      renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters,
        })
      );

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });

      const callArgs = (mockApiClient.post as jest.Mock).mock
        .calls[0][1] as Record<string, unknown>;
      const filtersBody = callArgs.filters as Record<string, unknown>;

      expect(filtersBody.subjectId).toEqual(['math']);
      expect(filtersBody.topicIds).toBeUndefined();
      expect(filtersBody.subtopicIds).toBeUndefined();
    });
  });

  describe('Filtered Lessons', () => {
    it('should filter out added lessons', async () => {
      const mockLessons: Lesson[] = [
        buildLesson({ id: 'lesson-1' }),
        buildLesson({ id: 'lesson-2' }),
        buildLesson({ id: 'lesson-3' }),
      ];

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: mockLessons,
            pagination: buildPagination(),
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          addedLessonIds: ['lesson-2'],
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredLessons).toHaveLength(2);
      expect(result.current.filteredLessons.map((l) => l.id)).toEqual([
        'lesson-1',
        'lesson-3',
      ]);
    });

    it('should update filtered lessons when addedLessonIds change', async () => {
      const mockLessons: Lesson[] = [
        buildLesson({ id: 'lesson-1' }),
        buildLesson({ id: 'lesson-2' }),
      ];

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: mockLessons,
            pagination: buildPagination(),
          },
        },
      });

      const { result, rerender } = renderHook(
        ({ addedLessonIds }) =>
          useLessonBank({
            apiClient: mockApiClient,
            addedLessonIds,
          }),
        {
          initialProps: { addedLessonIds: [] },
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredLessons).toHaveLength(2);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rerender({ addedLessonIds: ['lesson-1'] as any });

      expect(result.current.filteredLessons).toHaveLength(1);
      expect(result.current.filteredLessons[0].id).toBe('lesson-2');
    });
  });

  describe('Modal Handlers', () => {
    it('should open modal and set selected lesson when handleWatch is called', () => {
      const lesson = buildLesson();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.selectedLesson).toBeNull();

      act(() => {
        result.current.handleWatch(lesson);
      });

      expect(result.current.isWatchModalOpen).toBe(true);
      expect(result.current.selectedLesson).toEqual(lesson);
    });

    it('should close modal when handleCloseModal is called', () => {
      const lesson = buildLesson();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      expect(result.current.isWatchModalOpen).toBe(true);

      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.selectedLesson).toBeNull();
    });

    it('should call onAddLesson when handleAddToLesson is called', () => {
      const lesson = buildLesson();
      const onAddLesson = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onAddLesson,
        })
      );

      act(() => {
        result.current.handleAddToLesson(lesson);
      });

      expect(onAddLesson).toHaveBeenCalledWith(lesson);
    });

    it('should call onAddLesson and close modal when handleAddToLessonFromModal is called', () => {
      const lesson = buildLesson();
      const onAddLesson = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onAddLesson,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      expect(result.current.isWatchModalOpen).toBe(true);

      act(() => {
        result.current.handleAddToLessonFromModal();
      });

      expect(onAddLesson).toHaveBeenCalledWith(lesson);
      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.selectedLesson).toBeNull();
    });

    it('should not call onAddLesson if not provided', () => {
      const lesson = buildLesson();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      act(() => {
        result.current.handleAddToLesson(lesson);
      });

      // Should not throw
      expect(result.current.isWatchModalOpen).toBe(false);
    });
  });

  describe('Data Getters', () => {
    it('should get video data from lesson', () => {
      const lesson = buildLessonWithMedia({
        videoSrc: 'https://example.com/video.mp4',
        videoPoster: 'https://example.com/poster.jpg',
        videoSubtitles: 'https://example.com/subtitles.vtt',
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const videoData = result.current.getVideoData(lesson);

      expect(videoData).toEqual({
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        subtitles: 'https://example.com/subtitles.vtt',
      });
    });

    it('should return empty video data for null lesson', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const videoData = result.current.getVideoData(null);

      expect(videoData).toEqual({
        src: '',
        poster: undefined,
        subtitles: undefined,
      });
    });

    it('should get podcast data from lesson', () => {
      const lesson = buildLessonWithMedia({
        podcastSrc: 'https://example.com/podcast.mp3',
        podcastTitle: 'Test Podcast',
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const podcastData = result.current.getPodcastData(lesson);

      expect(podcastData).toEqual({
        src: 'https://example.com/podcast.mp3',
        title: 'Test Podcast',
      });
    });

    it('should return empty podcast data for null lesson', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const podcastData = result.current.getPodcastData(null);

      expect(podcastData).toEqual({
        src: '',
        title: '',
      });
    });

    it('should get board images from lesson', () => {
      const boardImages: WhiteboardImage[] = [
        { id: 'board-1', imageUrl: 'https://example.com/board1.jpg' },
        { id: 'board-2', imageUrl: 'https://example.com/board2.jpg' },
      ];

      const lesson = buildLessonWithMedia({ boardImages });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const images = result.current.getBoardImages(lesson);

      expect(images).toEqual(boardImages);
    });

    it('should return empty array for null lesson', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const images = result.current.getBoardImages(null);

      expect(images).toEqual([]);
    });

    it('should get board image ref correctly', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const firstRef = result.current.getBoardImageRef(0, 3);
      const lastRef = result.current.getBoardImageRef(2, 3);
      const middleRef = result.current.getBoardImageRef(1, 3);

      expect(firstRef).toBe(result.current.firstBoardImageRef);
      expect(lastRef).toBe(result.current.lastBoardImageRef);
      expect(middleRef).toBeNull();
    });

    it('should get initial timestamp from callback if provided', () => {
      const getInitialTimestamp = jest.fn().mockReturnValue(120);
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          getInitialTimestamp,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(getInitialTimestamp).toHaveBeenCalledWith('lesson-1');
      expect(timestamp).toBe(120);
    });

    it('should get initial timestamp from localStorage if callback not provided', () => {
      localStorageMock.setItem('lesson-lesson-1', '150.5');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(timestamp).toBe(150.5);
    });

    it('should return 0 if no timestamp found', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(timestamp).toBe(0);
    });
  });

  describe('Video Callbacks', () => {
    it('should call onVideoTimeUpdate when handleVideoTimeUpdate is called', () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onVideoTimeUpdate = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      act(() => {
        result.current.handleVideoTimeUpdate(120);
      });

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('lesson-1', 120);
    });

    it('should use lessonId when isFromTrailRoute is true', () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onVideoTimeUpdate = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
          isFromTrailRoute: true,
          lessonId: 'trail-lesson-1',
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      act(() => {
        result.current.handleVideoTimeUpdate(120);
      });

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('trail-lesson-1', 120);
    });

    it('should call onVideoComplete when handleVideoCompleteCallback is called', () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onVideoComplete = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoComplete,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      act(() => {
        result.current.handleVideoCompleteCallback();
      });

      expect(onVideoComplete).toHaveBeenCalledWith('lesson-1');
    });

    it('should not call callbacks if no lesson is selected', () => {
      const onVideoTimeUpdate = jest.fn();
      const onVideoComplete = jest.fn();
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
          onVideoComplete,
        })
      );

      act(() => {
        result.current.handleVideoTimeUpdate(120);
      });

      act(() => {
        result.current.handleVideoCompleteCallback();
      });

      expect(onVideoTimeUpdate).not.toHaveBeenCalled();
      expect(onVideoComplete).not.toHaveBeenCalled();
    });
  });

  describe('Podcast Callbacks', () => {
    it('should call onPodcastEnded when handlePodcastEnded is called', async () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledWith('lesson-1');
    });

    it('should only call onPodcastEnded once per lesson', async () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(1);
    });

    it('should reset flag when lesson changes', async () => {
      const lesson1 = buildLesson({ id: 'lesson-1' });
      const lesson2 = buildLesson({ id: 'lesson-2' });
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
        })
      );

      act(() => {
        result.current.handleWatch(lesson1);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      act(() => {
        result.current.handleWatch(lesson2);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(2);
    });

    it('should revert flag if onPodcastEnded fails', async () => {
      const lesson = buildLesson({ id: 'lesson-1' });
      const onPodcastEnded = jest.fn().mockRejectedValue(new Error('Failed'));
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
        })
      );

      act(() => {
        result.current.handleWatch(lesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      // Should be able to call again after failure
      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(2);
    });
  });

  describe('Helpers', () => {
    it('should return singular form for one lesson', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [buildLesson()],
            pagination: buildPagination({ total: 1 }),
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.uniqueLesson()).toBe('aula');
    });

    it('should return plural form for multiple lessons', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [buildLesson(), buildLesson({ id: 'lesson-2' })],
            pagination: buildPagination({ total: 2 }),
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.uniqueLesson()).toBe('aulas');
    });

    it('should return plural form when total is 0', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      expect(result.current.uniqueLesson()).toBe('aulas');
    });
  });

  describe('Infinite Scroll', () => {
    it('should setup IntersectionObserver', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [buildLesson()],
            pagination: buildPagination({ hasNext: true }),
          },
        },
      });

      renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(IntersectionObserver).toHaveBeenCalled();
      });
    });

    it('should load more lessons when intersection occurs', async () => {
      const mockLessons1: Lesson[] = [buildLesson({ id: 'lesson-1' })];
      const mockLessons2: Lesson[] = [buildLesson({ id: 'lesson-2' })];

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              lessons: mockLessons1,
              pagination: buildPagination({ hasNext: true, page: 1 }),
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              lessons: mockLessons2,
              pagination: buildPagination({ hasNext: false, page: 2 }),
            },
          },
        });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toEqual(mockLessons1);
      expect(result.current.pagination?.hasNext).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);

      // Wait a bit for observer to be set up
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the most recent observer instance
      const mockCalls = (IntersectionObserver as jest.Mock).mock.results;
      expect(mockCalls.length).toBeGreaterThan(0);
      const observerInstance = mockCalls[mockCalls.length - 1].value;

      await act(async () => {
        observerInstance.trigger([
          {
            isIntersecting: true,
            target: document.createElement('div'),
          } as unknown as IntersectionObserverEntry,
        ]);
      });

      await waitFor(
        () => {
          expect(result.current.loadingMore).toBe(false);
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          expect(result.current.lessons).toHaveLength(2);
        },
        { timeout: 2000 }
      );

      expect(result.current.lessons.map((l) => l.id)).toEqual([
        'lesson-1',
        'lesson-2',
      ]);
    });

    it('should not load more when hasNext is false', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            lessons: [buildLesson()],
            pagination: buildPagination({ hasNext: false }),
          },
        },
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = (mockApiClient.post as jest.Mock).mock.calls
        .length;

      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      await act(async () => {
        observerInstance.trigger([
          {
            isIntersecting: true,
          } as IntersectionObserverEntry,
        ]);
      });

      // Wait a bit to ensure no additional calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect((mockApiClient.post as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });
  });
});
