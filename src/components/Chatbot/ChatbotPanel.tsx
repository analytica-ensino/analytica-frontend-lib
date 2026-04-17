import { useEffect, useRef, useState, type ReactNode } from 'react';
import { XIcon, ListIcon, PlusIcon, RobotIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';
import IconButton from '../IconButton/IconButton';
import { cn } from '../../utils/utils';

/**
 * Props for the chatbot panel shell
 */
export interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  /** Conversation list passed as a node so the panel stays layout-only */
  historySlot: ReactNode;
  /** Messages list passed as a node (allows easy swap during tests) */
  messagesSlot: ReactNode;
  /** Input area slot (auto-resize textarea + send button) */
  inputSlot: ReactNode;
  /** Optional error banner (string shown above the input) */
  errorMessage?: string | null;
  className?: string;
}

/**
 * Fixed drawer-like panel anchored to the bottom-right of the screen.
 * Splits into optional history sidebar + main conversation area. The
 * panel is purely presentational — state lives in the `useChatbot` hook.
 */
export default function ChatbotPanel({
  isOpen,
  onClose,
  onStartNew,
  historySlot,
  messagesSlot,
  inputSlot,
  errorMessage,
  className,
}: Readonly<ChatbotPanelProps>) {
  const [showHistory, setShowHistory] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  // Escape-key dismissal + focus management: when the panel opens we
  // remember the previously focused element, move focus to the close
  // button, and listen for Escape to close. On close, focus is restored.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      const previous = previouslyFocusedRef.current as HTMLElement | null;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      aria-label="Assistente de estudos"
      className={cn(
        // `<dialog open>` comes with `margin: auto` by default; `m-0`
        // resets that so the `fixed` positioning below pins the panel
        // to the bottom-right as intended.
        'fixed bottom-20 right-6 z-40 m-0',
        'flex h-[600px] w-[380px] flex-col overflow-hidden rounded-xl p-0',
        'border border-background-200 bg-white shadow-2xl',
        'sm:w-[420px]',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-background-200 bg-primary-500 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <RobotIcon size={20} weight="fill" />
          <Text size="md" weight="semibold" className="text-white">
            Assistente de estudos
          </Text>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            aria-label={showHistory ? 'Ocultar histórico' : 'Mostrar histórico'}
            onClick={() => setShowHistory((v) => !v)}
            icon={<ListIcon size={16} />}
          />
          <IconButton
            size="sm"
            aria-label="Nova conversa"
            onClick={onStartNew}
            icon={<PlusIcon size={16} />}
          />
          <IconButton
            ref={closeButtonRef}
            size="sm"
            aria-label="Fechar assistente"
            onClick={onClose}
            icon={<XIcon size={16} />}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showHistory && <div className="w-44 flex-shrink-0">{historySlot}</div>}
        <div className="flex flex-1 flex-col">
          {messagesSlot}
          {errorMessage && (
            <div className="border-t border-error-200 bg-error-50 px-3 py-2">
              <Text size="xs" className="text-error-700">
                {errorMessage}
              </Text>
            </div>
          )}
          {inputSlot}
        </div>
      </div>
    </dialog>
  );
}
