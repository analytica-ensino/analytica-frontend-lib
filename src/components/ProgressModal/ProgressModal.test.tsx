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
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
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

  it('does not render image when image prop is omitted', () => {
    render(<ProgressModal {...defaultProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders ReactNode message', () => {
    render(
      <ProgressModal
        {...defaultProps}
        message={<span data-testid="rich-message">Rich message</span>}
      />
    );

    expect(screen.getByTestId('rich-message')).toBeInTheDocument();
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
    it('message is rendered as the modal h2 title (accessible name)', () => {
      const { container } = render(
        <ProgressModal {...defaultProps} message="Transcrevendo..." />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Transcrevendo...');
    });

    it('dialog aria-labelledby points to the h2 with message', () => {
      const { container } = render(
        <ProgressModal {...defaultProps} message="Analisando..." />
      );
      const dialog = container.querySelector('dialog');
      const h2 = container.querySelector('h2');
      const h2Id = h2?.getAttribute('id');
      expect(h2Id).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-labelledby', h2Id as string);
      expect(h2).toHaveTextContent('Analisando...');
    });
  });
});
