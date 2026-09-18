import { type ReactNode, type RefObject } from 'react';
import { Text, VideoPlayer, CardAudio, Whiteboard } from '../../../index';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';

/**
 * Playable video of a lesson, already resolved from whatever shape the caller's
 * lesson model has.
 */
export interface LessonVideoData {
  src: string;
  poster?: string;
  subtitles?: string;
}

/** Podcast track of a lesson, already resolved. */
export interface LessonPodcastData {
  src: string;
  title: string;
}

export interface LessonVideoSectionProps {
  video: LessonVideoData;
  /** Second to resume playback from. Ignored when `persistProgress` is false. */
  initialTime?: number;
  /** Receives the current second and the media duration once it is known. */
  onTimeUpdate?: (seconds: number, duration?: number) => void;
  onVideoComplete?: () => void;
  /**
   * Saves and restores the playback position in localStorage, scoped by
   * `storageKey` and `userId`. Set to `false` for viewers whose position must
   * not be remembered — a teacher previewing the catalogue is not "watching"
   * the lesson, and resuming them mid-video would be wrong.
   */
  persistProgress?: boolean;
  storageKey?: string;
  userId?: string;
  className?: string;
  /** Shown instead of the player when the lesson has no video. */
  emptyMessage?: string;
  /** Rendered directly below the player (alerts, questionnaire cards, ...). */
  children?: ReactNode;
}

/**
 * Lesson video player, or a placeholder when the lesson carries no video.
 *
 * Extracted from LessonWatchModal so the same player wiring backs both the
 * modal (lesson bank / recommended-lesson preview) and the full lesson page.
 */
export const LessonVideoSection = ({
  video,
  initialTime,
  onTimeUpdate,
  onVideoComplete,
  persistProgress = true,
  storageKey,
  userId,
  className = 'w-full h-full object-cover rounded-b-xl',
  emptyMessage = 'Vídeo não disponível para esta aula.',
  children,
}: LessonVideoSectionProps) => {
  if (!video.src) {
    return (
      <div className="px-6 py-6 flex flex-col gap-4">
        <Text size="md" className="text-text-600">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <>
      <VideoPlayer
        src={video.src}
        poster={video.poster}
        subtitles={video.subtitles}
        onTimeUpdate={onTimeUpdate}
        onVideoComplete={onVideoComplete}
        initialTime={persistProgress ? initialTime : 0}
        className={className}
        autoSave={persistProgress}
        storageKey={storageKey}
        userId={userId}
      />
      {children}
    </>
  );
};

export interface LessonPodcastSectionProps {
  podcast?: LessonPodcastData | null;
  onEnded?: () => void;
}

/**
 * Podcast player for a lesson. Renders nothing when the lesson has no audio.
 */
export const LessonPodcastSection = ({
  podcast,
  onEnded,
}: LessonPodcastSectionProps) => {
  if (!podcast?.src) {
    return null;
  }

  return (
    <div className="w-full">
      <Text size="md" weight="bold" className="pb-2">
        {podcast.title}
      </Text>
      <CardAudio src={podcast.src} title={podcast.title} onEnded={onEnded} />
    </div>
  );
};

export interface LessonBoardImagesSectionProps {
  images?: WhiteboardImage[];
  /**
   * Ref for the board at `index` of `total`. Consumers use it to detect when
   * the first and last boards become visible (progress criteria for students);
   * omit it when no such tracking is needed.
   */
  getImageRef?: (
    index: number,
    total: number
  ) => RefObject<HTMLDivElement | null> | null;
  /**
   * Called when a board is clicked. Receives the board itself first, because a
   * lesson may carry only one of the two frames: its position says nothing
   * about which frame it is, so consumers must identify it by its own data.
   * Omit to render the boards as plain, non-interactive blocks.
   */
  onImageClick?: (image: WhiteboardImage, index: number, total: number) => void;
  title?: string;
}

/**
 * The lesson's whiteboard images. Renders nothing when there are none.
 */
export const LessonBoardImagesSection = ({
  images,
  getImageRef,
  onImageClick,
  title = 'Quadros da aula',
}: LessonBoardImagesSectionProps) => {
  if (!images || images.length === 0) {
    return null;
  }

  const total = images.length;

  return (
    <div className="w-full">
      <Text size="md" weight="bold" className="pb-2">
        {title}
      </Text>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {images.map((image: WhiteboardImage, index: number) => (
          // Whiteboard renders its own buttons (zoom, download), so this
          // container must not be a button itself: nesting them is invalid
          // HTML and leaves the inner controls unreachable. It does not need
          // to be one either — activating those buttons, by mouse or by
          // keyboard, fires a click that bubbles up to this handler.
          <div
            key={image.id || `board-image-${index}`}
            ref={getImageRef?.(index, total)}
            className={`flex flex-row rounded-xl bg-background-50${
              onImageClick ? ' cursor-pointer' : ''
            }`}
            onClick={
              onImageClick ? () => onImageClick(image, index, total) : undefined
            }
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
};
