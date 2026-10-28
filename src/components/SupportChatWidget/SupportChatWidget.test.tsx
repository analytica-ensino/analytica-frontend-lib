import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getByLabelText('1 nova mensagem')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.queryByLabelText('1 nova mensagem')).not.toBeInTheDocument();

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

    fireEvent.click(screen.getByText('Iniciar nova conversa'));
    expect(screen.queryByText('Olá')).not.toBeInTheDocument();
    expect(
      screen.getByText('Olá! Como podemos te ajudar?')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument();
  });

  it('resumes a kept conversation without counting it as unread', async () => {
    const { adapter, emit } = createAdapter();
    adapter.restoreConversation = jest.fn().mockResolvedValue({
      ticket: {
        id: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.ABERTO,
        handlerType: null,
        problemType: null,
      },
      messages: [
        buildMessage('m1', 'oi'),
        buildMessage('a1', 'Resposta antiga', SUPPORT_CHAT_AUTHOR.AGENT),
      ],
    });
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    await act(async () => {});

    expect(screen.queryByLabelText('1 nova mensagem')).not.toBeInTheDocument();

    emit({
      type: 'new_message',
      payload: {
        message: buildMessage('a2', 'Resposta nova', SUPPORT_CHAT_AUTHOR.AGENT),
      },
    });
    expect(screen.getByLabelText('1 nova mensagem')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    expect(screen.getByText('Resposta antiga')).toBeInTheDocument();
    expect(screen.getByText('Resposta nova')).toBeInTheDocument();
  });

  it('closing with X only hides: the conversation and unread count go on', async () => {
    const { adapter, emit } = createAdapter();
    const onClose = jest.fn();
    render(
      <SupportChatWidget adapter={adapter} channel="app" onClose={onClose} />
    );

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('oi');
    fireEvent.click(screen.getByLabelText('Fechar'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    emit({
      type: 'new_message',
      payload: {
        message: buildMessage('a2', 'Resposta', SUPPORT_CHAT_AUTHOR.AGENT),
      },
    });
    expect(screen.getByLabelText('1 nova mensagem')).toBeInTheDocument();

    emit({
      type: 'new_message',
      payload: {
        message: buildMessage('a3', 'Mais uma', SUPPORT_CHAT_AUTHOR.AGENT),
      },
    });
    expect(screen.getByLabelText('2 novas mensagens')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    expect(screen.getByText('oi')).toBeInTheDocument();
    expect(screen.getByText('Resposta')).toBeInTheDocument();
  });

  it('closing calls onClose and keeps the theme', async () => {
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
    fireEvent.click(screen.getByLabelText('Fechar'));

    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('Abrir ajuda'));
    expect(screen.getByText('oi')).toBeInTheDocument();
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
    fireEvent.click(screen.getByLabelText('Anexar arquivo'));
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
      [new File(['x'], 'a.txt', { type: 'text/plain' })],
      'Envie imagens (JPG, PNG, GIF, WEBP), PDF ou vídeo (MP4, WEBM, MOV)',
    ],
    ['size', [png('big.png', 6 * 1024 * 1024)], 'big.png passa de 5 MB'],
    [
      'count',
      Array.from({ length: 6 }, (_, i) => png(`${i}.png`)),
      'Máximo de 5 arquivos por mensagem',
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
    expect(screen.getByText('y.pdf').closest('a')).toHaveAttribute(
      'href',
      'https://cdn/y.pdf'
    );
  });
});

describe('SupportChatWidget FAQ reference', () => {
  const aiAnswer = {
    ...buildMessage(
      'ai1',
      'Clique em "Esqueci a senha".',
      SUPPORT_CHAT_AUTHOR.AI
    ),
    faq: { id: 'art-1', title: 'Como redefinir a senha' },
  };

  const openWithAiAnswer = async (
    faqArticleUrl?: (articleId: string) => string
  ) => {
    const { adapter, emit } = createAdapter();
    render(
      <SupportChatWidget
        adapter={adapter}
        channel="app"
        faqArticleUrl={faqArticleUrl}
      />
    );
    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('esqueci a senha');
    emit({ type: 'new_message', payload: { message: aiAnswer } });
  };

  it('links the article the AI answer is based on', async () => {
    await openWithAiAnswer((id) => `/artigo/${id}`);

    expect(
      screen.getByText('Baseado na FAQ: Como redefinir a senha').closest('a')
    ).toHaveAttribute('href', '/artigo/art-1');
  });

  it('only names the article without a link builder', async () => {
    await openWithAiAnswer();

    expect(
      screen.getByText('Baseado na FAQ: Como redefinir a senha').closest('a')
    ).toBeNull();
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

describe('SupportChatWidget contact form', () => {
  const contactAsk = (id: string) => ({
    ...buildMessage(id, 'Qual seu nome e e-mail?', SUPPORT_CHAT_AUTHOR.AI),
    contactRequest: ['name', 'email'] as SupportChatMessage['contactRequest'],
  });

  const openWithContactAsk = async (withUpdateContact = true) => {
    const { adapter, emit } = createAdapter();
    if (withUpdateContact) {
      adapter.updateContact = jest.fn().mockResolvedValue(undefined);
    }
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('oi');
    emit({ type: 'new_message', payload: { message: contactAsk('ai1') } });
    return { adapter, emit };
  };

  const contactForm = () => screen.getByRole('form', { name: 'Seus dados' });

  const fillContact = async () => {
    fireEvent.change(screen.getByLabelText('Seu nome'), {
      target: { value: 'Ana' },
    });
    await act(async () => {
      fireEvent.click(
        within(contactForm()).getByRole('button', { name: 'Avançar' })
      );
    });
    fireEvent.change(screen.getByLabelText('Seu e-mail'), {
      target: { value: 'Ana@X.com' },
    });
    await act(async () => {
      fireEvent.click(
        within(contactForm()).getByRole('button', { name: 'Enviar' })
      );
    });
  };

  it('locks the composer until the contact is saved', async () => {
    const { adapter, emit } = await openWithContactAsk();

    expect(contactForm()).toBeInTheDocument();
    const textarea = screen.getByLabelText('Mensagem');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Preencha seus dados acima'
    );
    expect(screen.getByLabelText('Anexar arquivo')).toBeDisabled();
    expect(screen.getByLabelText('Enviar')).toBeDisabled();

    await fillContact();
    expect(adapter.updateContact).toHaveBeenCalledWith('ticket-1', {
      requesterName: 'Ana',
      email: 'ana@x.com',
    });
    expect(
      screen.getByTestId('support-chat-contact-saved')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeEnabled();
    expect(screen.getByLabelText('Mensagem')).toHaveAttribute(
      'placeholder',
      'Digite sua mensagem'
    );
    expect(screen.getByLabelText('Anexar arquivo')).toBeEnabled();

    // A later message without a request keeps the saved form in place
    emit({
      type: 'new_message',
      payload: {
        message: buildMessage('a2', 'Obrigado', SUPPORT_CHAT_AUTHOR.AI),
      },
    });
    expect(
      screen.getByTestId('support-chat-contact-saved')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeEnabled();
  });

  it('shows the form only under the latest request', async () => {
    const { emit } = await openWithContactAsk();
    emit({ type: 'new_message', payload: { message: contactAsk('ai2') } });

    expect(screen.getAllByRole('form', { name: 'Seus dados' })).toHaveLength(1);
    expect(screen.getByLabelText('Mensagem')).toBeDisabled();
  });

  it('shows no form when the adapter cannot save the contact', async () => {
    await openWithContactAsk(false);

    expect(screen.getByText('Qual seu nome e e-mail?')).toBeInTheDocument();
    expect(
      screen.queryByRole('form', { name: 'Seus dados' })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeEnabled();
  });

  it('keeps the composer locked and shows the error when saving fails', async () => {
    const { adapter } = await openWithContactAsk();
    (adapter.updateContact as jest.Mock).mockRejectedValueOnce({
      response: { status: 409 },
    });

    await fillContact();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'O e-mail deste atendimento já foi informado'
    );
    expect(contactForm()).toBeInTheDocument();
    expect(
      screen.queryByTestId('support-chat-contact-saved')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeDisabled();
  });

  it('starting over clears the request', async () => {
    const { emit } = await openWithContactAsk();
    emit({
      type: 'ticket_updated',
      payload: {
        ticketId: 'ticket-1',
        status: SUPPORT_CHAT_STATUS.FECHADO,
        handlerType: null,
        problemType: null,
      },
    });
    fireEvent.click(screen.getByText('Iniciar nova conversa'));

    expect(
      screen.queryByRole('form', { name: 'Seus dados' })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeEnabled();
  });
});

describe('SupportChatWidget article inside the chat', () => {
  const ARTICLE_ID = '0b6f3c8e-1a2b-4c3d-8e9f-0123456789ab';
  const aiAnswer = {
    ...buildMessage('ai1', 'Veja o passo a passo.', SUPPORT_CHAT_AUTHOR.AI),
    faq: { id: ARTICLE_ID, title: 'Como redefinir a senha' },
  };

  const openWithArticles = async ({
    faqArticleUrl,
    institutionId = 'inst-1',
    message = aiAnswer,
  }: {
    faqArticleUrl?: (articleId: string) => string;
    institutionId?: string;
    message?: SupportChatMessage;
  } = {}) => {
    const { adapter, emit } = createAdapter();
    adapter.getArticle = jest.fn().mockResolvedValue({
      id: ARTICLE_ID,
      title: 'Como redefinir a senha',
      body: '<p>Clique em <strong>Esqueci a senha</strong>.</p>',
      updatedAt: '2026-10-21T12:00:00.000Z',
    });
    render(
      <SupportChatWidget
        adapter={adapter}
        channel="app"
        institutionId={institutionId}
        faqArticleUrl={faqArticleUrl}
      />
    );
    fireEvent.click(screen.getByLabelText('Abrir suporte'));
    await sendText('esqueci a senha');
    emit({ type: 'new_message', payload: { message } });
    return { adapter, emit };
  };

  const openFaq = async () => {
    await act(async () => {
      fireEvent.click(
        screen.getByText('Baseado na FAQ: Como redefinir a senha')
      );
    });
  };

  it('opens the FAQ article in the expanded window and goes back', async () => {
    const { adapter } = await openWithArticles();
    const dialog = screen.getByRole('dialog', { name: 'Suporte' });
    expect(dialog).toHaveClass('w-[360px]', 'h-[520px]');
    expect(
      screen.getByText('Baseado na FAQ: Como redefinir a senha').closest('a')
    ).toHaveAttribute('href', '#');

    await openFaq();
    expect(adapter.getArticle).toHaveBeenCalledWith('inst-1', ARTICLE_ID);
    expect(screen.getByTestId('support-chat-article')).toBeInTheDocument();
    expect(screen.getByText('Esqueci a senha')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mensagem')).not.toBeInTheDocument();
    expect(screen.queryByText('oi')).not.toBeInTheDocument();
    expect(dialog).toHaveClass('w-[720px]', 'h-[615px]');
    expect(
      screen.queryByLabelText('Abrir em nova aba')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Reduzir artigo'));
    expect(dialog).toHaveClass('w-[360px]', 'h-[520px]');
    fireEvent.click(screen.getByLabelText('Expandir artigo'));
    expect(dialog).toHaveClass('w-[720px]', 'h-[615px]');

    fireEvent.click(screen.getByLabelText('Voltar para a janela de mensagens'));
    expect(
      screen.queryByTestId('support-chat-article')
    ).not.toBeInTheDocument();
    expect(dialog).toHaveClass('w-[360px]', 'h-[520px]');
    expect(screen.getByText('oi')).toBeInTheDocument();
    expect(screen.getByText('Veja o passo a passo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument();
  });

  it('links the article page in a new tab with faqArticleUrl', async () => {
    await openWithArticles({ faqArticleUrl: (id) => `/artigo/${id}` });
    expect(
      screen.getByText('Baseado na FAQ: Como redefinir a senha').closest('a')
    ).toHaveAttribute('href', `/artigo/${ARTICLE_ID}`);

    await openFaq();
    expect(screen.getByLabelText('Abrir em nova aba')).toHaveAttribute(
      'href',
      `/artigo/${ARTICLE_ID}`
    );
  });

  it('opens an article link written in a message', async () => {
    const { adapter } = await openWithArticles({
      message: buildMessage(
        'ag1',
        `Leia https://faq.escola.com/artigo/${ARTICLE_ID}.`,
        SUPPORT_CHAT_AUTHOR.AGENT
      ),
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole('link', {
          name: `https://faq.escola.com/artigo/${ARTICLE_ID}`,
        })
      );
    });
    expect(adapter.getArticle).toHaveBeenCalledWith('inst-1', ARTICLE_ID);
    expect(screen.getByTestId('support-chat-article')).toBeInTheDocument();
    // Only the title loaded from the article is known here
    expect(
      screen.getByRole('heading', { name: 'Como redefinir a senha' })
    ).toBeInTheDocument();
  });

  it('keeps the old link without an institution', async () => {
    await openWithArticles({
      institutionId: '',
      faqArticleUrl: (id) => `/artigo/${id}`,
    });
    const link = screen
      .getByText('Baseado na FAQ: Como redefinir a senha')
      .closest('a');
    expect(link).toHaveAttribute('target', '_blank');
    fireEvent.click(link!);
    expect(
      screen.queryByTestId('support-chat-article')
    ).not.toBeInTheDocument();
  });
});

describe('SupportChatWidget PDF and video attachments', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });

  it('shows picked PDF and video as chips and sends them', async () => {
    const { adapter } = createAdapter();
    render(<SupportChatWidget adapter={adapter} channel="app" />);
    fireEvent.click(screen.getByLabelText('Abrir suporte'));

    const input = screen.getByTestId('support-chat-file-input');
    expect(input.getAttribute('accept')).toContain('application/pdf');
    expect(input.getAttribute('accept')).toContain('video/mp4');
    fireEvent.change(input, {
      target: {
        files: [
          new File(['x'], 'guia.pdf', { type: 'application/pdf' }),
          new File(['x'], 'tela.mp4', { type: 'video/mp4' }),
        ],
      },
    });
    expect(screen.getByText('guia.pdf')).toBeInTheDocument();
    expect(screen.getByText('tela.mp4')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover guia.pdf')).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Enviar'));
    });
    expect(adapter.startConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({ name: 'guia.pdf' }),
          expect.objectContaining({ name: 'tela.mp4' }),
        ],
      })
    );
  });

  it('plays a video attachment of a message', async () => {
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
              id: 'v1',
              url: 'https://cdn/tela.mp4',
              fileName: 'tela.mp4',
              mimeType: 'video/mp4',
              size: 1,
            },
          ],
        },
      },
    });
    const video = screen.getByLabelText('tela.mp4');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('src', 'https://cdn/tela.mp4');
    expect(video).toHaveAttribute('controls');
  });
});
