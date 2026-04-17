import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatbotApiClient,
  ChatbotConversation,
  ChatbotMessage,
  ChatbotCurrentContext,
  SendChatbotMessageResult,
} from '../types/chatbot';

const DEFAULT_CONVERSATIONS_PAGE_SIZE = 20;
const DEFAULT_MESSAGES_PAGE_SIZE = 50;

/**
 * Monotonic counter used as a fallback when `crypto.randomUUID` is not
 * available (older browsers / some jsdom builds).
 */
let placeholderCounter = 0;

/**
 * Generate a collision-safe id for optimistic user bubbles. Prefers
 * `crypto.randomUUID()` when available (browsers + modern Node), and
 * falls back to a timestamp + monotonic counter otherwise.
 */
function generatePlaceholderId(): string {
  const globalCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `pending-${globalCrypto.randomUUID()}`;
  }
  placeholderCounter += 1;
  return `pending-${Date.now()}-${placeholderCounter}`;
}

/**
 * Replace the optimistic placeholder with the server-confirmed pair.
 */
function replacePlaceholder(
  prev: ChatbotMessage[],
  placeholderId: string,
  result: SendChatbotMessageResult
): ChatbotMessage[] {
  return [
    ...prev.filter((m) => m.id !== placeholderId),
    result.userMessage,
    result.assistantMessage,
  ];
}

/**
 * Remove an optimistic placeholder (used on error rollback).
 */
function removePlaceholder(
  prev: ChatbotMessage[],
  placeholderId: string
): ChatbotMessage[] {
  return prev.filter((m) => m.id !== placeholderId);
}

/**
 * Filter out an item by id. Generic helper used for conversations.
 */
function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Data and actions exposed by `useChatbot`
 */
export interface UseChatbotReturn {
  isOpen: boolean;
  isSending: boolean;
  isLoadingHistory: boolean;
  isLoadingMessages: boolean;
  errorMessage: string | null;
  conversations: ChatbotConversation[];
  activeConversationId: string | null;
  messages: ChatbotMessage[];
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  selectConversation: (id: string | null) => void;
  startNewConversation: () => void;
  sendMessage: (
    text: string,
    currentContext?: ChatbotCurrentContext
  ) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  reloadConversations: () => Promise<void>;
}

/**
 * Factory that wires the hook to a concrete API client. Returned hook
 * owns the chatbot UI state (open/close, messages, conversations).
 *
 * Implemented as a factory so consumer apps can bind a typed client once
 * (usually near composition root) and keep the hook implementation free
 * of app-specific transport concerns.
 */
export function createUseChatbot(apiClient: ChatbotApiClient) {
  return function useChatbot(): UseChatbotReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ChatbotConversation[]>(
      []
    );
    const [activeConversationId, setActiveConversationId] = useState<
      string | null
    >(null);
    const [messages, setMessages] = useState<ChatbotMessage[]>([]);

    // Keep the latest apiClient in a ref so the memoized callbacks stay
    // stable even if the parent swaps client references between renders.
    const apiClientRef = useRef(apiClient);
    apiClientRef.current = apiClient;

    // Guard against state updates after unmount. The ref is re-armed on
    // mount so the hook works correctly under React 18/19 Strict Mode
    // (which mounts, unmounts and remounts during development).
    const mountedRef = useRef(false);
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const loadConversations = useCallback(async () => {
      setIsLoadingHistory(true);
      setErrorMessage(null);
      try {
        const result = await apiClientRef.current.listConversations({
          page: 1,
          limit: DEFAULT_CONVERSATIONS_PAGE_SIZE,
        });
        if (!mountedRef.current) return;
        setConversations(result.conversations);
      } catch (err) {
        if (!mountedRef.current) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Falha ao carregar conversas'
        );
      } finally {
        if (mountedRef.current) setIsLoadingHistory(false);
      }
    }, []);

    const loadMessages = useCallback(async (conversationId: string) => {
      setIsLoadingMessages(true);
      setErrorMessage(null);
      try {
        const result = await apiClientRef.current.getMessages(conversationId, {
          page: 1,
          limit: DEFAULT_MESSAGES_PAGE_SIZE,
        });
        if (!mountedRef.current) return;
        setMessages(result.messages);
      } catch (err) {
        if (!mountedRef.current) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Falha ao carregar mensagens'
        );
      } finally {
        if (mountedRef.current) setIsLoadingMessages(false);
      }
    }, []);

    const openPanel = useCallback(() => {
      setIsOpen(true);
      void loadConversations();
    }, [loadConversations]);

    const closePanel = useCallback(() => {
      setIsOpen(false);
    }, []);

    const togglePanel = useCallback(() => {
      setIsOpen((prev) => {
        if (!prev) void loadConversations();
        return !prev;
      });
    }, [loadConversations]);

    const selectConversation = useCallback(
      (id: string | null) => {
        setActiveConversationId(id);
        if (id) {
          void loadMessages(id);
        } else {
          setMessages([]);
        }
      },
      [loadMessages]
    );

    const startNewConversation = useCallback(() => {
      setActiveConversationId(null);
      setMessages([]);
    }, []);

    const sendMessage = useCallback(
      async (text: string, currentContext?: ChatbotCurrentContext) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        const placeholderId = generatePlaceholderId();
        const placeholder: ChatbotMessage = {
          id: placeholderId,
          conversationId: activeConversationId ?? '',
          role: 'user',
          content: trimmed,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, placeholder]);
        setIsSending(true);
        setErrorMessage(null);

        try {
          const result = await apiClientRef.current.sendMessage({
            message: trimmed,
            conversationId: activeConversationId ?? undefined,
            currentContext,
          });
          if (!mountedRef.current) return;

          setMessages((prev) =>
            replacePlaceholder(prev, placeholderId, result)
          );
          setActiveConversationId(result.conversationId);

          // Refresh conversations list so title / lastMessageAt update
          void loadConversations();
        } catch (err) {
          if (!mountedRef.current) return;
          setMessages((prev) => removePlaceholder(prev, placeholderId));
          setErrorMessage(
            err instanceof Error ? err.message : 'Falha ao enviar mensagem'
          );
        } finally {
          if (mountedRef.current) setIsSending(false);
        }
      },
      [activeConversationId, isSending, loadConversations]
    );

    const deleteConversation = useCallback(
      async (id: string) => {
        setErrorMessage(null);
        try {
          await apiClientRef.current.deleteConversation(id);
          if (!mountedRef.current) return;
          setConversations((prev) => removeById(prev, id));
          if (activeConversationId === id) {
            setActiveConversationId(null);
            setMessages([]);
          }
        } catch (err) {
          if (!mountedRef.current) return;
          setErrorMessage(
            err instanceof Error ? err.message : 'Falha ao excluir conversa'
          );
        }
      },
      [activeConversationId]
    );

    return {
      isOpen,
      isSending,
      isLoadingHistory,
      isLoadingMessages,
      errorMessage,
      conversations,
      activeConversationId,
      messages,
      openPanel,
      closePanel,
      togglePanel,
      selectConversation,
      startNewConversation,
      sendMessage,
      deleteConversation,
      reloadConversations: loadConversations,
    };
  };
}
