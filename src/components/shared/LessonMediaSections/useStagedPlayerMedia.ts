import { useEffect, useState } from 'react';
import type { LessonVideoData } from './LessonMediaSections';

export interface StagedPlayerMedia {
  /** Lesson whose video the player holds. */
  lessonId: string;
  video: LessonVideoData;
  /** Second to start from, already known. */
  resumeAt: number;
}

export interface UseStagedPlayerMediaReturn {
  /** What the player should show, or null before the first lesson is ready. */
  playerMedia: StagedPlayerMedia | null;
  /**
   * False while the player still holds the previous lesson: its events must
   * not be recorded against the lesson now open.
   */
  isPlayerOnActiveLesson: boolean;
}

/**
 * Keeps one player mounted while the page moves from lesson to lesson.
 *
 * Remounting the player on every lesson (a `key` per lesson) drops fullscreen
 * and picture-in-picture, and the next lesson would start on the page instead
 * of in the floating window. Instead, render one `LessonVideoSection` with no
 * per-lesson `key`, fed from `playerMedia`: the player swaps its source and
 * resets its per-media state (completion, resume, autoplay) when `src` or
 * `storageKey` change, so pass `storageKey={`lesson-${playerMedia.lessonId}`}`.
 *
 * The media only moves to a newly opened lesson once that lesson's resume
 * point is known: the player applies its start position once per video, so a
 * point arriving after it had started would be ignored. Until then the player
 * keeps the previous video, and `isPlayerOnActiveLesson` is false.
 *
 * @param lessonId - The lesson open on the page
 * @param video - Its video
 * @param resumeAt - Its resume point, or null while it is being read
 * @returns The media for the player and whether it matches the open lesson
 */
export const useStagedPlayerMedia = (
  lessonId: string | undefined,
  video: LessonVideoData,
  resumeAt: number | null
): UseStagedPlayerMediaReturn => {
  const [playerMedia, setPlayerMedia] = useState<StagedPlayerMedia | null>(
    null
  );
  // Callers often rebuild the video object; only its fields define it.
  const { src, hlsSrc, poster, subtitles } = video;

  useEffect(() => {
    if (!lessonId || resumeAt === null) return;
    setPlayerMedia({
      lessonId,
      video: { src, hlsSrc, poster, subtitles },
      resumeAt,
    });
  }, [lessonId, resumeAt, src, hlsSrc, poster, subtitles]);

  return {
    playerMedia,
    isPlayerOnActiveLesson: playerMedia?.lessonId === lessonId,
  };
};
