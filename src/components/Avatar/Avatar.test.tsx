import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the picture when a src is given', () => {
    render(<Avatar src="https://x/photo.png" name="Ana Clara" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://x/photo.png');
    expect(img).toHaveAttribute('alt', 'Imagem de perfil de Ana Clara');
  });

  it('names the picture generically when there is no name', () => {
    render(<Avatar src="https://x/photo.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Imagem de perfil');
  });

  it('prefers an explicit alt over the default label', () => {
    render(<Avatar src="https://x/p.png" name="Ana" alt="Foto da Ana" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Foto da Ana');
  });

  it('falls back to the placeholder when there is no src', () => {
    const { container } = render(<Avatar name="Ana" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('announces the empty state on the wrapper when there is no src', () => {
    render(<Avatar name="Ana" />);
    expect(
      screen.getByRole('img', { name: 'Imagem de perfil, sem imagem' })
    ).toHaveAttribute('data-component', 'Avatar');
  });

  it('stays decorative when an empty alt is given', () => {
    render(<Avatar name="Ana" alt="" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('lets the consumer override the fallback label', () => {
    render(<Avatar name="Ana" aria-label="Avatar da turma" />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Avatar da turma');
  });

  it('falls back to the placeholder when the picture fails to load', () => {
    const { container } = render(<Avatar src="https://x/broken.png" />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // A broken URL shows the placeholder, so the announced state has to follow
  // the rendered fallback rather than the presence of `src`.
  it('announces the empty state when the picture fails to load', () => {
    const { container } = render(
      <Avatar src="https://x/broken.png" name="Ana" />
    );
    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(
      screen.getByRole('img', { name: 'Imagem de perfil, sem imagem' })
    ).toBeInTheDocument();
  });

  it('retries when the src changes after a failure', () => {
    const { container, rerender } = render(
      <Avatar src="https://x/broken.png" />
    );
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(container.querySelector('img')).not.toBeInTheDocument();

    rerender(<Avatar src="https://x/works.png" />);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://x/works.png'
    );
  });

  it('applies the requested size', () => {
    const { container } = render(<Avatar name="Ana" size={64} />);
    const root = container.querySelector('[data-component="Avatar"]');
    expect(root).toHaveStyle({ width: '64px', height: '64px' });
  });
});
