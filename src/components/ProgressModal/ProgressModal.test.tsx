import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProgressModal from './ProgressModal';

describe('ProgressModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    message: 'Carregando...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    render(<ProgressModal {...defaultProps} />);
    // aparece duas vezes: (1) sr-only no h2, (2) visível abaixo da imagem
    expect(screen.getAllByText('Carregando...').length).toBeGreaterThan(0);
  });

  it('does not render when isOpen is false', () => {
    render(<ProgressModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
  });

  it('renders the provided image with correct alt text', () => {
    render(
      <ProgressModal
        {...defaultProps}
        image="https://example.com/loading.png"
        imageAlt="Loading image"
      />
    );

    const img = screen.getByAltText('Loading image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/loading.png');
  });

  it('uses message as image alt when imageAlt is not provided', () => {
    render(
      <ProgressModal
        {...defaultProps}
        image="https://example.com/loading.png"
      />
    );

    expect(screen.getByAltText('Carregando...')).toBeInTheDocument();
  });

  it('uses generic alt text when message is ReactNode and imageAlt not provided', () => {
    render(
      <ProgressModal
        {...defaultProps}
        message={<span data-testid="custom-message">Custom</span>}
        image="https://example.com/loading.png"
      />
    );

    expect(screen.getByAltText('Carregando')).toBeInTheDocument();
  });

  it('uses accessibleName as image alt when message is ReactNode', () => {
    render(
      <ProgressModal
        {...defaultProps}
        message={<span>Custom</span>}
        accessibleName="Analisando redação"
        image="https://example.com/loading.png"
      />
    );

    expect(screen.getByAltText('Analisando redação')).toBeInTheDocument();
  });

  it('does not render image when image prop is omitted', () => {
    render(<ProgressModal {...defaultProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders ReactNode message visibly below the image', () => {
    render(
      <ProgressModal
        {...defaultProps}
        message={<span data-testid="rich-message">Rich message</span>}
      />
    );

    expect(screen.getByTestId('rich-message')).toBeInTheDocument();
  });

  it('renders the visible message below the image (not only in header)', () => {
    const { container } = render(
      <ProgressModal
        {...defaultProps}
        image="https://example.com/img.png"
        message="Transcrevendo..."
      />
    );

    // A mensagem visível fica FORA do h2 (h2 só tem o sr-only)
    const h2 = container.querySelector('h2');
    const visibleMessages = screen
      .getAllByText('Transcrevendo...')
      .filter((el) => !h2?.contains(el));
    expect(visibleMessages.length).toBeGreaterThan(0);
  });

  it('shows determinate progress with percentage when progress is provided', () => {
    render(<ProgressModal {...defaultProps} progress={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('hides percentage in indeterminate mode (no progress prop)', () => {
    render(<ProgressModal {...defaultProps} />);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('applies animate-pulse wrapper in indeterminate mode', () => {
    const { container } = render(<ProgressModal {...defaultProps} />);
    const pulseWrapper = container.querySelector('.animate-pulse');
    expect(pulseWrapper).toBeInTheDocument();
  });

  it('does not apply animate-pulse in determinate mode', () => {
    const { container } = render(
      <ProgressModal {...defaultProps} progress={50} />
    );
    const pulseWrapper = container.querySelector('.animate-pulse');
    expect(pulseWrapper).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ProgressModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fechar modal');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('accepts different size variants', () => {
    const { rerender, container } = render(
      <ProgressModal {...defaultProps} size="xs" />
    );
    expect(container.querySelector('.max-w-\\[360px\\]')).toBeInTheDocument();

    rerender(<ProgressModal {...defaultProps} size="lg" />);
    expect(container.querySelector('.max-w-\\[640px\\]')).toBeInTheDocument();
  });

  it('defaults to "sm" size', () => {
    const { container } = render(<ProgressModal {...defaultProps} />);
    expect(container.querySelector('.max-w-\\[420px\\]')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('renders message as sr-only accessible name in the h2 title', () => {
      const { container } = render(
        <ProgressModal {...defaultProps} message="Transcrevendo..." />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Transcrevendo...');
      const srOnly = h2?.querySelector('.sr-only');
      expect(srOnly).toHaveTextContent('Transcrevendo...');
    });

    it('dialog aria-labelledby points to the h2', () => {
      const { container } = render(
        <ProgressModal {...defaultProps} message="Analisando..." />
      );
      const dialog = container.querySelector('dialog');
      const h2 = container.querySelector('h2');
      const h2Id = h2?.getAttribute('id');
      expect(h2Id).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-labelledby', h2Id as string);
    });

    it('uses accessibleName in h2 when message is ReactNode', () => {
      const { container } = render(
        <ProgressModal
          {...defaultProps}
          message={<span>Rich</span>}
          accessibleName="Gerando resultado"
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toHaveTextContent('Gerando resultado');
    });

    it('falls back to "Carregando" when message is ReactNode without accessibleName', () => {
      const { container } = render(
        <ProgressModal {...defaultProps} message={<span>Rich</span>} />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toHaveTextContent('Carregando');
    });
  });
});
