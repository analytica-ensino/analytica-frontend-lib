import { ChatCircleDotsIcon } from '@phosphor-icons/react';
import { cn } from '../../utils/utils';

/**
 * Props for the floating action button that opens the chatbot panel
 */
export interface ChatbotFabProps {
  /** Click handler — opens or toggles the panel */
  onClick: () => void;
  /** Whether the panel is currently open (drives aria + styling) */
  isOpen?: boolean;
  /** Optional unread count badge */
  unreadCount?: number;
  /** Extra tailwind classes */
  className?: string;
}

/**
 * Circular floating action button anchored bottom-right of the viewport.
 * Uses `fixed` so it sits on top of page scroll.
 */
export default function ChatbotFab({
  onClick,
  isOpen = false,
  unreadCount = 0,
  className,
}: ChatbotFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente de estudos'}
      aria-expanded={isOpen}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-primary-500 text-white shadow-lg',
        'transition-all hover:bg-primary-600 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary-300',
        className
      )}
    >
      <ChatCircleDotsIcon size={26} weight="fill" />
      {unreadCount > 0 && (
        <span
          data-testid="chatbot-fab-badge"
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1 text-xs font-bold text-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
