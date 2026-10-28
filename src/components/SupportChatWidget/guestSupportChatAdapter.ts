import { isSupportTicketOrigin } from '../../types/support';
import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_GUEST_SENDER_ID,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatAnswerApi,
  type SupportChatArticle,
  type SupportChatEvent,
  type SupportChatHttpClient,
  type SupportChatMessage,
  type SupportChatTicket,
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
  /**
   * localStorage key of the open conversation, kept so a reload resumes it.
   * Default: `analytica:support-chat`.
   */
  storageKey?: string;
}

/** Open conversation kept across page loads */
interface StoredSupportChatSession {
  ticketId: string;
  token: string;
  name: string;
  /** E-mail of the logged user who opened it; null for a visitor */
  userEmail: string | null;
  /** Opening text the chat does not show (image-only start) */
  hiddenId?: string;
}

const DEFAULT_STORAGE_KEY = 'analytica:support-chat';

/** The browser may block storage (private mode, policies): never throw */
const readStoredSession = (key: string): StoredSupportChatSession | null => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<StoredSupportChatSession>;
    return session.ticketId && session.token
      ? (session as StoredSupportChatSession)
      : null;
  } catch {
    return null;
  }
};

const writeStoredSession = (key: string, session: StoredSupportChatSession) => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(session));
  } catch {
    // Not kept: a reload starts a new conversation, as before
  }
};

const clearStoredSession = (key: string) => {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Nothing kept to clear
  }
};

const statusOf = (error: unknown) =>
  (error as { response?: { status?: number } } | null)?.response?.status;

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
  faq:
    answer.faqArticleId && answer.faqArticleTitle
      ? { id: answer.faqArticleId, title: answer.faqArticleTitle }
      : null,
  contactRequest: answer.contactRequest ?? null,
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
  storageKey = DEFAULT_STORAGE_KEY,
}: GuestSupportChatAdapterOptions): SupportChatAdapter => {
  const sessions = new Map<string, { token: string; name: string }>();
  /**
   * Ticket opening text written by the adapter (an image-only start still
   * needs a description). It is the ticket description for the agents, not
   * something the visitor typed, so the chat does not show it.
   */
  const hiddenIds = new Set<string>();
  const isVisible = (message: SupportChatMessage) => !hiddenIds.has(message.id);

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
    return data.data
      .map((answer) => fromSupportAnswer(answer, nameFor(ticketId)))
      .filter(isVisible);
  };

  /**
   * Upload each file straight to the storage: ask the backend for a signed
   * URL, then PUT the file there. Returns what the message needs.
   */
  const uploadFiles = (ticketId: string, files: File[]) =>
    Promise.all(
      files.map(async (file) => {
        const { data } = await apiClient.post<{
          data: { uploadUrl: string; key: string; contentType: string };
        }>(
          `/support/guest/${ticketId}/upload-url`,
          { fileName: file.name, fileSize: file.size, mimeType: file.type },
          { headers: headersFor(ticketId) }
        );
        const { uploadUrl, key, contentType } = data.data;
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file,
        });
        if (!response.ok) {
          throw new Error(`Não foi possível enviar ${file.name}`);
        }
        return {
          key,
          fileName: file.name,
          mimeType: contentType,
          size: file.size,
        };
      })
    );

  const sendMessage = async (
    ticketId: string,
    content: string,
    files: File[] = []
  ) => {
    const attachments = await uploadFiles(ticketId, files);
    const { data } = await apiClient.post<{ data: SupportChatAnswerApi }>(
      `/support/guest/${ticketId}/answer`,
      { answer: content, attachments },
      { headers: headersFor(ticketId) }
    );
    return fromSupportAnswer(data.data, nameFor(ticketId));
  };

  return {
    async startConversation({
      message,
      channel,
      institutionId,
      requesterName,
      email,
      files = [],
    }) {
      // The ticket needs a description; an image-only start uses the names
      const description = message || files.map((file) => file.name).join(', ');
      const { data } = await apiClient.post<{
        data: { id: string; guestToken: string };
      }>('/support/external', {
        description,
        ...(institutionId ? { institutionId } : {}),
        ...(requesterName ? { requesterName } : {}),
        ...(email ? { email } : {}),
        // The app the chat runs in, when it is one the API knows
        ...(isSupportTicketOrigin(channel) ? { origin: channel } : {}),
      });
      const ticketId = data.data.id;
      const name = requesterName || 'Visitante';
      sessions.set(ticketId, { token: data.data.guestToken, name });

      // The first message is saved with the ticket; read it back for its id.
      // /support/external takes no files, so they go as the next message.
      let messages = await listMessages(ticketId);
      let hiddenId: string | undefined;
      if (!message && messages[0]) {
        hiddenId = messages[0].id;
        hiddenIds.add(hiddenId);
        messages = messages.slice(1);
      }
      writeStoredSession(storageKey, {
        ticketId,
        token: data.data.guestToken,
        name,
        userEmail: email ?? null,
        hiddenId,
      });
      if (files.length) messages.push(await sendMessage(ticketId, '', files));
      return {
        ticket: {
          id: ticketId,
          status: SUPPORT_CHAT_STATUS.ABERTO,
          handlerType: null,
          problemType: null,
        },
        messages,
      };
    },

    sendMessage,

    async getArticle(institutionId, articleId) {
      const { data } = await apiClient.get<{
        data: { article: SupportChatArticle };
      }>(`/help-center/${institutionId}/articles/${articleId}`);
      const { id, title, body, updatedAt } = data.data.article;
      return { id, title, body, updatedAt: updatedAt ?? null };
    },

    async updateContact(ticketId, contact) {
      if (!apiClient.put) {
        throw new Error('O cliente da API não envia PUT');
      }
      await apiClient.put(`/support/guest/${ticketId}`, contact, {
        headers: headersFor(ticketId),
      });
      const session = sessions.get(ticketId);
      if (session && contact.requesterName) {
        session.name = contact.requesterName;
        const stored = readStoredSession(storageKey);
        if (stored?.ticketId === ticketId) {
          writeStoredSession(storageKey, {
            ...stored,
            name: contact.requesterName,
          });
        }
      }
    },

    async restoreConversation({ email }) {
      const stored = readStoredSession(storageKey);
      if (!stored) return null;
      // Another account on this browser: that conversation is not theirs
      if (stored.userEmail !== (email ?? null)) {
        clearStoredSession(storageKey);
        return null;
      }

      const { ticketId } = stored;
      sessions.set(ticketId, { token: stored.token, name: stored.name });
      if (stored.hiddenId) hiddenIds.add(stored.hiddenId);
      try {
        const { data } = await apiClient.get<{ data: SupportChatTicket }>(
          `/support/guest/${ticketId}`,
          { headers: headersFor(ticketId) }
        );
        if (data.data.status === SUPPORT_CHAT_STATUS.FECHADO) {
          clearStoredSession(storageKey);
          return null;
        }
        return { ticket: data.data, messages: await listMessages(ticketId) };
      } catch (error) {
        // Ticket gone or token expired: it cannot be resumed. Any other
        // failure (offline) keeps it for the next load.
        if (statusOf(error) === 404) clearStoredSession(storageKey);
        sessions.delete(ticketId);
        return null;
      }
    },

    forgetConversation() {
      clearStoredSession(storageKey);
    },

    listMessages,

    subscribe(ticketId, listener) {
      // id → what the chat shows besides the text; a message seen again with
      // more of it (a stale WebSocket history may lack contactRequest/faq) is
      // delivered again so the chat replaces it
      const seen = new Map<string, string>();
      const extrasOf = (message: SupportChatMessage) =>
        JSON.stringify([message.contactRequest ?? null, message.faq ?? null]);
      const NO_EXTRAS = JSON.stringify([null, null]);
      let socket: WebSocket | null = null;
      let pollTimer: ReturnType<typeof setInterval> | null = null;
      let active = true;

      const deliver = (message: SupportChatMessage) => {
        if (!isVisible(message)) return;
        const extras = extrasOf(message);
        const previous = seen.get(message.id);
        // Same as before, or a poorer copy: nothing new to show
        if (previous === extras || (previous && extras === NO_EXTRAS)) return;
        seen.set(message.id, extras);
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
          // The REST API is the source of truth: a WebSocket deployed apart
          // from it may send a history without contactRequest/faq
          void poll();
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
