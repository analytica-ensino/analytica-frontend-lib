import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ImageIcon } from '@phosphor-icons/react/dist/csr/Image';
import { ChatTeardropTextIcon } from '@phosphor-icons/react/dist/csr/ChatTeardropText';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { CaretUpIcon } from '@phosphor-icons/react/dist/csr/CaretUp';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import Chips from '../Chips/Chips';
import TextArea from '../TextArea/TextArea';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Text from '../Text/Text';
import {
  SUPPORT_CHAT_REPLY_MODE,
  type SupportChatReplyMode,
} from '../../types/supportChat';
import type { SupportQuickReply } from '../../types/supportConversation';
import { cn } from '../../utils/utils';

/** Ticket status offered by the "Enviar como" split button */
export interface SupportComposerStatusOption {
  value: string;
  label: string;
  /** Color class of the status dot, e.g. `bg-error-500` */
  dotClassName?: string;
}

/**
 * Turns the send button into "Enviar como {status}" with a menu of statuses,
 * like a help desk "Submit as": the main button sends the text keeping the
 * current status; picking a status in the menu sends the text (if any) and
 * moves the ticket to that status right away.
 */
export interface SupportComposerSubmitStatus {
  /** Current status of the ticket */
  value: string;
  options: SupportComposerStatusOption[];
}

/**
 * Props of the SupportChatComposer component
 */
export interface SupportChatComposerProps {
  /** Called with the text and the chosen mode; the field is cleared afterwards */
  onSend: (data: {
    text: string;
    mode: SupportChatReplyMode;
    /** Status picked in the "Enviar como" menu (only with `submitStatus`) */
    status?: string;
  }) => void;
  /** Shows the "Enviar como {status}" split button instead of "Enviar" */
  submitStatus?: SupportComposerSubmitStatus;
  /** Mode selected when the composer mounts (default: reply to the user) */
  defaultMode?: SupportChatReplyMode;
  /** Called when the agent switches between reply and internal note */
  onModeChange?: (mode: SupportChatReplyMode) => void;
  /** Images picked with the image button; without it the button is hidden */
  onAttachImages?: (files: File[]) => void;
  /** Blocks sending (e.g. while a reply is being sent) */
  disabled?: boolean;
  /**
   * Saved replies. With them the "Respostas rápidas" button shows up and
   * typing "/" at the start of the field opens the same menu, filtered by
   * what follows the slash. Picking one replaces the text.
   */
  quickReplies?: SupportQuickReply[];
  /** Opens the FAQ search; without it the "FAQ" button is hidden */
  onOpenFaq?: () => void;
  /** Placeholder of the text field (mentions "/" when there are quick replies) */
  placeholder?: string;
  /** Extra classes for the root (it takes the full width of its parent) */
  className?: string;
}

/** Mode chips, in display order */
/** Starting height of the text field, in px: a single line */
const COMPOSER_MIN_HEIGHT = 48;

/** Quick replies whose title or text contains the query (case-insensitive) */
const filterQuickReplies = (
  replies: SupportQuickReply[],
  query: string
): SupportQuickReply[] => {
  const term = query.trim().toLowerCase();
  if (!term) return replies;
  return replies.filter(
    (reply) =>
      reply.title.toLowerCase().includes(term) ||
      reply.text.toLowerCase().includes(term)
  );
};

const MODE_OPTIONS: ReadonlyArray<{
  mode: SupportChatReplyMode;
  label: string;
}> = [
  { mode: SUPPORT_CHAT_REPLY_MODE.USER, label: 'Resposta ao usuário' },
  { mode: SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE, label: 'Nota interna' },
];

/**
 * Box where a support agent answers a ticket: chooses between replying to
 * the user and writing an internal note (the field turns the note color),
 * types the text and sends it. Enter sends and Shift+Enter breaks the line.
 * With `quickReplies`, "Respostas rápidas" and "/" open the saved replies;
 * with `onOpenFaq`, a "FAQ" button shows up.
 *
 * @example
 * ```tsx
 * <SupportChatComposer
 *   onSend={({ text, mode }) => sendReply(text, mode)}
 *   onAttachImages={(files) => upload(files)}
 * />
 * ```
 */
const SupportChatComposer = ({
  onSend,
  defaultMode = SUPPORT_CHAT_REPLY_MODE.USER,
  onModeChange,
  onAttachImages,
  quickReplies,
  onOpenFaq,
  disabled = false,
  placeholder,
  className,
  submitStatus,
}: SupportChatComposerProps) => {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [mode, setMode] = useState<SupportChatReplyMode>(defaultMode);
  const [text, setText] = useState('');
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasQuickReplies = Boolean(quickReplies?.length);
  const isNote = mode === SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE;
  // "/" at the start of the field opens the menu filtered by what follows it
  const slashQuery =
    hasQuickReplies && text.startsWith('/') ? text.slice(1) : null;
  const menuOpen = !disabled && (quickMenuOpen || slashQuery !== null);
  const visibleReplies = menuOpen
    ? filterQuickReplies(quickReplies ?? [], slashQuery ?? '')
    : [];
  const fieldPlaceholder =
    placeholder ??
    (hasQuickReplies
      ? 'Escreva sua resposta… digite / para respostas rápidas'
      : 'Escreva sua resposta…');

  const pickQuickReply = (reply: SupportQuickReply) => {
    setText(reply.text);
    setQuickMenuOpen(false);
  };

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

  // Picking a status submits right away; the text is optional here
  const submitWithStatus = (status: string) => {
    setStatusMenuOpen(false);
    if (disabled) return;
    onSend({ text: text.trim(), mode, status });
    setText('');
  };

  const currentStatus = submitStatus?.options.find(
    (option) => option.value === submitStatus.value
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      setQuickMenuOpen(false);
      if (slashQuery !== null) setText('');
      return;
    }
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

      <div className="relative">
        {menuOpen && (
          <div
            role="menu"
            aria-label="Respostas rápidas"
            data-testid="support-chat-composer-quick-replies"
            className="absolute bottom-full left-0 z-10 mb-2 flex max-h-60 w-full max-w-md flex-col overflow-y-auto rounded-lg border border-border-100 bg-background p-1 shadow-lg"
          >
            {visibleReplies.length === 0 ? (
              <Text size="sm" color="text-text-500" className="px-3 py-2">
                Nenhuma resposta rápida encontrada
              </Text>
            ) : (
              visibleReplies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="raw"
                  role="menuitem"
                  onClick={() => pickQuickReply(reply)}
                  className="flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-background-50"
                >
                  <Text size="sm" weight="semibold" color="text-text-900">
                    {reply.title}
                  </Text>
                  <Text
                    size="xs"
                    color="text-text-600"
                    className="line-clamp-1"
                  >
                    {reply.text}
                  </Text>
                </Button>
              ))
            )}
          </div>
        )}
        <TextArea
          aria-label="Resposta"
          placeholder={
            isNote ? 'Escreva uma nota para a equipe…' : fieldPlaceholder
          }
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoResize
          // One line to start (24px of text + 24px of padding); it grows as
          // the agent types, instead of the TextArea default of 96px
          minHeight={COMPOSER_MIN_HEIGHT}
          className={cn(
            'rounded-lg',
            // Internal notes get the note color so they are not sent by mistake
            isNote && 'bg-exam-3 border-warning-200'
          )}
          data-mode={mode}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
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
          {hasQuickReplies && (
            <Button
              variant="link"
              action="secondary"
              size="small"
              iconLeft={<ChatTeardropTextIcon size={18} />}
              aria-expanded={menuOpen}
              disabled={disabled}
              onClick={() => setQuickMenuOpen((open) => !open)}
            >
              Respostas rápidas
            </Button>
          )}
          {onOpenFaq && (
            <Button
              variant="link"
              action="secondary"
              size="small"
              iconLeft={<LinkIcon size={18} />}
              disabled={disabled}
              onClick={onOpenFaq}
            >
              FAQ
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Text size="xs" color="text-text-500">
            Enter envia · Shift+Enter quebra linha
          </Text>
          {submitStatus ? (
            <div className="relative flex items-stretch">
              <Button
                variant="solid"
                action="primary"
                size="medium"
                onClick={send}
                disabled={!canSend}
                className="rounded-r-none"
              >
                Enviar como&nbsp;<strong>{currentStatus?.label}</strong>
              </Button>
              <Button
                variant="solid"
                action="primary"
                size="medium"
                aria-label="Escolher status ao enviar"
                aria-haspopup="menu"
                aria-expanded={statusMenuOpen}
                disabled={disabled}
                onClick={() => setStatusMenuOpen((open) => !open)}
                className="rounded-l-none border-l border-l-primary-700 px-3"
              >
                {statusMenuOpen ? (
                  <CaretDownIcon size={16} />
                ) : (
                  <CaretUpIcon size={16} />
                )}
              </Button>
              {statusMenuOpen && (
                <div
                  role="menu"
                  aria-label="Enviar como"
                  data-testid="support-chat-composer-status-menu"
                  className="absolute bottom-full right-0 z-10 mb-2 flex min-w-52 flex-col rounded-lg border border-border-100 bg-background p-1 shadow-lg"
                >
                  {submitStatus.options.map((option) => (
                    <Button
                      key={option.value}
                      variant="raw"
                      role="menuitem"
                      aria-current={
                        option.value === submitStatus.value ? 'true' : undefined
                      }
                      onClick={() => submitWithStatus(option.value)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-background-50"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-3 shrink-0 rounded-sm',
                          option.dotClassName ?? 'bg-text-400'
                        )}
                      />
                      <Text size="sm" weight="medium" color="text-text-900">
                        {option.label}
                      </Text>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="solid"
              action="primary"
              size="medium"
              onClick={send}
              disabled={!canSend}
            >
              Enviar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChatComposer;
