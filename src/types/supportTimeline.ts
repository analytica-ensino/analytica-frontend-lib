/**
 * Support (SAC) status timeline types
 */

/**
 * Status shown in the support ticket status timeline.
 * Backend mapping: OPEN = `ABERTO`, PENDING = `PENDENTE`,
 * IN_PROGRESS = `EM_ANDAMENTO`, DONE = `FECHADO`;
 * HUMAN is the `handlerType` change to `HUMANO`, not a ticket status.
 */
export const SUPPORT_TIMELINE_STATUS = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  HUMAN: 'HUMAN',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type SupportTimelineStatus =
  (typeof SUPPORT_TIMELINE_STATUS)[keyof typeof SUPPORT_TIMELINE_STATUS];
