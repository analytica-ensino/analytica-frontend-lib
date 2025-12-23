import { useState, useCallback } from 'react';
import type {
  ChatApiClient,
  ChatRoom,
  ChatRoomWithDetails,
  ChatUser,
  AvailableUsersResponse,
  CreateRoomResponse,
  GetRoomsResponse,
} from '../types/chat';

/**
 * Options for the useChatRooms hook
 */
export interface UseChatRoomsOptions {
  apiClient: ChatApiClient;
}

/**
 * Return type for the useChatRooms hook
 */
export interface UseChatRoomsReturn {
  /** List of user's chat rooms */
  rooms: ChatRoomWithDetails[];
  /** Available users for creating new chat rooms */
  availableUsers: ChatUser[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Fetch user's chat rooms */
  fetchRooms: () => Promise<void>;
  /** Fetch available users for chat */
  fetchAvailableUsers: () => Promise<void>;
  /** Create a new chat room */
  createRoom: (participantIds: string[]) => Promise<ChatRoom | null>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for managing chat rooms via REST API
 *
 * Provides functionality to:
 * - List user's chat rooms
 * - Fetch available users for new chats
 * - Create new chat rooms
 *
 * @param options - Hook configuration options
 * @returns Chat rooms state and actions
 *
 * @example
 * ```tsx
 * const { rooms, fetchRooms, createRoom } = useChatRooms({ apiClient: api });
 *
 * useEffect(() => {
 *   fetchRooms();
 * }, []);
 *
 * const handleCreateRoom = async (userIds: string[]) => {
 *   const room = await createRoom(userIds);
 *   if (room) {
 *     // Navigate to the new room
 *   }
 * };
 * ```
 */
export function useChatRooms({
  apiClient,
}: UseChatRoomsOptions): UseChatRoomsReturn {
  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user's chat rooms
   */
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<GetRoomsResponse>('/chat/rooms');
      setRooms(response.data.rooms);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Erro ao carregar salas');
      setError(error);
      console.error('Error fetching chat rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Fetch available users for chat
   */
  const fetchAvailableUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<AvailableUsersResponse>(
        '/chat/available-users'
      );
      setAvailableUsers(response.data.users);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Erro ao carregar usuários');
      setError(error);
      console.error('Error fetching available users:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  /**
   * Create a new chat room
   */
  const createRoom = useCallback(
    async (participantIds: string[]): Promise<ChatRoom | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<CreateRoomResponse>(
          '/chat/rooms',
          {
            participantIds,
          }
        );

        // Refresh rooms list after creating
        await fetchRooms();

        return response.data.room;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Erro ao criar sala');
        setError(error);
        console.error('Error creating chat room:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, fetchRooms]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rooms,
    availableUsers,
    loading,
    error,
    fetchRooms,
    fetchAvailableUsers,
    createRoom,
    clearError,
  };
}

/**
 * Factory function to create a pre-configured useChatRooms hook
 *
 * @param apiClient - API client instance
 * @returns Pre-configured hook function
 *
 * @example
 * ```tsx
 * // In your app setup
 * import { createUseChatRooms } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useChatRooms = createUseChatRooms(api);
 *
 * // Then use directly in components
 * const { rooms, fetchRooms } = useChatRooms();
 * ```
 */
export function createUseChatRooms(apiClient: ChatApiClient) {
  return () => useChatRooms({ apiClient });
}
