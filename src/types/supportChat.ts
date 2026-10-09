/**
 * Support (SAC) chat types
 */

/**
 * Who authored a support chat message.
 * `INTERNAL_NOTE` is only visible in the backoffice.
 */
export const SUPPORT_CHAT_MESSAGE_TYPE = {
  USER: 'USER',
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
 * File attached to a support chat message
 */
export interface SupportChatAttachment {
  id: string;
  name: string;
  url: string;
  /** MIME type; `image/*` renders a thumbnail */
  mimeType?: string;
}

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
