import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Props for the "is typing" indicator of the support chat
 */
export interface SupportChatTypingIndicatorProps {
  /** Name of who is typing, e.g. "Beatriz" */
  name: string;
  /** Extra classes for the root element */
  className?: string;
}

/** Staggered delays so the three dots bounce in sequence */
const DOT_DELAYS = [
  '[animation-delay:-0.3s]',
  '[animation-delay:-0.15s]',
  '',
] as const;

/**
 * "Fulano está digitando…" row shown at the end of the support chat: a gray
 * bubble with three animated dots followed by the caption.
 *
 * Announced politely to screen readers through the visible caption; the dots
 * are decorative and stop bouncing when the user prefers reduced motion.
 */
export default function SupportChatTypingIndicator({
  name,
  className,
}: Readonly<SupportChatTypingIndicatorProps>) {
  return (
    <output
      aria-live="polite"
      className={cn('flex w-full items-center gap-2', className)}
    >
      <Text
        as="span"
        aria-hidden="true"
        data-testid="support-chat-typing-bubble"
        className="flex items-center gap-0.75 rounded-xl bg-background-100 px-2.5 py-2"
      >
        {DOT_DELAYS.map((delay) => (
          <Text
            as="span"
            key={delay || 'last'}
            data-testid="support-chat-typing-dot"
            className={cn(
              'size-1.25 rounded-full bg-text-400 animate-bounce motion-reduce:animate-none',
              delay
            )}
          />
        ))}
      </Text>
      <Text as="span" size="xs" color="text-text-600">
        {`${name} está digitando…`}
      </Text>
    </output>
  );
}
