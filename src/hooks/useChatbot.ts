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
 * Replace the optimistic placeholder with the server-confirmed pair,
 * and drop any in-progress streaming bubble (replaced by the
 * persisted assistant message that lands together).
 */
function replacePlaceholder(
  prev: ChatbotMessage[],
  placeholderId: string,
  streamingId: string,
  result: SendChatbotMessageResult
): ChatbotMessage[] {
  return [
    ...prev.filter((m) => m.id !== placeholderId && m.id !== streamingId),
    result.userMessage,
    result.assistantMessage,
  ];
}

/**
 * Remove an optimistic placeholder (and any partial streaming bubble)
 * used on error rollback.
 */
function removePlaceholder(
  prev: ChatbotMessage[],
  placeholderId: string,
  streamingId: string
): ChatbotMessage[] {
  return prev.filter((m) => m.id !== placeholderId && m.id !== streamingId);
}

/**
 * Append (or update) the in-progress assistant bubble while tokens
 * arrive over the stream. Idempotent on `streamingId`.
 */
function appendStreamingChunk(
  prev: ChatbotMessage[],
  streamingId: string,
  conversationId: string,
  chunk: string
): ChatbotMessage[] {
  const existing = prev.find((m) => m.id === streamingId);
  if (!existing) {
    return [
      ...prev,
      {
        id: streamingId,
        conversationId,
        role: CHATBOT_MESSAGE_ROLES.ASSISTANT,
        content: chunk,
        createdAt: new Date(),
      },
    ];
  }
  return prev.map((m) =>
    m.id === streamingId ? { ...m, content: m.content + chunk } : m
  );
}

/**
 * Word-pacing constants for the streaming bubble. Gemini emits 5–20
 * words per chunk; rendering them raw makes the bubble grow in visible
 * jumps. The pacer drips one word per tick so the UX matches what users
 * expect from ChatGPT/Claude.
 *
 * `BASE_MS` is the comfortable read pace; the formula in `nextDelayMs`
 * accelerates as the buffer grows so the total render time never lags
 * behind the model's actual output (cap at `MIN_MS` per word).
 */
const PACER_BASE_MS = 35;
const PACER_MIN_MS = 8;
const PACER_KP = 0.3;

/**
 * Pop the next "word + trailing whitespace" group from the buffer.
 * Preserves whitespace as-is (newlines, double spaces) so markdown and
 * lists stream out correctly. Returns null on empty input.
 */
function takeOneWord(buffer: string): { piece: string; rest: string } | null {
  const match = /^(?:\S+\s*|\s+)/.exec(buffer);
  if (!match) return null;
  return { piece: match[0], rest: buffer.slice(match[0].length) };
}

/**
 * Adaptive tick delay. The longer the pending buffer, the faster we
 * drip — keeps total render time ≈ stream duration even when the model
 * delivers a 200-char chunk all at once.
 */
function nextDelayMs(bufferLen: number): number {
  const dt = PACER_BASE_MS - bufferLen * PACER_KP;
  return Math.max(PACER_MIN_MS, dt);
}

/**
 * Mutable state for the streaming-bubble word pacer. Lives in a ref at
 * hook scope so unmount and per-send reset can both touch the same
 * instance. Defined as a named type because TypeScript narrows mutable
 * properties aggressively across closures (Promise executor + try/catch),
 * and a named alias keeps the optional-resolve type stable.
 */
interface PacerState {
  buffer: string;
  timer: ReturnType<typeof setTimeout> | null;
  draining: boolean;
  drainResolve: (() => void) | null;
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

    // Word-pacer state. Only one send-at-a-time (guarded by `isSendingRef`),
    // so a single instance is enough. Lives at hook scope so unmount can
    // cancel any pending tick.
    const pacerRef = useRef<PacerState>({
      buffer: '',
      timer: null,
      draining: false,
      drainResolve: null,
    });

    useEffect(() => {
      return () => {
        const pacer = pacerRef.current;
        if (pacer.timer) {
          clearTimeout(pacer.timer);
          pacer.timer = null;
        }
        pacer.buffer = '';
        pacer.draining = false;
        if (pacer.drainResolve) {
          pacer.drainResolve();
          pacer.drainResolve = null;
        }
      };
    }, []);

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
        // Independent id for the streaming assistant bubble so it can be
        // appended to / removed without touching the user placeholder.
        const streamingId = generatePlaceholderId().replace(
          'pending-',
          'streaming-'
        );
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

        // The pacer needs to know the latest conversation id for the
        // streaming bubble. `activeConversationId` from closure is stale
        // (state setter is async); track it in a local mutable instead.
        let streamConvId = activeConversationId ?? '';

        const pacer = pacerRef.current;
        // Reset any leftover state from a prior send.
        pacer.buffer = '';
        pacer.draining = false;
        if (pacer.timer) {
          clearTimeout(pacer.timer);
          pacer.timer = null;
        }
        if (pacer.drainResolve) {
          pacer.drainResolve();
          pacer.drainResolve = null;
        }

        const tickPacer = (): void => {
          pacer.timer = null;
          if (!mountedRef.current || sendSeq !== messagesSeqRef.current) {
            return;
          }
          const taken = takeOneWord(pacer.buffer);
          if (!taken) {
            // Buffer empty. If we're draining (server done), signal done.
            if (pacer.draining && pacer.drainResolve) {
              pacer.drainResolve();
              pacer.drainResolve = null;
              pacer.draining = false;
            }
            return;
          }
          pacer.buffer = taken.rest;
          setMessages((prev: ChatbotMessage[]) =>
            appendStreamingChunk(prev, streamingId, streamConvId, taken.piece)
          );
          if (pacer.buffer.length > 0 || pacer.draining) {
            scheduleTick();
          } else if (pacer.drainResolve) {
            pacer.drainResolve();
            pacer.drainResolve = null;
          }
        };

        const scheduleTick = (): void => {
          if (pacer.timer) return;
          // While draining we accelerate to the floor — server has already
          // delivered the full text, so finishing the visual catch-up
          // shouldn't add perceptible latency.
          const dt = pacer.draining
            ? PACER_MIN_MS
            : nextDelayMs(pacer.buffer.length);
          pacer.timer = setTimeout(tickPacer, dt);
        };

        try {
          const result = await apiClientRef.current.sendMessage(
            {
              message: trimmed,
              conversationId: activeConversationId ?? undefined,
              currentContext,
            },
            {
              // Server confirmed the user message + (possibly new)
              // conversation id before any token arrives. Promote the
              // optimistic user bubble to the persisted one and start
              // tracking the streaming assistant id under the right
              // conversation id. Sequence guard prevents stale events
              // from polluting a conversation the user already left.
              onStart: ({
                conversationId,
                userMessage,
              }: {
                conversationId: string;
                userMessage: ChatbotMessage;
              }) => {
                if (!mountedRef.current || sendSeq !== messagesSeqRef.current) {
                  return;
                }
                streamConvId = conversationId;
                setMessages((prev: ChatbotMessage[]) =>
                  prev.map((m: ChatbotMessage) =>
                    m.id === placeholderId ? userMessage : m
                  )
                );
                setActiveConversationId(conversationId);
              },
              // Enqueue each chunk into the word-pacer instead of dumping
              // it straight into the bubble. The pacer drips one word per
              // tick (`PACER_BASE_MS` cadence, accelerating with buffer
              // size) so the assistant bubble grows like a typewriter
              // even when Gemini delivers 200 chars at once.
              onToken: (chunk: string) => {
                if (!mountedRef.current || sendSeq !== messagesSeqRef.current) {
                  return;
                }
                // Hide the "typing" indicator as soon as the first token
                // arrives — the streaming bubble itself takes over as
                // the visual cue from here on.
                setIsSending(false);
                pacer.buffer += chunk;
                scheduleTick();
              },
            }
          );
          if (!mountedRef.current) return;

          if (sendSeq !== messagesSeqRef.current) {
            // User switched conversations mid-flight. The server still
            // persisted the new conversation — refresh the list so it
            // appears in history — but do NOT touch the currently visible
            // messages or `activeConversationId` (that would silently
            // yank the user back to the old conversation).
            if (pacer.timer) {
              clearTimeout(pacer.timer);
              pacer.timer = null;
            }
            pacer.buffer = '';
            void loadConversations();
            return;
          }

          // Drain any words still buffered before swapping the streaming
          // bubble for the canonical persisted message — otherwise the
          // user sees a sudden jump from word-paced render to full text.
          if (pacer.buffer.length > 0 || pacer.timer) {
            pacer.draining = true;
            await new Promise<void>((resolve) => {
              pacer.drainResolve = resolve;
              scheduleTick();
            });
          }

          // Final swap: replace any remaining placeholder + streaming
          // bubble with the canonical persisted pair.
          setMessages((prev) =>
            replacePlaceholder(prev, placeholderId, streamingId, result)
          );
          setActiveConversationId(result.conversationId);

          // Refresh conversations list so title / lastMessageAt update
          void loadConversations();
        } catch (err) {
          if (!mountedRef.current) return;
          // Stop the pacer immediately on error — partial text is
          // discarded together with the placeholder.
          if (pacer.timer) {
            clearTimeout(pacer.timer);
            pacer.timer = null;
          }
          pacer.buffer = '';
          pacer.draining = false;
          // Local cast: TS narrows `pacer.drainResolve` to `null` based on
          // earlier `= null` assignments in this function, even though the
          // Promise executor sets it to a real resolver. Casting to the
          // declared union restores the truthy check.
          const errorDrainResolve =
            pacer.drainResolve as PacerState['drainResolve'];
          pacer.drainResolve = null;
          if (errorDrainResolve) errorDrainResolve();
          // Only clean up the placeholder / surface the error if the user
          // is still viewing the conversation this send belongs to.
          if (sendSeq !== messagesSeqRef.current) return;
          setMessages((prev) =>
            removePlaceholder(prev, placeholderId, streamingId)
          );
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
