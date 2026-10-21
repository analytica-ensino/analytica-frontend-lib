import type { ReactNode } from 'react';
import type {
  SupportChatAttachment,
  SupportChatAuthor,
  SupportChatFaqReference,
  SupportChatMessageType,
  SupportChatSendStatus,
} from './supportChat';

/**
 * Support (SAC) conversation types — central area of the agent's ticket
 * screen: header, status banner, message list and composer.
 */

/** Kind of an item of the conversation timeline */
export const SUPPORT_CONVERSATION_ITEM = {
  /** Date separator ("Hoje") */
  DATE: 'date',
  /** Gray system event ("Atendimento iniciado via App") */
  SYSTEM: 'system',
  /** Orange handoff event ("IA transferiu para humano — motivo: …") */
  TRANSFER: 'transfer',
  /** Blue AI event ("IA assumiu o atendimento") */
  AI: 'ai',
  /** Green conclusion event ("Atendimento concluído") */
  DONE: 'done',
  /** Message of the user, the AI, an agent or an internal note */
  MESSAGE: 'message',
} as const;

export type SupportConversationItemKind =
  (typeof SUPPORT_CONVERSATION_ITEM)[keyof typeof SUPPORT_CONVERSATION_ITEM];

/** Date separator of the timeline */
export interface SupportConversationDateItem {
  kind: typeof SUPPORT_CONVERSATION_ITEM.DATE;
  id: string;
  /** e.g. "Hoje", "Ontem" or "12/10/2026" */
  label: string;
}

/** System or handoff event of the timeline */
export interface SupportConversationEventItem {
  kind:
    | typeof SUPPORT_CONVERSATION_ITEM.SYSTEM
    | typeof SUPPORT_CONVERSATION_ITEM.TRANSFER
    | typeof SUPPORT_CONVERSATION_ITEM.AI
    | typeof SUPPORT_CONVERSATION_ITEM.DONE;
  id: string;
  text: string;
  /** Already formatted time, appended as "text · time" */
  time?: string;
}

/** Message of the timeline (same data as SupportChatMessage) */
export interface SupportConversationMessageItem {
  kind: typeof SUPPORT_CONVERSATION_ITEM.MESSAGE;
  id: string;
  type: SupportChatMessageType;
  text: string;
  /** Already formatted time, e.g. "14:02" */
  time: string;
  author?: SupportChatAuthor;
  faq?: SupportChatFaqReference;
  attachments?: SupportChatAttachment[];
  status?: SupportChatSendStatus;
  onRetry?: () => void;
}

/** Item of the conversation timeline, in display order */
export type SupportConversationItem =
  | SupportConversationDateItem
  | SupportConversationEventItem
  | SupportConversationMessageItem;

/** Visual variant of the status banner, by ticket state */
export const SUPPORT_STATUS_BANNER_VARIANT = {
  /** Waiting for a human (orange, clock) */
  WAITING: 'waiting',
  /** The AI is handling the ticket (blue, robot) */
  AI: 'ai',
  /** Ticket concluded (green, check) */
  DONE: 'done',
  /** Any other neutral notice (gray, info) */
  INFO: 'info',
} as const;

export type SupportStatusBannerVariant =
  (typeof SUPPORT_STATUS_BANNER_VARIANT)[keyof typeof SUPPORT_STATUS_BANNER_VARIANT];

/** Action button of the status banner (e.g. "Responder como humano") */
export interface SupportStatusBannerAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Tone of the ticket status badge in the header */
export type SupportConversationStatusTone =
  | 'warning'
  | 'info'
  | 'success'
  | 'muted'
  | 'error';

/** Option of a header select (status or "Atendido por") */
export interface SupportConversationOption {
  value: string;
  label: string;
}

/** Channel and institution shown on the right of the header meta row */
export interface SupportConversationChannel {
  /** e.g. "App", "Web", "WhatsApp", "E-mail" */
  label: string;
  /** Icon of the channel; defaults by label (App → mobile, Web → desktop…) */
  icon?: ReactNode;
}

/** Saved reply offered by "Respostas rápidas" and the "/" menu */
export interface SupportQuickReply {
  id: string;
  /** Short name shown in the menu, e.g. "Saudação" */
  title: string;
  /** Text that replaces what is typed */
  text: string;
}
