import { type ReactNode, type RefObject } from 'react';
import { Text, VideoPlayer, CardAudio, Whiteboard } from '../../../index';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';
import type { VideoEndControls } from '../../VideoPlayer/VideoPlayer';
import { useLessonVideoHlsSrc } from '../../../hooks/useLessonVideoHlsSrc';

/**
 * Playable video of a lesson, already resolved from whatever shape the caller's
 * lesson model has.
 */
export interface LessonVideoData {
  /** The MP4 (`urlVideo`). Always the player's source and its fallback. */
  src: string;
  /**
   * The HLS master (`urlVideoHls`), or null/omitted while the lesson has not
   * been converted. When present, the player plays it with a quality menu and
   * falls back to `src`; the institution's `lessonVideoMp4Only` switch drops
   * it, and the player then plays `src` exactly as before HLS.
   */
  hlsSrc?: string | null;
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
  /**
   * Second to resume playback from. Independent of `persistProgress`: a page
   * that resumes from a position kept elsewhere (the backend, for a student's
   * lesson) passes it here with `persistProgress` off.
   */
  initialTime?: number;
  /** Receives the current second and the media duration once it is known. */
  onTimeUpdate?: (seconds: number, duration?: number) => void;
  /** Receives the current second and the media duration when playback pauses. */
  onPause?: (seconds: number, duration: number) => void;
  onVideoComplete?: () => void;
  /** Fired when playback actually reaches the end of the video. */
  onEnded?: (controls: VideoEndControls) => void;
  /** Tries to start playback as soon as the video is ready. */
  autoPlay?: boolean;
  /** Rendered over the video, inside the player. */
  overlay?: ReactNode;
  /** Whether the page is showing the player in cinema mode. */
  isCinemaMode?: boolean;
  /** Offers the cinema mode control when the page supports it. */
  onToggleCinemaMode?: () => void;
  /**
   * Saves and restores the playback position in localStorage, scoped by
   * `storageKey` and `userId`. Set to `false` for viewers whose position must
   * not be remembered — a teacher previewing the catalogue is not "watching"
   * the lesson — and for pages whose position lives elsewhere, so a stale
   * local copy cannot compete with it.
   */
  persistProgress?: boolean;
  storageKey?: string;
  userId?: string;
  className?: string;
  /** Shown instead of the player when the lesson has no video. */
  emptyMessage?: string;
  /** Rendered directly below the player (alerts, questionnaire cards, ...). */
  children?: ReactNode;
  /**
   * Shows the picture-in-picture button and keeps the video playing on leaving
   * the tab; off, the video pauses. Pass `hasLessonPictureInPicture` from
   * `useModules`.
   */
  allowPictureInPicture?: boolean;
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
  onPause,
  onVideoComplete,
  onEnded,
  autoPlay,
  overlay,
  isCinemaMode,
  onToggleCinemaMode,
  persistProgress = true,
  storageKey,
  userId,
  className = 'w-full h-full object-cover rounded-b-xl',
  emptyMessage = 'Vídeo não disponível para esta aula.',
  children,
  allowPictureInPicture,
}: LessonVideoSectionProps) => {
  const hlsSrc = useLessonVideoHlsSrc(video.hlsSrc);

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
        hlsSrc={hlsSrc}
        poster={video.poster}
        subtitles={video.subtitles}
        onTimeUpdate={onTimeUpdate}
        onPause={onPause}
        onVideoComplete={onVideoComplete}
        onEnded={onEnded}
        autoPlay={autoPlay}
        overlay={overlay}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={onToggleCinemaMode}
        initialTime={initialTime}
        className={className}
        autoSave={persistProgress}
        storageKey={storageKey}
        userId={userId}
        pauseOnBackground={!allowPictureInPicture}
        allowPictureInPicture={allowPictureInPicture}
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
 * Nome acessível do grupo do podcast.
 *
 * O título vem do backend (`podCastTitle`) e muitas vezes já é "Podcast" — é o
 * default do catálogo e o literal usado na trilha. Prefixar sempre produziria
 * "Podcast: Podcast"; prefixar nunca deixaria um título como "Episódio 3" sem
 * dizer do que se trata. Daí o prefixo condicional.
 */
export const getPodcastGroupLabel = (title: string) => {
  const trimmed = title.trim();
  if (!trimmed) return 'Podcast';

  return trimmed.toLowerCase().startsWith('podcast')
    ? trimmed
    : `Podcast: ${trimmed}`;
};

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
    // O card inteiro é uma seção nomeada, pro leitor de tela anunciar "Podcast:
    // <título>" uma vez ao entrar e tratar player, tempos e controles como um
    // conjunto — em vez de botões soltos sem contexto. O nome fica SÓ aqui: o
    // `<audio>` do `CardAudio` não tem `controls`, então não leva rótulo
    // próprio, que era a origem do título duplicado na árvore.
    //
    // `<section>` com nome acessível (elemento nativo, papel `region`) em vez de
    // um `<div role="group">`: o papel vem do elemento. Das alternativas nativas
    // de agrupamento, `region` é a que serve — `<fieldset>` existe pra conjunto
    // de campos de formulário, e isto é um player de mídia.
    <section
      className="w-full"
      aria-label={getPodcastGroupLabel(podcast.title)}
    >
      <Text size="md" weight="bold" className="pb-2">
        {podcast.title}
      </Text>
      <CardAudio src={podcast.src} title={podcast.title} onEnded={onEnded} />
    </section>
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
          // Pure layout container. The interactive element is Whiteboard's own
          // button, which reports activation through `onImageActivate` — so
          // there is no wrapper control here to nest buttons inside, and no
          // handler on a non-interactive element to give a role and key
          // handling to. Keyboard, mouse and touch all come from that button.
          <div
            key={image.id || `board-image-${index}`}
            ref={getImageRef?.(index, total)}
            className="flex flex-row rounded-xl bg-background-50"
          >
            <Whiteboard
              images={[image]}
              showDownload={true}
              imagesPerRow={2}
              onImageActivate={
                onImageClick
                  ? () => onImageClick(image, index, total)
                  : undefined
              }
              className="gap-4 w-full items-center border-border-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
