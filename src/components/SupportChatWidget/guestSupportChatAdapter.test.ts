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
  it('keeps the FAQ article an AI answer is based on', () => {
    expect(
      fromSupportAnswer(
        {
          ...answer('a', SUPPORT_CHAT_AUTHOR.AI),
          faqArticleId: 'art-1',
          faqArticleTitle: 'Como redefinir a senha',
        },
        'Ana'
      ).faq
    ).toEqual({ id: 'art-1', title: 'Como redefinir a senha' });
    expect(
      fromSupportAnswer(answer('b', SUPPORT_CHAT_AUTHOR.AI), 'Ana').faq
    ).toBeNull();
  });

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

describe('fromSupportAnswer contactRequest', () => {
  it('keeps the contact fields an AI answer asks for', () => {
    expect(
      fromSupportAnswer(
        {
          ...answer('a', SUPPORT_CHAT_AUTHOR.AI),
          contactRequest: ['name', 'email'],
        },
        'Ana'
      ).contactRequest
    ).toEqual(['name', 'email']);
    expect(
      fromSupportAnswer(answer('b', SUPPORT_CHAT_AUTHOR.AI), 'Ana')
        .contactRequest
    ).toBeNull();
  });
});

describe('createGuestSupportChatAdapter updateContact', () => {
  it('saves the contact with the guest token and uses the new name', async () => {
    const { apiClient, adapter } = setup();
    const put = jest.fn().mockResolvedValue({ data: {} });
    (apiClient as unknown as SupportChatHttpClient).put = put;
    await adapter.startConversation({ message: 'oi', channel: 'login' });

    await adapter.updateContact?.('t1', {
      requesterName: 'Ana',
      email: 'ana@x.com',
    });
    expect(put).toHaveBeenCalledWith(
      '/support/guest/t1',
      { requesterName: 'Ana', email: 'ana@x.com' },
      { headers: { 'x-support-guest-token': 'tok' } }
    );

    const messages = await adapter.listMessages('t1');
    expect(messages[0].senderName).toBe('Ana');
  });

  it('keeps the name when only the e-mail is sent or the ticket is unknown', async () => {
    const { apiClient, adapter } = setup();
    const put = jest.fn().mockResolvedValue({ data: {} });
    (apiClient as unknown as SupportChatHttpClient).put = put;
    await adapter.startConversation({ message: 'oi', channel: 'login' });

    await adapter.updateContact?.('t1', { email: 'ana@x.com' });
    await adapter.updateContact?.('other', { requesterName: 'Bia' });
    expect(put).toHaveBeenLastCalledWith(
      '/support/guest/other',
      { requesterName: 'Bia' },
      { headers: { 'x-support-guest-token': '' } }
    );
    expect((await adapter.listMessages('t1'))[0].senderName).toBe('Visitante');
  });

  it('fails when the API client has no PUT', async () => {
    const { adapter } = setup();
    await expect(
      adapter.updateContact?.('t1', { email: 'ana@x.com' })
    ).rejects.toThrow('O cliente da API não envia PUT');
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
    // The app the chat runs in goes as the ticket origin
    expect(apiClient.post).toHaveBeenCalledWith('/support/external', {
      description: 'oi',
      institutionId: 'inst-1',
      requesterName: 'Ana',
      origin: 'login',
    });
    expect(started.ticket.id).toBe('t1');
    expect(started.messages[0]).toMatchObject({ id: 'a1', senderName: 'Ana' });
    expect(apiClient.get).toHaveBeenCalledWith('/support/guest/t1/answer', {
      headers: { 'x-support-guest-token': 'tok' },
    });

    const sent = await adapter.sendMessage('t1', 'de novo');
    expect(apiClient.post).toHaveBeenLastCalledWith(
      '/support/guest/t1/answer',
      { answer: 'de novo', attachments: [] },
      { headers: { 'x-support-guest-token': 'tok' } }
    );
    expect(sent).toMatchObject({ id: 'a2', content: 'de novo' });
  });

  it('sends only the fields given and an empty token for unknown tickets', async () => {
    const { apiClient, adapter } = setup();
    await adapter.startConversation({
      message: 'oi',
      // A channel the API does not know as an origin is not sent
      channel: 'backoffice',
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
    // Opening the conversation, plus one REST read when the socket opens
    expect(apiClient.get).toHaveBeenCalledTimes(2);

    socket.onclose?.();
    socket.onerror?.();
    await jest.advanceTimersByTimeAsync(1000);
    expect(apiClient.get.mock.calls.length).toBeGreaterThan(1);

    unsubscribe();
    expect(socket.close).toHaveBeenCalled();
    expect(socket.onclose).toBeNull();
  });

  it('delivers a seen message again when it comes back with the contact request', async () => {
    const { adapter } = setup('ws://localhost:3005?channel=support');
    await adapter.startConversation({ message: 'oi', channel: 'login' });
    const events: SupportChatEvent[] = [];
    adapter.subscribe('t1', (event) => events.push(event));
    const socket = FakeSocket.last;
    socket.onopen?.();

    const stale = fromSupportAnswer(
      answer('ai1', SUPPORT_CHAT_AUTHOR.AI),
      'Visitante'
    );
    const marked = { ...stale, contactRequest: ['name', 'email'] as const };
    // A stale history first, then the message with the request, then the stale copy again
    socket.frame({ type: 'history', payload: { messages: [stale] } });
    socket.frame({ type: 'new_message', payload: { message: marked } });
    socket.frame({ type: 'new_message', payload: { message: marked } });
    socket.frame({ type: 'new_message', payload: { message: stale } });

    expect(
      events.map(
        (event) =>
          event.type === 'new_message' && event.payload.message.contactRequest
      )
    ).toEqual([null, ['name', 'email']]);
  });
});

describe('createGuestSupportChatAdapter uploads', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const uploadSetup = (ok = true) => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok });
    const apiClient = {
      get: jest.fn().mockResolvedValue({ data: { data: [answer('a1')] } }),
      post: jest.fn().mockImplementation((url: string) => {
        if (url === '/support/external') {
          return Promise.resolve({
            data: { data: { id: 't1', guestToken: 'tok' } },
          });
        }
        if (url.endsWith('/upload-url')) {
          return Promise.resolve({
            data: {
              data: {
                uploadUrl: 'https://r2/put',
                key: 'k1',
                contentType: 'image/png',
              },
            },
          });
        }
        return Promise.resolve({
          data: { data: answer('a2', SUPPORT_CHAT_AUTHOR.GUEST, '') },
        });
      }),
    };
    const adapter = createGuestSupportChatAdapter({
      apiClient: apiClient as unknown as SupportChatHttpClient,
    });
    return { apiClient, adapter };
  };

  const file = new File(['abc'], 'foto.png', { type: 'image/png' });

  it('opens with the file names and sends the images as the next message', async () => {
    const { apiClient, adapter } = uploadSetup();

    const started = await adapter.startConversation({
      message: '',
      channel: 'login',
      files: [file],
    });

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/support/external', {
      description: 'foto.png',
      origin: 'login',
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      '/support/guest/t1/upload-url',
      { fileName: 'foto.png', fileSize: 3, mimeType: 'image/png' },
      { headers: { 'x-support-guest-token': 'tok' } }
    );
    expect(globalThis.fetch).toHaveBeenCalledWith('https://r2/put', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: file,
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(
      3,
      '/support/guest/t1/answer',
      {
        answer: '',
        attachments: [
          { key: 'k1', fileName: 'foto.png', mimeType: 'image/png', size: 3 },
        ],
      },
      { headers: { 'x-support-guest-token': 'tok' } }
    );
    // The opening text (file names) is hidden from the chat
    expect(started.messages.map((message) => message.id)).toEqual(['a2']);
    expect(await adapter.listMessages('t1')).toEqual([]);

    const events: SupportChatEvent[] = [];
    const unsubscribe = adapter.subscribe('t1', (event) => events.push(event));
    await Promise.resolve();
    await Promise.resolve();
    expect(events).toEqual([]);
    unsubscribe();
  });

  it('fails when the storage refuses the upload', async () => {
    const { apiClient, adapter } = uploadSetup(false);
    await adapter.startConversation({ message: 'oi', channel: 'login' });

    await expect(adapter.sendMessage('t1', '', [file])).rejects.toThrow(
      'Não foi possível enviar foto.png'
    );
    expect(apiClient.post).not.toHaveBeenCalledWith(
      '/support/guest/t1/answer',
      expect.anything(),
      expect.anything()
    );
  });
});

describe('createGuestSupportChatAdapter getArticle', () => {
  it('loads the article of the help center', async () => {
    const { apiClient, adapter } = setup();
    apiClient.get.mockResolvedValueOnce({
      data: {
        data: {
          article: {
            id: 'art-1',
            title: 'Simulados',
            body: '<p>oi</p>',
            updatedAt: '2026-10-21T12:00:00.000Z',
            extra: 'ignored',
          },
        },
      },
    });

    await expect(adapter.getArticle!('inst-1', 'art-1')).resolves.toEqual({
      id: 'art-1',
      title: 'Simulados',
      body: '<p>oi</p>',
      updatedAt: '2026-10-21T12:00:00.000Z',
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/help-center/inst-1/articles/art-1'
    );
  });

  it('uses null when the article has no update date', async () => {
    const { apiClient, adapter } = setup();
    apiClient.get.mockResolvedValueOnce({
      data: { data: { article: { id: 'a', title: 't', body: 'b' } } },
    });

    await expect(adapter.getArticle!('inst-1', 'a')).resolves.toEqual({
      id: 'a',
      title: 't',
      body: 'b',
      updatedAt: null,
    });
  });
});

describe('createGuestSupportChatAdapter session kept across reloads', () => {
  const KEY = 'analytica:support-chat';
  const stored = () => JSON.parse(localStorage.getItem(KEY) ?? 'null');
  const ticket = {
    id: 't1',
    status: 'ABERTO',
    handlerType: 'IA',
    problemType: null,
  };

  /** API that answers the ticket read and the messages of t1 */
  const restoreSetup = (ticketReply: () => Promise<unknown>) => {
    const { apiClient, adapter } = setup();
    apiClient.get.mockImplementation((url: string) =>
      url === '/support/guest/t1'
        ? ticketReply()
        : Promise.resolve({ data: { data: [answer('a1')] } })
    );
    return { apiClient, adapter };
  };

  beforeEach(() => localStorage.clear());

  it('keeps the ticket, token and name when the conversation starts', async () => {
    const { adapter } = setup();
    await adapter.startConversation({
      message: 'oi',
      channel: 'aluno',
      requesterName: 'Ana',
      email: 'ana@x.com',
    });

    expect(stored()).toEqual({
      ticketId: 't1',
      token: 'tok',
      name: 'Ana',
      userEmail: 'ana@x.com',
    });
  });

  it('keeps the name the visitor gives in the contact form', async () => {
    const { apiClient, adapter } = setup();
    (apiClient as unknown as SupportChatHttpClient).put = jest
      .fn()
      .mockResolvedValue({ data: {} });
    await adapter.startConversation({ message: 'oi', channel: 'login' });

    await adapter.updateContact?.('t1', { requesterName: 'Bia' });

    expect(stored()).toMatchObject({ name: 'Bia', userEmail: null });
  });

  it('resumes an unresolved conversation with the kept token and name', async () => {
    const { apiClient, adapter } = restoreSetup(() =>
      Promise.resolve({ data: { data: ticket } })
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: null,
      })
    );

    const resumed = await adapter.restoreConversation?.({});

    expect(apiClient.get).toHaveBeenCalledWith('/support/guest/t1', {
      headers: { 'x-support-guest-token': 'tok' },
    });
    expect(resumed?.ticket).toEqual(ticket);
    expect(resumed?.messages[0]).toMatchObject({ id: 'a1', senderName: 'Ana' });
  });

  it('keeps hiding the opening text of an image-only start', async () => {
    const { adapter } = restoreSetup(() =>
      Promise.resolve({ data: { data: ticket } })
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: null,
        hiddenId: 'a1',
      })
    );

    expect((await adapter.restoreConversation?.({}))?.messages).toEqual([]);
  });

  it('forgets a resolved conversation', async () => {
    const { adapter } = restoreSetup(() =>
      Promise.resolve({ data: { data: { ...ticket, status: 'FECHADO' } } })
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: null,
      })
    );

    expect(await adapter.restoreConversation?.({})).toBeNull();
    expect(stored()).toBeNull();
  });

  it('forgets the conversation of another user without asking the API', async () => {
    const { apiClient, adapter } = setup();
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: 'ana@x.com',
      })
    );

    expect(
      await adapter.restoreConversation?.({ email: 'bia@x.com' })
    ).toBeNull();
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(stored()).toBeNull();
  });

  it('forgets a ticket the API no longer finds (expired token)', async () => {
    const { adapter } = restoreSetup(() =>
      Promise.reject({ response: { status: 404 } })
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: null,
      })
    );

    expect(await adapter.restoreConversation?.({})).toBeNull();
    expect(stored()).toBeNull();
    // The token is not used for the forgotten ticket
    expect(await adapter.listMessages('t1')).toMatchObject([
      { senderName: 'Visitante' },
    ]);
  });

  it('keeps the conversation for the next load when the API is unreachable', async () => {
    const { adapter } = restoreSetup(() =>
      Promise.reject(new Error('offline'))
    );
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ticketId: 't1',
        token: 'tok',
        name: 'Ana',
        userEmail: null,
      })
    );

    expect(await adapter.restoreConversation?.({})).toBeNull();
    expect(stored()).toMatchObject({ ticketId: 't1' });
  });

  it('resumes nothing when nothing was kept or the kept value is broken', async () => {
    const { apiClient, adapter } = setup();
    expect(await adapter.restoreConversation?.({})).toBeNull();

    localStorage.setItem(KEY, '{not json');
    expect(await adapter.restoreConversation?.({})).toBeNull();
    localStorage.setItem(KEY, JSON.stringify({ ticketId: 't1' }));
    expect(await adapter.restoreConversation?.({})).toBeNull();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('forgets the conversation on request', async () => {
    const { adapter } = setup();
    await adapter.startConversation({ message: 'oi', channel: 'login' });

    adapter.forgetConversation?.();

    expect(stored()).toBeNull();
  });

  it('never throws when the browser blocks the storage', async () => {
    const { adapter } = setup();
    const blocked = () => {
      throw new Error('blocked');
    };
    const spies = [
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked),
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked),
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked),
    ];

    await expect(
      adapter.startConversation({ message: 'oi', channel: 'login' })
    ).resolves.toMatchObject({ ticket: { id: 't1' } });
    expect(await adapter.restoreConversation?.({})).toBeNull();
    expect(() => adapter.forgetConversation?.()).not.toThrow();

    spies.forEach((spy) => spy.mockRestore());
  });
});
