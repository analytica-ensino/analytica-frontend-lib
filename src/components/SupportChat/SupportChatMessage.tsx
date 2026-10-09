import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Sparkle from '../../assets/icons/Sparkle';
import { cn } from '../../utils/utils';
import { getInitials } from '../../utils/getInitials';
import {
  SUPPORT_CHAT_MESSAGE_TYPE,
  SUPPORT_CHAT_SEND_STATUS,
  type SupportChatAttachment,
  type SupportChatAuthor,
  type SupportChatFaqReference,
  type SupportChatMessageType,
  type SupportChatSendStatus,
} from '../../types/supportChat';

/**
 * Props for a support (SAC) chat message
 */
export interface SupportChatMessageProps {
  /** Who authored the message (user, AI assistant, agent or internal note) */
  type: SupportChatMessageType;
  /** Message body; line breaks are preserved */
  text: string;
  /** Already formatted time, e.g. "13:52" */
  time: string;
  /** Author shown in the avatar (and as the name for agents/notes) */
  author?: SupportChatAuthor;
  /** FAQ the AI answer was based on (AI messages only) */
  faq?: SupportChatFaqReference;
  /** Files attached to the message */
  attachments?: SupportChatAttachment[];
  /** Delivery status; defaults to SENT */
  status?: SupportChatSendStatus;
  /** Called when the user clicks "Tentar novamente" on a failed message */
  onRetry?: () => void;
  /** Extra classes for the root element */
  className?: string;
}

/** Bubble classes for each message type */
const BUBBLE_CLASSES: Record<SupportChatMessageType, string> = {
  [SUPPORT_CHAT_MESSAGE_TYPE.USER]: 'bg-background-100',
  [SUPPORT_CHAT_MESSAGE_TYPE.AI]: 'bg-primary-50/60 border border-primary-100',
  [SUPPORT_CHAT_MESSAGE_TYPE.AGENT]: 'bg-primary-950',
  [SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE]:
    'bg-exam-3 border border-warning-200',
};

/**
 * Avatar for the virtual assistant (sparkle icon)
 */
function AiAvatar() {
  return (
    <div
      role="img"
      aria-label="Assistente virtual"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-800"
    >
      <Sparkle
        width={12}
        height={12}
        aria-hidden="true"
        data-testid="support-chat-ai-sparkle"
      />
    </div>
  );
}

/**
 * Avatar with the author's initials
 */
function InitialsAvatar({ author }: Readonly<{ author: SupportChatAuthor }>) {
  return (
    <div
      role="img"
      aria-label={author.name}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-800',
        author.avatarClassName
      )}
    >
      <Text size="2xs" weight="bold" color="text-white" aria-hidden="true">
        {author.initials ?? getInitials(author.name)}
      </Text>
    </div>
  );
}

/**
 * Single attachment: image thumbnail or generic file icon, plus the file name
 */
function AttachmentItem({
  attachment,
  isDark,
}: Readonly<{ attachment: SupportChatAttachment; isDark: boolean }>) {
  const isImage = attachment.mimeType?.startsWith('image/') ?? false;
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex max-w-full items-center gap-2"
    >
      {isImage ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <FileIcon
          size={20}
          aria-hidden="true"
          className={cn('shrink-0', isDark ? 'text-white' : 'text-text-700')}
        />
      )}
      <Text
        as="span"
        size="xs"
        color={isDark ? 'text-white' : 'text-text-700'}
        className="truncate underline"
      >
        {attachment.name}
      </Text>
    </a>
  );
}

/**
 * Support (SAC) chat message bubble.
 *
 * - USER: light gray bubble on the left with an initials avatar
 * - AI: light blue bubble on the left labeled "ASSISTENTE VIRTUAL", with an optional FAQ reference
 * - AGENT: dark blue bubble on the right with the agent name and avatar
 * - INTERNAL_NOTE: yellow bubble on the right, visible only in the backoffice
 */
export default function SupportChatMessage({
  type,
  text,
  time,
  author,
  faq,
  attachments,
  status = SUPPORT_CHAT_SEND_STATUS.SENT,
  onRetry,
  className,
}: Readonly<SupportChatMessageProps>) {
  const isAi = type === SUPPORT_CHAT_MESSAGE_TYPE.AI;
  const isAgent = type === SUPPORT_CHAT_MESSAGE_TYPE.AGENT;
  const isNote = type === SUPPORT_CHAT_MESSAGE_TYPE.INTERNAL_NOTE;
  const isRight = isAgent || isNote;
  const isSending = status === SUPPORT_CHAT_SEND_STATUS.SENDING;
  const isFailed = status === SUPPORT_CHAT_SEND_STATUS.FAILED;

  const avatar = isAi ? (
    <AiAvatar />
  ) : (
    author && <InitialsAvatar author={author} />
  );

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isRight ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isRight && avatar}

      <div
        className={cn(
          'flex min-w-0 max-w-[85%] flex-col gap-1 sm:max-w-[498px]',
          isRight ? 'items-end' : 'items-start'
        )}
      >
        <div
          data-testid="support-chat-message-bubble"
          className={cn(
            'flex max-w-full flex-col gap-1.5 rounded-xl px-3.5 py-2.5',
            BUBBLE_CLASSES[type],
            isSending && 'opacity-60'
          )}
        >
          {isAi && (
            <Text
              size="2xs"
              weight="bold"
              color="text-primary-800"
              className="uppercase tracking-wider"
            >
              Assistente virtual
            </Text>
          )}

          {isNote && (
            <Text
              size="2xs"
              weight="bold"
              color="text-warning-700"
              className="uppercase tracking-wider"
            >
              {author ? `Nota interna · ${author.name}` : 'Nota interna'}
            </Text>
          )}

          {isAgent && author && (
            <Text size="2xs" weight="bold" color="text-primary-100">
              {author.name}
            </Text>
          )}

          <Text
            size="sm"
            color={isAgent ? 'text-white' : 'text-text-950'}
            className="whitespace-pre-wrap break-words"
          >
            {text}
          </Text>

          {Array.isArray(attachments) && attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              {attachments.map((attachment) => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  isDark={isAgent}
                />
              ))}
            </div>
          )}

          {isAi && faq && (
            <div className="self-stretch border-t border-primary-100 pt-1.5">
              {faq.onClick ? (
                <Button
                  variant="link"
                  size="extra-small"
                  onClick={faq.onClick}
                  className="p-0 text-left font-normal text-primary-800"
                >
                  Baseado na FAQ: {faq.title}
                </Button>
              ) : (
                <Text size="xs" color="text-primary-800">
                  Baseado na FAQ: {faq.title}
                </Text>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFailed && (
            <>
              <WarningCircleIcon
                size={14}
                aria-hidden="true"
                className="text-error-600"
              />
              <Text as="span" size="2xs" color="text-error-600">
                Falha no envio
              </Text>
              {onRetry && (
                <Button
                  variant="link"
                  action="negative"
                  size="extra-small"
                  onClick={onRetry}
                  className="p-0"
                >
                  Tentar novamente
                </Button>
              )}
            </>
          )}
          {isSending && (
            <Text as="span" size="2xs" color="text-text-400">
              Enviando…
            </Text>
          )}
          <Text as="span" size="2xs" color="text-text-400">
            {time}
          </Text>
        </div>
      </div>

      {isRight && avatar}
    </div>
  );
}
