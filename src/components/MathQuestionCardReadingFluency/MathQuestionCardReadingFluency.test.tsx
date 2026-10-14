import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MathQuestionCardReadingFluency } from './MathQuestionCardReadingFluency';

const ALTERNATIVES = [
  { id: 'a', text: '16' },
  { id: 'b', text: '15' },
  { id: 'c', text: '60' },
];

const STATEMENT =
  'Ana ganhou 10 brigadeiros e depois mais 6. Quantos brigadeiros ela tem agora?';

describe('MathQuestionCardReadingFluency', () => {
  it('renders the statement and names the alternatives group with it', () => {
    render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText(STATEMENT)).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: STATEMENT })
    ).toBeInTheDocument();
  });

  it('renders one radio per alternative, in order', () => {
    render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );

    expect(
      screen.getAllByRole('radio').map((radio) => radio.textContent)
    ).toEqual(['16', '15', '60']);
  });

  it('accepts two alternatives as well (the art has 2 or 3)', () => {
    render(
      <MathQuestionCardReadingFluency
        statement="Qual é mais pesado?"
        alternatives={ALTERNATIVES.slice(0, 2)}
        onSelect={jest.fn()}
      />
    );

    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('marks only the selected alternative', () => {
    render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        selectedId="b"
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByRole('radio', { name: '15' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: '16' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByRole('radio', { name: '15' })).toHaveClass(
      'bg-secondary-200'
    );
  });

  it('starts with nothing selected', () => {
    render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );

    screen
      .getAllByRole('radio')
      .forEach((radio) =>
        expect(radio).toHaveAttribute('aria-checked', 'false')
      );
  });

  it('calls onSelect with the tapped alternative id', () => {
    const onSelect = jest.fn();
    render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: '60' }));

    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('renders the illustration only when there is one', () => {
    const { rerender } = render(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(
      <MathQuestionCardReadingFluency
        statement={STATEMENT}
        imageUrl="https://cdn.example.com/brigadeiros.png"
        imageAlt="10 brigadeiros mais 6 brigadeiros"
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );
    expect(
      screen.getByRole('img', { name: '10 brigadeiros mais 6 brigadeiros' })
    ).toHaveAttribute('src', 'https://cdn.example.com/brigadeiros.png');
  });

  it('names image-only alternatives by their position', () => {
    render(
      <MathQuestionCardReadingFluency
        statement="Qual bolo tem 3 velinhas?"
        alternatives={[
          { id: 'a', imageUrl: 'https://cdn.example.com/bolo-2.png' },
          { id: 'b', imageUrl: 'https://cdn.example.com/bolo-3.png' },
        ]}
        onSelect={jest.fn()}
      />
    );

    expect(
      screen.getByRole('radio', { name: 'Alternativa 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Alternativa 2' })
    ).toBeInTheDocument();
  });

  it('forwards the ref and merges className on the card', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <MathQuestionCardReadingFluency
        ref={ref}
        data-testid="card"
        className="custom-class"
        statement={STATEMENT}
        alternatives={ALTERNATIVES}
        onSelect={jest.fn()}
      />
    );

    const card = screen.getByTestId('card');
    expect(ref.current).toBe(card);
    expect(card).toHaveClass('custom-class', 'max-w-[634px]', 'rounded-3xl');
  });
});
