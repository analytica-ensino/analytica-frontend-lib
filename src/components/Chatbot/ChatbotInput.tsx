import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import IconButton from '../IconButton/IconButton';
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
 */
export default function ChatbotInput({
  onSend,
  disabled = false,
  placeholder = 'Pergunte ao assistente...',
  className,
}: Readonly<ChatbotInputProps>) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${MIN_HEIGHT}px`;
    const next = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${next}px`;
  }, []);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    requestAnimationFrame(resize);
  }, [disabled, onSend, resize, value]);

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
        'flex items-end gap-2 border-t border-background-200 bg-white p-3',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        aria-label="Mensagem para o assistente"
        className={cn(
          'flex-1 resize-none rounded-xl border border-background-200 px-3 py-2 text-sm',
          'placeholder:text-text-400',
          'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100',
          'disabled:cursor-not-allowed disabled:bg-background-100'
        )}
        style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
      />
      <IconButton
        icon={<PaperPlaneTiltIcon size={18} weight="fill" />}
        aria-label="Enviar mensagem"
        onClick={submit}
        disabled={isSendDisabled}
      />
    </div>
  );
}
