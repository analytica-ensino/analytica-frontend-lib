import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal, {
  MicPermissionModalPapole,
  MicOffModalPapole,
  AudioPlaybackModalPapole,
  SuccessModalPapole,
} from './Modal';
import { useMicrophonePermission } from '../../hooks/useMicrophonePermission';
import * as videoUtils from './utils/videoUtils';

// MicPermissionModalPapole reads the microphone permission via this hook; mock it
// so we control `shouldAsk` (managed-mode visibility) and `requestPermission`.
jest.mock('../../hooks/useMicrophonePermission');
const mockUseMicrophonePermission = useMicrophonePermission as jest.Mock;

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: 'Test content',
  };

  let originalOverflow: string;

  beforeEach(() => {
    jest.clearAllMocks();
    // Salvar o valor original do overflow
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    // Restaurar o valor original do overflow
    document.body.style.overflow = originalOverflow;
  });

  it('deve renderizar o modal quando isOpen é true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('deve chamar onClose quando o botão X é clicado', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fechar modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose quando ESC é pressionado', async () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('não deve chamar onClose quando ESC é pressionado e closeOnEscape é false', async () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('deve renderizar o footer quando fornecido', () => {
    const footer = <button>Footer Button</button>;
    render(<Modal {...defaultProps} footer={footer} />);

    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('não deve renderizar o botão de fechar quando hideCloseButton é true', () => {
    render(<Modal {...defaultProps} hideCloseButton />);

    expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument();
  });

  it('deve aplicar classes CSS personalizadas', () => {
    render(<Modal {...defaultProps} className="custom-class" />);

    // Buscar o dialog que tem as classes personalizadas
    const modalContent = document.querySelector('dialog');
    expect(modalContent).toHaveClass('custom-class');
  });

  describe('Custom CSS classes', () => {
    it('should apply viewport classes (max-w-[95vw])', () => {
      render(<Modal {...defaultProps} className="max-w-[95vw]" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[95vw]');
    });

    it('should apply max-height classes with viewport units', () => {
      render(<Modal {...defaultProps} className="max-h-[90vh]" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-h-[90vh]');
    });

    it('should apply overflow classes', () => {
      render(<Modal {...defaultProps} className="overflow-y-auto" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('overflow-y-auto');
    });

    it('should apply multiple custom classes simultaneously', () => {
      render(
        <Modal
          {...defaultProps}
          className="max-w-[95vw] max-h-[90vh] overflow-y-auto"
        />
      );

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[95vw]');
      expect(modalContent).toHaveClass('max-h-[90vh]');
      expect(modalContent).toHaveClass('overflow-y-auto');
    });

    it('should combine custom classes with modal size classes', () => {
      render(
        <Modal
          {...defaultProps}
          size="lg"
          className="max-h-[90vh] overflow-y-auto"
        />
      );

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[640px]');
      expect(modalContent).toHaveClass('max-h-[90vh]');
      expect(modalContent).toHaveClass('overflow-y-auto');
    });
  });

  it('deve bloquear o scroll do body quando o modal está aberto', () => {
    render(<Modal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('deve adicionar padding-right ao body quando há scrollbar', () => {
    // Mock window.innerWidth e clientWidth para simular scrollbar
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1009, // 15px de scrollbar
    });

    render(<Modal {...defaultProps} />);

    expect(document.body.style.paddingRight).toBe('15px');
  });

  it('deve criar overlay para cobrir área da scrollbar', () => {
    // Mock window.innerWidth e clientWidth para simular scrollbar
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1009,
    });

    render(<Modal {...defaultProps} />);

    const overlay = document.getElementById('modal-scrollbar-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay?.style.width).toBe('15px');
    expect(overlay?.style.position).toBe('fixed');
    expect(overlay?.style.top).toBe('0px');
    expect(overlay?.style.right).toBe('0px');
  });

  it('deve remover overlay quando modal fecha', () => {
    // Mock scrollbar
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1009,
    });

    const { rerender } = render(<Modal {...defaultProps} />);

    expect(
      document.getElementById('modal-scrollbar-overlay')
    ).toBeInTheDocument();

    rerender(<Modal {...defaultProps} isOpen={false} />);

    expect(
      document.getElementById('modal-scrollbar-overlay')
    ).not.toBeInTheDocument();
  });

  it('deve aplicar as classes de estilo corretas no conteúdo', () => {
    render(<Modal {...defaultProps} />);

    const contentDiv = screen.getByText('Test content');
    expect(contentDiv).toHaveClass(
      'text-text-500',
      'font-normal',
      'text-sm',
      'leading-6'
    );
  });

  it('deve aplicar padding correto no header', () => {
    render(<Modal {...defaultProps} />);

    const header = document.querySelector('.flex.items-center.justify-between');
    expect(header).toHaveClass('px-6', 'py-6');
  });

  it('deve usar elemento dialog para acessibilidade', () => {
    render(<Modal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('open');
  });

  describe('Tamanhos', () => {
    it('deve aplicar classes de tamanho XS', () => {
      render(<Modal {...defaultProps} size="xs" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[360px]');
    });

    it('deve aplicar classes de tamanho SM', () => {
      render(<Modal {...defaultProps} size="sm" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[420px]');
    });

    it('deve aplicar classes de tamanho MD (padrão)', () => {
      render(<Modal {...defaultProps} />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[510px]');
    });

    it('deve aplicar classes de tamanho LG', () => {
      render(<Modal {...defaultProps} size="lg" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[640px]');
    });

    it('deve aplicar classes de tamanho XL', () => {
      render(<Modal {...defaultProps} size="xl" />);

      const modalContent = document.querySelector('dialog');
      expect(modalContent).toHaveClass('max-w-[970px]');
    });
  });

  describe('Activity variant', () => {
    const activityProps = {
      isOpen: true,
      onClose: jest.fn(),
      title: 'Nova atividade',
      variant: 'activity' as const,
      description: 'Descrição da atividade',
      image: 'https://example.com/image.png',
      actionLink: 'https://example.com',
      actionLabel: 'Iniciar',
    };

    it('deve renderizar modal de atividade com todas as props', () => {
      render(<Modal {...activityProps} />);

      expect(screen.getByText('Nova atividade')).toBeInTheDocument();
      expect(screen.getByText('Descrição da atividade')).toBeInTheDocument();
      expect(screen.getByText('Iniciar')).toBeInTheDocument();

      const image = screen.getByAltText('');
      expect(image).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('deve renderizar iframe do YouTube quando actionLink é URL do YouTube', () => {
      // Mock das funções de videoUtils
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(true);
      jest
        .spyOn(videoUtils, 'getYouTubeVideoId')
        .mockReturnValue('dQw4w9WgXcQ');
      jest
        .spyOn(videoUtils, 'getYouTubeEmbedUrl')
        .mockReturnValue(
          'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1'
        );

      render(
        <Modal
          {...activityProps}
          actionLink="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />
      );

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1'
      );
      expect(iframe).toHaveAttribute('title', 'Vídeo YouTube');
    });

    it('deve exibir botão quando URL é do YouTube mas ID não é extraído', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(true);
      jest.spyOn(videoUtils, 'getYouTubeVideoId').mockReturnValue(null);

      render(
        <Modal
          {...activityProps}
          actionLabel="Iniciar"
          actionLink="https://www.youtube.com/watch"
        />
      );

      expect(screen.getByText('Iniciar')).toBeInTheDocument();
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('deve renderizar botão quando actionLink não é YouTube', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(false);

      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

      render(<Modal {...activityProps} />);

      const button = screen.getByText('Iniciar');
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      );

      windowOpenSpy.mockRestore();
    });

    it('não deve renderizar ação quando actionLink é null', () => {
      render(<Modal {...activityProps} actionLink={undefined} />);

      expect(screen.queryByText('Iniciar')).not.toBeInTheDocument();
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('não deve renderizar imagem quando image é undefined', () => {
      render(<Modal {...activityProps} image={undefined} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('não deve renderizar descrição quando description é undefined', () => {
      render(<Modal {...activityProps} description={undefined} />);

      expect(
        screen.queryByText('Descrição da atividade')
      ).not.toBeInTheDocument();
    });

    it('deve usar label padrão quando actionLabel não é fornecido', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(false);

      render(<Modal {...activityProps} actionLabel={undefined} />);

      expect(screen.getByText('Iniciar Atividade')).toBeInTheDocument();
    });

    it('deve ter layout centralizado para variante activity', () => {
      render(<Modal {...activityProps} />);

      const contentDiv = document.querySelector(
        '.flex.flex-col.items-center.px-6.pb-6.gap-5'
      );
      expect(contentDiv).toBeInTheDocument();
    });

    it('deve ter header apenas com botão X na variante activity', () => {
      render(<Modal {...activityProps} />);

      const header = document.querySelector('.flex.justify-end.p-6.pb-0');
      expect(header).toBeInTheDocument();

      // Não deve ter título no header para variante activity
      const headerTitle = header?.querySelector('h2');
      expect(headerTitle).not.toBeInTheDocument();
    });

    it('deve exibir botão quando URL é do YouTube mas ID não é extraído', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(true);
      jest.spyOn(videoUtils, 'getYouTubeVideoId').mockReturnValue(null);
      render(
        <Modal
          {...activityProps}
          actionLabel="Iniciar"
          actionLink="https://www.youtube.com/watch"
        />
      );
      expect(screen.getByText('Iniciar')).toBeInTheDocument();
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('deve usar label padrão quando YouTube ID é null e actionLabel não fornecido', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(true);
      jest.spyOn(videoUtils, 'getYouTubeVideoId').mockReturnValue(null);
      render(
        <Modal
          {...activityProps}
          actionLink="https://www.youtube.com/watch"
          actionLabel={undefined}
        />
      );
      expect(screen.getByText('Iniciar Atividade')).toBeInTheDocument();
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('deve normalizar URL sem protocolo ao abrir em nova aba', () => {
      jest.spyOn(videoUtils, 'isYouTubeUrl').mockReturnValue(false);
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
      render(<Modal {...activityProps} actionLink="example.com/path" />);
      fireEvent.click(screen.getByText('Iniciar'));
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com/path',
        '_blank',
        'noopener,noreferrer'
      );
      windowOpenSpy.mockRestore();
    });
  });

  describe('title como ReactNode', () => {
    it('renderiza title string dentro de um <h2>', () => {
      const { container } = render(
        <Modal {...defaultProps} title="Título simples" />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Título simples');
    });

    it('renderiza title ReactNode (phrasing content) dentro do mesmo <h2>', () => {
      const { container } = render(
        <Modal
          {...defaultProps}
          title={
            <span>
              <button type="button">Voltar</button>
              <span>Título composto</span>
            </span>
          }
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(screen.getByText('Título composto')).toBeInTheDocument();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });

    it('mantém aria-labelledby apontando pro h2 quando title é ReactNode', () => {
      const { container } = render(
        <Modal {...defaultProps} title={<span>Custom</span>} />
      );
      const dialog = container.querySelector('dialog');
      const h2 = container.querySelector('h2');
      const h2Id = h2?.getAttribute('id');
      expect(h2Id).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-labelledby', h2Id as string);
    });
  });
});

// ======================================================================
// MicPermissionModalPapole
// ======================================================================

describe('MicPermissionModalPapole', () => {
  let requestPermission: jest.Mock;
  let originalOverflow: string;

  beforeEach(() => {
    jest.clearAllMocks();
    originalOverflow = document.body.style.overflow;
    requestPermission = jest.fn().mockResolvedValue(true);
    // Default: microphone not granted yet (managed mode opens on its own).
    mockUseMicrophonePermission.mockReturnValue({
      shouldAsk: true,
      requestPermission,
    });
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe('managed mode (no isOpen)', () => {
    it('opens on its own when the mic still needs to be asked', () => {
      render(<MicPermissionModalPapole />);
      expect(
        screen.getByText('Por que pedimos acesso ao microfone')
      ).toBeInTheDocument();
      expect(screen.getByText(/Usamos o microfone/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Habilitar permissões' })
      ).toBeInTheDocument();
    });

    it('stays closed when permission is already granted', () => {
      mockUseMicrophonePermission.mockReturnValue({
        shouldAsk: false,
        requestPermission,
      });
      render(<MicPermissionModalPapole />);
      expect(
        screen.queryByText('Por que pedimos acesso ao microfone')
      ).not.toBeInTheDocument();
    });

    it('requests permission and reports the result via onEnable', async () => {
      const onEnable = jest.fn();
      render(<MicPermissionModalPapole onEnable={onEnable} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Habilitar permissões' })
      );

      await waitFor(() => {
        expect(requestPermission).toHaveBeenCalledTimes(1);
        expect(onEnable).toHaveBeenCalledWith(true);
      });
    });

    it('dismisses on "Configurar depois" and calls onConfigureLater', () => {
      const onConfigureLater = jest.fn();
      render(<MicPermissionModalPapole onConfigureLater={onConfigureLater} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Configurar depois' })
      );

      expect(onConfigureLater).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByText('Por que pedimos acesso ao microfone')
      ).not.toBeInTheDocument();
    });

    it('dismisses when the close button is clicked', () => {
      render(<MicPermissionModalPapole />);
      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
      expect(
        screen.queryByText('Por que pedimos acesso ao microfone')
      ).not.toBeInTheDocument();
    });

    it('dismisses on Escape', () => {
      render(<MicPermissionModalPapole />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(
        screen.queryByText('Por que pedimos acesso ao microfone')
      ).not.toBeInTheDocument();
    });

    it('calls onLearnMore when the "Saiba mais" bar is clicked', () => {
      const onLearnMore = jest.fn();
      render(<MicPermissionModalPapole onLearnMore={onLearnMore} />);
      fireEvent.click(
        screen.getByText('Saiba mais sobre como cuidamos dos dados')
      );
      expect(onLearnMore).toHaveBeenCalledTimes(1);
    });
  });

  describe('controlled mode (isOpen provided)', () => {
    it('renders when isOpen is true regardless of shouldAsk', () => {
      mockUseMicrophonePermission.mockReturnValue({
        shouldAsk: false,
        requestPermission,
      });
      render(<MicPermissionModalPapole isOpen />);
      expect(
        screen.getByText('Por que pedimos acesso ao microfone')
      ).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<MicPermissionModalPapole isOpen={false} />);
      expect(
        screen.queryByText('Por que pedimos acesso ao microfone')
      ).not.toBeInTheDocument();
    });

    it('calls onClose (not internal dismiss) on the close button', () => {
      const onClose = jest.fn();
      render(<MicPermissionModalPapole isOpen onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      // Still open: the parent owns visibility.
      expect(
        screen.getByText('Por que pedimos acesso ao microfone')
      ).toBeInTheDocument();
    });

    it('calls onClose on Escape', () => {
      const onClose = jest.fn();
      render(<MicPermissionModalPapole isOpen onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('"Configurar depois" calls onConfigureLater without internally dismissing', () => {
      const onConfigureLater = jest.fn();
      render(
        <MicPermissionModalPapole isOpen onConfigureLater={onConfigureLater} />
      );
      fireEvent.click(
        screen.getByRole('button', { name: 'Configurar depois' })
      );
      expect(onConfigureLater).toHaveBeenCalledTimes(1);
      // Controlled: still visible until the parent flips isOpen.
      expect(
        screen.getByText('Por que pedimos acesso ao microfone')
      ).toBeInTheDocument();
    });

    it('does not close on Escape when closeOnEscape is false', () => {
      const onClose = jest.fn();
      render(
        <MicPermissionModalPapole
          isOpen
          onClose={onClose}
          closeOnEscape={false}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('renders a custom title and description', () => {
    render(
      <MicPermissionModalPapole
        isOpen
        title="Título custom"
        description={<p>Descrição custom</p>}
      />
    );
    expect(screen.getByText('Título custom')).toBeInTheDocument();
    expect(screen.getByText('Descrição custom')).toBeInTheDocument();
  });
});

// ======================================================================
// MicOffModalPapole
// ======================================================================

describe('MicOffModalPapole', () => {
  const defaultProps = { isOpen: true, onClose: jest.fn() };
  let originalOverflow: string;

  beforeEach(() => {
    jest.clearAllMocks();
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it('renders the default title and actions when open', () => {
    render(<MicOffModalPapole {...defaultProps} />);
    expect(
      screen.getByText('Parece que o microfone está desligado')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tentar ler de novo' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pedir ajuda a um adulto' })
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<MicOffModalPapole {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByText('Parece que o microfone está desligado')
    ).not.toBeInTheDocument();
  });

  it('calls onRetry and onAskAdult', () => {
    const onRetry = jest.fn();
    const onAskAdult = jest.fn();
    render(
      <MicOffModalPapole
        {...defaultProps}
        onRetry={onRetry}
        onAskAdult={onAskAdult}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tentar ler de novo' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Pedir ajuda a um adulto' })
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onAskAdult).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on the close button and on Escape', () => {
    const onClose = jest.fn();
    render(<MicOffModalPapole {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = jest.fn();
    render(
      <MicOffModalPapole
        {...defaultProps}
        onClose={onClose}
        closeOnEscape={false}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders a custom title', () => {
    render(<MicOffModalPapole {...defaultProps} title="Sem áudio" />);
    expect(screen.getByText('Sem áudio')).toBeInTheDocument();
  });
});

// ======================================================================
// AudioPlaybackModalPapole
// ======================================================================

describe('AudioPlaybackModalPapole', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    src: 'recording.webm',
  };

  let playMock: jest.Mock;
  let pauseMock: jest.Mock;
  let currentTimeValue: number;
  let durationValue: number;
  let originalOverflow: string;

  const descriptors = {
    play: Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'play'),
    pause: Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'pause'),
    currentTime: Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      'currentTime'
    ),
    duration: Object.getOwnPropertyDescriptor(
      HTMLMediaElement.prototype,
      'duration'
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    originalOverflow = document.body.style.overflow;
    playMock = jest.fn().mockResolvedValue(undefined);
    pauseMock = jest.fn();
    currentTimeValue = 0;
    durationValue = 0;

    // jsdom doesn't implement media playback — stub it.
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: playMock,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      writable: true,
      value: pauseMock,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
      configurable: true,
      get: () => currentTimeValue,
      set: (value: number) => {
        currentTimeValue = value;
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
      configurable: true,
      get: () => durationValue,
    });
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
    Object.defineProperty(HTMLMediaElement.prototype, 'play', descriptors.play!);
    Object.defineProperty(
      HTMLMediaElement.prototype,
      'pause',
      descriptors.pause!
    );
    if (descriptors.currentTime) {
      Object.defineProperty(
        HTMLMediaElement.prototype,
        'currentTime',
        descriptors.currentTime
      );
    }
    if (descriptors.duration) {
      Object.defineProperty(
        HTMLMediaElement.prototype,
        'duration',
        descriptors.duration
      );
    }
  });

  const getAudio = () =>
    document.querySelector('audio') as HTMLAudioElement;

  it('renders the decorative waveform, player and body actions', () => {
    const { container } = render(<AudioPlaybackModalPapole {...defaultProps} />);

    // 19 decorative waveform bars.
    const waveform = container.querySelector('[aria-hidden="true"]');
    expect(waveform?.children).toHaveLength(19);

    expect(
      screen.getByRole('button', { name: 'Reproduzir' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pronto!' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Quero ler de novo' })
    ).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AudioPlaybackModalPapole {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByRole('button', { name: 'Reproduzir' })
    ).not.toBeInTheDocument();
  });

  it('disables the play button without a src', () => {
    render(<AudioPlaybackModalPapole {...defaultProps} src={undefined} />);
    expect(screen.getByRole('button', { name: 'Reproduzir' })).toBeDisabled();
  });

  it('toggles play/pause and updates the aria-label', async () => {
    render(<AudioPlaybackModalPapole {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    expect(playMock).toHaveBeenCalledTimes(1);

    // Só vira "Pausar" depois que o play() resolve.
    fireEvent.click(await screen.findByRole('button', { name: 'Pausar' }));
    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Reproduzir' })
    ).toBeInTheDocument();
  });

  it('keeps the play label when play() rejects (e.g. invalid source)', async () => {
    playMock.mockRejectedValueOnce(new Error('no supported source'));
    render(<AudioPlaybackModalPapole {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    expect(playMock).toHaveBeenCalledTimes(1);

    // A falha não pode deixar a UI indicando reprodução ativa.
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Reproduzir' })
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByRole('button', { name: 'Pausar' })
    ).not.toBeInTheDocument();
  });

  it('updates the displayed time on timeupdate', () => {
    render(<AudioPlaybackModalPapole {...defaultProps} />);

    currentTimeValue = 65; // 00:01:05
    fireEvent.timeUpdate(getAudio());

    expect(screen.getByText('00:01:05')).toBeInTheDocument();
  });

  it('seeks and updates the progress after metadata loads', () => {
    const { container } = render(<AudioPlaybackModalPapole {...defaultProps} />);

    durationValue = 100;
    fireEvent.loadedMetadata(getAudio());

    const progressButton = screen.getByRole('button', {
      name: 'Barra de progresso',
    });
    // Seek to the middle of the track.
    jest
      .spyOn(progressButton, 'getBoundingClientRect')
      .mockReturnValue({ left: 0, width: 200 } as DOMRect);
    fireEvent.click(progressButton, { clientX: 100 });

    expect(currentTimeValue).toBe(50);
    const fill = container.querySelector(
      '[aria-label="Barra de progresso"] span'
    ) as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('resets playing state and time when the audio ends', () => {
    render(<AudioPlaybackModalPapole {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
    currentTimeValue = 30;
    fireEvent.timeUpdate(getAudio());
    expect(screen.getByText('00:00:30')).toBeInTheDocument();

    fireEvent.ended(getAudio());

    expect(
      screen.getByRole('button', { name: 'Reproduzir' })
    ).toBeInTheDocument();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('calls onConfirm, onRetry, onClose and Escape', () => {
    const onConfirm = jest.fn();
    const onRetry = jest.fn();
    const onClose = jest.fn();
    render(
      <AudioPlaybackModalPapole
        {...defaultProps}
        onConfirm={onConfirm}
        onRetry={onRetry}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pronto!' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quero ler de novo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

// ======================================================================
// SuccessModalPapole
// ======================================================================

describe('SuccessModalPapole', () => {
  const defaultProps = { isOpen: true, onClose: jest.fn() };
  let originalOverflow: string;

  beforeEach(() => {
    jest.clearAllMocks();
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it('renders the default title, description and celebration image', () => {
    render(<SuccessModalPapole {...defaultProps} />);
    expect(screen.getByText('Incrível!')).toBeInTheDocument();
    expect(screen.getByText('Você leu muito bem!')).toBeInTheDocument();
    expect(screen.getByAltText('Papolê')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SuccessModalPapole {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Incrível!')).not.toBeInTheDocument();
  });

  it('calls onClose on the close button and on Escape', () => {
    const onClose = jest.fn();
    render(<SuccessModalPapole {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = jest.fn();
    render(
      <SuccessModalPapole
        {...defaultProps}
        onClose={onClose}
        closeOnEscape={false}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders custom title and description', () => {
    render(
      <SuccessModalPapole
        {...defaultProps}
        title="Muito bem!"
        description="Continue assim!"
      />
    );
    expect(screen.getByText('Muito bem!')).toBeInTheDocument();
    expect(screen.getByText('Continue assim!')).toBeInTheDocument();
  });
});
