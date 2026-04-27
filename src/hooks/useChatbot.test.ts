import { act, renderHook, waitFor } from '@testing-library/react';
import { createUseChatbot } from './useChatbot';
import type {
  ChatbotApiClient,
  ChatbotMessage,
  SendChatbotMessageResult,
} from '../types/chatbot';

function buildClient(
  overrides: Partial<ChatbotApiClient> = {}
): jest.Mocked<ChatbotApiClient> {
  return {
    sendMessage: jest.fn(async () => ({
      conversationId: 'c-1',
      userMessage: {
        id: 'u-1',
        conversationId: 'c-1',
        role: 'user',
        content: 'hi',
        createdAt: new Date(),
      } as ChatbotMessage,
      assistantMessage: {
        id: 'a-1',
        conversationId: 'c-1',
        role: 'assistant',
        content: 'reply',
        createdAt: new Date(),
      } as ChatbotMessage,
    })),
    listConversations: jest.fn(async () => ({
      conversations: [
        {
          id: 'c-1',
          title: 'First',
          lastMessageAt: new Date(),
          createdAt: new Date(),
        },
      ],
      total: 1,
    })),
    getMessages: jest.fn(async () => ({
      messages: [],
      total: 0,
    })),
    deleteConversation: jest.fn(async () => undefined),
    ...overrides,
  } as jest.Mocked<ChatbotApiClient>;
}

describe('useChatbot', () => {
  it('starts closed with empty state', () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.conversations).toEqual([]);
  });

  it('togglePanel opens and loads conversations', async () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      result.current.togglePanel();
    });
    expect(result.current.isOpen).toBe(true);
    await waitFor(() =>
      expect(client.listConversations).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      })
    );
    await waitFor(() => expect(result.current.conversations).toHaveLength(1));
  });

  it('sendMessage appends user and assistant messages and activates conversation', async () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.sendMessage('hi');
    });

    expect(result.current.activeConversationId).toBe('c-1');
    expect(result.current.messages.map((m) => m.role)).toEqual([
      'user',
      'assistant',
    ]);
  });

  it('sendMessage ignores empty or whitespace input', async () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(client.sendMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('sendMessage rolls back the optimistic bubble on error', async () => {
    const client = buildClient({
      sendMessage: jest.fn(async () => {
        throw new Error('boom');
      }),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.sendMessage('oi');
    });

    expect(result.current.messages).toHaveLength(0);
    // Raw transport errors are intentionally hidden from users — the hook
    // always surfaces a Portuguese fallback regardless of the thrown value.
    expect(result.current.errorMessage).toBe('Falha ao enviar mensagem');
  });

  it('sendMessage discards the response if the user switched conversations mid-flight', async () => {
    let resolveSend: ((value: SendChatbotMessageResult) => void) | undefined;
    const client = buildClient({
      sendMessage: jest.fn(
        () =>
          new Promise((resolve) => {
            resolveSend = resolve;
          })
      ),
      // Second conversation is already loaded — getMessages returns nothing
      // so the active `messages` list stays empty after the switch.
      getMessages: jest.fn(async () => ({ messages: [], total: 0 })),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    // 1) Fire the send (no await yet — response is pending)
    act(() => {
      void result.current.sendMessage('oi');
    });

    // 2) While the send is pending, user switches to another conversation
    await act(async () => {
      result.current.selectConversation('c-other');
    });
    await waitFor(() => expect(client.getMessages).toHaveBeenCalled());

    // 3) NOW the send response arrives
    await act(async () => {
      resolveSend?.({
        conversationId: 'c-1',
        userMessage: {
          id: 'u-1',
          conversationId: 'c-1',
          role: 'user',
          content: 'oi',
          createdAt: new Date(),
        } as ChatbotMessage,
        assistantMessage: {
          id: 'a-1',
          conversationId: 'c-1',
          role: 'assistant',
          content: 'reply',
          createdAt: new Date(),
        } as ChatbotMessage,
      });
    });

    // User should remain on the conversation they switched to — NOT yanked
    // back to c-1 by the late-arriving response.
    expect(result.current.activeConversationId).toBe('c-other');
    // And the messages of the new conversation must not have the response
    // appended (userMessage / assistantMessage from c-1 must be absent).
    expect(
      result.current.messages.some((m) => m.id === 'u-1' || m.id === 'a-1')
    ).toBe(false);
    // Conversations list is refreshed so the new conversation shows up.
    await waitFor(() => expect(client.listConversations).toHaveBeenCalled());
  });

  it('selectConversation loads messages', async () => {
    const client = buildClient({
      getMessages: jest.fn(async () => ({
        messages: [
          {
            id: 'm-1',
            conversationId: 'c-9',
            role: 'assistant',
            content: 'ola',
            createdAt: new Date(),
          } as ChatbotMessage,
        ],
        total: 1,
      })),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      result.current.selectConversation('c-9');
    });
    await waitFor(() =>
      expect(client.getMessages).toHaveBeenCalledWith('c-9', {
        page: 1,
        limit: 50,
      })
    );
    await waitFor(() =>
      expect(result.current.messages[0]?.content).toBe('ola')
    );
  });

  it('startNewConversation clears active conversation and messages', async () => {
    // Seed real messages via sendMessage so the "clears messages"
    // assertion is meaningful — without this, the initial empty list
    // would pass the final expectation trivially.
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.sendMessage('oi');
    });
    expect(result.current.messages.length).toBeGreaterThan(0);
    expect(result.current.activeConversationId).toBe('c-1');

    act(() => {
      result.current.startNewConversation();
    });

    expect(result.current.activeConversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('deleteConversation removes it from the local list', async () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    // Load conversations first
    act(() => {
      result.current.openPanel();
    });
    await waitFor(() => expect(result.current.conversations).toHaveLength(1));

    await act(async () => {
      await result.current.deleteConversation('c-1');
    });

    expect(client.deleteConversation).toHaveBeenCalledWith('c-1');
    expect(result.current.conversations).toHaveLength(0);
  });

  it('closePanel flips the open flag', () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    act(() => {
      result.current.openPanel();
      result.current.closePanel();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('generatePlaceholderId falls back to timestamp+counter when crypto.randomUUID is unavailable', async () => {
    const originalCrypto = (globalThis as { crypto?: Crypto }).crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      const client = buildClient();
      const { result } = renderHook(() => createUseChatbot(client)());

      await act(async () => {
        await result.current.sendMessage('hi');
      });

      // sendMessage used the fallback branch (29-30). No assertion on id
      // shape is required — the observable contract is that sendMessage
      // still resolves successfully and persists both messages.
      expect(result.current.messages.map((m) => m.role)).toEqual([
        'user',
        'assistant',
      ]);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
        writable: true,
      });
    }
  });

  it('loadConversations suppresses error when superseded by a newer call (race guard)', async () => {
    let rejectFirst: (e: unknown) => void = () => undefined;
    const client = buildClient({
      listConversations: jest
        .fn()
        // First call rejects, but only after a later call resolves.
        .mockImplementationOnce(
          () => new Promise((_, reject) => (rejectFirst = reject))
        )
        .mockResolvedValueOnce({ conversations: [], total: 0 }),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    // Fire two loads in quick succession — the second wins.
    act(() => {
      result.current.openPanel();
    });
    act(() => {
      void result.current.reloadConversations();
    });

    await waitFor(() =>
      expect(client.listConversations).toHaveBeenCalledTimes(2)
    );

    // Reject the stale first request — the guard should swallow the error.
    await act(async () => {
      rejectFirst(new Error('stale'));
    });

    // No error leaks from the superseded call.
    expect(result.current.errorMessage).toBeNull();
  });

  it('loadMessages suppresses error when superseded by a newer call', async () => {
    let rejectFirst: (e: unknown) => void = () => undefined;
    const client = buildClient({
      getMessages: jest
        .fn()
        .mockImplementationOnce(
          () => new Promise((_, reject) => (rejectFirst = reject))
        )
        .mockResolvedValueOnce({ messages: [], total: 0 }),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    act(() => {
      result.current.selectConversation('c-1');
    });
    act(() => {
      result.current.selectConversation('c-2');
    });
    await waitFor(() => expect(client.getMessages).toHaveBeenCalledTimes(2));

    await act(async () => {
      rejectFirst(new Error('stale'));
    });

    expect(result.current.errorMessage).toBeNull();
  });

  it('selectConversation(null) clears messages without calling getMessages', () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    act(() => {
      result.current.selectConversation(null);
    });

    expect(result.current.activeConversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(client.getMessages).not.toHaveBeenCalled();
  });

  it('deleteConversation reports an error message when the API call fails', async () => {
    const client = buildClient({
      deleteConversation: jest.fn().mockRejectedValue(new Error('db down')),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.deleteConversation('c-1');
    });

    // Raw transport errors are intentionally hidden — always surfaces pt-BR fallback.
    expect(result.current.errorMessage).toBe('Falha ao excluir conversa');
  });

  it('deleteConversation uses a generic fallback for non-Error throwables', async () => {
    const client = buildClient({
      deleteConversation: jest.fn().mockRejectedValue('oops'),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      await result.current.deleteConversation('c-1');
    });

    expect(result.current.errorMessage).toMatch(/Falha ao excluir conversa/);
  });

  it('loadConversations uses a generic fallback for non-Error throwables', async () => {
    const client = buildClient({
      listConversations: jest.fn().mockRejectedValue('oops'),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      result.current.openPanel();
    });
    await waitFor(() =>
      expect(result.current.errorMessage).toMatch(/Falha ao carregar conversas/)
    );
  });

  it('loadMessages uses a generic fallback for non-Error throwables', async () => {
    const client = buildClient({
      getMessages: jest.fn().mockRejectedValue('oops'),
    });
    const { result } = renderHook(() => createUseChatbot(client)());

    await act(async () => {
      result.current.selectConversation('c-1');
    });
    await waitFor(() =>
      expect(result.current.errorMessage).toMatch(/Falha ao carregar mensagens/)
    );
  });

  it('streams chunks word-by-word into the assistant bubble before swapping for the persisted message', async () => {
    jest.useFakeTimers();
    try {
      // Capture the handlers passed by the hook so we can drive `onToken`
      // ourselves and observe word-by-word growth.
      let capturedHandlers: {
        onStart?: (event: {
          conversationId: string;
          userMessage: ChatbotMessage;
        }) => void;
        onToken?: (chunk: string) => void;
      } = {};
      let resolveSend: ((value: SendChatbotMessageResult) => void) | undefined;

      const client = buildClient({
        sendMessage: jest.fn((_payload, handlers) => {
          capturedHandlers = handlers ?? {};
          return new Promise<SendChatbotMessageResult>((resolve) => {
            resolveSend = resolve;
          });
        }),
      });
      const { result } = renderHook(() => createUseChatbot(client)());

      // Fire the send (don't await — pacer needs intermediate ticks).
      act(() => {
        void result.current.sendMessage('hi');
      });

      // Server confirms the user message and conversation id.
      act(() => {
        capturedHandlers.onStart?.({
          conversationId: 'c-1',
          userMessage: {
            id: 'u-1',
            conversationId: 'c-1',
            role: 'user',
            content: 'hi',
            createdAt: new Date(),
          } as ChatbotMessage,
        });
      });

      // Backend pushes a small chunk (no acceleration) so we can observe
      // a single word per tick at the base cadence.
      act(() => {
        capturedHandlers.onToken?.('alpha beta gamma');
      });

      // After the first tick only the first word should be visible.
      // With a 16-char buffer at the base ~30ms cadence the first
      // delay is well under 35ms — advance just enough to fire one tick.
      act(() => {
        jest.advanceTimersByTime(35);
      });
      const firstAssistant = result.current.messages.find(
        (m) => m.role === 'assistant'
      );
      expect(firstAssistant?.content).toBe('alpha ');
      // Bubble id is the streaming placeholder, not the persisted id yet.
      expect(firstAssistant?.id.startsWith('streaming-')).toBe(true);

      // Drain the rest of the buffer.
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(
        result.current.messages.find((m) => m.role === 'assistant')?.content
      ).toBe('alpha beta gamma');

      // Resolve the request — pacer should drain (already empty) and
      // swap the streaming bubble for the canonical persisted reply.
      await act(async () => {
        resolveSend?.({
          conversationId: 'c-1',
          userMessage: {
            id: 'u-1',
            conversationId: 'c-1',
            role: 'user',
            content: 'hi',
            createdAt: new Date(),
          } as ChatbotMessage,
          assistantMessage: {
            id: 'a-1',
            conversationId: 'c-1',
            role: 'assistant',
            content: 'hello there friend',
            createdAt: new Date(),
          } as ChatbotMessage,
        });
        // Flush microtasks + any final drain ticks.
        await jest.runOnlyPendingTimersAsync();
      });

      const finalAssistant = result.current.messages.find(
        (m) => m.role === 'assistant'
      );
      expect(finalAssistant?.id).toBe('a-1');
      expect(finalAssistant?.content).toBe('hello there friend');
    } finally {
      jest.useRealTimers();
    }
  });

  it('deleteConversation clears active conversation state when deleting the active one', async () => {
    const client = buildClient();
    const { result } = renderHook(() => createUseChatbot(client)());

    // Activate a conversation first.
    await act(async () => {
      await result.current.sendMessage('hi');
    });
    expect(result.current.activeConversationId).toBe('c-1');
    expect(result.current.messages.length).toBeGreaterThan(0);

    await act(async () => {
      await result.current.deleteConversation('c-1');
    });

    // Both references to the deleted conversation are cleared.
    expect(result.current.activeConversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });
});
