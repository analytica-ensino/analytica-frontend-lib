import { cn } from '../../utils/utils';

/**
 * Props for the typing indicator shown while the assistant is generating
 * a reply.
 */
export interface ChatbotTypingIndicatorProps {
  className?: string;
}

/**
 * Three animated dots signalling "assistant is typing".
 * Implemented in pure Tailwind — no additional dependencies.
 */
export default function ChatbotTypingIndicator({
  className,
}: ChatbotTypingIndicatorProps) {
  return (
    <div
      role="status"
      aria-label="Assistente digitando"
      className={cn(
        'inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-background-100 px-4 py-3',
        className
      )}
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-text-400" />
    </div>
  );
}
