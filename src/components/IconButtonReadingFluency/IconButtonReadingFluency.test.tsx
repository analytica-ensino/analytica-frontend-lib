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
      'focus-visible:border-secondary-600',
      // A cor do rótulo mora aqui, não no <span>, para acompanhar o estado.
      'text-secondary-700',
      'hover:text-secondary-100',
      'active:text-secondary-100'
    );
    expect(button.className).toContain(
      '[box-shadow:0px_4px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021]'
    );
    expect(button.className).toContain(
      'active:[box-shadow:0px_2px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021]'
    );
  });

  it('sizes the default icon as in the art (61×50) instead of stretching it', () => {
    render(<IconButtonReadingFluency aria-label="Falar" />);

    const icon = screen
      .getByRole('button', { name: 'Falar' })
      .querySelector('svg[viewBox="0 0 61 50"]');
    expect(icon).toHaveClass('h-[50px]', 'w-[61px]', 'shrink-0');
  });

  it('keeps the padding horizontal only, so the icon is not squeezed', () => {
    render(<IconButtonReadingFluency aria-label="Falar" />);
    const button = screen.getByRole('button', { name: 'Falar' });

    expect(button).toHaveClass('px-4', 'h-[70px]', 'w-auto');
    // Uma asserção por classe: `not.toHaveClass('a', 'b')` passaria se só uma
    // delas estivesse presente, e qualquer padding vertical espreme o ícone.
    for (const verticalPadding of ['p-4', 'py-4', 'pt-4', 'pb-4']) {
      expect(button).not.toHaveClass(verticalPadding);
    }
  });

  it('renders the label with the art typography and no color of its own', () => {
    render(
      <IconButtonReadingFluency aria-label="Ouvir narração" label="Ouvir" />
    );

    // O rótulo visível não substitui o aria-label, que segue mais descritivo.
    const button = screen.getByRole('button', { name: 'Ouvir narração' });
    const label = screen.getByText('Ouvir');
    expect(button).toContainElement(label);
    expect(label).toHaveClass(
      'font-quicksand',
      'text-[20px]',
      'font-bold',
      'uppercase',
      'leading-[25px]'
    );
    // Sem cor própria: é isso que deixa o rótulo herdar o `hover:`/`active:` do
    // botão. As variantes entram na lista porque uma cor de estado no próprio
    // rótulo quebra o mesmo contrato — e passariam despercebidas se só a cor
    // base fosse checada. Uma asserção por classe — `not.toHaveClass('a', 'b')`
    // passaria se só uma delas estivesse presente.
    for (const ownColor of [
      'text-secondary-700',
      'text-secondary-100',
      'hover:text-secondary-100',
      'active:text-secondary-100',
    ]) {
      expect(label).not.toHaveClass(ownColor);
    }
  });

  it('uses the visible label as the accessible name when there is no aria-label', () => {
    render(<IconButtonReadingFluency label="Ouvir" />);

    const button = screen.getByRole('button', { name: 'Ouvir' });
    expect(button).toContainElement(screen.getByText('Ouvir'));
  });

  it('renders no label element when the prop is omitted', () => {
    render(<IconButtonReadingFluency aria-label="Falar" />);

    expect(
      screen.getByRole('button', { name: 'Falar' }).querySelector('span')
    ).toBeNull();
  });

  it('renders both a custom icon and a label', () => {
    render(
      <IconButtonReadingFluency aria-label="Custom" label="Ouvir">
        <svg data-testid="custom-icon" />
      </IconButtonReadingFluency>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Ouvir')).toBeInTheDocument();
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
