import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ImagePreviewCard from './ImagePreviewCard';

describe('ImagePreviewCard', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/essay.jpg',
    fileName: 'essay.jpg',
  };

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders the image with correct src and alt', () => {
    render(<ImagePreviewCard {...defaultProps} />);
    const img = screen.getByAltText('essay.jpg');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/essay.jpg');
  });

  it('renders the filename chip', () => {
    render(<ImagePreviewCard {...defaultProps} />);
    expect(screen.getByText('essay.jpg')).toBeInTheDocument();
  });

  it('renders the default "Imagem" label', () => {
    render(<ImagePreviewCard {...defaultProps} />);
    expect(screen.getByText('Imagem')).toBeInTheDocument();
  });

  it('accepts custom label', () => {
    render(<ImagePreviewCard {...defaultProps} label="Anexo" />);
    expect(screen.getByText('Anexo')).toBeInTheDocument();
  });

  it('hides label when label is falsy', () => {
    render(<ImagePreviewCard {...defaultProps} label="" />);
    expect(screen.queryByText('Imagem')).not.toBeInTheDocument();
  });

  it('renders ReactNode as label', () => {
    render(
      <ImagePreviewCard
        {...defaultProps}
        label={<span data-testid="rich-label">Anexo *</span>}
      />
    );
    expect(screen.getByTestId('rich-label')).toBeInTheDocument();
  });

  describe('Remove action', () => {
    it('does not render X button when onRemove is omitted', () => {
      render(<ImagePreviewCard {...defaultProps} />);
      expect(screen.queryByLabelText('Remover imagem')).not.toBeInTheDocument();
    });

    it('renders X button when onRemove is provided', () => {
      const onRemove = jest.fn();
      render(<ImagePreviewCard {...defaultProps} onRemove={onRemove} />);
      expect(screen.getByLabelText('Remover imagem')).toBeInTheDocument();
    });

    it('calls onRemove when X is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = jest.fn();
      render(<ImagePreviewCard {...defaultProps} onRemove={onRemove} />);

      await user.click(screen.getByLabelText('Remover imagem'));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('respects custom removeAriaLabel', () => {
      const onRemove = jest.fn();
      render(
        <ImagePreviewCard
          {...defaultProps}
          onRemove={onRemove}
          removeAriaLabel="Descartar"
        />
      );
      expect(screen.getByLabelText('Descartar')).toBeInTheDocument();
    });
  });

  describe('Update action', () => {
    it('does not render update button when onUpdate is omitted', () => {
      render(<ImagePreviewCard {...defaultProps} />);
      expect(screen.queryByText('Atualizar imagem')).not.toBeInTheDocument();
    });

    it('renders the default "Atualizar imagem" button when onUpdate is provided', () => {
      const onUpdate = jest.fn();
      render(<ImagePreviewCard {...defaultProps} onUpdate={onUpdate} />);
      expect(screen.getByText('Atualizar imagem')).toBeInTheDocument();
    });

    it('calls onUpdate when button is clicked', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      render(<ImagePreviewCard {...defaultProps} onUpdate={onUpdate} />);

      await user.click(screen.getByText('Atualizar imagem'));
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('accepts custom updateButtonLabel', () => {
      const onUpdate = jest.fn();
      render(
        <ImagePreviewCard
          {...defaultProps}
          onUpdate={onUpdate}
          updateButtonLabel="Substituir"
        />
      );
      expect(screen.getByText('Substituir')).toBeInTheDocument();
    });
  });

  it('applies additional className to the root', () => {
    const { container } = render(
      <ImagePreviewCard {...defaultProps} className="my-class" />
    );
    expect(container.firstChild).toHaveClass('my-class');
  });
});
