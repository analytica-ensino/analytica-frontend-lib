import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_GUEST_SENDER_ID,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatAnswerApi,
  type SupportChatEvent,
  type SupportChatHttpClient,
  type SupportChatMessage,
} from '../../types/supportChat';

export interface GuestSupportChatAdapterOptions {
  /** Client of the backend API (e.g. the app axios instance) */
  apiClient: SupportChatHttpClient;
  /**
   * Support WebSocket, including ?channel=support (e.g.
   * wss://bff-hml-chat.analyticaensino.com.br?channel=support).
   * Without it the adapter only polls the REST API.
   */
  wsUrl?: string;
  /** Polling interval while the socket is not connected, in ms */
  pollIntervalMs?: number;
}

const GUEST_TOKEN_HEADER = 'x-support-guest-token';

const senderNameFor = (role: string, requesterName: string) => {
  if (role === SUPPORT_CHAT_AUTHOR.AGENT) return 'Suporte';
  if (role === SUPPORT_CHAT_AUTHOR.AI) return 'Assistente';
  return requesterName;
};

/** REST answer → widget message */
export const fromSupportAnswer = (
  answer: SupportChatAnswerApi,
  requesterName: string
): SupportChatMessage => ({
  id: answer.id,
  senderId:
    answer.authorType === SUPPORT_CHAT_AUTHOR.GUEST
      ? SUPPORT_CHAT_GUEST_SENDER_ID
      : answer.authorType.toLowerCase(),
  senderName: senderNameFor(answer.authorType, requesterName),
  senderPhoto: null,
  senderRole: answer.authorType,
  content: answer.answer,
  messageType: 'text',
  createdAt: answer.createdAt,
  attachments: answer.attachments ?? [],
});

/**
 * Support chat adapter for visitors (no login), on top of the support API:
 * - POST /support/external opens the ticket and returns the guest token;
 * - GET/POST /support/guest/:id/answer read and send, with the token header;
 * - the chat WebSocket (?channel=support&roomId=&token=) pushes the events,
 *   and REST polling covers the time the socket is down.
 */
export const createGuestSupportChatAdapter = ({
  apiClient,
  wsUrl,
  pollIntervalMs = 3000,
}: GuestSupportChatAdapterOptions): SupportChatAdapter => {
  const sessions = new Map<string, { token: string; name: string }>();

  const headersFor = (ticketId: string) => ({
    [GUEST_TOKEN_HEADER]: sessions.get(ticketId)?.token ?? '',
  });
  const nameFor = (ticketId: string) =>
    sessions.get(ticketId)?.name ?? 'Visitante';

  const listMessages = async (ticketId: string) => {
    const { data } = await apiClient.get<{ data: SupportChatAnswerApi[] }>(
      `/support/guest/${ticketId}/answer`,
      { headers: headersFor(ticketId) }
    );
    return data.data.map((answer) =>
      fromSupportAnswer(answer, nameFor(ticketId))
    );
  };

  return {
    async startConversation({ message, institutionId, requesterName, email }) {
      const { data } = await apiClient.post<{
        data: { id: string; guestToken: string };
      }>('/support/external', {
        description: message,
        ...(institutionId ? { institutionId } : {}),
        ...(requesterName ? { requesterName } : {}),
        ...(email ? { email } : {}),
      });
      const ticketId = data.data.id;
      sessions.set(ticketId, {
        token: data.data.guestToken,
        name: requesterName || 'Visitante',
      });

      // The first message is saved with the ticket; read it back for its id
      const [first] = await listMessages(ticketId);
      return {
        ticket: {
          id: ticketId,
          status: SUPPORT_CHAT_STATUS.ABERTO,
          handlerType: null,
          problemType: null,
        },
        message: first,
      };
    },

    async sendMessage(ticketId, content) {
      const { data } = await apiClient.post<{ data: SupportChatAnswerApi }>(
        `/support/guest/${ticketId}/answer`,
        { answer: content },
        { headers: headersFor(ticketId) }
      );
      return fromSupportAnswer(data.data, nameFor(ticketId));
    },

    listMessages,

    subscribe(ticketId, listener) {
      const seen = new Set<string>();
      let socket: WebSocket | null = null;
      let pollTimer: ReturnType<typeof setInterval> | null = null;
      let active = true;

      const deliver = (message: SupportChatMessage) => {
        if (seen.has(message.id)) return;
        seen.add(message.id);
        listener({ type: 'new_message', payload: { message } });
      };

      const poll = async () => {
        try {
          (await listMessages(ticketId)).forEach(deliver);
        } catch {
          // Next tick tries again
        }
      };
      const startPolling = () => {
        if (pollTimer || !active) return;
        void poll();
        pollTimer = setInterval(poll, pollIntervalMs);
      };
      const stopPolling = () => {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = null;
      };

      const handleFrame = (raw: string) => {
        let event: { type?: string; payload?: Record<string, unknown> };
        try {
          event = JSON.parse(raw);
        } catch {
          return;
        }
        const payload = event.payload ?? {};
        if (event.type === 'history') {
          (payload.messages as SupportChatMessage[]).forEach((message) =>
            deliver({ ...message, attachments: message.attachments ?? [] })
          );
        } else if (event.type === 'new_message') {
          const message = payload.message as SupportChatMessage;
          deliver({ ...message, attachments: message.attachments ?? [] });
        } else if (
          event.type === 'message_updated' ||
          event.type === 'ticket_updated'
        ) {
          listener(event as SupportChatEvent);
        } else if (event.type === 'error') {
          listener({
            type: 'error',
            payload: {
              message: String(payload.message_text ?? payload.message ?? ''),
            },
          });
        }
      };

      const token = sessions.get(ticketId)?.token;
      if (wsUrl && token) {
        const url = new URL(wsUrl);
        url.searchParams.set('channel', 'support');
        url.searchParams.set('roomId', ticketId);
        url.searchParams.set('token', token);
        socket = new WebSocket(url.toString());
        socket.onopen = () => {
          stopPolling();
          socket?.send(JSON.stringify({ type: 'getInitialData' }));
        };
        socket.onmessage = (event) => handleFrame(String(event.data));
        socket.onclose = startPolling;
        socket.onerror = startPolling;
      } else {
        startPolling();
      }

      return () => {
        active = false;
        stopPolling();
        if (socket) {
          socket.onclose = null;
          socket.close();
        }
      };
    },
  };
};
