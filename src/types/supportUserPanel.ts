import type { SupportTimelineStatus } from './supportTimeline';

/**
 * Support (SAC) user panel types — right-side panel of the agent's ticket
 * screen, with the contact profile, their ticket history and the current
 * ticket details.
 */

/** Tabs of the user panel */
export const SUPPORT_USER_PANEL_TAB = {
  PROFILE: 'profile',
  HISTORY: 'history',
  TICKET: 'ticket',
} as const;

export type SupportUserPanelTab =
  (typeof SUPPORT_USER_PANEL_TAB)[keyof typeof SUPPORT_USER_PANEL_TAB];

/** Channel a contact reached support through */
export const SUPPORT_CHANNEL = {
  APP: 'App',
  WEB: 'Web',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
} as const;

export type SupportChannel =
  (typeof SUPPORT_CHANNEL)[keyof typeof SUPPORT_CHANNEL];

/** Ticket priority */
export const SUPPORT_TICKET_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type SupportTicketPriority =
  (typeof SUPPORT_TICKET_PRIORITY)[keyof typeof SUPPORT_TICKET_PRIORITY];

/** Status shown on a ticket card of the history tab */
export const SUPPORT_TICKET_CARD_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_HUMAN: 'WAITING_HUMAN',
  HUMAN: 'HUMAN',
  DONE: 'DONE',
} as const;

export type SupportTicketCardStatus =
  (typeof SUPPORT_TICKET_CARD_STATUS)[keyof typeof SUPPORT_TICKET_CARD_STATUS];

/** Filters of the history tab (single selection) */
export const SUPPORT_HISTORY_FILTER = {
  ALL: 'all',
  OPEN: 'open',
  DONE: 'done',
  AI: 'ai',
} as const;

export type SupportHistoryFilter =
  (typeof SUPPORT_HISTORY_FILTER)[keyof typeof SUPPORT_HISTORY_FILTER];

/** Note left by an agent on a contact, visible to the whole team */
export interface SupportContactNote {
  id: string;
  text: string;
  author: string;
  /** ISO date */
  createdAt: string;
}

/** Contact (the user who opened the ticket) */
export interface SupportContact {
  id: string;
  name: string;
  avatarUrl?: string | null;
  /** e.g. "Estudante" */
  role: string;
  /** e.g. "Rede Aprender Mais" */
  institution: string;
  /** Whether the contact is linked to a platform user */
  linked: boolean;
  email?: string | null;
  /**
   * `false` when the e-mail was typed by a logged-out visitor and nobody
   * proved it is theirs: show it, but do not trust it. Omitted means verified.
   */
  emailVerified?: boolean;
  /** Digits only or already formatted; rendered as `(DD) 9XXXX-XXXX` */
  phone?: string | null;
  /** e.g. "3º ano B — Ensino Médio" */
  classOrPosition?: string | null;
  /** ISO date */
  firstContactAt: string;
  /** ISO date */
  lastContactAt: string;
  ticketsCount: number;
  /** e.g. "Android 14 · Moto G54" */
  device?: string | null;
  preferredChannel: SupportChannel;
  notes: SupportContactNote[];
}

/** Who resolved a ticket */
export type SupportTicketResolver =
  | { type: 'ai' }
  | { type: 'agent'; name: string };

/**
 * Id of a support ticket: a number (e.g. 4821) or a UUID. When it is not
 * meant for display, give the ticket a `code`.
 */
export type SupportTicketId = number | string;

/** Ticket card of the history tab */
export interface SupportTicketSummary {
  id: SupportTicketId;
  /** Shown on the card; defaults to `#{id}` (e.g. "#3F4A5B" for a UUID) */
  code?: string;
  title: string;
  reason?: string | null;
  subreason?: string | null;
  status: SupportTicketCardStatus;
  /** ISO date */
  createdAt: string;
  resolvedBy?: SupportTicketResolver;
  durationMin?: number | null;
  /** Shown when the card is expanded */
  priority?: SupportTicketPriority | null;
  /** Shown when the card is expanded */
  channel?: SupportChannel | null;
  /** App the ticket was opened from, already as a label (e.g. "Professor") */
  origin?: string | null;
}

/** Aggregated numbers shown above the history list */
export interface SupportHistorySummary {
  total: number;
  resolved: number;
  /** Average resolution time in minutes; null when nothing was resolved */
  avgMin: number | null;
}

/** Status change event of the current ticket */
export interface SupportTicketTimelineEvent {
  status: SupportTimelineStatus;
  /** ISO date */
  at: string;
}

/** Option of the reason select */
export interface SupportReasonOption {
  value: string;
  label: string;
}

/** Current ticket details */
export interface SupportTicketDetails {
  id: SupportTicketId;
  channel: SupportChannel;
  /**
   * App the ticket was opened from, already as a label (e.g. "Professor").
   * Shown next to the channel ("Web · Professor").
   */
  origin?: string | null;
  /** ISO date */
  openedAt: string;
  /** ISO date of the first human reply; absent while waiting for a human */
  firstHumanAt?: string | null;
  /** ISO date the ticket was concluded; absent while it is open */
  closedAt?: string | null;
  /** Whether the ticket is concluded (fields become read-only, counters stop) */
  done: boolean;
  /** Value of the selected reason, from `reasonOptions` */
  reason?: string | null;
  priority: SupportTicketPriority;
  aiSummary?: string | null;
  timeline: SupportTicketTimelineEvent[];
}
