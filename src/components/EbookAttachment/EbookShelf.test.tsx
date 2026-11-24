import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookShelf } from './EbookShelf';

const renderShelf = (
  state: Partial<{ loading: boolean; error: boolean; empty: boolean }>,
  onRetry = jest.fn()
) =>
  render(
    <EbookShelf
      loading={false}
      error={false}
      empty={false}
      onRetry={onRetry}
      {...state}
    >
      <li>Livro 1</li>
    </EbookShelf>
  );

describe('EbookShelf', () => {
  it('lists the cards it is given', () => {
    renderShelf({});

    expect(screen.getByRole('list')).toHaveTextContent('Livro 1');
  });

  it('shows skeletons while loading', () => {
    renderShelf({ loading: true });

    expect(screen.getByTestId('ebook-shelf-loading')).toBeInTheDocument();
    expect(screen.queryByText('Livro 1')).not.toBeInTheDocument();
  });

  it('says when no book matches', () => {
    renderShelf({ empty: true });

    expect(screen.getByText('Nenhum livro encontrado')).toBeInTheDocument();
  });

  it('offers to try again on an error, before anything else', () => {
    const onRetry = jest.fn();
    renderShelf({ error: true, loading: true, empty: true }, onRetry);

    expect(
      screen.getByText('Não foi possível carregar os livros.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
