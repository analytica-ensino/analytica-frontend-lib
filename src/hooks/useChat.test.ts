import { renderHook, act } from '@testing-library/react';
import { useChat, createUseChat, WS_STATES } from './useChat';
import type { UseChatOptions } from './useChat';
import type { WSServerMessage } from '../types/chat';

// Mock WebSocket
class MockWebSocket {
  static readonly instances: MockWebSocket[] = [];
  static lastInstance: MockWebSocket | null = null;

  url: string;
  readyState: number = WS_STATES.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    MockWebSocket.lastInstance = this;
  }

  send = jest.fn();
  close = jest.fn((code?: number, reason?: string) => {
    this.readyState = WS_STATES.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  });

  // Helper methods for tests
  simulateOpen() {
    this.readyState = WS_STATES.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: WSServerMessage) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent('message', { data: JSON.stringify(data) })
      );
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  simulateClose(code = 1000, reason = '') {
    this.readyState = WS_STATES.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }

  static reset() {
    MockWebSocket.instances = [];
    MockWebSocket.lastInstance = null;
  }
}

// Replace global WebSocket with mock
const originalWebSocket = globalThis.WebSocket;

describe('useChat', () => {
  const defaultOptions: UseChatOptions = {
    wsUrl: 'wss://example.com/chat/ws',
    token: 'test-token',
    roomId: 'room-123',
    userId: 'user-456',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    MockWebSocket.reset();
    (globalThis as unknown as { WebSocket: typeof MockWebSocket }).WebSocket =
      MockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    jest.useRealTimers();
    (globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket =
      originalWebSocket;
  });

  describe('Connection', () => {
    it('should connect to WebSocket on mount', () => {
      renderHook(() => useChat(defaultOptions));

      expect(MockWebSocket.lastInstance).not.toBeNull();
      expect(MockWebSocket.lastInstance?.url).toContain(
        'wss://example.com/chat/ws'
      );
      expect(MockWebSocket.lastInstance?.url).toContain('roomId=room-123');
      expect(MockWebSocket.lastInstance?.url).toContain('token=test-token');
    });

    it('should set isConnected to true when connection opens', async () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      expect(result.current.isConnected).toBe(false);

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should call onConnect callback when connection opens', () => {
      const onConnect = jest.fn();
      renderHook(() => useChat({ ...defaultOptions, onConnect }));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      expect(onConnect).toHaveBeenCalled();
    });

    it('should set isConnected to false when connection closes', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        MockWebSocket.lastInstance?.simulateClose();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should call onDisconnect callback when connection closes', () => {
      const onDisconnect = jest.fn();
      renderHook(() => useChat({ ...defaultOptions, onDisconnect }));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateClose();
      });

      expect(onDisconnect).toHaveBeenCalled();
    });

    it('should close connection on unmount', () => {
      const { unmount } = renderHook(() => useChat(defaultOptions));

      const ws = MockWebSocket.lastInstance;

      unmount();

      expect(ws?.close).toHaveBeenCalledWith(1000, 'Component unmounted');
    });
  });

  describe('Error Handling', () => {
    it('should set error when WebSocket error occurs', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateError();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Erro na conexão WebSocket');
    });

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();
      renderHook(() => useChat({ ...defaultOptions, onError }));

      act(() => {
        MockWebSocket.lastInstance?.simulateError();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should clear error when connection reopens', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateError();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Auto-reconnect', () => {
    it('should attempt to reconnect after disconnect', () => {
      renderHook(() => useChat(defaultOptions));

      const initialWs = MockWebSocket.lastInstance;

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateClose(1006, 'Connection lost');
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(MockWebSocket.instances.length).toBe(2);
      expect(MockWebSocket.lastInstance).not.toBe(initialWs);
    });

    it('should not reconnect after max attempts', () => {
      renderHook(() =>
        useChat({
          ...defaultOptions,
          maxReconnectAttempts: 2,
          reconnectInterval: 1000,
        })
      );

      // Initial connection + close
      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      // First reconnect attempt
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      // Second reconnect attempt (last one)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      // No more reconnects
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have 3 connections: initial + 2 reconnects
      expect(MockWebSocket.instances.length).toBe(3);
    });

    it('should not reconnect when autoReconnect is false', () => {
      renderHook(() =>
        useChat({
          ...defaultOptions,
          autoReconnect: false,
        })
      );

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(MockWebSocket.instances.length).toBe(1);
    });

    it('should not reconnect on manual disconnect', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        result.current.leave();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Only initial connection
      expect(MockWebSocket.instances.length).toBe(1);
    });

    it('should not reconnect on specific error codes', () => {
      const errorCodes = [4001, 4002, 4003]; // Unauthorized, Missing roomId, Access denied

      errorCodes.forEach((code) => {
        MockWebSocket.reset();

        renderHook(() => useChat(defaultOptions));

        act(() => {
          MockWebSocket.lastInstance?.simulateOpen();
          MockWebSocket.lastInstance?.simulateClose(code);
        });

        act(() => {
          jest.advanceTimersByTime(5000);
        });

        expect(MockWebSocket.instances.length).toBe(1);
      });
    });

    it('should use custom reconnect interval', () => {
      renderHook(() =>
        useChat({
          ...defaultOptions,
          reconnectInterval: 5000,
        })
      );

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      // Should not reconnect at 3000ms
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(MockWebSocket.instances.length).toBe(1);

      // Should reconnect at 5000ms
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(MockWebSocket.instances.length).toBe(2);
    });
  });

  describe('Message Handling', () => {
    it('should update messages when history message is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const mockMessages = [
        {
          id: 'msg-1',
          senderId: 'user-1',
          senderName: 'John',
          senderPhoto: null,
          senderRole: 'STUDENT',
          content: 'Hello',
          messageType: 'text' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'history',
          payload: { messages: mockMessages },
        });
      });

      expect(result.current.messages).toEqual(mockMessages);
    });

    it('should add new message when new_message is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const newMessage = {
        id: 'msg-2',
        senderId: 'user-2',
        senderName: 'Jane',
        senderPhoto: null,
        senderRole: 'TEACHER',
        content: 'Hi there',
        messageType: 'text' as const,
        createdAt: new Date().toISOString(),
      };

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'new_message',
          payload: { message: newMessage },
        });
      });

      expect(result.current.messages).toContainEqual(newMessage);
    });

    it('should update participants when participants message is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const mockParticipants = [
        {
          userInstitutionId: 'user-1',
          name: 'John',
          photo: null,
          role: 'STUDENT',
          isOnline: true,
        },
      ];

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'participants',
          payload: { participants: mockParticipants },
        });
      });

      expect(result.current.participants).toEqual(mockParticipants);
    });

    it('should add new participant when user_joined is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const newUser = {
        userInstitutionId: 'user-3',
        name: 'Bob',
        photo: null,
        role: 'STUDENT',
      };

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'user_joined',
          payload: { user: newUser },
        });
      });

      expect(result.current.participants).toContainEqual({
        ...newUser,
        isOnline: true,
      });
    });

    it('should update existing participant to online when user_joined is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const existingParticipants = [
        {
          userInstitutionId: 'user-1',
          name: 'John',
          photo: null,
          role: 'STUDENT',
          isOnline: false,
        },
      ];

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'participants',
          payload: { participants: existingParticipants },
        });
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'user_joined',
          payload: {
            user: {
              userInstitutionId: 'user-1',
              name: 'John',
              photo: null,
              role: 'STUDENT',
            },
          },
        });
      });

      expect(result.current.participants[0].isOnline).toBe(true);
    });

    it('should mark participant as offline when user_left is received', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      const participants = [
        {
          userInstitutionId: 'user-1',
          name: 'John',
          photo: null,
          role: 'STUDENT',
          isOnline: true,
        },
      ];

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'participants',
          payload: { participants },
        });
      });

      act(() => {
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'user_left',
          payload: {
            user: {
              userInstitutionId: 'user-1',
              name: 'John',
              photo: null,
              role: 'STUDENT',
            },
          },
        });
      });

      expect(result.current.participants[0].isOnline).toBe(false);
    });

    it('should set error when error message is received', () => {
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useChat({ ...defaultOptions, onError })
      );

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateMessage({
          type: 'error',
          payload: { message_text: 'Room not found' },
        });
      });

      expect(result.current.error?.message).toBe('Room not found');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle malformed JSON message gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        if (MockWebSocket.lastInstance?.onmessage) {
          MockWebSocket.lastInstance.onmessage(
            new MessageEvent('message', { data: 'invalid json' })
          );
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error parsing WebSocket message:',
        expect.any(Error)
      );

      // Should not crash
      expect(result.current.messages).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('sendMessage', () => {
    it('should send message through WebSocket', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        result.current.sendMessage('Hello, world!');
      });

      expect(MockWebSocket.lastInstance?.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'message',
          payload: { content: 'Hello, world!' },
        })
      );
    });

    it('should not send empty message', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        result.current.sendMessage('   ');
      });

      expect(MockWebSocket.lastInstance?.send).not.toHaveBeenCalled();
    });

    it('should trim message content', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        result.current.sendMessage('  Hello  ');
      });

      expect(MockWebSocket.lastInstance?.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'message',
          payload: { content: 'Hello' },
        })
      );
    });

    it('should not send message when not connected', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      // Don't simulate open - stay in CONNECTING state

      act(() => {
        result.current.sendMessage('Hello');
      });

      expect(MockWebSocket.lastInstance?.send).not.toHaveBeenCalled();
    });
  });

  describe('leave', () => {
    it('should send leave message and close connection', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      act(() => {
        result.current.leave();
      });

      expect(MockWebSocket.lastInstance?.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'leave' })
      );
      expect(MockWebSocket.lastInstance?.close).toHaveBeenCalledWith(
        1000,
        'User left'
      );
    });
  });

  describe('reconnect', () => {
    it('should reconnect manually', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      const initialWs = MockWebSocket.lastInstance;

      act(() => {
        result.current.reconnect();
      });

      expect(MockWebSocket.instances.length).toBe(2);
      expect(MockWebSocket.lastInstance).not.toBe(initialWs);
    });

    it('should reset reconnect attempts on manual reconnect', () => {
      const { result } = renderHook(() =>
        useChat({
          ...defaultOptions,
          maxReconnectAttempts: 1,
          reconnectInterval: 1000,
        })
      );

      // Initial connection and close to trigger auto-reconnect
      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Close again - should not auto-reconnect (max attempts reached)
      act(() => {
        MockWebSocket.lastInstance?.simulateClose(1006);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const countBeforeManualReconnect = MockWebSocket.instances.length;

      // Manual reconnect should work even after max attempts
      act(() => {
        result.current.reconnect();
      });

      expect(MockWebSocket.instances.length).toBe(
        countBeforeManualReconnect + 1
      );
    });
  });

  describe('currentUserId', () => {
    it('should return the provided userId', () => {
      const { result } = renderHook(() => useChat(defaultOptions));

      expect(result.current.currentUserId).toBe('user-456');
    });
  });

  describe('createUseChat factory', () => {
    it('should create a pre-configured hook', () => {
      const useConfiguredChat = createUseChat('wss://custom.example.com/ws');

      const { result } = renderHook(() =>
        useConfiguredChat({
          token: 'custom-token',
          roomId: 'custom-room',
          userId: 'custom-user',
        })
      );

      expect(MockWebSocket.lastInstance?.url).toContain(
        'wss://custom.example.com/ws'
      );
      expect(MockWebSocket.lastInstance?.url).toContain('roomId=custom-room');
      expect(MockWebSocket.lastInstance?.url).toContain('token=custom-token');
      expect(result.current.currentUserId).toBe('custom-user');
    });
  });

  describe('WS_STATES', () => {
    it('should export correct WebSocket state constants', () => {
      expect(WS_STATES.CONNECTING).toBe(0);
      expect(WS_STATES.OPEN).toBe(1);
      expect(WS_STATES.CLOSING).toBe(2);
      expect(WS_STATES.CLOSED).toBe(3);
    });
  });

  describe('Connection lifecycle with options changes', () => {
    it('should reconnect when roomId changes', () => {
      const { rerender } = renderHook(
        (props: UseChatOptions) => useChat(props),
        { initialProps: defaultOptions }
      );

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      const initialWs = MockWebSocket.lastInstance;

      rerender({ ...defaultOptions, roomId: 'new-room' });

      expect(MockWebSocket.instances.length).toBe(2);
      expect(MockWebSocket.lastInstance).not.toBe(initialWs);
      expect(MockWebSocket.lastInstance?.url).toContain('roomId=new-room');
    });

    it('should reconnect when token changes', () => {
      const { rerender } = renderHook(
        (props: UseChatOptions) => useChat(props),
        { initialProps: defaultOptions }
      );

      act(() => {
        MockWebSocket.lastInstance?.simulateOpen();
      });

      const initialWs = MockWebSocket.lastInstance;

      rerender({ ...defaultOptions, token: 'new-token' });

      expect(MockWebSocket.instances.length).toBe(2);
      expect(MockWebSocket.lastInstance).not.toBe(initialWs);
      expect(MockWebSocket.lastInstance?.url).toContain('token=new-token');
    });
  });
});
