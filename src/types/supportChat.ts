import type { SupportType } from './support';

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

export type SupportChatAuthor =
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
 * File attached to a message
 */
export interface SupportChatAttachment {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

/**
 * Chat message (same shape as the platform chat, plus attachments)
 */
export interface SupportChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole: SupportChatAuthor;
  content: string;
  messageType: string;
  createdAt: string;
  attachments: SupportChatAttachment[];
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
}

/**
 * Message as returned by the support REST routes
 */
export interface SupportChatAnswerApi {
  id: string;
  authorType: SupportChatAuthor;
  answer: string;
  createdAt: string;
  attachments?: SupportChatAttachment[];
}
