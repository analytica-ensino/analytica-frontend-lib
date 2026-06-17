/**
 * Chatbot types for AI-assisted student conversations
 */

/**
 * Message author — mirrors the backend `chatbot_messages.role` column.
 * Use the constants instead of raw strings when comparing roles.
 */
export const CHATBOT_MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type ChatbotRole =
  (typeof CHATBOT_MESSAGE_ROLES)[keyof typeof CHATBOT_MESSAGE_ROLES];

/**
 * Single message inside a conversation
 */
export interface ChatbotMessage {
  id: string;
  conversationId: string;
  role: ChatbotRole;
  content: string;
  createdAt: Date | string;
}

/**
 * Conversation metadata displayed in the history list
 */
export interface ChatbotConversation {
  id: string;
  title: string | null;
  lastMessageAt: Date | string;
  createdAt: Date | string;
}

/**
 * Page-level hints the frontend passes along so the backend can enrich
 * the prompt. All fields optional. `questionId` is meaningful only when
 * accompanied by `activityId`.
 */
export interface ChatbotCurrentContext {
  activityId?: string;
  questionId?: string;
  lessonId?: string;
}

/**
 * Payload sent when publishing a new student message
 */
export interface SendChatbotMessagePayload {
  message: string;
  conversationId?: string;
  currentContext?: ChatbotCurrentContext;
}

/**
 * Data returned by the send-message endpoint
 */
export interface SendChatbotMessageResult {
  conversationId: string;
  userMessage: ChatbotMessage;
  assistantMessage: ChatbotMessage;
}

/**
 * Minimal user shape required to render the UI (label and optional photo)
 */
export interface ChatbotUser {
  id: string;
  name: string;
  photo?: string | null;
}

/**
 * Transport-agnostic API client. Implemented by the frontend-aluno-web
 * adapter using axios; can be swapped for fetch/mock in tests and stories.
 */
export interface ChatbotApiClient {
  /**
   * Send a message and receive the assistant reply.
   */
  sendMessage(
    payload: SendChatbotMessagePayload
  ): Promise<SendChatbotMessageResult>;
  /**
   * List the current user's conversations.
   */
  listConversations(params: {
    page: number;
    limit: number;
  }): Promise<{ conversations: ChatbotConversation[]; total: number }>;
  /**
   * Fetch messages of a specific conversation.
   */
  getMessages(
    conversationId: string,
    params: { page: number; limit: number }
  ): Promise<{ messages: ChatbotMessage[]; total: number }>;
  /**
   * Delete a conversation.
   */
  deleteConversation(conversationId: string): Promise<void>;
}

/**
 * Alias consumed by the apps under the name `ChatbotMessageData`.
 * Re-exported here so it is reachable via the `types/chatbot` subpath
 * (and not only via the root barrel).
 */
export type { ChatbotMessage as ChatbotMessageData };
