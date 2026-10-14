import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ImageIcon } from '@phosphor-icons/react/dist/csr/Image';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import Chips from '../Chips/Chips';
import TextArea from '../TextArea/TextArea';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Text from '../Text/Text';
import {
  SUPPORT_CHAT_REPLY_MODE,
  type SupportChatReplyMode,
} from '../../types/supportChat';
import { cn } from '../../utils/utils';

/**
 * Props of the SupportChatComposer component
 */
export interface SupportChatComposerProps {
  /** Called with the text and the chosen mode; the field is cleared afterwards */
  onSend: (data: { text: string; mode: SupportChatReplyMode }) => void;
  /** Mode selected when the composer mounts (default: reply to the user) */
  defaultMode?: SupportChatReplyMode;
  /** Called when the agent switches between reply and internal note */
  onModeChange?: (mode: SupportChatReplyMode) => void;
  /** Images picked with the image button; without it the button is hidden */
  onAttachImages?: (files: File[]) => void;
  /** FAQ button; without it the button is hidden */
  onFaqClick?: () => void;
  /** Blocks sending (e.g. while a reply is being sent) */
  disabled?: boolean;
  /** Placeholder of the text field */
  placeholder?: string;
  /** Extra classes for the root (it takes the full width of its parent) */
  className?: string;
}

/** Mode chips, in display order */
const MODE_OPTIONS: ReadonlyArray<{
  mode: SupportChatReplyMode;
  label: string;
}> = [
  { mode: SUPPORT_CHAT_REPLY_MODE.USER, label: 'Resposta ao usuário' },
  { mode: SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE, label: 'Nota interna' },
];

/**
 * Box where a support agent answers a ticket: chooses between replying to
 * the user and writing an internal note, types the text and sends it.
 * Enter sends and Shift+Enter breaks the line.
 *
 * @example
 * ```tsx
 * <SupportChatComposer
 *   onSend={({ text, mode }) => sendReply(text, mode)}
 *   onAttachImages={(files) => upload(files)}
 *   onFaqClick={openFaq}
 * />
 * ```
 */
const SupportChatComposer = ({
  onSend,
  defaultMode = SUPPORT_CHAT_REPLY_MODE.USER,
  onModeChange,
  onAttachImages,
  onFaqClick,
  disabled = false,
  placeholder = 'Escreva sua resposta…',
  className,
}: SupportChatComposerProps) => {
  const [mode, setMode] = useState<SupportChatReplyMode>(defaultMode);
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !disabled && text.trim().length > 0;

  const selectMode = (next: SupportChatReplyMode) => {
    if (next === mode) return;
    setMode(next);
    onModeChange?.(next);
  };

  const send = () => {
    if (!canSend) return;
    onSend({ text: text.trim(), mode });
    setText('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter and IME composition keep the line break
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Reset so picking the same file again still fires onChange
    event.target.value = '';
    if (files.length > 0) onAttachImages?.(files);
  };

  return (
    <div
      className={cn('flex w-full flex-col gap-3', className)}
      data-testid="support-chat-composer"
    >
      <div className="flex flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => (
          <Chips
            key={option.mode}
            selected={mode === option.mode}
            aria-pressed={mode === option.mode}
            onClick={() => selectMode(option.mode)}
          >
            {option.label}
          </Chips>
        ))}
      </div>

      <TextArea
        aria-label="Resposta"
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoResize
        className="rounded-lg"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {onAttachImages && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                data-testid="support-chat-composer-file-input"
                onChange={handleFiles}
              />
              <IconButton
                icon={<ImageIcon size={20} />}
                size="sm"
                aria-label="Anexar imagem"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
              />
            </>
          )}
          {onFaqClick && (
            <Button
              variant="link"
              size="small"
              iconLeft={<LinkIcon size={16} />}
              onClick={onFaqClick}
              disabled={disabled}
              className="p-0 font-normal text-text-700"
            >
              FAQ
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Text size="xs" color="text-text-500">
            Enter envia · Shift+Enter quebra linha
          </Text>
          <Button
            variant="solid"
            action="primary"
            size="medium"
            onClick={send}
            disabled={!canSend}
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChatComposer;
