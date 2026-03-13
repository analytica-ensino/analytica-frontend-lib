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
  createTopic: (body: {
    content: string;
    imageUrl?: string;
    countsForGrade?: boolean;
  }) => Promise<void>;
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

/* -- State updaters (extracted to reduce nesting depth — SonarQube) -- */

const replaceTopicById =
  (topicId: string, body: { content?: string; imageUrl?: string | null }) =>
  (prev: ForumTopic[]) =>
    prev.map((t) => (t.id === topicId ? { ...t, ...body } : t));

const removeTopicById = (topicId: string) => (prev: ForumTopic[]) =>
  prev.filter((t) => t.id !== topicId);

const replaceReplyById =
  (replyId: string, body: { content?: string; imageUrl?: string | null }) =>
  (prev: ForumReply[]) =>
    prev.map((r) => (r.id === replyId ? { ...r, ...body } : r));

const updateSelectedTopic =
  (topicId: string, body: { content?: string; imageUrl?: string | null }) =>
  (prev: ForumTopic | null) =>
    prev?.id === topicId ? { ...prev, ...body } : prev;

const clearSelectedTopicIfMatch =
  (topicId: string, clearReplies: () => void) => (prev: ForumTopic | null) => {
    if (prev?.id === topicId) {
      clearReplies();
      return null;
    }
    return prev;
  };

const removeReplyById = (replyId: string) => (prev: ForumReply[]) =>
  prev.filter((r) => r.id !== replyId);

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

    /** Wraps a mutation call with isSubmitting / error handling. */
    const withSubmit = useCallback(
      async (action: () => Promise<void>, errorMsg: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
          await action();
        } catch {
          setError(errorMsg);
          throw new Error(errorMsg);
        } finally {
          setIsSubmitting(false);
        }
      },
      []
    );

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
      async (body: {
        content: string;
        imageUrl?: string;
        countsForGrade?: boolean;
      }) =>
        withSubmit(
          () => apiClient.createTopic(body),
          'Erro ao criar o tópico.'
        ),
      [apiClient, withSubmit]
    );

    const updateTopic = useCallback(
      async (
        topicId: string,
        body: { content?: string; imageUrl?: string | null }
      ) =>
        withSubmit(async () => {
          await apiClient.updateTopic(topicId, body);
          setTopics(replaceTopicById(topicId, body));
          setSelectedTopic(updateSelectedTopic(topicId, body));
        }, 'Erro ao atualizar o tópico.'),
      [apiClient, withSubmit]
    );

    const deleteTopic = useCallback(
      async (topicId: string) =>
        withSubmit(async () => {
          await apiClient.deleteTopic(topicId);
          setTopics(removeTopicById(topicId));
          setSelectedTopic(
            clearSelectedTopicIfMatch(topicId, () => setReplies([]))
          );
        }, 'Erro ao excluir o tópico.'),
      [apiClient, withSubmit]
    );

    const createReply = useCallback(
      async (topicId: string, body: { content: string; imageUrl?: string }) =>
        withSubmit(
          () => apiClient.createReply(topicId, body),
          'Erro ao criar a resposta.'
        ),
      [apiClient, withSubmit]
    );

    const updateReply = useCallback(
      async (
        replyId: string,
        body: { content?: string; imageUrl?: string | null }
      ) =>
        withSubmit(async () => {
          await apiClient.updateReply(replyId, body);
          setReplies(replaceReplyById(replyId, body));
        }, 'Erro ao atualizar a resposta.'),
      [apiClient, withSubmit]
    );

    const deleteReply = useCallback(
      async (replyId: string) =>
        withSubmit(async () => {
          await apiClient.deleteReply(replyId);
          setReplies(removeReplyById(replyId));
        }, 'Erro ao excluir a resposta.'),
      [apiClient, withSubmit]
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
