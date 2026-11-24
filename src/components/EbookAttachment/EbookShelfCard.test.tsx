import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookShelfCard } from './EbookShelfCard';
import type { EbookLibraryItem } from '../../types/ebookAttachment';

const ebook: EbookLibraryItem = {
  id: '1',
  code: 'EB01',
  title: 'Meu pé de laranja lima',
  subtitle: null,
  authors: [],
  coverUrl: null,
  category: 'Educação Financeira',
  theme: null,
  segment: 'Anos Iniciais',
  schoolYears: ['4º ano'],
};

describe('EbookShelfCard', () => {
  it('opens the book from anywhere on the card when it has no action', () => {
    const onOpen = jest.fn();
    render(<EbookShelfCard ebook={ebook} onOpen={onOpen} />);

    const card = screen.getByTestId('ebook-shelf-card');
    const open = within(card).getByRole('button', {
      name: 'Visualizar o livro Meu pé de laranja lima',
    });
    expect(
      within(open).getByText('EB01 • Educação Financeira')
    ).toBeInTheDocument();
    expect(
      within(open).getByText('4º ano • Anos Iniciais')
    ).toBeInTheDocument();

    fireEvent.click(open);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens the book from the cover, beside its action', () => {
    const onOpen = jest.fn();
    const onAction = jest.fn();
    render(
      <EbookShelfCard
        ebook={ebook}
        onOpen={onOpen}
        selected
        footer={
          <button type="button" onClick={onAction}>
            Remover da seleção
          </button>
        }
      />
    );

    expect(screen.getByTestId('ebook-shelf-card')).toHaveAttribute(
      'data-selected',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover da seleção' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Visualizar o livro Meu pé de laranja lima',
      })
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
