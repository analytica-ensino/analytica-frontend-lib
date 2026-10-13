import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectionButtonReadingFluency } from './SelectionButtonReadingFluency';

describe('SelectionButtonReadingFluency', () => {
  it('renders the label inside a button', () => {
    render(<SelectionButtonReadingFluency>16</SelectionButtonReadingFluency>);

    expect(screen.getByRole('button', { name: '16' })).toBeInTheDocument();
  });

  it('applies the default state of the art (beige, 4px border, 3D edge)', () => {
    render(<SelectionButtonReadingFluency>16</SelectionButtonReadingFluency>);
    const button = screen.getByRole('button', { name: '16' });

    expect(button).toHaveClass(
      'bg-background-100',
      'border-4',
      'border-background-400',
      'text-background-900',
      'rounded-[20px]',
      'min-h-[70px]'
    );
    expect(button.className).toContain(
      '[box-shadow:0px_4px_0px_0px_#D2C99C,0px_0px_4px_0px_#00000021]'
    );
    expect(button.className).toContain(
      'active:[box-shadow:0px_2px_0px_0px_#D2C99C,0px_0px_4px_0px_#00000021]'
    );
  });

  it('applies the selected state of the art (light green, 2px border)', () => {
    render(
      <SelectionButtonReadingFluency selected>15</SelectionButtonReadingFluency>
    );
    const button = screen.getByRole('button', { name: '15' });

    expect(button).toHaveClass(
      'bg-secondary-200',
      'border-2',
      'border-secondary-600'
    );
    expect(button).not.toHaveClass('bg-background-100');
    expect(button.className).toContain(
      '[box-shadow:0px_2px_0px_0px_#31A34D,0px_0px_4px_0px_#00000021]'
    );
  });

  it('compensates the border in the padding so both states keep the same size', () => {
    const { rerender } = render(
      <SelectionButtonReadingFluency>16</SelectionButtonReadingFluency>
    );
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-[18.5px]');

    rerender(
      <SelectionButtonReadingFluency selected>16</SelectionButtonReadingFluency>
    );
    expect(screen.getByRole('button')).toHaveClass('px-3.5', 'py-[20.5px]');
  });

  it('announces aria-pressed when used on its own', () => {
    const { rerender } = render(
      <SelectionButtonReadingFluency>16</SelectionButtonReadingFluency>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <SelectionButtonReadingFluency selected>16</SelectionButtonReadingFluency>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('leaves the checked state to aria-checked when it is a radio', () => {
    render(
      <SelectionButtonReadingFluency role="radio" aria-checked selected>
        16
      </SelectionButtonReadingFluency>
    );
    const radio = screen.getByRole('radio', { name: '16' });

    expect(radio).toHaveAttribute('aria-checked', 'true');
    expect(radio).not.toHaveAttribute('aria-pressed');
  });

  it('renders the image above the label', () => {
    render(
      <SelectionButtonReadingFluency
        imageSrc="https://cdn.example.com/bolo.png"
        imageAlt="Bolo com 3 velinhas"
      >
        3
      </SelectionButtonReadingFluency>
    );

    const image = screen.getByRole('img', { name: 'Bolo com 3 velinhas' });
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/bolo.png');
    expect(image).toHaveClass('object-contain');
  });

  it('can be an image-only alternative named by the image alt', () => {
    render(
      <SelectionButtonReadingFluency
        imageSrc="https://cdn.example.com/bolo.png"
        imageAlt="Bolo com 3 velinhas"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Bolo com 3 velinhas' })
    ).toBeInTheDocument();
  });

  it('calls onClick and forwards the ref', () => {
    const onClick = jest.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <SelectionButtonReadingFluency ref={ref} onClick={onClick}>
        16
      </SelectionButtonReadingFluency>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('defaults to type="button" and merges className', () => {
    render(
      <SelectionButtonReadingFluency className="flex-1">
        16
      </SelectionButtonReadingFluency>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('flex-1');
  });
});
