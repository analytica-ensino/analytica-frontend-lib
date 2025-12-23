import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatRooms, createUseChatRooms } from './useChatRooms';
import type {
  ChatApiClient,
  ChatRoomWithDetails,
  ChatUser,
  ChatRoom,
} from '../types/chat';

// Mock data
const mockRoom: ChatRoomWithDetails = {
  id: 'room-1',
  name: 'Test Room',
  classId: 'class-1',
  createdById: 'user-1',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastMessage: {
    id: 'msg-1',
    senderId: 'user-2',
    senderName: 'John Doe',
    senderPhoto: null,
    senderRole: 'STUDENT',
    content: 'Hello!',
    messageType: 'text',
    createdAt: new Date().toISOString(),
  },
  participantCount: 3,
};

const mockRoom2: ChatRoomWithDetails = {
  id: 'room-2',
  name: 'Another Room',
  classId: 'class-1',
  createdById: 'user-2',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastMessage: null,
  participantCount: 2,
};

const mockAvailableUsers: ChatUser[] = [
  {
    userInstitutionId: 'user-2',
    name: 'Jane Smith',
    photo: null,
    profileName: 'Aluno',
  },
  {
    userInstitutionId: 'user-3',
    name: 'Bob Wilson',
    photo: 'https://example.com/bob.jpg',
    profileName: 'Professor',
  },
];

const mockCreatedRoom: ChatRoom = {
  id: 'room-new',
  name: 'New Room',
  classId: 'class-1',
  createdById: 'user-1',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useChatRooms', () => {
  let mockApiClient: ChatApiClient;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      expect(result.current.rooms).toEqual([]);
      expect(result.current.availableUsers).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      expect(typeof result.current.fetchRooms).toBe('function');
      expect(typeof result.current.fetchAvailableUsers).toBe('function');
      expect(typeof result.current.createRoom).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('fetchRooms', () => {
    it('should fetch rooms successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [mockRoom, mockRoom2] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/rooms');
      expect(result.current.rooms).toEqual([mockRoom, mockRoom2]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading to true while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.get as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      act(() => {
        result.current.fetchRooms();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!({ data: { rooms: [] } });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle error when fetching rooms fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      (mockApiClient.get as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching chat rooms:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('should create a generic error for non-Error exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockApiClient.get as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.error?.message).toBe('Erro ao carregar salas');

      consoleSpy.mockRestore();
    });

    it('should clear previous error when fetching', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // First call fails
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('First error')
      );

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.error).not.toBeNull();

      // Second call succeeds
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { rooms: [] },
      });

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.error).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('fetchAvailableUsers', () => {
    it('should fetch available users successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { users: mockAvailableUsers },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchAvailableUsers();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/available-users');
      expect(result.current.availableUsers).toEqual(mockAvailableUsers);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading to true while fetching users', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.get as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      act(() => {
        result.current.fetchAvailableUsers();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!({ data: { users: [] } });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle error when fetching users fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      (mockApiClient.get as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchAvailableUsers();
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching available users:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('should create a generic error for non-Error exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockApiClient.get as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchAvailableUsers();
      });

      expect(result.current.error?.message).toBe('Erro ao carregar usuários');

      consoleSpy.mockRestore();
    });
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          room: mockCreatedRoom,
          participants: [],
        },
      });

      // Mock fetchRooms to return updated list
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [mockRoom] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      let createdRoom: ChatRoom | null = null;

      await act(async () => {
        createdRoom = await result.current.createRoom(['user-2', 'user-3']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/rooms', {
        participantIds: ['user-2', 'user-3'],
      });
      expect(createdRoom).toEqual(mockCreatedRoom);
      expect(result.current.loading).toBe(false);
    });

    it('should refresh rooms after creating a room', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          room: mockCreatedRoom,
          participants: [],
        },
      });

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [mockRoom, mockRoom2] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.createRoom(['user-2']);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/rooms');
      expect(result.current.rooms).toEqual([mockRoom, mockRoom2]);
    });

    it('should set loading to true while creating room', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.post as jest.Mock).mockReturnValue(promise);
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      act(() => {
        result.current.createRoom(['user-2']);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!({
          data: { room: mockCreatedRoom, participants: [] },
        });
        await promise;
      });

      // Loading might still be true due to fetchRooms call
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle error when creating room fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Failed to create room');
      (mockApiClient.post as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      let createdRoom: ChatRoom | null = null;

      await act(async () => {
        createdRoom = await result.current.createRoom(['user-2']);
      });

      expect(createdRoom).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating chat room:',
        error
      );

      consoleSpy.mockRestore();
    });

    it('should create a generic error for non-Error exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockApiClient.post as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.createRoom(['user-2']);
      });

      expect(result.current.error?.message).toBe('Erro ao criar sala');

      consoleSpy.mockRestore();
    });

    it('should clear error before creating room', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // First call fails
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('First error')
      );

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.createRoom(['user-2']);
      });

      expect(result.current.error).not.toBeNull();

      // Second call succeeds
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { room: mockCreatedRoom, participants: [] },
      });
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { rooms: [] },
      });

      await act(async () => {
        await result.current.createRoom(['user-3']);
      });

      expect(result.current.error).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (mockApiClient.get as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('createUseChatRooms factory', () => {
    it('should create a pre-configured hook', () => {
      const useConfiguredChatRooms = createUseChatRooms(mockApiClient);

      const { result } = renderHook(() => useConfiguredChatRooms());

      expect(result.current.rooms).toEqual([]);
      expect(typeof result.current.fetchRooms).toBe('function');
      expect(typeof result.current.fetchAvailableUsers).toBe('function');
      expect(typeof result.current.createRoom).toBe('function');
    });

    it('should use the provided API client', async () => {
      const useConfiguredChatRooms = createUseChatRooms(mockApiClient);

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [mockRoom] },
      });

      const { result } = renderHook(() => useConfiguredChatRooms());

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/rooms');
      expect(result.current.rooms).toEqual([mockRoom]);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple fetch operations', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: { rooms: [mockRoom] } })
        .mockResolvedValueOnce({ data: { users: mockAvailableUsers } });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await Promise.all([
          result.current.fetchRooms(),
          result.current.fetchAvailableUsers(),
        ]);
      });

      expect(result.current.rooms).toEqual([mockRoom]);
      expect(result.current.availableUsers).toEqual(mockAvailableUsers);
    });

    it('should handle rapid sequential calls', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [mockRoom] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        result.current.fetchRooms();
        result.current.fetchRooms();
        await result.current.fetchRooms();
      });

      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('State Persistence', () => {
    it('should maintain rooms state across multiple fetches', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: { rooms: [mockRoom] } })
        .mockResolvedValueOnce({ data: { rooms: [mockRoom, mockRoom2] } });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.rooms).toEqual([mockRoom]);

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.rooms).toEqual([mockRoom, mockRoom2]);
    });

    it('should maintain available users state independently of rooms', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: { rooms: [mockRoom] } })
        .mockResolvedValueOnce({ data: { users: mockAvailableUsers } });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.rooms).toEqual([mockRoom]);
      expect(result.current.availableUsers).toEqual([]);

      await act(async () => {
        await result.current.fetchAvailableUsers();
      });

      expect(result.current.rooms).toEqual([mockRoom]);
      expect(result.current.availableUsers).toEqual(mockAvailableUsers);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rooms response', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchRooms();
      });

      expect(result.current.rooms).toEqual([]);
    });

    it('should handle empty users response', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { users: [] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.fetchAvailableUsers();
      });

      expect(result.current.availableUsers).toEqual([]);
    });

    it('should handle creating room with single participant', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: { room: mockCreatedRoom, participants: [] },
      });
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [] },
      });

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.createRoom(['single-user']);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/rooms', {
        participantIds: ['single-user'],
      });
    });

    it('should handle creating room with many participants', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: { room: mockCreatedRoom, participants: [] },
      });
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { rooms: [] },
      });

      const manyParticipants = Array.from(
        { length: 50 },
        (_, i) => `user-${i}`
      );

      const { result } = renderHook(() =>
        useChatRooms({ apiClient: mockApiClient })
      );

      await act(async () => {
        await result.current.createRoom(manyParticipants);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/rooms', {
        participantIds: manyParticipants,
      });
    });
  });
});
