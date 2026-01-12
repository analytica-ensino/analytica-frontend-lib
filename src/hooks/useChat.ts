import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ChatMessage,
  ChatParticipant,
  WSServerMessage,
  WSClientMessage,
} from '../types/chat';

/**
 * WebSocket connection states
 */
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

/**
 * Options for the useChat hook
 */
export interface UseChatOptions {
  /** WebSocket URL (e.g., wss://api.example.com/chat/ws) */
  wsUrl: string;
  /** JWT authentication token */
  token: string;
  /** Chat room ID */
  roomId: string;
  /** Current user's userInstitutionId */
  userId: string;
  /** Callback when connection is established */
  onConnect?: () => void;
  /** Callback when connection is closed */
  onDisconnect?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnect interval in ms (default: 3000) */
  reconnectInterval?: number;
  /** Max reconnect attempts (default: 5) */
  maxReconnectAttempts?: number;
}

/**
 * Return type for the useChat hook
 */
export interface UseChatReturn {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** List of chat messages */
  messages: ChatMessage[];
  /** List of room participants */
  participants: ChatParticipant[];
  /** Send a text message */
  sendMessage: (content: string) => void;
  /** Leave the chat room */
  leave: () => void;
  /** Current error state */
  error: Error | null;
  /** Reconnect to the WebSocket */
  reconnect: () => void;
  /** Current user ID for identifying own messages */
  currentUserId: string;
}

/**
 * Hook for managing WebSocket connection to a chat room
 *
 * Handles:
 * - WebSocket connection lifecycle
 * - Message sending/receiving
 * - Participant tracking
 * - Auto-reconnection
 *
 * @param options - Hook configuration options
 * @returns Chat state and actions
 *
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   messages,
 *   participants,
 *   sendMessage,
 *   error
 * } = useChat({
 *   wsUrl: 'wss://api.example.com/chat/ws',
 *   token: authToken,
 *   roomId: 'room-123',
 *   userId: 'user-456',
 *   onConnect: () => console.log('Connected!'),
 *   onError: (err) => console.error('Error:', err),
 * });
 *
 * const handleSend = () => {
 *   sendMessage('Hello, world!');
 * };
 * ```
 */
export function useChat({
  wsUrl,
  token,
  roomId,
  userId,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseChatOptions): UseChatReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isManualDisconnectRef = useRef(false);
  const isConnectingRef = useRef(false);
  const connectRef = useRef<() => void>(() => {});

  /**
   * Send a WebSocket message
   */
  const sendWsMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WS_STATES.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  /**
   * Send a text message
   */
  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      sendWsMessage({
        type: 'message',
        payload: { content: trimmedContent },
      });
    },
    [sendWsMessage]
  );

  /**
   * Leave the chat room
   */
  const leave = useCallback(() => {
    isManualDisconnectRef.current = true;
    sendWsMessage({ type: 'leave' });
    wsRef.current?.close(1000, 'User left');
  }, [sendWsMessage]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WSServerMessage;

        switch (data.type) {
          case 'history':
            if (data.payload.messages) {
              setMessages(data.payload.messages);
            }
            break;

          case 'participants':
            if (data.payload.participants) {
              setParticipants(data.payload.participants);
            }
            break;

          case 'new_message':
            if (data.payload.message) {
              setMessages((prev) => [...prev, data.payload.message!]);
            }
            break;

          case 'user_joined':
            if (data.payload.user) {
              const user = data.payload.user;
              setParticipants((prev) => {
                // Check if user already exists
                const exists = prev.some(
                  (p) => p.userInstitutionId === user.userInstitutionId
                );
                if (exists) {
                  // Update online status
                  return prev.map((p) =>
                    p.userInstitutionId === user.userInstitutionId
                      ? { ...p, isOnline: true }
                      : p
                  );
                }
                // Add new participant
                return [
                  ...prev,
                  {
                    userInstitutionId: user.userInstitutionId,
                    name: user.name,
                    photo: user.photo,
                    role: user.role,
                    isOnline: true,
                  },
                ];
              });
            }
            break;

          case 'user_left':
            if (data.payload.user) {
              const user = data.payload.user;
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userInstitutionId === user.userInstitutionId
                    ? { ...p, isOnline: false }
                    : p
                )
              );
            }
            break;

          case 'error': {
            const errorMessage =
              data.payload.message_text || 'Erro desconhecido';
            setError(new Error(errorMessage));
            onError?.(new Error(errorMessage));
            break;
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    },
    [onError]
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return;
    }

    // Build WebSocket URL with query params
    const url = new URL(wsUrl);
    url.searchParams.set('roomId', roomId);
    url.searchParams.set('token', token);

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    isConnectingRef.current = true;
    const ws = new WebSocket(url.toString());
    wsRef.current = ws;

    ws.onopen = () => {
      isConnectingRef.current = false;
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
      ws.send(JSON.stringify({ type: 'getInitialData' }));

      onConnect?.();
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      isConnectingRef.current = false;
      const error = new Error('Erro na conexão WebSocket');
      setError(error);
      onError?.(error);
    };

    ws.onclose = (event) => {
      isConnectingRef.current = false;
      setIsConnected(false);
      onDisconnect?.();

      // Auto-reconnect if not manual disconnect and within attempts limit
      if (
        autoReconnect &&
        !isManualDisconnectRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttempts &&
        event.code !== 4001 && // Unauthorized
        event.code !== 4002 && // Missing roomId
        event.code !== 4003 // Access denied
      ) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };
  }, [
    wsUrl,
    roomId,
    token,
    handleMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
  ]);

  // Keep connect ref updated
  connectRef.current = connect;

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    connectRef.current();
  }, []);

  // Connect on mount, disconnect on unmount
  // Only connect when roomId is provided
  useEffect(() => {
    if (!roomId) {
      return;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isManualDisconnectRef.current = false;
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;

    // Close existing connection before opening new one
    if (wsRef.current) {
      wsRef.current.close(1000, 'Room changed');
      wsRef.current = null;
    }

    // Small delay to ensure previous connection is closed
    const timeoutId = setTimeout(() => {
      connectRef.current();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isManualDisconnectRef.current = true;
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close(1000, 'Component unmounted');
    };
  }, [roomId]);

  return {
    isConnected,
    messages,
    participants,
    sendMessage,
    leave,
    error,
    reconnect,
    currentUserId: userId,
  };
}

/**
 * Factory function to create a pre-configured useChat hook
 *
 * @param baseWsUrl - Base WebSocket URL
 * @returns Factory function that creates the hook with room-specific options
 *
 * @example
 * ```tsx
 * // In your app setup
 * const createChatHook = createUseChat('wss://api.example.com/chat/ws');
 *
 * // In component
 * const { messages, sendMessage } = createChatHook({
 *   token: authToken,
 *   roomId: 'room-123',
 *   userId: 'user-456',
 * });
 * ```
 */
export function createUseChat(baseWsUrl: string) {
  return (options: Omit<UseChatOptions, 'wsUrl'>) =>
    useChat({ ...options, wsUrl: baseWsUrl });
}
