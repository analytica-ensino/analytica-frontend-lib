import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatEvent,
  type SupportChatMessage,
  type SupportChatTicket,
  type SupportChatUser,
} from '../types/supportChat';

export interface UseSupportChatConfig {
  adapter: SupportChatAdapter;
  channel: string;
  institutionId?: string;
  user?: SupportChatUser;
}

export interface UseSupportChatReturn {
  ticket: SupportChatTicket | null;
  messages: SupportChatMessage[];
  sending: boolean;
  error: string | null;
  /** Ticket resolved: no more messages can be sent */
  closed: boolean;
  /** Send a message; the first one opens the ticket */
  send: (content: string) => Promise<SupportChatMessage | null>;
  /** Forget the current conversation */
  reset: () => void;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Não foi possível enviar a mensagem';

/** Add or replace a message, keeping the list ordered by arrival */
const upsertMessage = (
  list: SupportChatMessage[],
  message: SupportChatMessage
): SupportChatMessage[] =>
  list.some((item) => item.id === message.id)
    ? list.map((item) => (item.id === message.id ? message : item))
    : [...list, message];

/**
 * State of a support conversation on top of a SupportChatAdapter.
 * The REST-like calls write; the subscription only applies the events,
 * so a message received both ways is stored once.
 */
export const useSupportChat = ({
  adapter,
  channel,
  institutionId,
  user,
}: UseSupportChatConfig): UseSupportChatReturn => {
  const [ticket, setTicket] = useState<SupportChatTicket | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const ticketId = ticket?.id;

  useEffect(() => {
    if (!ticketId) return;

    const handleEvent = (event: SupportChatEvent) => {
      switch (event.type) {
        case 'new_message':
          setMessages((list) => upsertMessage(list, event.payload.message));
          break;
        case 'message_updated':
          setMessages((list) =>
            list.map((item) =>
              item.id === event.payload.messageId
                ? { ...item, content: event.payload.content }
                : item
            )
          );
          break;
        case 'ticket_updated': {
          const { ticketId: id, ...rest } = event.payload;
          setTicket((current) =>
            current?.id === id ? { ...current, ...rest } : current
          );
          break;
        }
        case 'error':
          setError(event.payload.message);
          break;
      }
    };

    return adapter.subscribe(ticketId, handleEvent);
  }, [adapter, ticketId]);

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || sendingRef.current) return null;

      sendingRef.current = true;
      setSending(true);
      setError(null);
      try {
        if (ticketId) {
          const message = await adapter.sendMessage(ticketId, text);
          setMessages((list) => upsertMessage(list, message));
          return message;
        }

        const started = await adapter.startConversation({
          message: text,
          channel,
          institutionId,
          requesterName: user?.name,
          email: user?.email,
        });
        setTicket(started.ticket);
        setMessages((list) => upsertMessage(list, started.message));
        return started.message;
      } catch (sendError) {
        setError(getErrorMessage(sendError));
        return null;
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [adapter, channel, institutionId, ticketId, user?.email, user?.name]
  );

  const reset = useCallback(() => {
    setTicket(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    ticket,
    messages,
    sending,
    error,
    closed: ticket?.status === SUPPORT_CHAT_STATUS.FECHADO,
    send,
    reset,
  };
};
