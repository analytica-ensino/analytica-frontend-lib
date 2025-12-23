/**
 * Chat types for real-time messaging functionality
 */

/**
 * User profile role enumerations
 * Defines all available user roles in the system with hierarchy levels
 * Matches backend PROFILE_ROLES enum
 */
export enum PROFILE_ROLES {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  REGIONAL_MANAGER = 'REGIONAL_MANAGER',
  UNIT_MANAGER = 'UNIT_MANAGER',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

/**
 * Message types enum
 */
export const CHAT_MESSAGE_TYPES = {
  TEXT: 'text',
  SYSTEM: 'system',
} as const;

export type ChatMessageType =
  (typeof CHAT_MESSAGE_TYPES)[keyof typeof CHAT_MESSAGE_TYPES];

/**
 * User available for chat selection
 */
export interface ChatUser {
  userInstitutionId: string;
  name: string;
  photo: string | null;
  profileName: string;
}

/**
 * Available users grouped by role
 */
export interface AvailableUsers {
  users: ChatUser[];
}

/**
 * Chat room basic info
 */
export interface ChatRoom {
  id: string;
  name: string;
  classId: string;
  createdById: string;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Chat room with last message and participant count
 */
export interface ChatRoomWithDetails extends ChatRoom {
  lastMessage: ChatMessage | null;
  participantCount: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole: string;
  content: string;
  messageType: ChatMessageType;
  createdAt: Date | string;
}

/**
 * Chat participant
 */
export interface ChatParticipant {
  userInstitutionId: string;
  name: string;
  photo: string | null;
  role: string;
  isOnline: boolean;
}

/**
 * WebSocket user info
 */
export interface WSUserInfo {
  userInstitutionId: string;
  name: string;
  photo: string | null;
  role: string;
}

/**
 * WebSocket message types - Client to Server
 */
export type WSClientMessageType = 'message' | 'leave';

/**
 * WebSocket message types - Server to Client
 */
export type WSServerMessageType =
  | 'user_joined'
  | 'user_left'
  | 'new_message'
  | 'participants'
  | 'history'
  | 'error';

/**
 * WebSocket client message
 */
export interface WSClientMessage {
  type: WSClientMessageType;
  payload?: {
    content?: string;
  };
}

/**
 * WebSocket server message
 */
export interface WSServerMessage {
  type: WSServerMessageType;
  payload: {
    user?: WSUserInfo;
    message?: ChatMessage;
    messages?: ChatMessage[];
    participants?: ChatParticipant[];
    message_text?: string;
  };
}

/**
 * Chat API client interface
 */
export interface ChatApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * API response types
 */
export interface AvailableUsersResponse {
  users: ChatUser[];
}

export interface CreateRoomResponse {
  room: ChatRoom;
  participants: Array<{
    id: string;
    roomId: string;
    userInstitutionId: string;
    isOnline: boolean;
    lastSeenAt: Date | string | null;
    joinedAt: Date | string;
  }>;
}

export interface GetRoomsResponse {
  rooms: ChatRoomWithDetails[];
}

export interface GetRoomDetailsResponse {
  room: ChatRoom;
  participants: Array<{
    userInstitutionId: string;
    userName: string;
    userPhoto: string | null;
    userRole: string;
    isOnline: boolean;
    lastSeenAt: Date | string | null;
  }>;
  messages: ChatMessage[];
}
