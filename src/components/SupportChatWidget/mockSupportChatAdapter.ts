import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_GUEST_SENDER_ID,
  SUPPORT_CHAT_HANDLER,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatEvent,
  type SupportChatMessage,
  type SupportChatTicket,
} from '../../types/supportChat';

export interface MockSupportChatAdapterOptions {
  /** Latency of every call, in ms (default 300) */
  delayMs?: number;
  /** Delay of the automatic agent reply, in ms (default 1500) */
  replyDelayMs?: number;
  /** Text of the agent reply; null disables it */
  replyText?: string | null;
}

const DEFAULT_REPLY =
  'Olá! Recebemos sua mensagem e já vamos te ajudar. Este é um atendimento de demonstração.';

/**
 * In-memory adapter for the support chat widget. It mirrors the backend
 * contract (statuses, authors, events) so the widget can be built and tested
 * before the real API + WebSocket adapter exists.
 */
export const createMockSupportChatAdapter = ({
  delayMs = 300,
  replyDelayMs = 1500,
  replyText = DEFAULT_REPLY,
}: MockSupportChatAdapterOptions = {}): SupportChatAdapter => {
  const tickets = new Map<string, SupportChatTicket>();
  const messages = new Map<string, SupportChatMessage[]>();
  const requesters = new Map<string, { name: string; logged: boolean }>();
  const listeners = new Map<string, Set<(event: SupportChatEvent) => void>>();
  let sequence = 0;

  const wait = () => new Promise((resolve) => setTimeout(resolve, delayMs));
  const nextId = (prefix: string) => `${prefix}-${++sequence}`;

  const emit = (ticketId: string, event: SupportChatEvent) => {
    listeners.get(ticketId)?.forEach((listener) => listener(event));
  };

  const append = (ticketId: string, message: SupportChatMessage) => {
    messages.set(ticketId, [...(messages.get(ticketId) ?? []), message]);
  };

  const toAttachments = (files: File[]) =>
    files.map((file) => ({
      id: nextId('file'),
      url: URL.createObjectURL(file),
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }));

  const buildRequesterMessage = (
    ticketId: string,
    content: string,
    files: File[] = []
  ): SupportChatMessage => {
    const requester = requesters.get(ticketId);
    return {
      id: nextId('msg'),
      senderId: requester?.logged ? 'user' : SUPPORT_CHAT_GUEST_SENDER_ID,
      senderName: requester?.name ?? 'Visitante',
      senderPhoto: null,
      senderRole: requester?.logged
        ? SUPPORT_CHAT_AUTHOR.USER
        : SUPPORT_CHAT_AUTHOR.GUEST,
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      attachments: toAttachments(files),
    };
  };

  const scheduleReply = (ticketId: string) => {
    if (replyText === null) return;
    setTimeout(() => {
      const ticket = tickets.get(ticketId);
      if (!ticket) return;

      const reply: SupportChatMessage = {
        id: nextId('msg'),
        senderId: 'agent',
        senderName: 'Suporte',
        senderPhoto: null,
        senderRole: SUPPORT_CHAT_AUTHOR.AGENT,
        content: replyText,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        attachments: [],
      };
      append(ticketId, reply);

      const updated: SupportChatTicket = {
        ...ticket,
        status: SUPPORT_CHAT_STATUS.EM_ANDAMENTO,
        handlerType: SUPPORT_CHAT_HANDLER.HUMANO,
      };
      tickets.set(ticketId, updated);

      emit(ticketId, { type: 'new_message', payload: { message: reply } });
      emit(ticketId, {
        type: 'ticket_updated',
        payload: {
          ticketId,
          status: updated.status,
          handlerType: updated.handlerType,
          problemType: updated.problemType,
        },
      });
    }, replyDelayMs);
  };

  return {
    async startConversation({ message, requesterName, email, files }) {
      await wait();
      const ticket: SupportChatTicket = {
        id: nextId('ticket'),
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      };
      tickets.set(ticket.id, ticket);
      requesters.set(ticket.id, {
        name: requesterName || 'Visitante',
        logged: Boolean(email),
      });

      const first = buildRequesterMessage(ticket.id, message, files);
      append(ticket.id, first);
      scheduleReply(ticket.id);
      return { ticket, messages: [first] };
    },

    async sendMessage(ticketId, content, files) {
      await wait();
      const ticket = tickets.get(ticketId);
      if (!ticket) throw new Error('Atendimento não encontrado');
      if (ticket.status === SUPPORT_CHAT_STATUS.FECHADO) {
        throw new Error('Este atendimento já foi encerrado');
      }

      const message = buildRequesterMessage(ticketId, content, files);
      append(ticketId, message);
      scheduleReply(ticketId);
      return message;
    },

    async listMessages(ticketId) {
      await wait();
      return [...(messages.get(ticketId) ?? [])];
    },

    subscribe(ticketId, listener) {
      const set = listeners.get(ticketId) ?? new Set();
      set.add(listener);
      listeners.set(ticketId, set);
      return () => {
        set.delete(listener);
      };
    },
  };
};
