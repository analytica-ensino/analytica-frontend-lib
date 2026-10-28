import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_GUEST_SENDER_ID,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatContact,
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
  /** The conversation was resumed from an earlier page load */
  restored: boolean;
  /** Send a message (text and/or files); the first one opens the ticket */
  send: (content: string, files?: File[]) => Promise<SupportChatMessage | null>;
  /**
   * Save the contact typed in the form shown under the AI request. Resolves
   * false (and sets `error`) when it fails. Undefined when the adapter cannot
   * save it.
   */
  updateContact?: (contact: SupportChatContact) => Promise<boolean>;
  /** Forget the current conversation */
  reset: () => void;
}

let pendingSequence = 0;

/**
 * Message shown right away while it is being sent (optimistic rendering).
 * Images use local object URLs, released when the real message arrives.
 */
const buildPendingMessage = (
  content: string,
  files: File[],
  user?: SupportChatUser
): SupportChatMessage => {
  pendingSequence += 1;
  return {
    id: `pending-${pendingSequence}`,
    senderId: SUPPORT_CHAT_GUEST_SENDER_ID,
    senderName: user?.name || 'Você',
    senderPhoto: null,
    senderRole: user?.email
      ? SUPPORT_CHAT_AUTHOR.USER
      : SUPPORT_CHAT_AUTHOR.GUEST,
    content,
    messageType: 'text',
    createdAt: new Date().toISOString(),
    attachments: files.map((file, index) => ({
      id: `pending-${pendingSequence}-${index}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    })),
    pending: true,
  };
};

const releasePending = (message: SupportChatMessage) =>
  message.attachments.forEach((item) => URL.revokeObjectURL(item.url));

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
  const [restored, setRestored] = useState(false);
  const sendingRef = useRef(false);

  const ticketId = ticket?.id;
  const userEmail = user?.email;
  // Read by the restore, which must not replace a conversation started meanwhile
  const ticketRef = useRef(ticket);
  ticketRef.current = ticket;

  // Resume the unresolved conversation of an earlier page load, unless the
  // person already started a new one meanwhile
  useEffect(() => {
    if (!adapter.restoreConversation) return;
    let active = true;
    adapter
      .restoreConversation({ email: userEmail })
      .then((resumed) => {
        if (!active || !resumed) return;
        if (ticketRef.current || sendingRef.current) return;
        setTicket(resumed.ticket);
        setMessages(resumed.messages);
        setRestored(true);
      })
      .catch(() => {
        // Not resumed: the next message opens a new ticket
      });
    return () => {
      active = false;
    };
  }, [adapter, userEmail]);

  const closed = ticket?.status === SUPPORT_CHAT_STATUS.FECHADO;

  // A resolved conversation is not resumed on the next load
  useEffect(() => {
    if (closed) adapter.forgetConversation?.();
  }, [adapter, closed]);

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
    async (content: string, files: File[] = []) => {
      const text = content.trim();
      if ((!text && files.length === 0) || sendingRef.current) return null;

      sendingRef.current = true;
      setSending(true);
      setError(null);

      const pending = buildPendingMessage(text, files, user);
      setMessages((list) => [...list, pending]);
      // Swap the optimistic message for the confirmed ones
      const confirm = (confirmed: SupportChatMessage[]) =>
        setMessages((list) =>
          confirmed.reduce(
            upsertMessage,
            list.filter((item) => item.id !== pending.id)
          )
        );

      try {
        if (ticketId) {
          const message = await adapter.sendMessage(ticketId, text, files);
          confirm([message]);
          return message;
        }

        const started = await adapter.startConversation({
          message: text,
          channel,
          institutionId,
          requesterName: user?.name,
          email: user?.email,
          files,
        });
        setTicket(started.ticket);
        confirm(started.messages);
        return started.messages[started.messages.length - 1] ?? null;
      } catch (sendError) {
        setMessages((list) => list.filter((item) => item.id !== pending.id));
        setError(getErrorMessage(sendError));
        return null;
      } finally {
        releasePending(pending);
        sendingRef.current = false;
        setSending(false);
      }
    },
    [adapter, channel, institutionId, ticketId, user]
  );

  const updateContact = useCallback(
    async (contact: SupportChatContact) => {
      if (!ticketId || !adapter.updateContact) return false;
      setError(null);
      try {
        await adapter.updateContact(ticketId, contact);
        return true;
      } catch (contactError) {
        setError(
          (contactError as { response?: { status?: number } } | null)?.response
            ?.status === 409
            ? 'O e-mail deste atendimento já foi informado'
            : 'Não foi possível salvar seus dados. Tente de novo.'
        );
        return false;
      }
    },
    [adapter, ticketId]
  );

  const reset = useCallback(() => {
    adapter.forgetConversation?.();
    setTicket(null);
    setMessages([]);
    setError(null);
    setRestored(false);
  }, [adapter]);

  return {
    ticket,
    messages,
    sending,
    error,
    closed,
    restored,
    send,
    updateContact: adapter.updateContact ? updateContact : undefined,
    reset,
  };
};
