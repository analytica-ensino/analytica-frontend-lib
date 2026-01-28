import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessonBank } from './useLessonBank';
import type { BaseApiClient } from '../../../types/api';
import type { Lesson, LessonsListResponse } from '../../../types/lessons';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  callback: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void;

  constructor(
    callback: (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => void
  ) {
    this.callback = callback;
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
  takeRecords = (): IntersectionObserverEntry[] => [];
}

(
  globalThis as unknown as {
    IntersectionObserver: typeof MockIntersectionObserver;
  }
).IntersectionObserver = MockIntersectionObserver;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLessonBank', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const createMockLesson = (
    id: string,
    overrides?: Partial<Lesson>
  ): Lesson => ({
    id,
    title: `Lesson ${id}`,
    subjectId: 'subject-1',
    topicId: 'topic-1',
    subtopicId: 'subtopic-1',
    contentId: 'content-1',
    urlVideo: `https://example.com/video-${id}.mp4`,
    urlPodCast: `https://example.com/podcast-${id}.mp3`,
    urlCover: `https://example.com/cover-${id}.jpg`,
    urlSubtitle: `https://example.com/subtitle-${id}.vtt`,
    videoTitle: `Video ${id}`,
    podCastTitle: `Podcast ${id}`,
    subject: {
      id: 'subject-1',
      name: 'Matemática',
      color: '#FF0000',
      icon: 'math',
    },
    topic: {
      id: 'topic-1',
      name: 'Álgebra',
    },
    subtopic: {
      id: 'subtopic-1',
      name: 'Equações',
    },
    content: {
      id: 'content-1',
      name: 'Equações de 1º grau',
    },
    ...overrides,
  });

  const createMockResponse = (
    lessons: Lesson[],
    pagination = {
      page: 1,
      limit: 20,
      total: lessons.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }
  ): { data: LessonsListResponse } => ({
    data: {
      message: 'Success',
      data: {
        lessons,
        pagination,
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should return initial state with empty data when no filters provided', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      expect(result.current.lessons).toEqual([]);
      expect(result.current.pagination).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedLesson).toBeNull();
      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.filteredLessons).toEqual([]);
      expect(result.current.totalLessons).toBe(0);
    });

    it('should return all expected functions and refs', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      // Actions
      expect(result.current.handleWatch).toBeInstanceOf(Function);
      expect(result.current.handleAddToLesson).toBeInstanceOf(Function);
      expect(result.current.handleAddToLessonFromModal).toBeInstanceOf(
        Function
      );
      expect(result.current.handleCloseModal).toBeInstanceOf(Function);

      // Data getters
      expect(result.current.getVideoData).toBeInstanceOf(Function);
      expect(result.current.getPodcastData).toBeInstanceOf(Function);
      expect(result.current.getBoardImages).toBeInstanceOf(Function);
      expect(result.current.getBoardImageRef).toBeInstanceOf(Function);
      expect(result.current.getInitialTimestampValue).toBeInstanceOf(Function);

      // Callbacks
      expect(result.current.handleVideoTimeUpdate).toBeInstanceOf(Function);
      expect(result.current.handleVideoCompleteCallback).toBeInstanceOf(
        Function
      );
      expect(result.current.handlePodcastEnded).toBeInstanceOf(Function);

      // Helpers
      expect(result.current.uniqueLesson).toBeInstanceOf(Function);

      // Refs
      expect(result.current.observerTarget).toBeDefined();
      expect(result.current.firstBoardImageRef).toBeDefined();
      expect(result.current.lastBoardImageRef).toBeDefined();
    });
  });

  describe('Fetching Lessons', () => {
    it('should fetch lessons when valid filters are provided', async () => {
      const mockLessons = [createMockLesson('1'), createMockLesson('2')];
      const mockResponse = createMockResponse(mockLessons);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/lesson/list', {
        page: 1,
        limit: 20,
        subjectId: ['subject-1'],
      });

      expect(result.current.lessons).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('should not fetch lessons when filters have no subjectId', async () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            topicIds: ['topic-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(result.current.lessons).toEqual([]);
    });

    it('should not fetch lessons when subjectId is empty array', async () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: [],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(result.current.lessons).toEqual([]);
    });

    it('should include all filter types in request body', async () => {
      const mockLessons = [createMockLesson('1')];
      const mockResponse = createMockResponse(mockLessons);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1', 'subject-2'],
            topicIds: ['topic-1'],
            subtopicIds: ['subtopic-1'],
            contentIds: ['content-1'],
            selectedIds: ['lesson-1', 'lesson-2'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/lesson/list', {
        page: 1,
        limit: 20,
        subjectId: ['subject-1', 'subject-2'],
        topicId: ['topic-1'],
        subtopicId: ['subtopic-1'],
        contentId: ['content-1'],
        // selectedLessonsIds is no longer sent to API - it's only used for client-side filtering
      });
    });

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erro ao carregar aulas');
      expect(result.current.lessons).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao carregar aulas:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should refetch lessons when filters change', async () => {
      const mockLessons1 = [createMockLesson('1')];
      const mockLessons2 = [createMockLesson('2'), createMockLesson('3')];

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce(createMockResponse(mockLessons1))
        .mockResolvedValueOnce(createMockResponse(mockLessons2));

      const { result, rerender } = renderHook(
        ({ filters }) =>
          useLessonBank({
            apiClient: mockApiClient,
            filters,
          }),
        {
          initialProps: {
            filters: { subjectId: ['subject-1'] },
          },
        }
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      rerender({ filters: { subjectId: ['subject-2'] } });

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(2);
      });

      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Pagination', () => {
    it('should set pagination data from API response', async () => {
      const mockLessons = [createMockLesson('1')];
      const mockResponse = createMockResponse(mockLessons, {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.pagination).not.toBeNull();
      });

      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
      // totalLessons now reflects filteredLessons.length (visible lessons), not pagination.total
      // Since mock returns 1 lesson and no addedLessonIds, filteredLessons.length is 1
      expect(result.current.totalLessons).toBe(1);
    });
  });

  describe('Watch Modal', () => {
    it('should open watch modal when handleWatch is called', async () => {
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      expect(result.current.isWatchModalOpen).toBe(true);
      expect(result.current.selectedLesson).toEqual(mockLesson);
    });

    it('should close watch modal and clear selected lesson when handleCloseModal is called', async () => {
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      expect(result.current.isWatchModalOpen).toBe(true);

      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.selectedLesson).toBeNull();
    });
  });

  describe('Add to Lesson', () => {
    it('should call onAddLesson callback when handleAddToLesson is called', () => {
      const onAddLesson = jest.fn();
      const mockLesson = createMockLesson('1');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onAddLesson,
        })
      );

      act(() => {
        result.current.handleAddToLesson(mockLesson);
      });

      expect(onAddLesson).toHaveBeenCalledWith(mockLesson);
    });

    it('should not throw when onAddLesson is not provided', () => {
      const mockLesson = createMockLesson('1');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleAddToLesson(mockLesson);
        });
      }).not.toThrow();
    });

    it('should call onAddLesson and close modal when handleAddToLessonFromModal is called', async () => {
      const onAddLesson = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onAddLesson,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleAddToLessonFromModal();
      });

      expect(onAddLesson).toHaveBeenCalledWith(mockLesson);
      expect(result.current.isWatchModalOpen).toBe(false);
      expect(result.current.selectedLesson).toBeNull();
    });

    it('should not call onAddLesson from modal when no lesson is selected', () => {
      const onAddLesson = jest.fn();

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onAddLesson,
        })
      );

      act(() => {
        result.current.handleAddToLessonFromModal();
      });

      expect(onAddLesson).not.toHaveBeenCalled();
    });
  });

  describe('Filtered Lessons', () => {
    it('should filter out already added lessons', async () => {
      const mockLessons = [
        createMockLesson('1'),
        createMockLesson('2'),
        createMockLesson('3'),
      ];
      const mockResponse = createMockResponse(mockLessons);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
          addedLessonIds: ['1', '3'],
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(3);
      });

      expect(result.current.filteredLessons).toHaveLength(1);
      expect(result.current.filteredLessons[0].id).toBe('2');
      // totalLessons should match filteredLessons.length
      expect(result.current.totalLessons).toBe(1);
    });

    it('should return all lessons when addedLessonIds is empty', async () => {
      const mockLessons = [createMockLesson('1'), createMockLesson('2')];
      const mockResponse = createMockResponse(mockLessons);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
          addedLessonIds: [],
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(2);
      });

      expect(result.current.filteredLessons).toHaveLength(2);
      // totalLessons should match filteredLessons.length
      expect(result.current.totalLessons).toBe(2);
    });
  });

  describe('Video Data', () => {
    it('should return video data for a lesson', () => {
      const mockLesson = createMockLesson('1', {
        urlVideo: 'https://example.com/video.mp4',
        urlCover: 'https://example.com/cover.jpg',
        urlSubtitle: 'https://example.com/subtitle.vtt',
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const videoData = result.current.getVideoData(mockLesson);

      expect(videoData).toEqual({
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/cover.jpg',
        subtitles: 'https://example.com/subtitle.vtt',
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

    it('should handle lesson without video URL', () => {
      const mockLesson = createMockLesson('1', {
        urlVideo: undefined,
        urlCover: undefined,
        urlSubtitle: undefined,
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const videoData = result.current.getVideoData(mockLesson);

      expect(videoData).toEqual({
        src: '',
        poster: undefined,
        subtitles: undefined,
      });
    });
  });

  describe('Podcast Data', () => {
    it('should return podcast data for a lesson', () => {
      const mockLesson = createMockLesson('1', {
        urlPodCast: 'https://example.com/podcast.mp3',
        podCastTitle: 'My Podcast',
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const podcastData = result.current.getPodcastData(mockLesson);

      expect(podcastData).toEqual({
        src: 'https://example.com/podcast.mp3',
        title: 'My Podcast',
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

    it('should handle lesson without podcast URL', () => {
      const mockLesson = createMockLesson('1', {
        urlPodCast: undefined,
        podCastTitle: undefined,
      });

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const podcastData = result.current.getPodcastData(mockLesson);

      expect(podcastData).toEqual({
        src: '',
        title: '',
      });
    });
  });

  describe('Board Images', () => {
    it('should return board images from lesson', () => {
      const boardImages = [
        { url: 'https://example.com/board1.jpg' },
        { url: 'https://example.com/board2.jpg' },
      ];
      const mockLesson = {
        ...createMockLesson('1'),
        boardImages,
      };

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const images = result.current.getBoardImages(mockLesson);

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

    it('should return empty array when lesson has no board images', () => {
      const mockLesson = createMockLesson('1');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const images = result.current.getBoardImages(mockLesson);

      expect(images).toEqual([]);
    });
  });

  describe('Board Image Refs', () => {
    it('should return firstBoardImageRef for index 0', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const ref = result.current.getBoardImageRef(0, 3);

      expect(ref).toBe(result.current.firstBoardImageRef);
    });

    it('should return lastBoardImageRef for last index', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const ref = result.current.getBoardImageRef(2, 3);

      expect(ref).toBe(result.current.lastBoardImageRef);
    });

    it('should return null for middle indices', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const ref = result.current.getBoardImageRef(1, 3);

      expect(ref).toBeNull();
    });
  });

  describe('Initial Timestamp', () => {
    it('should use getInitialTimestamp callback when provided', () => {
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

    it('should fallback to localStorage when getInitialTimestamp not provided', () => {
      localStorageMock.getItem.mockReturnValueOnce('60.5');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('lesson-lesson-1');
      expect(timestamp).toBe(60.5);
    });

    it('should return 0 when localStorage has no value', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(timestamp).toBe(0);
    });

    it('should return 0 for invalid localStorage value', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(timestamp).toBe(0);
    });

    it('should return 0 for negative localStorage value', () => {
      localStorageMock.getItem.mockReturnValueOnce('-10');

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      const timestamp = result.current.getInitialTimestampValue('lesson-1');

      expect(timestamp).toBe(0);
    });
  });

  describe('Video Time Update', () => {
    it('should call onVideoTimeUpdate with lesson id and time', async () => {
      const onVideoTimeUpdate = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleVideoTimeUpdate(30);
      });

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('1', 30);
    });

    it('should use lessonId from config when isFromTrailRoute is true', async () => {
      const onVideoTimeUpdate = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
          isFromTrailRoute: true,
          lessonId: 'trail-lesson-id',
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleVideoTimeUpdate(30);
      });

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('trail-lesson-id', 30);
    });

    it('should not call onVideoTimeUpdate when no lesson is selected', () => {
      const onVideoTimeUpdate = jest.fn();

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
        })
      );

      act(() => {
        result.current.handleVideoTimeUpdate(30);
      });

      expect(onVideoTimeUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Video Complete Callback', () => {
    it('should call onVideoComplete with lesson id', async () => {
      const onVideoComplete = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoComplete,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleVideoCompleteCallback();
      });

      expect(onVideoComplete).toHaveBeenCalledWith('1');
    });

    it('should use lessonId from config when isFromTrailRoute is true', async () => {
      const onVideoComplete = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoComplete,
          isFromTrailRoute: true,
          lessonId: 'trail-lesson-id',
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleVideoCompleteCallback();
      });

      expect(onVideoComplete).toHaveBeenCalledWith('trail-lesson-id');
    });

    it('should not call onVideoComplete when no lesson is selected', () => {
      const onVideoComplete = jest.fn();

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoComplete,
        })
      );

      act(() => {
        result.current.handleVideoCompleteCallback();
      });

      expect(onVideoComplete).not.toHaveBeenCalled();
    });
  });

  describe('Podcast Ended Callback', () => {
    it('should call onPodcastEnded with lesson id', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledWith('1');
    });

    it('should only call onPodcastEnded once per lesson', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(1);
    });

    it('should reset podcast flag when lesson changes', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      const mockLesson1 = createMockLesson('1');
      const mockLesson2 = createMockLesson('2');
      const mockResponse = createMockResponse([mockLesson1, mockLesson2]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(2);
      });

      act(() => {
        result.current.handleWatch(mockLesson1);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      act(() => {
        result.current.handleWatch(mockLesson2);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(2);
    });

    it('should handle onPodcastEnded error and revert flag', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const onPodcastEnded = jest.fn().mockRejectedValue(new Error('Failed'));
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in podcast ended callback:',
        expect.any(Error)
      );

      // Flag should be reverted, allowing another call
      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });

    it('should not call onPodcastEnded when no lesson is selected', async () => {
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onPodcastEnded,
        })
      );

      await act(async () => {
        await result.current.handlePodcastEnded();
      });

      expect(onPodcastEnded).not.toHaveBeenCalled();
    });
  });

  describe('Unique Lesson Helper', () => {
    it('should return "aula" for single lesson', async () => {
      const mockLessons = [createMockLesson('1')];
      const mockResponse = createMockResponse(mockLessons, {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.totalLessons).toBe(1);
      });

      expect(result.current.uniqueLesson()).toBe('aula');
    });

    it('should return "aulas" for multiple lessons', async () => {
      const mockLessons = [createMockLesson('1'), createMockLesson('2')];
      const mockResponse = createMockResponse(mockLessons, {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.totalLessons).toBe(2);
      });

      expect(result.current.uniqueLesson()).toBe('aulas');
    });

    it('should return "aulas" for zero lessons', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      expect(result.current.uniqueLesson()).toBe('aulas');
    });
  });

  describe('Loading States', () => {
    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.post as jest.Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(createMockResponse([createMockLesson('1')]));
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Intersection Observer', () => {
    it('should return observerTarget ref that can be attached to an element', () => {
      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
        })
      );

      // The observerTarget ref should be defined and can be used
      expect(result.current.observerTarget).toBeDefined();
      expect(result.current.observerTarget.current).toBeNull();
    });
  });

  describe('Filter Changes', () => {
    it('should reset state when filters become invalid', async () => {
      const mockLessons = [createMockLesson('1')];
      const mockResponse = createMockResponse(mockLessons);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result, rerender } = renderHook(
        ({ filters }) =>
          useLessonBank({
            apiClient: mockApiClient,
            filters,
          }),
        {
          initialProps: {
            filters: { subjectId: ['subject-1'] },
          },
        }
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      rerender({ filters: { subjectId: [] } });

      await waitFor(() => {
        expect(result.current.lessons).toEqual([]);
      });

      expect(result.current.pagination).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('isFromTrailRoute with empty lessonId', () => {
    it('should use empty string when lessonId is undefined and isFromTrailRoute is true', async () => {
      const onVideoTimeUpdate = jest.fn();
      const mockLesson = createMockLesson('1');
      const mockResponse = createMockResponse([mockLesson]);

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useLessonBank({
          apiClient: mockApiClient,
          onVideoTimeUpdate,
          isFromTrailRoute: true,
          filters: {
            subjectId: ['subject-1'],
          },
        })
      );

      await waitFor(() => {
        expect(result.current.lessons).toHaveLength(1);
      });

      act(() => {
        result.current.handleWatch(mockLesson);
      });

      act(() => {
        result.current.handleVideoTimeUpdate(30);
      });

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('', 30);
    });
  });
});
