import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Book, Trash } from 'phosphor-react';
import { Button, Text, Divider } from '../../index';
import type { Lesson } from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';
import { cn } from '../../utils/utils';
import Video from '@/assets/icons/subjects/Video';
import { LessonWatchModal } from '../shared/LessonWatchModal';
import { AddActivityOptionModal, type ActivityOption } from './components';

type PreviewLesson = Lesson & {
  position?: number;
};

interface LessonPreviewProps {
  title?: string;
  lessons?: PreviewLesson[];
  onRemoveAll?: () => void;
  onRemoveLesson?: (lessonId: string) => void;
  className?: string;
  onReorder?: (orderedLessons: PreviewLesson[]) => void;
  /**
   * Emits the current ordered list (with positions) whenever it changes.
   */
  onPositionsChange?: (orderedLessons: PreviewLesson[]) => void;
  /**
   * Callback when video time updates
   */
  onVideoTimeUpdate?: (lessonId: string, time: number) => void;
  /**
   * Callback when video completes
   */
  onVideoComplete?: (lessonId: string) => void;
  /**
   * Callback when podcast ends
   */
  onPodcastEnded?: (lessonId: string) => void | Promise<void>;
  /**
   * Get initial timestamp for a lesson
   */
  getInitialTimestamp?: (lessonId: string) => number;
  /**
   * Callback when create new activity is clicked
   */
  onCreateNewActivity?: () => void;
}

export const LessonPreview = ({
  title = 'Prévia das aulas',
  lessons = [],
  onRemoveAll,
  onRemoveLesson,
  className,
  onReorder,
  onPositionsChange,
  onVideoTimeUpdate,
  onVideoComplete,
  onPodcastEnded,
  getInitialTimestamp,
  onCreateNewActivity,
}: LessonPreviewProps) => {
  const onPositionsChangeRef = useRef(onPositionsChange);
  onPositionsChangeRef.current = onPositionsChange;

  const normalizeWithPositions = useMemo(
    () => (items: PreviewLesson[]) =>
      items.map((item, index) => ({
        ...item,
        position: index + 1,
      })),
    []
  );

  const [orderedLessons, setOrderedLessons] = useState<PreviewLesson[]>(() =>
    normalizeWithPositions(lessons)
  );

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [isActivityOptionModalOpen, setIsActivityOptionModalOpen] =
    useState(false);

  // Refs for board images
  const firstBoardImageRef = useRef<HTMLDivElement | null>(null);
  const lastBoardImageRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedPodcast = useRef(false);

  // Sync when external lessons change (e.g., reset from parent)
  useEffect(() => {
    const normalized = normalizeWithPositions(lessons);
    setOrderedLessons(normalized);
    onPositionsChangeRef.current?.(normalized);
  }, [lessons, normalizeWithPositions]);

  const total = orderedLessons.length;
  const totalLabel =
    total === 1 ? '1 aula adicionada' : `${total} aulas adicionadas`;

  /**
   * Get video data from lesson
   */
  const getVideoData = (lesson: Lesson | null) => {
    if (!lesson) return { src: '' };
    const videoSrc = (lesson as Lesson & { videoSrc?: string }).videoSrc;
    const videoPoster = (lesson as Lesson & { videoPoster?: string })
      .videoPoster;
    const videoSubtitles = (lesson as Lesson & { videoSubtitles?: string })
      .videoSubtitles;
    return {
      src: videoSrc || '',
      poster: videoPoster,
      subtitles: videoSubtitles,
    };
  };

  /**
   * Get podcast data from lesson
   */
  const getPodcastData = (lesson: Lesson | null) => {
    if (!lesson) return { src: '', title: '' };
    const podcastSrc = (lesson as Lesson & { podcastSrc?: string }).podcastSrc;
    const podcastTitle =
      (lesson as Lesson & { podcastTitle?: string }).podcastTitle ||
      'Podcast da aula';
    return {
      src: podcastSrc || '',
      title: podcastTitle,
    };
  };

  /**
   * Get board images from lesson
   */
  const getBoardImages = (lesson: Lesson | null): WhiteboardImage[] => {
    if (!lesson) return [];
    const boardImages = (
      lesson as Lesson & {
        boardImages?: WhiteboardImage[];
      }
    ).boardImages;
    return boardImages || [];
  };

  /**
   * Get ref for board image based on index
   */
  const getBoardImageRef = (
    index: number,
    total: number
  ): React.RefObject<HTMLDivElement | null> | null => {
    if (index === 0) return firstBoardImageRef;
    if (index === total - 1) return lastBoardImageRef;
    return null;
  };

  /**
   * Get initial timestamp value for a lesson
   */
  const getInitialTimestampValue = (id: string): number => {
    if (getInitialTimestamp) {
      return getInitialTimestamp(id);
    }
    // Try to get from localStorage
    try {
      const stored = localStorage.getItem(`lesson-${id}-time`);
      if (stored) {
        return parseFloat(stored) || 0;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 0;
  };

  /**
   * Handle video time update
   */
  const handleVideoTimeUpdate = (time: number) => {
    if (selectedLesson && onVideoTimeUpdate) {
      onVideoTimeUpdate(selectedLesson.id, time);
    }
  };

  /**
   * Handle video complete callback
   */
  const handleVideoCompleteCallback = () => {
    if (selectedLesson && onVideoComplete) {
      onVideoComplete(selectedLesson.id);
    }
  };

  /**
   * Handle podcast ended
   */
  const handlePodcastEnded = async () => {
    if (selectedLesson && onPodcastEnded && !hasMarkedPodcast.current) {
      hasMarkedPodcast.current = true;
      try {
        await onPodcastEnded(selectedLesson.id);
      } catch {
        // Revert flag if callback failed
        hasMarkedPodcast.current = false;
      }
    }
  };

  /**
   * Handle watch lesson
   */
  const handleWatch = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsWatchModalOpen(true);
    hasMarkedPodcast.current = false;
  };

  /**
   * Handle close modal
   */
  const handleCloseModal = () => {
    setIsWatchModalOpen(false);
    setSelectedLesson(null);
    hasMarkedPodcast.current = false;
  };

  const handleReorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const current = [...orderedLessons];
    const fromIndex = current.findIndex((l) => l.id === fromId);
    const toIndex = current.findIndex((l) => l.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const normalized = normalizeWithPositions(current);
    setOrderedLessons(normalized);
    onReorder?.(normalized);
    onPositionsChange?.(normalized);
  };

  const handleSelectActivityOption = (option: ActivityOption) => {
    setIsActivityOptionModalOpen(false);
    if (option === 'create-new' && onCreateNewActivity) {
      onCreateNewActivity();
    } else if (option === 'choose-model') {
      // TODO: Implementar escolha de modelo
      console.log('Escolher modelo - a ser implementado');
    }
  };

  return (
    <>
      <div
        className={cn(
          'w-full flex-shrink-0 p-4 rounded-lg bg-background flex flex-col gap-4',
          className
        )}
      >
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Book size={24} />
          <Text size="lg" weight="bold">
            {title}
          </Text>
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-800">
            {totalLabel}
          </Text>
          {onRemoveAll && (
            <Button
              size="small"
              variant="link"
              action="negative"
              iconLeft={<Trash size={16} />}
              onClick={onRemoveAll}
            >
              Remover tudo
            </Button>
          )}
        </section>

        <section className="flex flex-col gap-3">
          {orderedLessons.map(
            (
              { id, title: lessonTitle = 'Aula sem título', position },
              index
            ) => (
              <div
                key={id}
                draggable
                data-draggable="true"
                role="button"
                tabIndex={0}
                aria-label={`Mover aula ${lessonTitle}`}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', id);
                  if (e.currentTarget instanceof HTMLElement) {
                    const preview = e.currentTarget.querySelector(
                      '[data-drag-preview="true"]'
                    );
                    if (preview) {
                      e.dataTransfer.setDragImage(preview, 8, 8);
                    } else {
                      e.dataTransfer.setDragImage(e.currentTarget, 8, 8);
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromId = e.dataTransfer.getData('text/plain');
                  handleReorder(fromId, id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    const targetId = orderedLessons[index - 1].id;
                    handleReorder(id, targetId);
                  } else if (
                    e.key === 'ArrowDown' &&
                    index < orderedLessons.length - 1
                  ) {
                    e.preventDefault();
                    const targetId = orderedLessons[index + 1].id;
                    handleReorder(id, targetId);
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    // Keyboard grab/drop noop; prevent scroll on space
                    e.preventDefault();
                  }
                }}
                className="rounded-lg border border-border-200 bg-background relative group"
              >
                {/* Hidden drag preview with visual representation of the card */}
                <div
                  data-drag-preview="true"
                  className="fixed -left-[9999px] -top-[9999px] pointer-events-none z-[9999] w-[440px]"
                >
                  <div className="w-full rounded-lg border border-border-200 bg-background">
                    <div className="p-4 flex flex-row items-center justify-between gap-4">
                      <div className="flex flex-row items-center gap-3 flex-1">
                        <Text size="sm" className="text-text-600">
                          {position ?? index + 1}
                        </Text>
                        <Text
                          size="md"
                          weight="medium"
                          className="text-text-950 truncate"
                        >
                          {lessonTitle}
                        </Text>
                      </div>
                      <div className="flex flex-row items-center text-text-950">
                        <Video size={24} color="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>

                {onRemoveLesson && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="link"
                      action="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLesson(id);
                      }}
                      aria-label={`Remover aula ${position ?? index + 1}`}
                    >
                      <Trash size={16} color="currentColor" />
                    </Button>
                  </div>
                )}
                <div className="p-4 flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-row items-center gap-3 flex-1">
                    <Text size="md" weight="medium" className="text-text-950">
                      {lessonTitle}
                    </Text>
                  </div>
                  <div className="flex flex-row items-center text-text-950">
                    <Button
                      variant="link"
                      action="secondary"
                      onClick={() => {
                        const lesson = orderedLessons.find((l) => l.id === id);
                        if (lesson) {
                          handleWatch(lesson);
                        }
                      }}
                      aria-label="Assistir aula"
                    >
                      <Video size={24} color="currentColor" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}
        </section>
      </div>

      <LessonWatchModal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        selectedLesson={selectedLesson}
        getVideoData={getVideoData}
        getInitialTimestampValue={getInitialTimestampValue}
        handleVideoTimeUpdate={handleVideoTimeUpdate}
        handleVideoCompleteCallback={handleVideoCompleteCallback}
        getPodcastData={getPodcastData}
        onPodcastEnded={handlePodcastEnded}
        getBoardImages={getBoardImages}
        getBoardImageRef={getBoardImageRef}
      />

      {/* Activity Option Modal */}
      <AddActivityOptionModal
        isOpen={isActivityOptionModalOpen}
        onClose={() => setIsActivityOptionModalOpen(false)}
        onSelectOption={handleSelectActivityOption}
      />

      {/* Activity Section */}
      <Divider />
      <div
        className={cn(
          'w-full flex-shrink-0 p-4 rounded-lg bg-background flex flex-col gap-4',
          className
        )}
      >
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Book size={24} />
          <Text size="lg" weight="bold">
            Atividade da aula recomendada
          </Text>
        </section>

        <Button
          variant="outline"
          action="primary"
          onClick={() => setIsActivityOptionModalOpen(true)}
          className="w-full"
        >
          Adicionar atividade
        </Button>
      </div>
    </>
  );
};

export type { LessonPreviewProps, PreviewLesson };
