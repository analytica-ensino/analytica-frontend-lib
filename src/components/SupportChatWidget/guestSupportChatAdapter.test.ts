import {
  createGuestSupportChatAdapter,
  fromSupportAnswer,
} from './guestSupportChatAdapter';
import {
  SUPPORT_CHAT_AUTHOR,
  type SupportChatAnswerApi,
  type SupportChatEvent,
  type SupportChatHttpClient,
} from '../../types/supportChat';

class FakeSocket {
  static last: FakeSocket;
  url: string;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = jest.fn();
  constructor(url: string) {
    this.url = url;
    FakeSocket.last = this;
  }
  send(data: string) {
    this.sent.push(data);
  }
  frame(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

const answer = (
  id: string,
  authorType: SupportChatAnswerApi['authorType'] = SUPPORT_CHAT_AUTHOR.GUEST,
  text = 'oi'
): SupportChatAnswerApi => ({
  id,
  authorType,
  answer: text,
  createdAt: '2026-10-12T12:00:00.000Z',
});

const setup = (wsUrl?: string) => {
  const apiClient = {
    get: jest.fn().mockResolvedValue({ data: { data: [answer('a1')] } }),
    post: jest.fn().mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data:
            url === '/support/external'
              ? { id: 't1', guestToken: 'tok' }
              : answer('a2', SUPPORT_CHAT_AUTHOR.GUEST, 'de novo'),
        },
      })
    ),
  };
  const adapter = createGuestSupportChatAdapter({
    apiClient: apiClient as unknown as SupportChatHttpClient,
    wsUrl,
    pollIntervalMs: 1000,
  });
  return { apiClient, adapter };
};

describe('fromSupportAnswer', () => {
  it.each([
    [SUPPORT_CHAT_AUTHOR.GUEST, 'guest', 'Ana'],
    [SUPPORT_CHAT_AUTHOR.USER, 'user', 'Ana'],
    [SUPPORT_CHAT_AUTHOR.AGENT, 'agent', 'Suporte'],
    [SUPPORT_CHAT_AUTHOR.AI, 'ai', 'Assistente'],
  ])('maps %s', (role, senderId, senderName) => {
    expect(fromSupportAnswer(answer('a', role), 'Ana')).toMatchObject({
      senderId,
      senderName,
      senderRole: role,
      attachments: [],
    });
  });
});

describe('createGuestSupportChatAdapter', () => {
  const OriginalWebSocket = globalThis.WebSocket;
  beforeEach(() => {
    globalThis.WebSocket = FakeSocket as unknown as typeof WebSocket;
  });
  afterEach(() => {
    globalThis.WebSocket = OriginalWebSocket;
    jest.useRealTimers();
  });

  it('opens the ticket, then reads and sends with the guest token', async () => {
    const { apiClient, adapter } = setup();

    const started = await adapter.startConversation({
      message: 'oi',
      channel: 'login',
      institutionId: 'inst-1',
      requesterName: 'Ana',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/support/external', {
      description: 'oi',
      institutionId: 'inst-1',
      requesterName: 'Ana',
    });
    expect(started.ticket.id).toBe('t1');
    expect(started.message).toMatchObject({ id: 'a1', senderName: 'Ana' });
    expect(apiClient.get).toHaveBeenCalledWith('/support/guest/t1/answer', {
      headers: { 'x-support-guest-token': 'tok' },
    });

    const sent = await adapter.sendMessage('t1', 'de novo');
    expect(apiClient.post).toHaveBeenLastCalledWith(
      '/support/guest/t1/answer',
      { answer: 'de novo' },
      { headers: { 'x-support-guest-token': 'tok' } }
    );
    expect(sent).toMatchObject({ id: 'a2', content: 'de novo' });
  });

  it('sends only the fields given and an empty token for unknown tickets', async () => {
    const { apiClient, adapter } = setup();
    await adapter.startConversation({
      message: 'oi',
      channel: 'login',
      email: 'ana@x.com',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/support/external', {
      description: 'oi',
      email: 'ana@x.com',
    });

    const messages = await adapter.listMessages('other');
    expect(apiClient.get).toHaveBeenLastCalledWith(
      '/support/guest/other/answer',
      { headers: { 'x-support-guest-token': '' } }
    );
    expect(messages[0].senderName).toBe('Visitante');
  });

  it('polls the REST API without a socket and delivers each message once', async () => {
    jest.useFakeTimers();
    const { apiClient, adapter } = setup();
    await adapter.startConversation({ message: 'oi', channel: 'login' });
    const events: SupportChatEvent[] = [];

    const unsubscribe = adapter.subscribe('t1', (event) => events.push(event));
    await jest.advanceTimersByTimeAsync(0);
    apiClient.get.mockResolvedValueOnce({
      data: { data: [answer('a1'), answer('r1', SUPPORT_CHAT_AUTHOR.AGENT)] },
    });
    apiClient.get.mockRejectedValueOnce(new Error('offline'));
    await jest.advanceTimersByTimeAsync(2000);

    expect(
      events.map(
        (event) => event.type === 'new_message' && event.payload.message.id
      )
    ).toEqual(['a1', 'r1']);

    unsubscribe();
    const calls = apiClient.get.mock.calls.length;
    await jest.advanceTimersByTimeAsync(5000);
    expect(apiClient.get.mock.calls.length).toBe(calls);
  });

  it('uses the WebSocket and falls back to polling when it closes', async () => {
    jest.useFakeTimers();
    const { apiClient, adapter } = setup('ws://localhost:3005?channel=support');
    await adapter.startConversation({ message: 'oi', channel: 'login' });
    const events: SupportChatEvent[] = [];
    const unsubscribe = adapter.subscribe('t1', (event) => events.push(event));
    const socket = FakeSocket.last;

    expect(socket.url).toBe(
      'ws://localhost:3005/?channel=support&roomId=t1&token=tok'
    );
    socket.onopen?.();
    expect(socket.sent).toEqual([JSON.stringify({ type: 'getInitialData' })]);

    const wsMessage = fromSupportAnswer(answer('a1'), 'Visitante');
    socket.frame({ type: 'history', payload: { messages: [wsMessage] } });
    socket.frame({
      type: 'new_message',
      payload: { message: { ...wsMessage, id: 'r1', attachments: undefined } },
    });
    socket.frame({ type: 'new_message', payload: { message: wsMessage } });
    socket.frame({
      type: 'message_updated',
      payload: { messageId: 'a1', content: 'x', read: true },
    });
    socket.frame({
      type: 'error',
      payload: { message: 'm', message_text: 'texto' },
    });
    socket.frame({ type: 'error' });
    socket.frame({ type: 'participants', payload: {} });
    socket.onmessage?.({ data: 'not json' });

    expect(events.map((event) => event.type)).toEqual([
      'new_message',
      'new_message',
      'message_updated',
      'error',
      'error',
    ]);
    expect(events[3]).toEqual({ type: 'error', payload: { message: 'texto' } });
    expect(events[4]).toEqual({ type: 'error', payload: { message: '' } });
    expect(apiClient.get).toHaveBeenCalledTimes(1);

    socket.onclose?.();
    socket.onerror?.();
    await jest.advanceTimersByTimeAsync(1000);
    expect(apiClient.get.mock.calls.length).toBeGreaterThan(1);

    unsubscribe();
    expect(socket.close).toHaveBeenCalled();
    expect(socket.onclose).toBeNull();
  });
});
