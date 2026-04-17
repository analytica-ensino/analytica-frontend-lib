import { TrashIcon, PlusIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import EmptyState from '../EmptyState/EmptyState';
import { SkeletonText } from '../Skeleton/Skeleton';
import { cn } from '../../utils/utils';
import type { ChatbotConversation } from '../../types/chatbot';

/**
 * Props for the list of past chatbot conversations
 */
export interface ChatbotConversationListProps {
  conversations: ChatbotConversation[];
  activeConversationId: string | null;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onStartNew: () => void;
  className?: string;
}

/**
 * Format the conversation timestamp in pt-BR (date + time).
 */
function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Sidebar-like drawer listing the student's past conversations. Clicking
 * a row activates it; the trash icon deletes it after confirmation.
 */
export default function ChatbotConversationList({
  conversations,
  activeConversationId,
  isLoading = false,
  onSelect,
  onDelete,
  onStartNew,
  className,
}: ChatbotConversationListProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-background-200 bg-white',
        className
      )}
    >
      <div className="p-3">
        <Button
          variant="solid"
          action="primary"
          size="small"
          onClick={onStartNew}
          iconLeft={<PlusIcon size={14} />}
          className="w-full"
        >
          Nova conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="space-y-2 px-2">
            <SkeletonText />
            <SkeletonText />
            <SkeletonText />
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Sem conversas ainda"
              description="Comece sua primeira conversa com o assistente."
            />
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      'group flex items-start gap-2 rounded-md px-2 py-2 transition-colors',
                      isActive ? 'bg-primary-50' : 'hover:bg-background-100'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className="flex-1 text-left"
                    >
                      <Text
                        size="sm"
                        weight="semibold"
                        className="truncate text-text-900"
                      >
                        {c.title || 'Conversa sem título'}
                      </Text>
                      <Text size="2xs" className="text-text-400">
                        {formatDate(c.lastMessageAt)}
                      </Text>
                    </button>
                    <IconButton
                      size="sm"
                      aria-label={`Excluir conversa ${c.title || ''}`.trim()}
                      onClick={() => onDelete(c.id)}
                      icon={<TrashIcon size={14} />}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
