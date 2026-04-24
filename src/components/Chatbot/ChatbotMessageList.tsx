import { useEffect, useRef } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import ChatbotMessage from './ChatbotMessage';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

/**
 * Props for the scrollable list of messages
 */
export interface ChatbotMessageListProps {
  messages: ChatbotMessageType[];
  isSending?: boolean;
  isLoading?: boolean;
  emptyHint?: string;
  className?: string;
}

/**
 * Vertical list of messages with auto-scroll to bottom on new items.
 */
export default function ChatbotMessageList({
  messages,
  isSending = false,
  isLoading = false,
  emptyHint = 'Comece a conversa enviando uma pergunta.',
  className,
}: Readonly<ChatbotMessageListProps>) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    // Skip the scroll on initial render — otherwise scrollIntoView could
    // yank the page viewport before the panel is visible. Only auto-scroll
    // on subsequent updates (new message, typing indicator changes).
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, isSending]);

  const showEmpty = !isLoading && messages.length === 0 && !isSending;

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-3',
        'bg-background-50',
        className
      )}
    >
      {showEmpty && (
        <div className="flex h-full items-center justify-center">
          <Text size="sm" className="text-center text-text-400">
            {emptyHint}
          </Text>
        </div>
      )}
      {messages.map((msg) => (
        <ChatbotMessage key={msg.id} message={msg} />
      ))}
      {isSending && (
        <div className="flex justify-start">
          <ChatbotTypingIndicator />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
