import { useEffect, useRef } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import ChatbotMessage from './ChatbotMessage';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

/**
 * Distance from the bottom (px) below which we treat the user as
 * "still following the conversation" and keep auto-scrolling. If the
 * user has scrolled up beyond this threshold, we leave them where they
 * are — pulling them back on every streamed word would be hostile UX.
 */
const STICKY_BOTTOM_THRESHOLD_PX = 80;

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
 * Vertical list of messages with auto-scroll that follows the streaming
 * assistant bubble word-by-word, throttled via `requestAnimationFrame`
 * so the ~30 word/s pacer doesn't fire one smooth-scroll per tick.
 *
 * The auto-scroll respects the user's intent: if they scrolled up beyond
 * `STICKY_BOTTOM_THRESHOLD_PX` we stop following. Sending a new message
 * (length changes) always re-anchors to the bottom — that's an explicit
 * action, not passive growth.
 */
export default function ChatbotMessageList({
  messages,
  isSending = false,
  isLoading = false,
  emptyHint = 'Comece a conversa enviando uma pergunta.',
  className,
}: Readonly<ChatbotMessageListProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const prevLengthRef = useRef(messages.length);

  // React to both message-count changes AND content growth on the last
  // bubble. The pacer mutates the last assistant message's content while
  // streaming, so depending only on `messages.length` would freeze the
  // viewport while the bubble grows downward off-screen.
  const lastContentLen =
    messages.length > 0 ? messages[messages.length - 1].content.length : 0;

  useEffect(() => {
    // Skip the scroll on initial render — otherwise scrollIntoView could
    // yank the page viewport before the panel is visible.
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevLengthRef.current = messages.length;
      return;
    }

    const container = containerRef.current;
    const bottom = bottomRef.current;
    if (!container || !bottom) return;

    const lengthGrew = messages.length > prevLengthRef.current;
    prevLengthRef.current = messages.length;

    // Respect the user's scroll position. A new message (length change)
    // always re-anchors — they just took an action and expect to see
    // the result. Mid-stream growth only follows if the user is already
    // near the bottom.
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (!lengthGrew && distanceFromBottom > STICKY_BOTTOM_THRESHOLD_PX) {
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      bottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [messages.length, isSending, lastContentLen]);

  const showEmpty = !isLoading && messages.length === 0 && !isSending;

  return (
    <div
      ref={containerRef}
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
