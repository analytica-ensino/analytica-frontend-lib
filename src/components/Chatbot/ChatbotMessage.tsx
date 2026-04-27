import { RobotIcon, UserIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import ChatbotContentRenderer from './ChatbotContentRenderer';
import {
  CHATBOT_MESSAGE_ROLES,
  type ChatbotMessage as ChatbotMessageType,
} from '../../types/chatbot';

/**
 * Props for a single message bubble
 */
export interface ChatbotMessageProps {
  message: ChatbotMessageType;
  className?: string;
  /** Optional classes forwarded to the assistant markdown renderer. */
  contentClassName?: string;
}

/**
 * Format a timestamp using pt-BR locale (hour and minute only)
 */
function formatTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Individual chat bubble. User messages are aligned to the right with a
 * primary background; assistant messages sit on the left in a neutral
 * background and pass through markdown / LaTeX renderers.
 */
export default function ChatbotMessage({
  message,
  className,
  contentClassName,
}: Readonly<ChatbotMessageProps>) {
  const isUser = message.role === CHATBOT_MESSAGE_ROLES.USER;
  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <div
          role="img"
          aria-label="Mensagem do assistente"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600"
        >
          <RobotIcon size={18} weight="fill" aria-hidden="true" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-2',
          isUser
            ? 'rounded-2xl rounded-br-md bg-background-200 text-text-900'
            : 'rounded-2xl rounded-bl-md bg-background-100 text-text-900'
        )}
      >
        {isUser ? (
          <Text size="sm" className="whitespace-pre-wrap break-words">
            {message.content}
          </Text>
        ) : (
          <ChatbotContentRenderer
            content={message.content}
            className={contentClassName}
          />
        )}
        <Text size="2xs" className="mt-1 block text-right text-text-400">
          {formatTimestamp(message.createdAt)}
        </Text>
      </div>
      {isUser && (
        <div
          role="img"
          aria-label="Sua mensagem"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white"
        >
          <UserIcon size={18} weight="fill" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
