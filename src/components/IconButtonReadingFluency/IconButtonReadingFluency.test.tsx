import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButtonReadingFluency } from './IconButtonReadingFluency';

describe('IconButtonReadingFluency', () => {
  it('renders a button with the default voice icon and the given aria-label', () => {
    render(<IconButtonReadingFluency aria-label="Falar" />);

    const button = screen.getByRole('button', { name: 'Falar' });
    expect(button).toBeInTheDocument();
    // Ícone default (VoiceIconReadingFluency, decorativo) presente.
    const icon = button.querySelector('svg[viewBox="0 0 61 50"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the state classes (default bg/border + 3D shadow, pressed drop)', () => {
    render(<IconButtonReadingFluency aria-label="Falar" />);
    const button = screen.getByRole('button', { name: 'Falar' });

    expect(button).toHaveClass(
      'bg-secondary-400',
      'border-secondary-200',
      'border-4',
      'rounded-[20px]',
      'hover:bg-secondary-500',
      'active:bg-secondary-600',
      'focus-visible:border-secondary-600'
    );
    expect(button.className).toContain(
      '[box-shadow:0px_4px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021]'
    );
    expect(button.className).toContain(
      'active:[box-shadow:0px_2px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021]'
    );
  });

  it('renders a custom icon via children instead of the default', () => {
    render(
      <IconButtonReadingFluency aria-label="Custom">
        <svg data-testid="custom-icon" />
      </IconButtonReadingFluency>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // O ícone default (VoiceIconReadingFluency) não é renderizado quando há children.
    expect(
      screen.getByRole('button').querySelector('svg[viewBox="0 0 61 50"]')
    ).toBeNull();
  });

  it('fires onClick and respects disabled', () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <IconButtonReadingFluency aria-label="Falar" onClick={onClick} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Falar' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <IconButtonReadingFluency aria-label="Falar" onClick={onClick} disabled />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Falar' }));
    expect(onClick).toHaveBeenCalledTimes(1); // não dispara quando disabled
    expect(screen.getByRole('button', { name: 'Falar' })).toBeDisabled();
  });

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButtonReadingFluency aria-label="Falar" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
