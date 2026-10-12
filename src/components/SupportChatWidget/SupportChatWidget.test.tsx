import { act, fireEvent, render, screen } from '@testing-library/react';
import { SupportChatWidget } from './SupportChatWidget';
import { SupportType } from '../../types/support';
import {
  SUPPORT_CHAT_AUTHOR,
  SUPPORT_CHAT_STATUS,
  type SupportChatAdapter,
  type SupportChatEvent,
  type SupportChatMessage,
} from '../../types/supportChat';

const buildMessage = (
  id: string,
  content: string,
  senderRole: SupportChatMessage['senderRole'] = SUPPORT_CHAT_AUTHOR.GUEST
): SupportChatMessage => ({
  id,
  senderId: senderRole === SUPPORT_CHAT_AUTHOR.AGENT ? 'agent' : 'guest',
  senderName:
    senderRole === SUPPORT_CHAT_AUTHOR.AGENT ? 'Suporte' : 'Visitante',
  senderPhoto: null,
  senderRole,
  content,
  messageType: 'text',
  createdAt: '2026-10-12T12:00:00.000Z',
  attachments: [],
});

const createAdapter = () => {
  let listener: ((event: SupportChatEvent) => void) | null = null;
  const adapter: jest.Mocked<SupportChatAdapter> = {
    startConversation: jest.fn().mockResolvedValue({
      ticket: {
        id: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      },
      messages: [buildMessage('m1', 'oi')],
    }),
    sendMessage: jest.fn().mockResolvedValue(buildMessage('m2', 'de novo')),
    listMessages: jest.fn().mockResolvedValue([]),
    subscribe: jest.fn((_ticketId, callback) => {
      listener = callback;
      return () => {
        listener = null;
      };
    }),
  };
  const emit = (event: SupportChatEvent) => act(() => listener?.(event));
  return { adapter, emit };
};

const type = (text: string) =>
  fireEvent.change(screen.getByLabelText('Mensagem'), {
    target: { value: text },
  });

const sendText = async (text: string) => {
  type(text);
  await act(async () => {
    fireEvent.click(screen.getByLabelText('Enviar'));
  });
};

describe('SupportChatWidget', () => {
  describe('flags', () => {
    it.each([
      ['enabled=false', { enabled: false }],
      ['chat=false', { chat: false }],
      ['ZENDESK', { supportType: SupportType.ZENDESK }],
    ])('renders nothing with %s', (_label, flags) => {
      const { container } = render(
        <SupportChatWidget
          adapter={createAdapter().adapter}
          channel="app"
          flags={flags}
        />
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders the button with NATIVE', () => {
      render(
        <SupportChatWidget
          adapter={createAdapter().adapter}
          channel="app"
          flags={{ supportType: SupportType.NATIVE }}
        />
      );
      expect(screen.getByLabelText('Abrir suporte')).toBeInTheDocument();
    });
  });

  it('opens, starts the conversation and sends more messages', async () => {
    const { adapter } = createAdapter();
    const onOpen = jest.fn();
    const onSend = jest.fn();
    render(
      <SupportChatWidget
        adapter={adapter}
        channel="backoffice"
        institutionId="inst-1"
        user={{ name: 'Maria', email: 'maria@escola.com' }}
        onOpen={onOpen}
        onSend={onSend}
      />
    );

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'Suporte' })).toBeInTheDocument();
    expect(
      screen.getByText('Olá! Como podemos te ajudar?')
    ).toBeInTheDocument();

    await sendText('oi');
    expect(adapter.startConversation).toHaveBeenCalledWith({
      message: 'oi',
      channel: 'backoffice',
      institutionId: 'inst-1',
      requesterName: 'Maria',
      email: 'maria@escola.com',
      files: [],
    });
    expect(onSend).toHaveBeenCalledWith(buildMessage('m1', 'oi'));
    expect(screen.getByText('oi')).toBeInTheDocument();

    type('de novo');
    await act(async () => {
      fireEvent.keyDown(screen.getByLabelText('Mensagem'), { key: 'Enter' });
    });
    expect(adapter.sendMessage).toHaveBeenCalledWith('ticket-1', 'de novo', []);
    expect(screen.getByText('de novo')).toBeInTheDocument();
  });

  it('keeps the text and shows the error when sending fails', async () => {
    const { adapter } = createAdapter();
    adapter.startConversation.mockRejectedValueOnce(new Error('Falhou'));
    render(<SupportChatWidget adapter={adapter} channel="app" />);

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('oi');

    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    expect(screen.getByLabelText('Mensagem')).toHaveValue('oi');
  });

  it('applies realtime events and counts unread replies while minimized', async () => {
    const { adapter, emit } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('oi');

    emit({
      type: 'message_updated',
      payload: { messageId: 'm1', content: 'oi editado', read: true },
    });
    expect(screen.getByText('oi editado')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Minimizar'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    emit({
      type: 'new_message',
      payload: {
        message: buildMessage('a1', 'Olá', SUPPORT_CHAT_AUTHOR.AGENT),
      },
    });
    expect(screen.getByLabelText('1 novas mensagens')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('1 novas mensagens')
    ).not.toBeInTheDocument();

    emit({ type: 'error', payload: { message: 'Conexão perdida' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Conexão perdida');

    emit({
      type: 'ticket_updated',
      payload: {
        ticketId: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.FECHADO,
        handlerType: null,
        problemType: null,
      },
    });
    expect(
      screen.getByText('Este atendimento foi encerrado.')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Mensagem')).not.toBeInTheDocument();
  });

  it('closing resets the conversation and calls onClose', async () => {
    const { adapter } = createAdapter();
    const onClose = jest.fn();
    render(
      <SupportChatWidget
        adapter={adapter}
        channel="app"
        onClose={onClose}
        theme={{
          title: 'Ajuda',
          primaryColor: '#123456',
          position: 'bottom-left',
        }}
      />
    );

    fireEvent.click(screen.getByLabelText('Abrir ajuda'));
    await sendText('oi');
    fireEvent.click(screen.getByLabelText('Encerrar conversa'));

    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('Abrir ajuda'));
    expect(screen.queryByText('oi')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Enviar')).toHaveStyle({
      backgroundColor: '#123456',
    });
  });

  it('ignores empty messages', async () => {
    const { adapter } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    type('   ');
    await act(async () => {
      fireEvent.submit(screen.getByLabelText('Mensagem').closest('form')!);
    });
    expect(adapter.startConversation).not.toHaveBeenCalled();
  });
});

describe('SupportChatWidget images', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });

  const png = (name = 'foto.png', size = 10) => {
    const file = new File(['x'], name, { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };
  const pick = (files: File[]) =>
    fireEvent.change(screen.getByTestId('support-chat-file-input'), {
      target: { files },
    });

  it('previews, removes and sends images', async () => {
    const { adapter } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));

    expect(screen.getByLabelText('Enviar')).toBeDisabled();
    const input = screen.getByTestId('support-chat-file-input');
    const click = jest.spyOn(input, 'click');
    fireEvent.click(screen.getByLabelText('Anexar imagem'));
    expect(click).toHaveBeenCalled();
    pick([png('a.png'), png('b.png')]);
    expect(screen.getByAltText('a.png')).toHaveAttribute('src', 'blob:preview');
    fireEvent.click(screen.getByLabelText('Remover a.png'));
    expect(screen.queryByAltText('a.png')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Enviar')).toBeEnabled();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Enviar'));
    });
    expect(adapter.startConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '',
        files: [expect.objectContaining({ name: 'b.png' })],
      })
    );
    expect(screen.queryByAltText('b.png')).not.toBeInTheDocument();
  });

  it('keeps the images when sending fails', async () => {
    const { adapter } = createAdapter();
    adapter.startConversation.mockRejectedValueOnce(new Error('Falhou'));
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));

    pick([png()]);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Enviar'));
    });
    expect(screen.getByAltText('foto.png')).toBeInTheDocument();
  });

  it.each([
    [
      'type',
      [new File(['x'], 'a.pdf', { type: 'application/pdf' })],
      'Envie imagens JPG, PNG, GIF ou WEBP',
    ],
    ['size', [png('big.png', 6 * 1024 * 1024)], 'big.png passa de 5 MB'],
    [
      'count',
      Array.from({ length: 6 }, (_, i) => png(`${i}.png`)),
      'Máximo de 5 imagens por mensagem',
    ],
  ])('refuses images by %s', (_label, files, text) => {
    const { adapter } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));

    pick(files as File[]);
    expect(screen.getByRole('alert')).toHaveTextContent(text);
  });

  it('shows image and file attachments of the messages', async () => {
    const { adapter, emit } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('oi');

    emit({
      type: 'new_message',
      payload: {
        message: {
          ...buildMessage('a1', '', SUPPORT_CHAT_AUTHOR.AGENT),
          attachments: [
            {
              id: 'f1',
              url: 'https://cdn/x.png',
              fileName: 'x.png',
              mimeType: 'image/png',
              size: 1,
            },
            {
              id: 'f2',
              url: 'https://cdn/y.pdf',
              fileName: 'y.pdf',
              mimeType: 'application/pdf',
              size: 1,
            },
          ],
        },
      },
    });
    expect(screen.getByAltText('x.png')).toHaveAttribute(
      'src',
      'https://cdn/x.png'
    );
    expect(screen.getByText('y.pdf')).toHaveAttribute(
      'href',
      'https://cdn/y.pdf'
    );
  });
});

describe('SupportChatWidget optimistic rendering', () => {
  it('shows the message faded while it is being sent', async () => {
    const { adapter } = createAdapter();
    adapter.startConversation.mockReturnValueOnce(new Promise(() => undefined));
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));

    type('oi');
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Enviar'));
    });

    const bubble = screen.getByText('oi').closest('[aria-busy]');
    expect(bubble).toHaveClass('opacity-60');
    expect(screen.getByText('Enviando…')).toBeInTheDocument();
  });
});
