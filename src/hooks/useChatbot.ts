import { useCallback, useEffect, useRef, useState } from 'react';
import { CHATBOT_MESSAGE_ROLES } from '../types/chatbot';
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
 * Map any thrown value to a Portuguese user-facing message. The raw
 * `err.message` is intentionally ignored — transport-level strings
 * (axios "Network Error", "Request failed with status code 500") are
 * not localized and should not reach the UI. Observability remains
 * intact: the original error still bubbles through `console.error` /
 * Sentry at higher layers. The signature leaves room to evolve into a
 * type-aware mapper later without changing call sites.
 */
function toUserErrorMessage(_err: unknown, fallback: string): string {
  return fallback;
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
 * Resolver for the current `ChatbotApiClient`. Accepts either a concrete
 * client (captured once) or a getter invoked on every call so consumers
 * can swap clients over time without recreating the hook.
 */
export type ChatbotApiClientResolver =
  | ChatbotApiClient
  | (() => ChatbotApiClient);

/**
 * Factory that wires the hook to a concrete API client. Returned hook
 * owns the chatbot UI state (open/close, messages, conversations).
 *
 * Implemented as a factory so consumer apps can bind a typed client once
 * (usually near composition root) and keep the hook implementation free
 * of app-specific transport concerns. The factory also accepts a **getter**
 * — pass `() => apiClientRef.current` to let the hook always see the
 * latest client even if the parent swaps references between renders.
 */
export function createUseChatbot(resolver: ChatbotApiClientResolver) {
  const resolveClient: () => ChatbotApiClient =
    typeof resolver === 'function'
      ? (resolver as () => ChatbotApiClient)
      : () => resolver;

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

    // Resolve the latest apiClient on every call so the hook respects
    // callers that pass a getter (e.g., bound to a React ref).
    const apiClientRef = useRef<ChatbotApiClient>(resolveClient());
    apiClientRef.current = resolveClient();

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

    // Monotonic sequence ids per load-op. Each call captures its token and
    // only commits state when still current — avoids stale responses from
    // overwriting newer ones when the user switches conversations quickly.
    const conversationsSeqRef = useRef(0);
    const messagesSeqRef = useRef(0);
    // Synchronous lock around `sendMessage` — the `isSending` state alone
    // cannot block a second call fired in the same tick (React batches
    // state updates), so we mirror it with a ref that flips immediately.
    const isSendingRef = useRef(false);

    /**
     * Bump the messages sequence and clear the loading flag so any
     * in-flight `loadMessages()` resolving afterward fails the sequence
     * check and does not repopulate state tied to a conversation the
     * user has already left.
     */
    const invalidateMessagesLoad = () => {
      messagesSeqRef.current += 1;
      setIsLoadingMessages(false);
    };

    const loadConversations = useCallback(async () => {
      const seq = ++conversationsSeqRef.current;
      setIsLoadingHistory(true);
      setErrorMessage(null);
      try {
        const result = await apiClientRef.current.listConversations({
          page: 1,
          limit: DEFAULT_CONVERSATIONS_PAGE_SIZE,
        });
        if (!mountedRef.current || seq !== conversationsSeqRef.current) return;
        setConversations(result.conversations);
      } catch (err) {
        if (!mountedRef.current || seq !== conversationsSeqRef.current) return;
        setErrorMessage(toUserErrorMessage(err, 'Falha ao carregar conversas'));
      } finally {
        if (mountedRef.current && seq === conversationsSeqRef.current) {
          setIsLoadingHistory(false);
        }
      }
    }, []);

    const loadMessages = useCallback(async (conversationId: string) => {
      const seq = ++messagesSeqRef.current;
      setIsLoadingMessages(true);
      setErrorMessage(null);
      try {
        const result = await apiClientRef.current.getMessages(conversationId, {
          page: 1,
          limit: DEFAULT_MESSAGES_PAGE_SIZE,
        });
        if (!mountedRef.current || seq !== messagesSeqRef.current) return;
        setMessages(result.messages);
      } catch (err) {
        if (!mountedRef.current || seq !== messagesSeqRef.current) return;
        setErrorMessage(toUserErrorMessage(err, 'Falha ao carregar mensagens'));
      } finally {
        if (mountedRef.current && seq === messagesSeqRef.current) {
          setIsLoadingMessages(false);
        }
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
          invalidateMessagesLoad();
          setMessages([]);
        }
      },
      [loadMessages]
    );

    const startNewConversation = useCallback(() => {
      invalidateMessagesLoad();
      setActiveConversationId(null);
      setMessages([]);
    }, []);

    const sendMessage = useCallback(
      async (text: string, currentContext?: ChatbotCurrentContext) => {
        const trimmed = text.trim();
        // Ref-based guard: `isSending` state alone can't block a second
        // call fired in the same tick (React batches updates), so we
        // mirror the flag in a ref that flips synchronously.
        if (!trimmed || isSendingRef.current) return;
        isSendingRef.current = true;

        // Capture the messages-seq so we can tell if the user switched
        // conversations while the request is in flight. `messagesSeqRef`
        // is bumped by `selectConversation`, `startNewConversation`, and
        // `deleteConversation` via `invalidateMessagesLoad` — any of those
        // mid-flight means the current UI no longer reflects this send.
        const sendSeq = messagesSeqRef.current;

        const placeholderId = generatePlaceholderId();
        const placeholder: ChatbotMessage = {
          id: placeholderId,
          conversationId: activeConversationId ?? '',
          role: CHATBOT_MESSAGE_ROLES.USER,
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

          if (sendSeq !== messagesSeqRef.current) {
            // User switched conversations mid-flight. The server still
            // persisted the new conversation — refresh the list so it
            // appears in history — but do NOT touch the currently visible
            // messages or `activeConversationId` (that would silently
            // yank the user back to the old conversation).
            void loadConversations();
            return;
          }

          setMessages((prev) =>
            replacePlaceholder(prev, placeholderId, result)
          );
          setActiveConversationId(result.conversationId);

          // Refresh conversations list so title / lastMessageAt update
          void loadConversations();
        } catch (err) {
          if (!mountedRef.current) return;
          // Only clean up the placeholder / surface the error if the user
          // is still viewing the conversation this send belongs to.
          if (sendSeq !== messagesSeqRef.current) return;
          setMessages((prev) => removePlaceholder(prev, placeholderId));
          setErrorMessage(toUserErrorMessage(err, 'Falha ao enviar mensagem'));
        } finally {
          isSendingRef.current = false;
          if (mountedRef.current) setIsSending(false);
        }
      },
      [activeConversationId, loadConversations]
    );

    const deleteConversation = useCallback(
      async (id: string) => {
        setErrorMessage(null);
        try {
          await apiClientRef.current.deleteConversation(id);
          if (!mountedRef.current) return;
          setConversations((prev) => removeById(prev, id));
          if (activeConversationId === id) {
            invalidateMessagesLoad();
            setActiveConversationId(null);
            setMessages([]);
          }
        } catch (err) {
          if (!mountedRef.current) return;
          setErrorMessage(toUserErrorMessage(err, 'Falha ao excluir conversa'));
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
