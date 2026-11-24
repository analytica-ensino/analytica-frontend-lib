import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookLibraryFilters } from './EbookLibraryFilters';
import {
  ALL_EBOOKS_FILTER,
  type UseEbookLibraryFiltersReturn,
} from './useEbookLibraryFilters';

const state = (): UseEbookLibraryFiltersReturn => ({
  searchInput: '',
  setSearchInput: jest.fn(),
  theme: ALL_EBOOKS_FILTER,
  setTheme: jest.fn(),
  segment: ALL_EBOOKS_FILTER,
  setSegment: jest.fn(),
  filters: { search: '', theme: '', segment: '' },
});

describe('EbookLibraryFilters', () => {
  it('offers each theme by its name, or its code when it has none', () => {
    const fields = state();
    render(
      <EbookLibraryFilters
        state={fields}
        facets={{
          themes: [
            { code: 'I', name: 'Educação 4.0 e 5.0', count: 2 },
            { code: 'III', name: null, count: 1 },
          ],
          segments: [{ name: 'Anos Iniciais', count: 3 }],
        }}
      />
    );

    fireEvent.click(screen.getByRole('combobox', { name: /^Tema/ }));
    expect(
      screen.getByRole('option', { name: 'Educação 4.0 e 5.0' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'III' }));

    expect(fields.setTheme).toHaveBeenCalledWith('III');
  });

  it('passes on what is typed in the search', () => {
    const fields = state();
    render(<EbookLibraryFilters state={fields} facets={null} />);

    fireEvent.change(screen.getByLabelText('Buscar livros'), {
      target: { value: 'Pinóquio' },
    });

    expect(fields.setSearchInput).toHaveBeenCalledWith('Pinóquio');
    expect(
      screen.getByRole('heading', { name: 'Filtrar acervo' })
    ).toBeInTheDocument();
  });
});
