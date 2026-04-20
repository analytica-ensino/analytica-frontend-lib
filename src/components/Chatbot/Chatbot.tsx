import { useRef } from 'react';
import ChatbotFab from './ChatbotFab';
import ChatbotPanel from './ChatbotPanel';
import ChatbotMessageList from './ChatbotMessageList';
import ChatbotInput from './ChatbotInput';
import ChatbotConversationList from './ChatbotConversationList';
import { createUseChatbot } from '../../hooks/useChatbot';
import type {
  ChatbotApiClient,
  ChatbotCurrentContext,
  ChatbotUser,
} from '../../types/chatbot';

/**
 * Props for the root Chatbot component
 */
export interface ChatbotProps {
  /** API client that wraps REST calls — produced by the host app */
  apiClient: ChatbotApiClient;
  /** Authenticated user (used only for UI decoration today) */
  user: ChatbotUser;
  /** Optional context sent with every outgoing message */
  currentContext?: ChatbotCurrentContext;
  /** Extra tailwind classes on the FAB */
  fabClassName?: string;
  /** Extra tailwind classes on the panel */
  panelClassName?: string;
}

/**
 * Analytica student chatbot — floating assistant available in the
 * authenticated area. Composes the Fab + Panel and owns no state of its
 * own: the `useChatbot` hook (bound to the provided `apiClient`) keeps
 * everything in one place.
 *
 * Host apps should render this inside the layout so the FAB is reachable
 * from every page. `currentContext` is a hint (activityId, questionId,
 * lessonId) produced by the host to enrich the AI prompt — it flows
 * untouched to the backend.
 */
export default function Chatbot({
  apiClient,
  user,
  currentContext,
  fabClassName,
  panelClassName,
}: Readonly<ChatbotProps>) {
  // Keep the latest apiClient in a ref — any `apiClient` prop swap (e.g.,
  // after re-auth with a new token-bound client) is seen by the hook on
  // its next call without tearing down internal state.
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  // Bind the factory exactly once, passing a getter so the hook resolves
  // `apiClientRef.current` fresh on every call instead of snapshotting
  // whatever client we saw on first mount.
  const boundHookRef = useRef<ReturnType<typeof createUseChatbot> | null>(null);
  boundHookRef.current ??= createUseChatbot(() => apiClientRef.current);
  const useBoundChatbot = boundHookRef.current;
  const {
    isOpen,
    isSending,
    isLoadingHistory,
    isLoadingMessages,
    errorMessage,
    conversations,
    activeConversationId,
    messages,
    togglePanel,
    closePanel,
    selectConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
  } = useBoundChatbot();

  const firstName = user.name?.trim().split(/\s+/)[0];
  const emptyHint = firstName
    ? `Olá, ${firstName}! Como posso ajudar nos seus estudos?`
    : 'Comece a conversa enviando uma pergunta.';

  const handleSend = (text: string): void => {
    sendMessage(text, currentContext).catch(() => undefined);
  };

  return (
    <>
      <ChatbotFab
        onClick={togglePanel}
        isOpen={isOpen}
        className={fabClassName}
      />
      <ChatbotPanel
        isOpen={isOpen}
        onClose={closePanel}
        onStartNew={startNewConversation}
        className={panelClassName}
        errorMessage={errorMessage}
        historySlot={
          <ChatbotConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            isLoading={isLoadingHistory}
            onSelect={selectConversation}
            onDelete={deleteConversation}
            onStartNew={startNewConversation}
          />
        }
        messagesSlot={
          <ChatbotMessageList
            messages={messages}
            isSending={isSending}
            isLoading={isLoadingMessages}
            emptyHint={emptyHint}
          />
        }
        inputSlot={<ChatbotInput onSend={handleSend} disabled={isSending} />}
      />
    </>
  );
}
