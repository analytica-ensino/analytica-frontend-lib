import { act, renderHook, waitFor } from '@testing-library/react';
import { createUseChatbot } from './useChatbot';
import type { ChatbotApiClient, ChatbotMessage } from '../types/chatbot';

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
    expect(result.current.errorMessage).toMatch(/boom/);
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

    expect(result.current.errorMessage).toMatch(/db down/);
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
