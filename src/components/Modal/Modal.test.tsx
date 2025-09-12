import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';
import * as videoUtils from './utils/videoUtils';

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

  it('deve bloquear o scroll do body quando o modal está aberto', () => {
    render(<Modal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
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

    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
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
  });
});
