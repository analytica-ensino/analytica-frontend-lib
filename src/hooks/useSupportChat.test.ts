import { act, renderHook } from '@testing-library/react';
import { useSupportChat } from './useSupportChat';
import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatEvent,
  type SupportChatMessage,
} from '../types/supportChat';

const message = (id: string, content: string): SupportChatMessage => ({
  id,
  senderId: 'guest',
  senderName: 'Visitante',
  senderPhoto: null,
  senderRole: SUPPORT_CHAT_AUTHOR.GUEST,
  content,
  messageType: 'text',
  createdAt: '2026-10-12T12:00:00.000Z',
  attachments: [],
});

const setup = () => {
  let listener: ((event: SupportChatEvent) => void) | null = null;
  const adapter: jest.Mocked<SupportChatAdapter> = {
    startConversation: jest.fn().mockResolvedValue({
      ticket: {
        id: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      },
      messages: [message('m1', 'oi')],
    }),
    sendMessage: jest.fn(),
    listMessages: jest.fn(),
    subscribe: jest.fn((_id, callback) => {
      listener = callback;
      return jest.fn();
    }),
  };
  const hook = renderHook(() => useSupportChat({ adapter, channel: 'login' }));
  const emit = (event: SupportChatEvent) => act(() => listener?.(event));
  return { adapter, hook, emit };
};

describe('useSupportChat', () => {
  it('starts as a visitor and stores a message received twice only once', async () => {
    const { adapter, hook, emit } = setup();

    await act(async () => {
      await hook.result.current.send('  oi  ');
    });
    expect(adapter.startConversation).toHaveBeenCalledWith({
      message: 'oi',
      channel: 'login',
      institutionId: undefined,
      requesterName: undefined,
      email: undefined,
      files: [],
    });

    emit({ type: 'new_message', payload: { message: message('m1', 'oi') } });
    expect(hook.result.current.messages).toHaveLength(1);
  });

  it('ignores updates of another ticket or message', async () => {
    const { hook, emit } = setup();
    await act(async () => {
      await hook.result.current.send('oi');
    });

    emit({
      type: 'ticket_updated',
      payload: {
        ticketId: 'other',
        status: SUPPORT_CHAT_STATUS.FECHADO,
        handlerType: null,
        problemType: null,
      },
    });
    emit({
      type: 'message_updated',
      payload: { messageId: 'other', content: 'x', read: true },
    });

    expect(hook.result.current.closed).toBe(false);
    expect(hook.result.current.messages[0].content).toBe('oi');
  });

  it('does not send while another send is in flight', async () => {
    const { adapter, hook } = setup();
    let resolve: (value: unknown) => void = () => undefined;
    adapter.startConversation.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }) as never
    );

    let second: unknown;
    await act(async () => {
      void hook.result.current.send('primeira');
      second = await hook.result.current.send('segunda');
    });
    expect(second).toBeNull();
    expect(adapter.startConversation).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve({
        ticket: {
          id: 'ticket-1',
          status: SUPPORT_CHAT_STATUS.ABERTO,
          handlerType: null,
          problemType: null,
        },
        messages: [message('m1', 'primeira')],
      });
    });
    expect(hook.result.current.sending).toBe(false);
  });

  it('uses a default message when the failure is not an Error', async () => {
    const { adapter, hook } = setup();
    await act(async () => {
      await hook.result.current.send('oi');
    });
    adapter.sendMessage.mockRejectedValueOnce('boom');

    await act(async () => {
      await hook.result.current.send('de novo');
    });
    expect(hook.result.current.error).toBe(
      'Não foi possível enviar a mensagem'
    );

    act(() => hook.result.current.reset());
    expect(hook.result.current.ticket).toBeNull();
    expect(hook.result.current.messages).toEqual([]);
    expect(hook.result.current.error).toBeNull();
  });
});

describe('useSupportChat with files', () => {
  it('sends an image-only message and returns the last started message', async () => {
    const { adapter, hook } = setup();
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    adapter.startConversation.mockResolvedValueOnce({
      ticket: {
        id: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      },
      messages: [message('m1', 'a.png'), message('m2', '')],
    });

    let result: unknown;
    await act(async () => {
      result = await hook.result.current.send('', [file]);
    });
    expect(adapter.startConversation).toHaveBeenCalledWith(
      expect.objectContaining({ message: '', files: [file] })
    );
    expect(result).toEqual(message('m2', ''));
    expect(hook.result.current.messages).toHaveLength(2);

    adapter.sendMessage.mockResolvedValueOnce(message('m3', ''));
    await act(async () => {
      await hook.result.current.send('', [file]);
    });
    expect(adapter.sendMessage).toHaveBeenCalledWith('ticket-1', '', [file]);
  });

  it('returns null when the start brings no message', async () => {
    const { adapter, hook } = setup();
    adapter.startConversation.mockResolvedValueOnce({
      ticket: {
        id: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      },
      messages: [],
    });
    let result: unknown = 'x';
    await act(async () => {
      result = await hook.result.current.send('oi');
    });
    expect(result).toBeNull();
  });
});
