import {
  Fragment,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BookIcon } from '@phosphor-icons/react/dist/csr/Book';
import { BookBookmarkIcon } from '@phosphor-icons/react/dist/csr/BookBookmark';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { Button, Text, Divider, EmptyState } from '../../index';
import type { Lesson } from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';
import { cn } from '../../utils/utils';
import { LessonWatchModal } from '../shared/LessonWatchModal';
import { AddActivityOptionModal, type ActivityOption } from './components';
import { ChooseActivityModelModal } from '../ChooseActivityModelModal';
import type { BaseApiClient } from '../../types/api';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ToastNotification } from '../shared/ToastNotification/ToastNotification';
import { useToastNotification } from '../shared/ToastNotification/useToastNotification';
import Activities from '../../assets/icons/Activities';
import { useReorderDragAndDrop } from '../../hooks/useReorderDragAndDrop';
import { DropPlaceholder } from '../DropPlaceholder/DropPlaceholder';
import { LessonCardPreview } from '../LessonCardPreview/LessonCardPreview';
import { buildLessonTrail } from '../../utils/lessonTrail';

/**
 * Extended lesson type with optional media properties
 */
interface LessonWithMedia extends Lesson {
  videoSrc?: string;
  videoPoster?: string;
  videoSubtitles?: string;
  podcastSrc?: string;
  podcastTitle?: string;
  boardImages?: WhiteboardImage[];
}

type PreviewLesson = LessonWithMedia & {
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
  /** User ID used to scope video-progress localStorage keys per user */
  userId?: string;
  /**
   * Callback when create new activity is clicked
   */
  onCreateNewActivity?: () => void;
  /**
   * API client for fetching activity models
   */
  apiClient: BaseApiClient;
  /**
   * Callback when an activity model is selected
   */
  onActivitySelected?: (model: ActivityModelTableItem) => void;
  /**
   * Callback when edit activity button is clicked
   */
  onEditActivity?: (activity: ActivityModelTableItem) => void;
  /**
   * Callback when remove activity button is clicked
   */
  onRemoveActivity?: () => void;
  /**
   * Initial selected activity (if any)
   */
  selectedActivity?: ActivityModelTableItem | null;
  /**
   * `default` keeps the plain column used by the wide layouts; `card` renders
   * the white rounded card used by the compact (<= 1024px) layout.
   */
  variant?: 'default' | 'card';
}

export const LessonPreview = ({
  title = 'Prévia da aula recomendada',
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
  userId,
  onCreateNewActivity,
  apiClient,
  onActivitySelected,
  onEditActivity,
  onRemoveActivity,
  selectedActivity: initialSelectedActivity = null,
  variant = 'default',
}: LessonPreviewProps) => {
  const isCard = variant === 'card';
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
  const [isChooseModelModalOpen, setIsChooseModelModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityModelTableItem | null>(initialSelectedActivity);

  // Toast notifications
  const { toastState, showSuccess, hideToast } = useToastNotification();

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

  // Sync selected activity when prop changes
  useEffect(() => {
    setSelectedActivity(initialSelectedActivity);
  }, [initialSelectedActivity]);

  const total = orderedLessons.length;
  const totalLabel =
    total === 1 ? '1 aula adicionada' : `${total} aulas adicionadas`;

  /**
   * Get video data from lesson
   */
  const getVideoData = (lesson: LessonWithMedia | null) => {
    if (!lesson) return { src: '' };
    return {
      src: lesson.videoSrc || '',
      poster: lesson.videoPoster,
      subtitles: lesson.videoSubtitles,
    };
  };

  /**
   * Get podcast data from lesson
   */
  const getPodcastData = (lesson: LessonWithMedia | null) => {
    if (!lesson) return { src: '', title: '' };
    return {
      src: lesson.podcastSrc || '',
      title: lesson.podcastTitle || 'Podcast da aula',
    };
  };

  /**
   * Get board images from lesson
   */
  const getBoardImages = (
    lesson: LessonWithMedia | null
  ): WhiteboardImage[] => {
    if (!lesson) return [];
    return lesson.boardImages || [];
  };

  /**
   * Get ref for board image based on index
   */
  const getBoardImageRef = (
    index: number,
    total: number
  ): RefObject<HTMLDivElement | null> | null => {
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
        return Number.parseFloat(stored) || 0;
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

  /** Moves a lesson to its new final index and renumbers the list. */
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= orderedLessons.length) return;
    if (toIndex < 0 || toIndex >= orderedLessons.length) return;

    const next = [...orderedLessons];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const normalized = normalizeWithPositions(next);
    setOrderedLessons(normalized);
    onReorder?.(normalized);
    onPositionsChange?.(normalized);
  };

  const lessonIds = useMemo(
    () => orderedLessons.map((lesson) => lesson.id),
    [orderedLessons]
  );

  const {
    draggingId,
    dropIndex,
    listRef,
    registerItem,
    handlePointerDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useReorderDragAndDrop({ itemIds: lessonIds, onMove: handleMove });

  const handleSelectActivityOption = (option: ActivityOption) => {
    setIsActivityOptionModalOpen(false);
    if (option === 'create-new' && onCreateNewActivity) {
      onCreateNewActivity();
    } else if (option === 'choose-model') {
      // Aguarda o primeiro modal fechar antes de abrir o próximo
      setTimeout(() => {
        setIsChooseModelModalOpen(true);
      }, 100);
    }
  };

  const handleSelectActivityModel = (model: ActivityModelTableItem) => {
    setIsChooseModelModalOpen(false);
    setSelectedActivity(model);
    if (onActivitySelected) {
      onActivitySelected(model);
    }
    // Show success toast
    showSuccess('Atividade adicionada à aula recomendada');
  };

  const handleRemoveActivity = () => {
    setSelectedActivity(null);
    if (onRemoveActivity) {
      onRemoveActivity();
    }
  };

  const handleEditActivity = () => {
    if (selectedActivity && onEditActivity) {
      onEditActivity(selectedActivity);
    }
  };

  return (
    <>
      <div
        data-testid="lesson-preview-container"
        data-variant={variant}
        className={cn(
          'w-full flex-shrink-0 bg-background flex flex-col',
          isCard
            ? 'px-7.5 max-[376px]:px-4 py-6 gap-6 rounded-xl'
            : 'p-4 gap-4 rounded-lg',
          className
        )}
        // The whole panel accepts the drop: while auto-scrolling, the pointer
        // often sits over the header instead of the list itself
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-4">
          <section className="flex flex-row items-center gap-2 text-text-950">
            {isCard ? <BookBookmarkIcon size={24} /> : <BookIcon size={24} />}
            <Text size={isCard ? 'xl' : 'lg'} weight="bold">
              {title}
            </Text>
          </section>

          <section className="flex flex-row flex-wrap justify-between items-center gap-4">
            <Text
              size="sm"
              className="text-text-700 bg-background-50 rounded-sm px-2 py-1 whitespace-nowrap"
            >
              {totalLabel}
            </Text>
            {/*
              The card keeps "Remover tudo" on screen and just disables it
              while the preview is empty, as the compact design shows.
            */}
            {onRemoveAll && (isCard || orderedLessons.length > 0) && (
              <Button
                size="small"
                variant="link"
                action="negative"
                iconLeft={<TrashIcon size={16} />}
                onClick={onRemoveAll}
                disabled={orderedLessons.length === 0}
                className="whitespace-nowrap"
              >
                Remover tudo
              </Button>
            )}
          </section>
        </div>

        {orderedLessons.length === 0 ? (
          <div
            className={cn(
              isCard &&
                'p-6 border border-dashed border-border-300 rounded-lg flex flex-col items-center'
            )}
          >
            <EmptyState
              image={<Activities />}
              title="Nenhuma aula adicionada ainda"
              description="Utilize a coluna ao lado para adicionar aulas à aula recomendada."
              size="compact"
            />
          </div>
        ) : (
          <section
            ref={listRef}
            data-testid="lessons-list"
            className="flex flex-col gap-3"
          >
            {orderedLessons.map((lesson, index) => {
              const {
                id,
                title: lessonTitle = 'Aula sem título',
                position,
                subject,
              } = lesson;

              return (
                <Fragment key={id}>
                  {dropIndex === index && <DropPlaceholder />}

                  <div
                    ref={registerItem(id)}
                    draggable
                    data-draggable="true"
                    role="button"
                    tabIndex={0}
                    aria-label={`Mover aula ${lessonTitle}`}
                    onMouseDown={handlePointerDown}
                    onDragStart={handleDragStart(id)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' && index > 0) {
                        e.preventDefault();
                        handleMove(index, index - 1);
                      } else if (
                        e.key === 'ArrowDown' &&
                        index < orderedLessons.length - 1
                      ) {
                        e.preventDefault();
                        handleMove(index, index + 1);
                      } else if (e.key === 'Enter' || e.key === ' ') {
                        // Keyboard grab/drop noop; prevent scroll on space
                        e.preventDefault();
                      }
                    }}
                    className={cn(
                      'rounded-lg cursor-grab transition-shadow duration-150',
                      'active:cursor-grabbing active:shadow-hard-shadow-2',
                      draggingId === id && 'opacity-40 shadow-hard-shadow-2'
                    )}
                  >
                    <LessonCardPreview
                      title={lessonTitle}
                      position={position}
                      subject={subject}
                      trail={buildLessonTrail(lesson)}
                      value={id}
                      showDragHandle
                      onWatch={() => handleWatch(lesson)}
                      onRemove={
                        onRemoveLesson ? () => onRemoveLesson(id) : undefined
                      }
                    />
                  </div>
                </Fragment>
              );
            })}

            {dropIndex === orderedLessons.length && <DropPlaceholder />}
          </section>
        )}

        {/* Activity Section */}
        <Divider />
        <section className="flex flex-row items-center gap-2 text-text-950">
          <BookIcon size={24} />
          <Text size="lg" weight="bold">
            Atividade da aula
          </Text>
        </section>

        {selectedActivity ? (
          <div className="flex flex-col gap-3">
            <div className="bg-background rounded-lg">
              <div className="p-4 flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-3 flex-1">
                  <Text size="md" weight="bold" className="text-text-950">
                    {selectedActivity.title}
                  </Text>
                </div>
                <div className="flex flex-row items-center text-text-950 gap-1">
                  <Button
                    variant="link"
                    action="secondary"
                    onClick={handleEditActivity}
                    aria-label="Editar atividade"
                    className="px-0 cursor-pointer"
                  >
                    <PencilSimpleIcon size={24} color="currentColor" />
                  </Button>
                  <Button
                    variant="link"
                    action="secondary"
                    onClick={handleRemoveActivity}
                    aria-label="Remover atividade"
                    className="px-0 cursor-pointer"
                  >
                    <TrashIcon size={24} color="currentColor" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            action="primary"
            onClick={() => setIsActivityOptionModalOpen(true)}
            className="w-full"
          >
            Adicionar atividade
          </Button>
        )}
      </div>

      <LessonWatchModal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        selectedLesson={selectedLesson}
        title={
          selectedLesson?.content?.name ||
          selectedLesson?.videoTitle ||
          selectedLesson?.content?.bnccCode ||
          selectedLesson?.title ||
          'Assistir Aula'
        }
        userId={userId}
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

      {/* Choose Activity Model Modal */}
      <ChooseActivityModelModal
        isOpen={isChooseModelModalOpen}
        onClose={() => setIsChooseModelModalOpen(false)}
        onSelectModel={handleSelectActivityModel}
        apiClient={apiClient}
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toastState.isOpen}
        onClose={hideToast}
        title={toastState.title}
        description={toastState.description}
        action={toastState.action}
      />
    </>
  );
};

export type { LessonPreviewProps, PreviewLesson };
