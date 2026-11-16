import type { EbookNarrationClip, EbookNarrationPage } from './types';

/** How far ahead, in seconds, an audio description is skipped before it sounds. */
export const AD_LOOKAHEAD_S = 0.2;

/** A clip counts as started this many seconds before its `start`, so the highlight leads the voice. */
export const HIGHLIGHT_LEAD_S = 0.05;

/**
 * Indexes the narration by page section (`data-secao`).
 * @param narration - Pages as stored with the version, or nothing
 * @returns Pages by `data-secao`
 */
export const indexNarration = (
  narration?: EbookNarrationPage[] | null
): Map<string, EbookNarrationPage> =>
  new Map((narration ?? []).map((page) => [page.section, page]));

/**
 * True when every clip of the page is audio description, so the page is
 * skipped altogether when audio description is off.
 * @param page - Narration of the page
 */
export const isAudioDescriptionOnly = (page: EbookNarrationPage): boolean =>
  page.clips.length > 0 && page.clips.every((clip) => clip.audioDescription);

/** True when any page of the book has an audio description clip. */
export const hasAudioDescription = (
  pages: Iterable<EbookNarrationPage>
): boolean =>
  Array.from(pages).some((page) =>
    page.clips.some((clip) => clip.audioDescription)
  );

/**
 * Where to jump to so an audio description is not heard.
 *
 * Looks AD_LOOKAHEAD_S ahead, so the jump happens before the description
 * starts, and chains descriptions that follow each other.
 *
 * @param page - Narration of the page
 * @param time - Current time, in seconds from the start of the page
 * @param withAudioDescription - The reader's audio description switch
 * @returns The time to jump to (relative to the page), or -1 to keep playing
 */
export const audioDescriptionSkipTarget = (
  page: EbookNarrationPage,
  time: number,
  withAudioDescription: boolean
): number => {
  if (withAudioDescription) return -1;
  let target = -1;
  let moved = true;
  while (moved) {
    moved = false;
    for (const clip of page.clips) {
      const from = target >= 0 ? target : time;
      if (
        clip.audioDescription &&
        from >= clip.start - AD_LOOKAHEAD_S &&
        from < clip.end - 0.01
      ) {
        target = clip.end;
        moved = true;
      }
    }
  }
  return target;
};

/**
 * Clips being read at a given time. Clips that start together (a speech
 * balloon split in two elements, for instance) are highlighted together.
 * @param page - Narration of the page
 * @param time - Current time, in seconds from the start of the page
 * @returns The clips to highlight, empty before the first one starts
 */
export const activeClips = (
  page: EbookNarrationPage,
  time: number
): EbookNarrationClip[] => {
  let current: EbookNarrationClip | undefined;
  for (const clip of page.clips) {
    if (time >= clip.start - HIGHLIGHT_LEAD_S) current = clip;
  }
  if (!current) return [];
  const start = current.start;
  return page.clips.filter((clip) => clip.start === start);
};
