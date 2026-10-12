import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  ChatCircleDotsIcon,
  MinusIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import { useSupportChat } from '../../hooks/useSupportChat';
import { SupportType } from '../../types/support';
import {
  SUPPORT_CHAT_AUTHOR,
  type SupportChatAdapter,
  type SupportChatFlags,
  type SupportChatMessage,
  type SupportChatTheme,
  type SupportChatUser,
} from '../../types/supportChat';
import { cn } from '../../utils/utils';

/** Visibility of the chat window */
export type SupportChatWindowState = 'closed' | 'open' | 'minimized';

export interface SupportChatWidgetProps {
  /** Data layer (createMockSupportChatAdapter for now) */
  adapter: SupportChatAdapter;
  /** App the widget runs in, sent with the ticket (e.g. "login", "backoffice") */
  channel: string;
  institutionId?: string;
  /** Logged user; omit for visitors */
  user?: SupportChatUser;
  flags?: SupportChatFlags;
  theme?: SupportChatTheme;
  onOpen?: () => void;
  onSend?: (message: SupportChatMessage) => void;
  /** Called when the conversation is closed (not when minimized) */
  onClose?: () => void;
}

/** The requester side of the conversation (user or visitor) */
const isOwnMessage = (message: SupportChatMessage) =>
  message.senderRole === SUPPORT_CHAT_AUTHOR.USER ||
  message.senderRole === SUPPORT_CHAT_AUTHOR.GUEST;

const formatTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const MessageBubble = ({ message }: { message: SupportChatMessage }) => {
  const own = isOwnMessage(message);
  return (
    <div
      className={cn('flex flex-col mb-3', own ? 'items-end' : 'items-start')}
    >
      {!own && (
        <Text size="xs" className="text-text-500 mb-1">
          {message.senderName}
        </Text>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap break-words',
          own
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-background-100 text-text-900 rounded-bl-md'
        )}
      >
        <Text size="sm" color="">
          {message.content}
        </Text>
      </div>
      <Text size="xs" className="text-text-400 mt-1">
        {formatTime(message.createdAt)}
      </Text>
    </div>
  );
};

/**
 * Floating support chat (native support, the Zendesk replacement).
 * Renders nothing when disabled or when the institution uses Zendesk.
 */
export const SupportChatWidget = ({
  flags,
  ...props
}: SupportChatWidgetProps) => {
  const hidden =
    flags?.enabled === false ||
    flags?.chat === false ||
    flags?.supportType === SupportType.ZENDESK;

  if (hidden) return null;
  return <SupportChatWidgetContent {...props} />;
};

const SupportChatWidgetContent = ({
  adapter,
  channel,
  institutionId,
  user,
  theme,
  onOpen,
  onSend,
  onClose,
}: Omit<SupportChatWidgetProps, 'flags'>) => {
  const [windowState, setWindowState] =
    useState<SupportChatWindowState>('closed');
  const [draft, setDraft] = useState('');
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const seenCount = useRef(0);

  const { messages, sending, error, closed, send, reset } = useSupportChat({
    adapter,
    channel,
    institutionId,
    user,
  });

  const isOpen = windowState === 'open';
  const title = theme?.title ?? 'Suporte';
  const left = theme?.position === 'bottom-left';
  const accentStyle = theme?.primaryColor
    ? { backgroundColor: theme.primaryColor }
    : undefined;

  // Count the support replies that arrive while the window is not visible
  useEffect(() => {
    const fresh = messages.slice(seenCount.current);
    seenCount.current = messages.length;
    if (isOpen) return;
    const replies = fresh.filter((message) => !isOwnMessage(message)).length;
    if (replies) setUnread((count) => count + replies);
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setUnread(0);
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight });
  }, [isOpen, messages]);

  const open = () => {
    setWindowState('open');
    onOpen?.();
  };

  const close = () => {
    setWindowState('closed');
    setDraft('');
    setUnread(0);
    seenCount.current = 0;
    reset();
    onClose?.();
  };

  const submit = async () => {
    const content = draft;
    if (!content.trim()) return;
    setDraft('');
    const message = await send(content);
    if (message) onSend?.(message);
    else setDraft(content);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 z-50 flex flex-col gap-3',
        left ? 'left-4 items-start' : 'right-4 items-end'
      )}
    >
      {isOpen && (
        <section
          role="dialog"
          aria-label={title}
          className="w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] flex flex-col bg-background rounded-2xl shadow-lg border border-border-100 overflow-hidden"
        >
          <header
            className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white"
            style={accentStyle}
          >
            <Text size="md" weight="semibold" color="">
              {title}
            </Text>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Minimizar"
                onClick={() => setWindowState('minimized')}
                className="p-1 rounded hover:bg-white/20"
              >
                <MinusIcon size={18} />
              </button>
              <button
                type="button"
                aria-label="Encerrar conversa"
                onClick={close}
                className="p-1 rounded hover:bg-white/20"
              >
                <XIcon size={18} />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <Text size="sm" className="text-text-500 text-center mt-8">
                Olá! Como podemos te ajudar?
              </Text>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>

          {error && (
            <Text
              size="xs"
              role="alert"
              className="px-4 py-2 text-error-700 bg-error-50"
            >
              {error}
            </Text>
          )}

          {closed ? (
            <Text
              size="sm"
              className="px-4 py-3 text-text-500 text-center border-t border-border-100"
            >
              Este atendimento foi encerrado.
            </Text>
          ) : (
            <form
              className="flex items-end gap-2 px-3 py-3 border-t border-border-100"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <textarea
                aria-label="Mensagem"
                placeholder="Digite sua mensagem"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-xl border border-border-300 px-3 py-2 text-sm text-text-900 focus:outline-none focus:border-primary-500 max-h-28"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={sending || !draft.trim()}
                className="p-2 rounded-full bg-primary-500 text-white disabled:opacity-50"
                style={accentStyle}
              >
                <PaperPlaneTiltIcon size={18} />
              </button>
            </form>
          )}
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          aria-label={`Abrir ${title.toLowerCase()}`}
          onClick={open}
          className="relative w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center hover:brightness-110"
          style={accentStyle}
        >
          <ChatCircleDotsIcon size={28} />
          {unread > 0 && (
            <span
              aria-label={`${unread} novas mensagens`}
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error-500 text-white text-xs flex items-center justify-center"
            >
              {unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
