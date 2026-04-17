import { RobotIcon, UserIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import ChatbotContentRenderer from './ChatbotContentRenderer';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

/**
 * Props for a single message bubble
 */
export interface ChatbotMessageProps {
  message: ChatbotMessageType;
  className?: string;
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
}: ChatbotMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <RobotIcon size={18} weight="fill" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-2',
          isUser
            ? 'rounded-2xl rounded-br-md bg-primary-500 text-white'
            : 'rounded-2xl rounded-bl-md bg-background-100 text-text-900'
        )}
      >
        {isUser ? (
          <Text size="sm" className="whitespace-pre-wrap break-words">
            {message.content}
          </Text>
        ) : (
          <ChatbotContentRenderer content={message.content} />
        )}
        <Text
          size="2xs"
          className={cn(
            'mt-1 block text-right',
            isUser ? 'text-white/70' : 'text-text-400'
          )}
        >
          {formatTimestamp(message.createdAt)}
        </Text>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
          <UserIcon size={18} weight="fill" />
        </div>
      )}
    </div>
  );
}
