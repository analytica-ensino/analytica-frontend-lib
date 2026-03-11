import { useState, useCallback } from 'react';
import type {
  ForumApiClient,
  ForumTopic,
  ForumReply,
  ForumPagination,
} from '../types/forum';

type UseForumState = {
  topics: ForumTopic[];
  pagination: ForumPagination | null;
  selectedTopic: ForumTopic | null;
  replies: ForumReply[];
  isLoadingTopics: boolean;
  isLoadingTopic: boolean;
  isSubmitting: boolean;
  error: string | null;
};

export type UseForumReturn = UseForumState & {
  fetchTopics: (params?: { limit?: number; offset?: number }) => Promise<void>;
  fetchTopic: (topicId: string) => Promise<void>;
  createTopic: (body: { content: string; imageUrl?: string }) => Promise<void>;
  updateTopic: (
    topicId: string,
    body: { content?: string; imageUrl?: string | null }
  ) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  createReply: (
    topicId: string,
    body: { content: string; imageUrl?: string }
  ) => Promise<void>;
  updateReply: (
    replyId: string,
    body: { content?: string; imageUrl?: string | null }
  ) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
  selectTopic: (topic: ForumTopic | null) => void;
  clearError: () => void;
};

export const createUseForum = (apiClient: ForumApiClient) => {
  return (): UseForumReturn => {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [pagination, setPagination] = useState<ForumPagination | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(
      async (params?: { limit?: number; offset?: number }) => {
        setIsLoadingTopics(true);
        setError(null);
        try {
          const response = await apiClient.getTopics(params);
          setTopics(response.topics);
          setPagination(response.pagination);
        } catch {
          setError('Erro ao carregar os tópicos.');
        } finally {
          setIsLoadingTopics(false);
        }
      },
      [apiClient]
    );

    const fetchTopic = useCallback(
      async (topicId: string) => {
        setIsLoadingTopic(true);
        setError(null);
        try {
          const response = await apiClient.getTopic(topicId);
          setSelectedTopic(response.topic);
          setReplies(response.replies);
        } catch {
          setError('Erro ao carregar o tópico.');
        } finally {
          setIsLoadingTopic(false);
        }
      },
      [apiClient]
    );

    const createTopic = useCallback(
      async (body: { content: string; imageUrl?: string }) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.createTopic(body);
        } catch {
          const msg = 'Erro ao criar o tópico.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const updateTopic = useCallback(
      async (
        topicId: string,
        body: { content?: string; imageUrl?: string | null }
      ) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.updateTopic(topicId, body);
          setTopics((prev) =>
            prev.map((t) => (t.id === topicId ? { ...t, ...body } : t))
          );
        } catch {
          const msg = 'Erro ao atualizar o tópico.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const deleteTopic = useCallback(
      async (topicId: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.deleteTopic(topicId);
          setTopics((prev) => prev.filter((t) => t.id !== topicId));
        } catch {
          const msg = 'Erro ao excluir o tópico.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const createReply = useCallback(
      async (topicId: string, body: { content: string; imageUrl?: string }) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.createReply(topicId, body);
        } catch {
          const msg = 'Erro ao criar a resposta.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const updateReply = useCallback(
      async (
        replyId: string,
        body: { content?: string; imageUrl?: string | null }
      ) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.updateReply(replyId, body);
          setReplies((prev) =>
            prev.map((r) => (r.id === replyId ? { ...r, ...body } : r))
          );
        } catch {
          const msg = 'Erro ao atualizar a resposta.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const deleteReply = useCallback(
      async (replyId: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await apiClient.deleteReply(replyId);
          setReplies((prev) => prev.filter((r) => r.id !== replyId));
        } catch {
          const msg = 'Erro ao excluir a resposta.';
          setError(msg);
          throw new Error(msg);
        } finally {
          setIsSubmitting(false);
        }
      },
      [apiClient]
    );

    const selectTopic = useCallback((topic: ForumTopic | null) => {
      setSelectedTopic(topic);
      setReplies([]);
    }, []);

    const clearError = useCallback(() => {
      setError(null);
    }, []);

    return {
      topics,
      pagination,
      selectedTopic,
      replies,
      isLoadingTopics,
      isLoadingTopic,
      isSubmitting,
      error,
      fetchTopics,
      fetchTopic,
      createTopic,
      updateTopic,
      deleteTopic,
      createReply,
      updateReply,
      deleteReply,
      selectTopic,
      clearError,
    };
  };
};
