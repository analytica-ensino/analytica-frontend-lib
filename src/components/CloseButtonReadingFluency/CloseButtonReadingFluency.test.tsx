import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CloseButtonReadingFluency } from './CloseButtonReadingFluency';

describe('CloseButtonReadingFluency', () => {
  it('renders a button labelled "Fechar" by default', () => {
    render(<CloseButtonReadingFluency />);

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });

  it('lets the caller override the aria-label', () => {
    render(<CloseButtonReadingFluency aria-label="Fechar modal" />);

    expect(
      screen.getByRole('button', { name: 'Fechar modal' })
    ).toBeInTheDocument();
  });

  it('renders the decorative close icon at its native size', () => {
    render(<CloseButtonReadingFluency />);

    const icon = screen
      .getByRole('button')
      .querySelector('svg[viewBox="0 0 37 37"]') as SVGSVGElement;
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '37');
    expect(icon).toHaveAttribute('height', '37');
  });

  it('forwards iconSize to the icon', () => {
    render(<CloseButtonReadingFluency iconSize={24} />);

    const icon = screen
      .getByRole('button')
      .querySelector('svg') as SVGSVGElement;
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('keeps at least the 42x42 hit target of the button it replaced', () => {
    render(<CloseButtonReadingFluency />);

    expect(screen.getByRole('button')).toHaveClass(
      'min-h-[42px]',
      'min-w-[42px]'
    );
  });

  it('defaults to type="button" so it never submits a surrounding form', () => {
    render(<CloseButtonReadingFluency />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<CloseButtonReadingFluency onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(<CloseButtonReadingFluency onClick={onClick} disabled />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges extra classes with the base ones', () => {
    render(<CloseButtonReadingFluency className="absolute right-4 top-4" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('absolute', 'right-4', 'top-4', 'min-h-[42px]');
  });

  it('forwards the ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<CloseButtonReadingFluency ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('exposes the correct displayName', () => {
    expect(CloseButtonReadingFluency.displayName).toBe(
      'CloseButtonReadingFluency'
    );
  });
});
