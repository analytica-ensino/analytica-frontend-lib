import { createMockSupportChatAdapter } from './mockSupportChatAdapter';
import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_GUEST_SENDER_ID,
  SUPPORT_CHAT_HANDLER,
  SUPPORT_CHAT_STATUS,
  type SupportChatEvent,
} from '../../types/supportChat';

describe('createMockSupportChatAdapter', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const run = async <T>(promise: Promise<T>) => {
    await jest.advanceTimersByTimeAsync(300);
    return promise;
  };

  it('opens a ticket with the visitor first message', async () => {
    const adapter = createMockSupportChatAdapter();
    const {
      ticket,
      messages: [message],
    } = await run(
      adapter.startConversation({ message: 'oi', channel: 'login' })
    );

    expect(ticket).toEqual({
      id: 'ticket-1',
      status: SUPPORT_CHAT_STATUS.ABERTO,
      handlerType: null,
      problemType: null,
    });
    expect(message).toMatchObject({
      senderId: SUPPORT_CHAT_GUEST_SENDER_ID,
      senderName: 'Visitante',
      senderRole: SUPPORT_CHAT_AUTHOR.GUEST,
      content: 'oi',
      attachments: [],
    });
    expect(await run(adapter.listMessages(ticket.id))).toEqual([message]);
  });

  it('marks a logged user as USER', async () => {
    const adapter = createMockSupportChatAdapter();
    const {
      messages: [message],
    } = await run(
      adapter.startConversation({
        message: 'oi',
        channel: 'app',
        requesterName: 'Maria',
        email: 'maria@escola.com',
      })
    );

    expect(message.senderName).toBe('Maria');
    expect(message.senderRole).toBe(SUPPORT_CHAT_AUTHOR.USER);
  });

  it('replies as the agent and updates the ticket', async () => {
    const adapter = createMockSupportChatAdapter({ replyText: 'Olá' });
    const { ticket } = await run(
      adapter.startConversation({ message: 'oi', channel: 'login' })
    );
    const events: SupportChatEvent[] = [];
    const unsubscribe = adapter.subscribe(ticket.id, (event) =>
      events.push(event)
    );

    await jest.advanceTimersByTimeAsync(1500);

    expect(events.map((event) => event.type)).toEqual([
      'new_message',
      'ticket_updated',
    ]);
    expect(events[0]).toMatchObject({
      payload: {
        message: { content: 'Olá', senderRole: SUPPORT_CHAT_AUTHOR.AGENT },
      },
    });
    expect(events[1]).toEqual({
      type: 'ticket_updated',
      payload: {
        ticketId: ticket.id,
        status: SUPPORT_CHAT_STATUS.EM_ANDAMENTO,
        handlerType: SUPPORT_CHAT_HANDLER.HUMANO,
        problemType: null,
      },
    });

    unsubscribe();
    await run(adapter.sendMessage(ticket.id, 'mais uma'));
    await jest.advanceTimersByTimeAsync(1500);
    expect(events).toHaveLength(2);
  });

  it('does not reply when replyText is null', async () => {
    const adapter = createMockSupportChatAdapter({ replyText: null });
    const { ticket } = await run(
      adapter.startConversation({ message: 'oi', channel: 'login' })
    );
    await jest.advanceTimersByTimeAsync(5000);

    expect(await run(adapter.listMessages(ticket.id))).toHaveLength(1);
  });

  it('sends on an existing ticket and refuses an unknown one', async () => {
    const adapter = createMockSupportChatAdapter({ replyText: null });
    const { ticket } = await run(
      adapter.startConversation({ message: 'oi', channel: 'login' })
    );

    const message = await run(adapter.sendMessage(ticket.id, 'tudo bem?'));
    expect(message.content).toBe('tudo bem?');

    const failure = adapter.sendMessage('ticket-x', 'oi');
    const assertion = expect(failure).rejects.toThrow(
      'Atendimento não encontrado'
    );
    await jest.advanceTimersByTimeAsync(300);
    await assertion;
    expect(await run(adapter.listMessages('ticket-x'))).toEqual([]);
  });
});

describe('createMockSupportChatAdapter with files', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    URL.createObjectURL = jest.fn(() => 'blob:local');
  });
  afterEach(() => jest.useRealTimers());

  it('turns the files into attachments', async () => {
    const adapter = createMockSupportChatAdapter({ replyText: null });
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const started = adapter.startConversation({
      message: '',
      channel: 'login',
      files: [file],
    });
    await jest.advanceTimersByTimeAsync(300);
    const {
      ticket,
      messages: [first],
    } = await started;
    expect(first.attachments).toEqual([
      {
        id: 'file-3',
        url: 'blob:local',
        fileName: 'a.png',
        mimeType: 'image/png',
        size: 1,
      },
    ]);

    const sent = adapter.sendMessage(ticket.id, '', [file]);
    await jest.advanceTimersByTimeAsync(300);
    expect((await sent).attachments).toHaveLength(1);
  });
});
