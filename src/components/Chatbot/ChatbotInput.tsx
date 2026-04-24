import { useCallback, useState, type KeyboardEvent } from 'react';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import { cn } from '../../utils/utils';

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 120;

/**
 * Props for the chatbot text input
 */
export interface ChatbotInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Auto-resizing textarea + send button. Enter sends, Shift+Enter creates a
 * new line, as is standard for chat UIs.
 *
 * Uses the library's `<TextArea>` component (design-system compliant)
 * with its built-in `autoResize` — no manual DOM height manipulation.
 */
export default function ChatbotInput({
  onSend,
  disabled = false,
  placeholder = 'Pergunte ao assistente...',
  className,
}: Readonly<ChatbotInputProps>) {
  const [value, setValue] = useState('');

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [disabled, onSend, value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Ignore Enter while an IME composition is in progress (e.g. typing
      // Japanese/Chinese), otherwise confirming the composition would
      // submit the message prematurely.
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  const isSendDisabled = disabled || value.trim().length === 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-background-200 bg-background p-3',
        className
      )}
    >
      {/* `TextArea` wraps its <textarea> in a flex column, so `flex-1`
          needs to live on this outer wrapper — passing it via
          `className` would only affect the inner element. */}
      <div className="flex-1 min-w-0">
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoResize
          minHeight={MIN_HEIGHT}
          aria-label="Mensagem para o assistente"
          className="w-full"
          style={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}
        />
      </div>
      {/* Use the library's `<Button>` with `variant="raw"` (same pattern
          as `ChatbotFab`) so the send action goes through the shared
          component. `raw` keeps custom sizing/shape without inheriting
          the default solid/outline/link classes. */}
      <Button
        variant="raw"
        type="button"
        onClick={submit}
        disabled={isSendDisabled}
        aria-label="Enviar mensagem"
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          'bg-primary-500 text-white transition-colors',
          'hover:bg-primary-600',
          'disabled:bg-background-200 disabled:text-text-500 disabled:cursor-not-allowed',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300'
        )}
      >
        <PaperPlaneTiltIcon size={20} weight="fill" />
      </Button>
    </div>
  );
}
