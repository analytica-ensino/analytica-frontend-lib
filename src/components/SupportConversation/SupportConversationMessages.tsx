import { useEffect, useRef } from 'react';
import Text from '../Text/Text';
import SupportChatMessage from '../SupportChat/SupportChatMessage';
import SupportChatEvent from '../SupportChat/SupportChatEvent';
import { cn } from '../../utils/utils';
import { SUPPORT_CHAT_EVENT_TYPE } from '../../types/supportChat';
import {
  SUPPORT_CONVERSATION_ITEM,
  type SupportConversationItem,
} from '../../types/supportConversation';

/**
 * Props of the SupportConversationMessages component
 */
export interface SupportConversationMessagesProps {
  /** Timeline in display order (oldest first) */
  items: SupportConversationItem[];
  /** First load: shows the loading text instead of the timeline */
  loading?: boolean;
  /** Text when the ticket has no item yet */
  emptyText?: string;
  className?: string;
}

/** Renders one item of the timeline with the matching chat piece */
const ConversationItem = ({ item }: { item: SupportConversationItem }) => {
  switch (item.kind) {
    case SUPPORT_CONVERSATION_ITEM.DATE:
      return (
        <SupportChatEvent
          type={SUPPORT_CHAT_EVENT_TYPE.DATE}
          text={item.label}
        />
      );
    case SUPPORT_CONVERSATION_ITEM.SYSTEM:
      return (
        <SupportChatEvent
          type={SUPPORT_CHAT_EVENT_TYPE.NEUTRAL}
          text={item.text}
          time={item.time}
        />
      );
    case SUPPORT_CONVERSATION_ITEM.TRANSFER:
      return (
        <SupportChatEvent
          type={SUPPORT_CHAT_EVENT_TYPE.TRANSFER}
          text={item.text}
          time={item.time}
        />
      );
    default:
      return (
        <SupportChatMessage
          type={item.type}
          text={item.text}
          time={item.time}
          author={item.author}
          faq={item.faq}
          attachments={item.attachments}
          status={item.status}
          onRetry={item.onRetry}
        />
      );
  }
};

/**
 * Scrollable timeline of the support conversation: date separators, system
 * and handoff events and the messages of the user, the AI, the agents and
 * the internal notes.
 *
 * It is the only part of the conversation that scrolls, and it starts at the
 * latest message: it scrolls to the bottom on mount and whenever the
 * timeline grows.
 */
export default function SupportConversationMessages({
  items,
  loading = false,
  emptyText = 'Nenhuma mensagem neste atendimento ainda.',
  className,
}: Readonly<SupportConversationMessagesProps>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    scroll?.scrollTo?.({ top: scroll.scrollHeight });
  }, [items.length, loading]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Mensagens do atendimento"
      aria-busy={loading}
      data-testid="support-conversation-messages"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4',
        className
      )}
    >
      {loading && (
        <Text size="sm" color="text-text-500" className="text-center">
          Carregando conversa…
        </Text>
      )}
      {!loading && items.length === 0 && (
        <Text size="sm" color="text-text-500" className="text-center">
          {emptyText}
        </Text>
      )}
      {!loading &&
        items.map((item) => <ConversationItem key={item.id} item={item} />)}
    </div>
  );
}
