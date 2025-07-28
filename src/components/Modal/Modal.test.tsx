import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

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

  it('deve chamar onClose quando o backdrop é clicado', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    // O backdrop agora é o primeiro div (overlay)
    const backdrop = document.querySelector('.fixed.inset-0.z-50');
    fireEvent.click(backdrop!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onClose quando o backdrop é clicado e closeOnBackdropClick é false', () => {
    const onClose = jest.fn();
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />
    );

    const backdrop = document.querySelector('.fixed.inset-0.z-50');
    fireEvent.click(backdrop!);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('não deve chamar onClose quando clica dentro do modal', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const modalContent = screen.getByText('Test content');
    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
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

  it('deve chamar onClose quando Enter ou Space é pressionado no backdrop', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const backdrop = document.querySelector('.fixed.inset-0.z-50');

    // Testar Enter
    fireEvent.keyDown(backdrop!, { key: 'Enter' });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Testar Space
    fireEvent.keyDown(backdrop!, { key: ' ' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('não deve chamar onClose quando Enter é pressionado no backdrop e closeOnBackdropClick é false', () => {
    const onClose = jest.fn();
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />
    );

    const backdrop = document.querySelector('.fixed.inset-0.z-50');
    fireEvent.keyDown(backdrop!, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
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
});
