import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AccessibilityFab from './AccessibilityFab';

describe('AccessibilityFab', () => {
  it('renders with the open label by default', () => {
    render(<AccessibilityFab onClick={() => undefined} />);
    const btn = screen.getByRole('button', {
      name: /opções de acessibilidade/i,
    });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('switches to the close label when isOpen is true', () => {
    render(<AccessibilityFab onClick={() => undefined} isOpen />);
    const btn = screen.getByRole('button', {
      name: /fechar opções de acessibilidade/i,
    });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<AccessibilityFab onClick={onClick} />);
    await userEvent.click(screen.getByTestId('accessibility-fab'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the accessibility.png icon (not an inline SVG icon)', () => {
    render(<AccessibilityFab onClick={() => undefined} />);
    const fab = screen.getByTestId('accessibility-fab');
    const img = fab.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('aria-hidden', 'true');
    // Sem SVG embutido: o ícone agora é uma `<img>` (PNG importado).
    expect(fab.querySelector('svg')).toBeNull();
  });

  it.each([
    ['right', /right-0/, /rounded-l-lg/],
    ['left', /left-0/, /rounded-r-lg/],
  ] as const)(
    'applies position classes for %s',
    (position, edgeClass, roundedClass) => {
      render(
        <AccessibilityFab onClick={() => undefined} position={position} />
      );
      const btn = screen.getByTestId('accessibility-fab');
      expect(btn.className).toMatch(edgeClass);
      expect(btn.className).toMatch(roundedClass);
    }
  );
});
