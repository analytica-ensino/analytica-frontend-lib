import type { ContentProgressItem } from './types';

/**
 * Reading rules of the accordion rows. Pure, no React.
 */

/**
 * Whether a lesson has progress to show.
 *
 * The deepest level decides differently from the two above it: topic and
 * subtopic carry a `status`, while `ContentProgressItem` only has `progress`
 * and `isCompleted`, so "no data" is inferred from zero progress on a lesson
 * not completed. `isCompleted` matters because a completed lesson with zero
 * progress exists in the type, and for it the row shows "0%", not the
 * no-data message.
 */
export const hasContentData = (item: ContentProgressItem): boolean =>
  item.progress !== 0 || item.isCompleted;

/**
 * Rounding of the percentage, as every level of the accordion draws it.
 */
export const roundProgress = (progress: number): number => Math.round(progress);
