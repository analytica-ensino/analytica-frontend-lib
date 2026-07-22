import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the picture when a src is given', () => {
    render(<Avatar src="https://x/photo.png" name="Ana Clara" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://x/photo.png');
    expect(img).toHaveAttribute('alt', 'Ana Clara');
  });

  it('prefers an explicit alt over the name', () => {
    render(<Avatar src="https://x/p.png" name="Ana" alt="Foto da Ana" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Foto da Ana');
  });

  it('falls back to the placeholder when there is no src', () => {
    const { container } = render(<Avatar name="Ana" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // NOTE: without a name/alt the picture is decorative (`alt=""`), so it has
  // role `presentation` — query the element itself instead of by role.
  it('falls back to the placeholder when the picture fails to load', () => {
    const { container } = render(<Avatar src="https://x/broken.png" />);
    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
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
