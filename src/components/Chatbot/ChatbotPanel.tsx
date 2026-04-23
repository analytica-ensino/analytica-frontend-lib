import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CaretUpIcon,
  ListIcon,
  MinusIcon,
  PlusIcon,
  RobotIcon,
  XIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import IconButton from '../IconButton/IconButton';
import { cn } from '../../utils/utils';

const HEADER_ICON_BUTTON_CLASSES =
  '!text-white hover:!bg-white/15 hover:!text-white focus-visible:!ring-white/60';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  // Reset the minimized state every time the panel is reopened so the
  // user always lands on the full conversation view.
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

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
      // Height uses an inline style instead of a Tailwind arbitrary
      // class so host apps don't need to add an `@source` directive
      // for Tailwind v4 to pick up an otherwise uncommon utility.
      style={
        isMinimized ? undefined : { height: 'min(720px, calc(100vh - 3rem))' }
      }
      className={cn(
        // `<dialog open>` comes with `margin: auto` by default; `m-0`
        // resets that so the `fixed` positioning below pins the panel
        // to the bottom-right as intended. The panel sits at the same
        // bottom-right corner as the FAB (the FAB is hidden while the
        // panel is open to avoid stacking).
        'fixed bottom-6 right-6 z-40 m-0',
        // Responsive sizing: fills small viewports without overflowing,
        // yet caps at the intended desktop footprint on larger screens.
        'flex w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl p-0',
        'border border-background-200 bg-white shadow-2xl',
        'sm:max-w-[420px]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 bg-primary-500 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <RobotIcon size={20} weight="fill" />
          </div>
          <div className="flex min-w-0 flex-col">
            <Text
              size="md"
              weight="semibold"
              className="truncate leading-tight text-white"
            >
              Assistente de estudos
            </Text>
            <Text size="2xs" className="truncate leading-tight text-white/80">
              Tire dúvidas enquanto estuda
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              <IconButton
                size="sm"
                aria-label={
                  showHistory ? 'Ocultar histórico' : 'Mostrar histórico'
                }
                onClick={() => setShowHistory((v) => !v)}
                icon={<ListIcon size={18} />}
                className={HEADER_ICON_BUTTON_CLASSES}
              />
              <IconButton
                size="sm"
                aria-label="Nova conversa"
                onClick={onStartNew}
                icon={<PlusIcon size={18} />}
                className={HEADER_ICON_BUTTON_CLASSES}
              />
            </>
          )}
          <IconButton
            size="sm"
            aria-label={
              isMinimized ? 'Expandir assistente' : 'Minimizar assistente'
            }
            aria-expanded={!isMinimized}
            onClick={() => setIsMinimized((v) => !v)}
            icon={
              isMinimized ? <CaretUpIcon size={18} /> : <MinusIcon size={18} />
            }
            className={HEADER_ICON_BUTTON_CLASSES}
          />
          <IconButton
            ref={closeButtonRef}
            size="sm"
            aria-label="Fechar assistente"
            onClick={onClose}
            icon={<XIcon size={18} />}
            className={HEADER_ICON_BUTTON_CLASSES}
          />
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-1 overflow-hidden border-t border-background-200">
          {showHistory && (
            <div className="w-44 shrink-0 border-r border-background-200">
              {historySlot}
            </div>
          )}
          <div className="flex flex-1 flex-col">
            {messagesSlot}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="border-t border-error-200 bg-error-50 px-3 py-2"
              >
                <Text size="xs" className="text-error-700">
                  {errorMessage}
                </Text>
              </div>
            )}
            {inputSlot}
          </div>
        </div>
      )}
    </dialog>
  );
}
