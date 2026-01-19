import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  RefObject,
} from 'react';
import type { BaseApiClient } from '../../../types/api';
import type {
  Lesson,
  LessonsListResponse,
  LessonsPagination,
} from '../../../types/lessons';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';

export interface LessonFilters {
  subjectId?: string[];
  topicIds?: string[];
  subtopicIds?: string[];
  contentIds?: string[];
  selectedIds?: string[];
}

interface UseLessonBankConfig {
  apiClient: BaseApiClient;
  filters?: LessonFilters;
  addedLessonIds?: string[];
  onAddLesson?: (lesson: Lesson) => void;
  isFromTrailRoute?: boolean;
  lessonId?: string;
  getInitialTimestamp?: (lessonId: string) => number;
  onVideoTimeUpdate?: (lessonId: string, time: number) => void;
  onVideoComplete?: (lessonId: string) => void;
  onPodcastEnded?: (lessonId: string) => void | Promise<void>;
}

interface UseLessonBankReturn {
  // State
  lessons: Lesson[];
  pagination: LessonsPagination | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  selectedLesson: Lesson | null;
  isWatchModalOpen: boolean;
  filteredLessons: Lesson[];
  totalLessons: number;

  // Refs
  observerTarget: RefObject<HTMLDivElement | null>;
  firstBoardImageRef: RefObject<HTMLDivElement | null>;
  lastBoardImageRef: RefObject<HTMLDivElement | null>;

  // Actions
  handleWatch: (lesson: Lesson) => void;
  handleAddToLesson: (lesson: Lesson) => void;
  handleAddToLessonFromModal: () => void;
  handleCloseModal: () => void;

  // Data getters
  getVideoData: (lesson: Lesson | null) => {
    src: string;
    poster?: string;
    subtitles?: string;
  };
  getPodcastData: (lesson: Lesson | null) => {
    src: string;
    title: string;
  };
  getBoardImages: (lesson: Lesson | null) => WhiteboardImage[];
  getBoardImageRef: (
    index: number,
    total: number
  ) => RefObject<HTMLDivElement | null> | null;
  getInitialTimestampValue: (id: string) => number;

  // Callbacks
  handleVideoTimeUpdate: (seconds: number) => void;
  handleVideoCompleteCallback: () => void;
  handlePodcastEnded: () => Promise<void>;

  // Helpers
  uniqueLesson: () => string;
}

/**
 * Hook for managing lesson bank state and operations
 */
export const useLessonBank = (
  config: UseLessonBankConfig
): UseLessonBankReturn => {
  const {
    apiClient,
    filters,
    addedLessonIds = [],
    onAddLesson,
    isFromTrailRoute = false,
    lessonId,
    getInitialTimestamp,
    onVideoTimeUpdate,
    onVideoComplete,
    onPodcastEnded,
  } = config;

  // State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pagination, setPagination] = useState<LessonsPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);

  // Refs
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMarkedPodcast = useRef(false);
  const firstBoardImageRef = useRef<HTMLDivElement>(null);
  const lastBoardImageRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);
  const apiClientRef = useRef(apiClient);

  // Update refs when props change
  useEffect(() => {
    filtersRef.current = filters;
    apiClientRef.current = apiClient;
  }, [filters, apiClient]);

  /**
   * Build filters body from filters object
   * Maps to the expected API format for POST /lesson/list
   */
  const buildFiltersBody = useCallback(
    (currentFilters: LessonFilters | undefined): Record<string, unknown> => {
      const filtersBody: Record<string, unknown> = {};
      if (currentFilters?.subjectId && currentFilters.subjectId.length > 0) {
        filtersBody.subjectId = currentFilters.subjectId;
      }
      if (currentFilters?.topicIds && currentFilters.topicIds.length > 0) {
        filtersBody.topicId = currentFilters.topicIds; // API expects topicId (singular)
      }
      if (
        currentFilters?.subtopicIds &&
        currentFilters.subtopicIds.length > 0
      ) {
        filtersBody.subtopicId = currentFilters.subtopicIds; // API expects subtopicId (singular)
      }
      if (currentFilters?.contentIds && currentFilters.contentIds.length > 0) {
        filtersBody.contentId = currentFilters.contentIds; // API expects contentId (singular)
      }
      if (
        currentFilters?.selectedIds &&
        currentFilters.selectedIds.length > 0
      ) {
        filtersBody.selectedLessonsIds = currentFilters.selectedIds; // API expects selectedLessonsIds
      }
      return filtersBody;
    },
    []
  );

  /**
   * Build the complete request body for lesson list API
   * @param page - Page number
   * @param limit - Items per page
   * @param currentFilters - Optional filters to apply
   */
  const buildLessonRequestBody = useCallback(
    (
      page: number,
      limit: number,
      currentFilters: LessonFilters | undefined
    ): Record<string, unknown> => {
      const requestBody: Record<string, unknown> = { page, limit };

      if (currentFilters) {
        const filtersBody = buildFiltersBody(currentFilters);
        Object.assign(requestBody, filtersBody);
      }

      return requestBody;
    },
    [buildFiltersBody]
  );

  /**
   * Fetch lessons from API
   */
  const fetchLessons = useCallback(
    async (append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const currentPagination = pagination;
        const page =
          append && currentPagination ? currentPagination.page + 1 : 1;
        const requestBody = buildLessonRequestBody(
          page,
          20,
          filtersRef.current
        );

        const response = await apiClientRef.current.post<LessonsListResponse>(
          '/lesson/list',
          requestBody
        );

        if (append) {
          setLessons((prev) => [...prev, ...response.data.data.lessons]);
        } else {
          setLessons(response.data.data.lessons);
        }

        setPagination(response.data.data.pagination);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar aulas:', err);
        setError('Erro ao carregar aulas');
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination, buildLessonRequestBody]
  );

  /**
   * Load more lessons (for infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (pagination?.hasNext && !loading && !loadingMore) {
      await fetchLessons(true);
    }
  }, [pagination, loading, loadingMore, fetchLessons]);

  /**
   * Create a stable key from filters to detect changes
   */
  const filtersKey = useMemo(() => {
    if (!filters) return '';
    return JSON.stringify({
      subjectId: filters.subjectId || [],
      topicIds: filters.topicIds || [],
      subtopicIds: filters.subtopicIds || [],
      contentIds: filters.contentIds || [],
      selectedIds: filters.selectedIds || [],
    });
  }, [filters]);

  /**
   * Reset pagination and fetch lessons when filters change
   * Only runs when filters actually change, not when other props change
   * Only fetches if filters contain at least a subjectId
   */
  useEffect(() => {
    // Check if filters are valid (at least subjectId must be present)
    const hasValidFilters = filters?.subjectId && filters.subjectId.length > 0;

    // If no valid filters, reset state and skip fetch
    if (!hasValidFilters) {
      setPagination(null);
      setLessons([]);
      setError(null);
      setLoading(false);
      return;
    }

    setPagination(null);
    setLessons([]);
    const loadLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody = buildLessonRequestBody(1, 20, filters);

        const response = await apiClientRef.current.post<LessonsListResponse>(
          '/lesson/list',
          requestBody
        );

        setLessons(response.data.data.lessons);
        setPagination(response.data.data.pagination);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar aulas:', err);
        setError('Erro ao carregar aulas');
        setLoading(false);
      }
    };

    loadLessons();
  }, [filtersKey, buildLessonRequestBody]);

  /**
   * Intersection Observer for infinite scroll
   * Loads more lessons when user scrolls to the bottom
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadingMore &&
          pagination?.hasNext
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadingMore, pagination, loadMore]);

  /**
   * Handle watch button click
   */
  const handleWatch = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsWatchModalOpen(true);
  }, []);

  /**
   * Handle add to lesson button click (from card)
   */
  const handleAddToLesson = useCallback(
    (lesson: Lesson) => {
      if (onAddLesson) {
        onAddLesson(lesson);
      }
    },
    [onAddLesson]
  );

  /**
   * Handle add to lesson from modal
   */
  const handleAddToLessonFromModal = useCallback(() => {
    if (selectedLesson && onAddLesson) {
      onAddLesson(selectedLesson);
    }
    setIsWatchModalOpen(false);
    setSelectedLesson(null);
  }, [selectedLesson, onAddLesson]);

  /**
   * Handle modal close
   */
  const handleCloseModal = useCallback(() => {
    setIsWatchModalOpen(false);
    setSelectedLesson(null);
  }, []);

  /**
   * Get video data from lesson
   */
  const getVideoData = useCallback((lesson: Lesson | null) => {
    if (!lesson) {
      return {
        src: '',
        poster: undefined,
        subtitles: undefined,
      };
    }

    return {
      src: lesson.urlVideo || '',
      poster: lesson.urlCover,
      subtitles: lesson.urlSubtitle,
    };
  }, []);

  /**
   * Get podcast data from lesson
   */
  const getPodcastData = useCallback((lesson: Lesson | null) => {
    if (!lesson) {
      return {
        src: '',
        title: '',
      };
    }

    return {
      src: lesson.urlPodCast || '',
      title: lesson.podCastTitle || '',
    };
  }, []);

  /**
   * Get board images from lesson
   */
  const getBoardImages = useCallback(
    (lesson: Lesson | null): WhiteboardImage[] => {
      if (!lesson) {
        return [];
      }

      const boardImages = (
        lesson as Lesson & {
          boardImages?: WhiteboardImage[];
        }
      ).boardImages;

      return boardImages || [];
    },
    []
  );

  /**
   * Get ref for board image (only first and last)
   */
  const getBoardImageRef = useCallback((index: number, total: number) => {
    if (index === 0) {
      return firstBoardImageRef;
    }
    if (index === total - 1) {
      return lastBoardImageRef;
    }
    return null;
  }, []);

  /**
   * Get initial timestamp for video
   */
  const getInitialTimestampValue = useCallback(
    (id: string): number => {
      if (getInitialTimestamp) {
        return getInitialTimestamp(id);
      }
      // Try to get from localStorage as fallback
      const saved = localStorage.getItem(`lesson-${id}`);
      if (saved) {
        const parsed = Number.parseFloat(saved);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return parsed;
        }
      }
      return 0;
    },
    [getInitialTimestamp]
  );

  /**
   * Handle video time update
   */
  const handleVideoTimeUpdate = useCallback(
    (seconds: number) => {
      if (!selectedLesson) return;

      const currentLessonId = isFromTrailRoute
        ? lessonId || ''
        : selectedLesson.id;

      if (onVideoTimeUpdate) {
        onVideoTimeUpdate(currentLessonId, seconds);
      }
    },
    [selectedLesson, isFromTrailRoute, lessonId, onVideoTimeUpdate]
  );

  /**
   * Handle video complete callback
   */
  const handleVideoCompleteCallback = useCallback(() => {
    if (!selectedLesson) return;

    const currentLessonId = isFromTrailRoute
      ? lessonId || ''
      : selectedLesson.id;

    if (onVideoComplete) {
      onVideoComplete(currentLessonId);
    }
  }, [selectedLesson, isFromTrailRoute, lessonId, onVideoComplete]);

  /**
   * Handle podcast ended callback
   */
  const handlePodcastEnded = useCallback(async () => {
    if (!selectedLesson) return;

    const currentLessonId = isFromTrailRoute
      ? lessonId || ''
      : selectedLesson.id;

    if (onPodcastEnded && !hasMarkedPodcast.current) {
      hasMarkedPodcast.current = true;

      try {
        await onPodcastEnded(currentLessonId);
      } catch (error) {
        // Revert flag if callback failed
        hasMarkedPodcast.current = false;
        console.error('Error in podcast ended callback:', error);
      }
    }
  }, [selectedLesson, isFromTrailRoute, lessonId, onPodcastEnded]);

  /**
   * Reset podcast flag when lesson changes
   */
  useEffect(() => {
    hasMarkedPodcast.current = false;
  }, [selectedLesson?.id]);

  /**
   * Filter out lessons that are already added
   */
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => !addedLessonIds.includes(lesson.id));
  }, [lessons, addedLessonIds]);

  const totalLessons = pagination?.total || 0;

  const uniqueLesson = useCallback(() => {
    return totalLessons === 1 ? 'aula' : 'aulas';
  }, [totalLessons]);

  return {
    // State
    lessons,
    pagination,
    loading,
    loadingMore,
    error,
    selectedLesson,
    isWatchModalOpen,
    filteredLessons,
    totalLessons,

    // Refs
    observerTarget,
    firstBoardImageRef,
    lastBoardImageRef,

    // Actions
    handleWatch,
    handleAddToLesson,
    handleAddToLessonFromModal,
    handleCloseModal,

    // Data getters
    getVideoData,
    getPodcastData,
    getBoardImages,
    getBoardImageRef,
    getInitialTimestampValue,

    // Callbacks
    handleVideoTimeUpdate,
    handleVideoCompleteCallback,
    handlePodcastEnded,

    // Helpers
    uniqueLesson,
  };
};
