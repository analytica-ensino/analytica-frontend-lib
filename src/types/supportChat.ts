import type { SupportType } from './support';

/**
 * Support (SAC) chat types
 */

/**
 * Who authored a support chat message. `USER`, `GUEST`, `AI` and `AGENT`
 * match the backend `senderRole`; `GUEST` (logged-out visitor) renders like `USER`.
 * `INTERNAL_NOTE` is only visible in the backoffice.
 */
export const SUPPORT_CHAT_MESSAGE_TYPE = {
  USER: 'USER',
  GUEST: 'GUEST',
  AI: 'AI',
  AGENT: 'AGENT',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
} as const;

export type SupportChatMessageType =
  (typeof SUPPORT_CHAT_MESSAGE_TYPE)[keyof typeof SUPPORT_CHAT_MESSAGE_TYPE];

/**
 * Delivery status of a message sent by the current user/agent
 */
export const SUPPORT_CHAT_SEND_STATUS = {
  SENT: 'SENT',
  SENDING: 'SENDING',
  FAILED: 'FAILED',
} as const;

export type SupportChatSendStatus =
  (typeof SUPPORT_CHAT_SEND_STATUS)[keyof typeof SUPPORT_CHAT_SEND_STATUS];

/**
 * File attached to a support chat message (same shape as the backend attachment)
 */
export interface SupportChatAttachment {
  id: string;
  fileName: string;
  url: string;
  /** MIME type; `image/*` renders a thumbnail */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
}

/**
 * Where an agent reply goes: to the requester (`USER`) or only to the team
 * (`INTERNAL_NOTE`, same value as the message type shown in the backoffice)
 */
export const SUPPORT_CHAT_REPLY_MODE = {
  USER: 'USER',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
} as const;

export type SupportChatReplyMode =
  (typeof SUPPORT_CHAT_REPLY_MODE)[keyof typeof SUPPORT_CHAT_REPLY_MODE];

/**
 * Kind of event shown between chat messages
 */
export const SUPPORT_CHAT_EVENT_TYPE = {
  NEUTRAL: 'NEUTRAL',
  TRANSFER: 'TRANSFER',
  AI: 'AI',
  SUCCESS: 'SUCCESS',
  DATE: 'DATE',
} as const;

export type SupportChatEventType =
  (typeof SUPPORT_CHAT_EVENT_TYPE)[keyof typeof SUPPORT_CHAT_EVENT_TYPE];

/**
 * Author displayed next to a support chat message
 */
export interface SupportChatAuthor {
  name: string;
  /** Overrides the initials computed from `name` */
  initials?: string;
  /** Tailwind classes overriding the avatar background color */
  avatarClassName?: string;
}

/**
 * FAQ entry the AI answer was based on
 */
export interface SupportChatFaqReference {
  title: string;
  onClick?: () => void;
}

/*
 * Support chat widget (floating chat on top of a SupportChatAdapter)
 */

/**
 * Ticket status, as sent by the backend (sup_support.status)
 */
export const SUPPORT_CHAT_STATUS = {
  ABERTO: 'ABERTO',
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  FECHADO: 'FECHADO',
} as const;

export type SupportChatStatus =
  (typeof SUPPORT_CHAT_STATUS)[keyof typeof SUPPORT_CHAT_STATUS];

/**
 * Who is handling the ticket
 */
export const SUPPORT_CHAT_HANDLER = {
  IA: 'IA',
  HUMANO: 'HUMANO',
} as const;

export type SupportChatHandler =
  (typeof SUPPORT_CHAT_HANDLER)[keyof typeof SUPPORT_CHAT_HANDLER];

/**
 * Author of a message (sent by the backend as senderRole)
 */
export const SUPPORT_CHAT_AUTHOR = {
  USER: 'USER',
  GUEST: 'GUEST',
  AGENT: 'AGENT',
  AI: 'AI',
} as const;

export type SupportChatAuthorRole =
  (typeof SUPPORT_CHAT_AUTHOR)[keyof typeof SUPPORT_CHAT_AUTHOR];

/** senderId of the messages written by a visitor (not logged in) */
export const SUPPORT_CHAT_GUEST_SENDER_ID = 'guest';

/** Images accepted by the backend */
export const SUPPORT_CHAT_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/** Largest image the backend accepts (5 MB) */
export const SUPPORT_CHAT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Most attachments in one message */
export const SUPPORT_CHAT_MAX_ATTACHMENTS = 5;

/**
 * Chat message (same shape as the platform chat, plus attachments)
 */
export interface SupportChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole: SupportChatAuthorRole;
  content: string;
  messageType: string;
  createdAt: string;
  attachments: SupportChatAttachment[];
  /** FAQ article an AI message is based on */
  faq?: { id: string; title: string } | null;
  /**
   * Contact fields an AI message asks for: the chat shows a form for them
   * under the message
   */
  contactRequest?: SupportChatContactField[] | null;
  /** Local only: shown before the server confirms it (optimistic) */
  pending?: boolean;
}

/**
 * Ticket the conversation belongs to
 */
export interface SupportChatTicket {
  id: string;
  status: SupportChatStatus;
  handlerType: SupportChatHandler | null;
  problemType: string | null;
}

/**
 * Realtime events pushed to the conversation (WebSocket in the real adapter)
 */
export type SupportChatEvent =
  | { type: 'new_message'; payload: { message: SupportChatMessage } }
  | {
      type: 'message_updated';
      payload: { messageId: string; content: string; read: boolean };
    }
  | {
      type: 'ticket_updated';
      payload: { ticketId: string } & Omit<SupportChatTicket, 'id'>;
    }
  | { type: 'error'; payload: { message: string } };

/**
 * Data needed to open a conversation (first message creates the ticket)
 */
export interface StartSupportChatInput {
  message: string;
  channel: string;
  institutionId?: string;
  requesterName?: string;
  email?: string;
  /** Files sent with the first message */
  files?: File[];
}

/**
 * Data layer of the widget. The mock adapter implements it in memory; the
 * real one will use the support REST API and the chat WebSocket.
 */
export interface SupportChatAdapter {
  /**
   * Create the ticket with its first message. With files the API may store
   * them as a second message, hence the list.
   */
  startConversation(input: StartSupportChatInput): Promise<{
    ticket: SupportChatTicket;
    messages: SupportChatMessage[];
  }>;
  /** Send a message (text and/or files) on an existing ticket */
  sendMessage(
    ticketId: string,
    content: string,
    files?: File[]
  ): Promise<SupportChatMessage>;
  /** Messages of the ticket, oldest first */
  listMessages(ticketId: string): Promise<SupportChatMessage[]>;
  /** Listen to realtime events of the ticket; returns the unsubscribe */
  subscribe(
    ticketId: string,
    listener: (event: SupportChatEvent) => void
  ): () => void;
  /**
   * Save the name and/or e-mail the visitor typed in the contact form.
   * Without it the chat does not show the form (the AI request stays a text).
   */
  updateContact?(ticketId: string, contact: SupportChatContact): Promise<void>;
}

/** Contact field the AI asks for */
export type SupportChatContactField = 'name' | 'email';

/** Contact sent by the chat form */
export interface SupportChatContact {
  requesterName?: string;
  email?: string;
}

/**
 * Feature flags of the widget
 */
export interface SupportChatFlags {
  /** Widget available at all (default true) */
  enabled?: boolean;
  /** Chat with the support (default true) */
  chat?: boolean;
  /** FAQ (reserved, not rendered yet) */
  faq?: boolean;
  /** AI first answer (reserved, not rendered yet) */
  ai?: boolean;
  /** ZENDESK hides the widget (the Zendesk messenger is used instead) */
  supportType?: SupportType;
}

/**
 * Visual customization of the widget
 */
export interface SupportChatTheme {
  /** Background of the button and the header (any CSS color) */
  primaryColor?: string;
  /** Corner of the screen (default bottom-right) */
  position?: 'bottom-right' | 'bottom-left';
  /** Header title (default "Suporte") */
  title?: string;
}

/**
 * Logged user (optional; a visitor has none)
 */
export interface SupportChatUser {
  name?: string;
  email?: string;
}

/**
 * HTTP client the API adapter needs (axios instances fit as they are)
 */
export interface SupportChatHttpClient {
  get: <T>(
    url: string,
    config?: { headers?: Record<string, string> }
  ) => Promise<{ data: T }>;
  post: <T>(
    url: string,
    data?: unknown,
    config?: { headers?: Record<string, string> }
  ) => Promise<{ data: T }>;
  /** Used to save the visitor contact (PUT /support/guest/:id) */
  put?: <T>(
    url: string,
    data?: unknown,
    config?: { headers?: Record<string, string> }
  ) => Promise<{ data: T }>;
}

/**
 * Message as returned by the support REST routes
 */
export interface SupportChatAnswerApi {
  id: string;
  authorType: SupportChatAuthorRole;
  answer: string;
  createdAt: string;
  attachments?: SupportChatAttachment[];
  /** FAQ article an AI message is based on */
  faqArticleId?: string | null;
  faqArticleTitle?: string | null;
  /** Contact fields an AI message asks for */
  contactRequest?: SupportChatContactField[] | null;
}
