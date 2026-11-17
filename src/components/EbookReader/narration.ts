import type { EbookNarrationPage, EbookNarrationSegment } from './types';

/** How far ahead, in seconds, an audio description is skipped before it sounds. */
export const AD_LOOKAHEAD_S = 0.2;

/** A segment counts as started this many seconds before its `start`, so the highlight leads the voice. */
export const HIGHLIGHT_LEAD_S = 0.05;

/**
 * True when every segment of the page is audio description, so the page is
 * skipped altogether when audio description is off.
 * @param page - Narration of the page
 */
export const isAudioDescriptionOnly = (page: EbookNarrationPage): boolean =>
  page.segments.length > 0 && page.segments.every((segment) => segment.ad);

/** True when any page of the book has an audio description segment. */
export const hasAudioDescription = (
  pages: Iterable<EbookNarrationPage>
): boolean =>
  Array.from(pages).some((page) => page.segments.some((segment) => segment.ad));

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
    for (const segment of page.segments) {
      const from = target >= 0 ? target : time;
      if (
        segment.ad &&
        from >= segment.start - AD_LOOKAHEAD_S &&
        from < segment.end - 0.01
      ) {
        target = segment.end;
        moved = true;
      }
    }
  }
  return target;
};

/**
 * Segments being read at a given time. Segments that start together (a
 * speech balloon split in two elements, for instance) are highlighted
 * together.
 * @param page - Narration of the page
 * @param time - Current time, in seconds from the start of the page
 * @returns The segments to highlight, empty before the first one starts
 */
export const activeSegments = (
  page: EbookNarrationPage,
  time: number
): EbookNarrationSegment[] => {
  let current: EbookNarrationSegment | undefined;
  for (const segment of page.segments) {
    if (time >= segment.start - HIGHLIGHT_LEAD_S) current = segment;
  }
  if (!current) return [];
  const start = current.start;
  return page.segments.filter((segment) => segment.start === start);
};
