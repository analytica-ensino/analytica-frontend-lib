/**
 * Support (SAC) status timeline types
 */

/**
 * Status shown in the support ticket status timeline
 */
export const SUPPORT_TIMELINE_STATUS = {
  OPEN: 'OPEN',
  HUMAN: 'HUMAN',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type SupportTimelineStatus =
  (typeof SUPPORT_TIMELINE_STATUS)[keyof typeof SUPPORT_TIMELINE_STATUS];
