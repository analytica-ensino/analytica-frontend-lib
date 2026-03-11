import { renderHook, act } from '@testing-library/react';
import { createUseForum } from './useForum';
import type { ForumApiClient, ForumTopic, ForumReply } from '../types/forum';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTopic: ForumTopic = {
  id: 'topic-1',
  classId: 'class-1',
  userInstitutionId: 'user-1',
  content: 'Conteúdo do tópico',
  imageUrl: null,
  createdAt: '2025-05-05T09:00:00.000Z',
  updatedAt: '2025-05-05T09:00:00.000Z',
  authorName: 'Ana Silva',
  authorPhoto: null,
  authorRole: 'STUDENT',
  replyCount: 1,
};

const mockReply: ForumReply = {
  id: 'reply-1',
  topicId: 'topic-1',
  userInstitutionId: 'user-2',
  content: 'Conteúdo da resposta',
  imageUrl: null,
  createdAt: '2025-05-05T10:00:00.000Z',
  updatedAt: '2025-05-05T10:00:00.000Z',
  authorName: 'Lucas Pereira',
  authorPhoto: null,
  authorRole: 'STUDENT',
};

const buildApiClient = (overrides: Partial<ForumApiClient> = {}): ForumApiClient => ({
  getTopics: jest.fn().mockResolvedValue({
    topics: [mockTopic],
    pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
  }),
  getTopic: jest.fn().mockResolvedValue({
    topic: mockTopic,
    replies: [mockReply],
  }),
  createTopic: jest.fn().mockResolvedValue(undefined),
  updateTopic: jest.fn().mockResolvedValue(undefined),
  deleteTopic: jest.fn().mockResolvedValue(undefined),
  createReply: jest.fn().mockResolvedValue(undefined),
  updateReply: jest.fn().mockResolvedValue(undefined),
  deleteReply: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ---------------------------------------------------------------------------
// fetchTopics
// ---------------------------------------------------------------------------

describe('createUseForum — fetchTopics', () => {
  it('loads topics and pagination on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopics();
    });

    expect(result.current.topics).toEqual([mockTopic]);
    expect(result.current.pagination).toEqual({ total: 1, limit: 50, offset: 0, hasMore: false });
    expect(result.current.isLoadingTopics).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const apiClient = buildApiClient({
      getTopics: jest.fn().mockRejectedValue(new Error('network')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopics();
    });

    expect(result.current.error).toBe('Erro ao carregar os tópicos.');
    expect(result.current.topics).toEqual([]);
  });

  it('passes params to the api client', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopics({ limit: 10, offset: 20 });
    });

    expect(apiClient.getTopics).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });
});

// ---------------------------------------------------------------------------
// fetchTopic
// ---------------------------------------------------------------------------

describe('createUseForum — fetchTopic', () => {
  it('loads topic and replies on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopic('topic-1');
    });

    expect(result.current.selectedTopic).toEqual(mockTopic);
    expect(result.current.replies).toEqual([mockReply]);
    expect(result.current.isLoadingTopic).toBe(false);
  });

  it('sets error on failure', async () => {
    const apiClient = buildApiClient({
      getTopic: jest.fn().mockRejectedValue(new Error('not found')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopic('topic-1');
    });

    expect(result.current.error).toBe('Erro ao carregar o tópico.');
  });
});

// ---------------------------------------------------------------------------
// createTopic
// ---------------------------------------------------------------------------

describe('createUseForum — createTopic', () => {
  it('calls apiClient.createTopic with given body', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.createTopic({ content: 'Novo tópico' });
    });

    expect(apiClient.createTopic).toHaveBeenCalledWith({ content: 'Novo tópico' });
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      createTopic: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(result.current.createTopic({ content: 'x' })).rejects.toThrow(
        'Erro ao criar o tópico.'
      );
    });

    expect(result.current.error).toBe('Erro ao criar o tópico.');
  });
});

// ---------------------------------------------------------------------------
// updateTopic
// ---------------------------------------------------------------------------

describe('createUseForum — updateTopic', () => {
  it('updates topic in local state on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    // Seed state
    await act(async () => {
      await result.current.fetchTopics();
    });

    await act(async () => {
      await result.current.updateTopic('topic-1', { content: 'Editado' });
    });

    expect(result.current.topics[0].content).toBe('Editado');
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      updateTopic: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(
        result.current.updateTopic('topic-1', { content: 'x' })
      ).rejects.toThrow('Erro ao atualizar o tópico.');
    });

    expect(result.current.error).toBe('Erro ao atualizar o tópico.');
  });
});

// ---------------------------------------------------------------------------
// deleteTopic
// ---------------------------------------------------------------------------

describe('createUseForum — deleteTopic', () => {
  it('removes topic from local state on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopics();
    });

    await act(async () => {
      await result.current.deleteTopic('topic-1');
    });

    expect(result.current.topics).toEqual([]);
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      deleteTopic: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(result.current.deleteTopic('topic-1')).rejects.toThrow(
        'Erro ao excluir o tópico.'
      );
    });

    expect(result.current.error).toBe('Erro ao excluir o tópico.');
  });
});

// ---------------------------------------------------------------------------
// createReply
// ---------------------------------------------------------------------------

describe('createUseForum — createReply', () => {
  it('calls apiClient.createReply with given body', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.createReply('topic-1', { content: 'Nova resposta' });
    });

    expect(apiClient.createReply).toHaveBeenCalledWith('topic-1', {
      content: 'Nova resposta',
    });
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      createReply: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(
        result.current.createReply('topic-1', { content: 'x' })
      ).rejects.toThrow('Erro ao criar a resposta.');
    });

    expect(result.current.error).toBe('Erro ao criar a resposta.');
  });
});

// ---------------------------------------------------------------------------
// updateReply
// ---------------------------------------------------------------------------

describe('createUseForum — updateReply', () => {
  it('updates reply in local state on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopic('topic-1');
    });

    await act(async () => {
      await result.current.updateReply('reply-1', { content: 'Editada' });
    });

    expect(result.current.replies[0].content).toBe('Editada');
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      updateReply: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(
        result.current.updateReply('reply-1', { content: 'x' })
      ).rejects.toThrow('Erro ao atualizar a resposta.');
    });

    expect(result.current.error).toBe('Erro ao atualizar a resposta.');
  });
});

// ---------------------------------------------------------------------------
// deleteReply
// ---------------------------------------------------------------------------

describe('createUseForum — deleteReply', () => {
  it('removes reply from local state on success', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopic('topic-1');
    });

    await act(async () => {
      await result.current.deleteReply('reply-1');
    });

    expect(result.current.replies).toEqual([]);
  });

  it('throws and sets error on failure', async () => {
    const apiClient = buildApiClient({
      deleteReply: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await expect(result.current.deleteReply('reply-1')).rejects.toThrow(
        'Erro ao excluir a resposta.'
      );
    });

    expect(result.current.error).toBe('Erro ao excluir a resposta.');
  });
});

// ---------------------------------------------------------------------------
// selectTopic / clearError
// ---------------------------------------------------------------------------

describe('createUseForum — selectTopic', () => {
  it('sets selectedTopic and clears replies', async () => {
    const apiClient = buildApiClient();
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopic('topic-1');
    });

    act(() => {
      result.current.selectTopic(null);
    });

    expect(result.current.selectedTopic).toBeNull();
    expect(result.current.replies).toEqual([]);
  });
});

describe('createUseForum — clearError', () => {
  it('clears the error state', async () => {
    const apiClient = buildApiClient({
      getTopics: jest.fn().mockRejectedValue(new Error('fail')),
    });
    const { result } = renderHook(() => createUseForum(apiClient)());

    await act(async () => {
      await result.current.fetchTopics();
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
