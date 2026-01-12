import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Book, Plus } from 'phosphor-react';
import {
  Button,
  Modal,
  Text,
  SkeletonText,
  BaseApiClient,
  VideoPlayer,
  Alert,
  CardAudio,
  Whiteboard,
} from '../..';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';
import type {
  Lesson,
  LessonsListResponse,
  LessonsPagination,
} from '../../types/lessons';
import { Video } from '@phosphor-icons/react';

interface LessonFilters {
  subjectId?: string[];
  topicIds?: string[];
  subtopicIds?: string[];
  contentIds?: string[];
  selectedIds?: string[];
}

interface LessonBankProps {
  apiClient: BaseApiClient;
  onAddLesson?: (lesson: Lesson) => void;
  addedLessonIds?: string[];
  className?: string;
  isFromTrailRoute?: boolean;
  lessonId?: string;
  getInitialTimestamp?: (lessonId: string) => number;
  onVideoTimeUpdate?: (lessonId: string, time: number) => void;
  onVideoComplete?: (lessonId: string) => void;
  onPodcastEnded?: (lessonId: string) => void | Promise<void>;
  filters?: LessonFilters;
}

/**
 * Component that displays the list of lessons from the API
 * Fetches and displays lessons with infinite scroll
 */
export const LessonBank = ({
  apiClient,
  onAddLesson,
  addedLessonIds = [],
  className,
  isFromTrailRoute = false,
  lessonId,
  getInitialTimestamp,
  onVideoTimeUpdate,
  onVideoComplete,
  onPodcastEnded,
  filters,
}: LessonBankProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pagination, setPagination] = useState<LessonsPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);

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
        const requestBody: Record<string, unknown> = {
          page,
          limit: 20,
        };

        // Add filters object if any filter is provided
        const currentFilters = filtersRef.current;
        if (currentFilters) {
          const filtersBody: Record<string, unknown> = {};
          if (currentFilters.subjectId && currentFilters.subjectId.length > 0) {
            filtersBody.subjectId = currentFilters.subjectId;
          }
          if (currentFilters.topicIds && currentFilters.topicIds.length > 0) {
            filtersBody.topicIds = currentFilters.topicIds;
          }
          if (
            currentFilters.subtopicIds &&
            currentFilters.subtopicIds.length > 0
          ) {
            filtersBody.subtopicIds = currentFilters.subtopicIds;
          }
          if (
            currentFilters.contentIds &&
            currentFilters.contentIds.length > 0
          ) {
            filtersBody.contentIds = currentFilters.contentIds;
          }
          if (
            currentFilters.selectedIds &&
            currentFilters.selectedIds.length > 0
          ) {
            filtersBody.selectedIds = currentFilters.selectedIds;
          }

          // Only add filters object if it has any properties
          if (Object.keys(filtersBody).length > 0) {
            requestBody.filters = filtersBody;
          }
        }

        const response = await apiClientRef.current.post<LessonsListResponse>(
          '/lessons/list',
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
    [apiClient, pagination]
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
      subjectId: filters.subjectId?.sort() || [],
      topicIds: filters.topicIds?.sort() || [],
      subtopicIds: filters.subtopicIds?.sort() || [],
      contentIds: filters.contentIds?.sort() || [],
      selectedIds: filters.selectedIds?.sort() || [],
    });
  }, [filters]);

  /**
   * Reset pagination and fetch lessons when filters change
   * Only runs when filters actually change, not when other props change
   */
  useEffect(() => {
    setPagination(null);
    setLessons([]);
    const loadLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestBody: Record<string, unknown> = {
          page: 1,
          limit: 20,
        };

        // Add filters object if any filter is provided
        if (filters) {
          const filtersBody: Record<string, unknown> = {};
          if (filters.subjectId && filters.subjectId.length > 0) {
            filtersBody.subjectId = filters.subjectId;
          }
          if (filters.topicIds && filters.topicIds.length > 0) {
            filtersBody.topicIds = filters.topicIds;
          }
          if (filters.subtopicIds && filters.subtopicIds.length > 0) {
            filtersBody.subtopicIds = filters.subtopicIds;
          }
          if (filters.contentIds && filters.contentIds.length > 0) {
            filtersBody.contentIds = filters.contentIds;
          }
          if (filters.selectedIds && filters.selectedIds.length > 0) {
            filtersBody.selectedIds = filters.selectedIds;
          }

          // Only add filters object if it has any properties
          if (Object.keys(filtersBody).length > 0) {
            requestBody.filters = filtersBody;
          }
        }

        const response = await apiClientRef.current.post<LessonsListResponse>(
          '/lessons/list',
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
  }, [filtersKey]);

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

  const totalLessons = pagination?.total || 0;

  const uniqueLesson = () => {
    return totalLessons === 1 ? 'aula' : 'aulas';
  };

  /**
   * Handle watch button click
   */
  const handleWatch = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsWatchModalOpen(true);
  };

  /**
   * Handle add to lesson button click (from card)
   */
  const handleAddToLesson = (lesson: Lesson) => {
    if (onAddLesson) {
      onAddLesson(lesson);
    }
  };

  /**
   * Handle add to lesson from modal
   */
  const handleAddToLessonFromModal = () => {
    if (selectedLesson && onAddLesson) {
      onAddLesson(selectedLesson);
    }
    setIsWatchModalOpen(false);
    setSelectedLesson(null);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsWatchModalOpen(false);
    setSelectedLesson(null);
  };

  /**
   * Get video data from lesson
   */
  const getVideoData = (lesson: Lesson | null) => {
    if (!lesson) {
      return {
        src: '',
        poster: undefined,
        subtitles: undefined,
      };
    }

    return {
      src: (lesson as Lesson & { videoSrc?: string }).videoSrc || '',
      poster: (lesson as Lesson & { videoPoster?: string }).videoPoster,
      subtitles: (lesson as Lesson & { videoSubtitles?: string })
        .videoSubtitles,
    };
  };

  /**
   * Get podcast data from lesson
   */
  const getPodcastData = (lesson: Lesson | null) => {
    if (!lesson) {
      return {
        src: '',
        title: '',
      };
    }

    return {
      src: (lesson as Lesson & { podcastSrc?: string }).podcastSrc || '',
      title: (lesson as Lesson & { podcastTitle?: string }).podcastTitle || '',
    };
  };

  /**
   * Get board images from lesson
   */
  const getBoardImages = (lesson: Lesson | null): WhiteboardImage[] => {
    if (!lesson) {
      return [];
    }

    const boardImages = (
      lesson as Lesson & {
        boardImages?: WhiteboardImage[];
      }
    ).boardImages;

    return boardImages || [];
  };

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

  /**
   * Renders the appropriate content based on loading, error, and lessons state
   */
  const renderLessonsContent = () => {
    if (loading && filteredLessons.length === 0) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded">
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Erro ao carregar aulas: {error}
          </Text>
        </div>
      );
    }

    if (filteredLessons.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Nenhuma aula encontrada.
          </Text>
        </div>
      );
    }

    return (
      <>
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col gap-3 p-4 border border-border-200 rounded-lg bg-background"
          >
            <Text size="md" weight="medium" className="text-text-950">
              {lesson.title}
            </Text>

            <div className="flex gap-2">
              <Button
                variant="outline"
                action="secondary"
                size="small"
                onClick={() => handleWatch(lesson)}
                className="flex-1"
                iconLeft={<Video />}
              >
                Assistir
              </Button>
              <Button
                variant="outline"
                action="primary"
                size="small"
                onClick={() => handleAddToLesson(lesson)}
                className="flex-1"
                iconLeft={<Plus />}
              >
                Adicionar à aula
              </Button>
            </div>
          </div>
        ))}
        {pagination?.hasNext && (
          <div ref={observerTarget} className="h-4 w-full">
            {loadingMore && (
              <div className="flex flex-col gap-2 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border rounded">
                    <SkeletonText lines={2} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`w-full flex flex-col p-4 gap-2 overflow-hidden h-full min-h-0 ${className || ''}`}
    >
      <div className="flex flex-col gap-2 flex-shrink-0">
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Book size={24} />
          <Text size="lg" weight="bold">
            Banco de Aulas
          </Text>
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-800">
            {loading
              ? 'Carregando...'
              : `${totalLessons} ${uniqueLesson()} total`}
          </Text>
        </section>
      </div>

      <div className="flex flex-col gap-3 overflow-auto flex-1 min-h-0">
        {renderLessonsContent()}
      </div>

      <Modal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        title={selectedLesson?.title || 'Assistir Aula'}
        size="lg"
        hideCloseButton={true}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="solid" onClick={handleAddToLessonFromModal}>
              Adicionar à aula
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {selectedLesson ? (
            (() => {
              const videoData = getVideoData(selectedLesson);
              if (videoData.src) {
                return (
                  <>
                    <VideoPlayer
                      src={videoData.src}
                      poster={videoData.poster || undefined}
                      subtitles={videoData.subtitles || undefined}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onVideoComplete={handleVideoCompleteCallback}
                      initialTime={getInitialTimestampValue(
                        isFromTrailRoute
                          ? lessonId || ''
                          : selectedLesson?.id || ''
                      )}
                      className="w-full h-full object-cover rounded-b-xl"
                      autoSave={true}
                      storageKey={`lesson-${
                        isFromTrailRoute
                          ? lessonId || 'unknown'
                          : selectedLesson?.id || 'unknown'
                      }`}
                    />
                    <div className="flex flex-col gap-4">
                      <Alert
                        action="info"
                        variant="solid"
                        description="Cada aula inclui questionários automáticos para o aluno praticar o conteúdo."
                        className="w-full"
                      />
                      {(() => {
                        const podcastData = getPodcastData(selectedLesson);
                        if (podcastData.src) {
                          return (
                            <div className="w-full">
                              <p className="text-text-950 font-bold text-md pb-2">
                                {podcastData.title}
                              </p>
                              <CardAudio
                                src={podcastData.src}
                                title={podcastData.title}
                                onEnded={handlePodcastEnded}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const boardImages = getBoardImages(selectedLesson);
                        if (boardImages.length > 0) {
                          return (
                            <div className="w-full">
                              <p className="text-text-950 font-bold text-md pb-2">
                                Quadros da aula
                              </p>
                              <div className="flex flex-wrap gap-4">
                                {boardImages.map((image, index) => (
                                  <div
                                    key={image.id ?? index}
                                    ref={getBoardImageRef(
                                      index,
                                      boardImages.length
                                    )}
                                    className="flex flex-row rounded-xl bg-background-50"
                                  >
                                    <Whiteboard
                                      images={[image]}
                                      showDownload={true}
                                      imagesPerRow={2}
                                      className="gap-4 w-full items-center border-border-50"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </>
                );
              }
              return (
                <div className="px-6 py-6 flex flex-col gap-4">
                  <Text size="md" className="text-text-600">
                    Vídeo não disponível para esta aula.
                  </Text>
                </div>
              );
            })()
          ) : (
            <div className="px-6 py-6 flex flex-col gap-4">
              <Text size="md" className="text-text-600">
                Carregando...
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export type { LessonBankProps, LessonFilters };
