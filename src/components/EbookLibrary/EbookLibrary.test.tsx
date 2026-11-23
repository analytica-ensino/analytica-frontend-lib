import { render, screen, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookLibrary } from './EbookLibrary';
import type { BaseApiClient } from '../../types/api';
import type {
  EbookLibraryItem,
  EbookLibraryPage,
} from '../../types/ebookAttachment';

// The preview itself (reader, material tabs) is EbookPreview's, tested through
// EbookPickerPreview: here it only shows which book is open.
jest.mock('../EbookAttachment/EbookPreview', () => ({
  EbookPreview: ({
    ebookId,
    onBack,
  }: {
    ebookId: string;
    onBack: () => void;
  }) => (
    <div data-testid="preview">
      <span>Prévia de {ebookId}</span>
      <button type="button" onClick={onBack}>
        Voltar da prévia
      </button>
    </div>
  ),
}));

const item = (id: string): EbookLibraryItem => ({
  id,
  code: `EB${id}`,
  title: `Livro ${id}`,
  subtitle: null,
  authors: [],
  coverUrl: null,
  category: 'Educação Financeira',
  theme: { code: 'I', name: 'Educação 4.0 e 5.0' },
  segment: 'Anos Iniciais',
  schoolYears: ['4º ano'],
});

const page = (
  items: EbookLibraryItem[],
  overrides: Partial<EbookLibraryPage> = {}
) => ({
  data: {
    message: 'ok',
    data: {
      items,
      total: items.length,
      page: 1,
      limit: 24,
      facets: {
        themes: [{ code: 'I', name: 'Educação 4.0 e 5.0', count: 1 }],
        segments: [{ name: 'Anos Iniciais', count: 1 }],
      },
      ...overrides,
    },
  },
});

/** Lets the requests resolve and the search debounce run. */
const settle = async () => {
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
};

const renderLibrary = async (get: jest.Mock) => {
  render(<EbookLibrary apiClient={{ get } as unknown as BaseApiClient} />);
  await settle();
};

describe('EbookLibrary', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("lists the institution's student books with how many there are", async () => {
    const get = jest.fn().mockResolvedValue(page([item('1'), item('2')]));
    await renderLibrary(get);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Biblioteca' })
    ).toBeInTheDocument();
    expect(screen.getByText('2 livros na estante')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24 },
    });
    const cards = screen.getAllByTestId('ebook-shelf-card');
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByText('EB1 • Educação Financeira')
    ).toBeInTheDocument();
    expect(
      within(cards[0]).getByText('4º ano • Anos Iniciais')
    ).toBeInTheDocument();
  });

  it('searches after the typing stops and filters by theme', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    await renderLibrary(get);
    get.mockClear();

    fireEvent.change(screen.getByLabelText('Buscar livros'), {
      target: { value: 'EF04MA25' },
    });
    expect(get).not.toHaveBeenCalled();
    await settle();
    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24, search: 'EF04MA25' },
    });

    fireEvent.click(screen.getByRole('combobox', { name: /^Tema/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Educação 4.0 e 5.0' }));
    await settle();
    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24, search: 'EF04MA25', theme: 'I' },
    });
  });

  it('shows another page in place of the one on screen', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(page([item('1')], { total: 30 }))
      .mockResolvedValueOnce(page([item('25')], { total: 30, page: 2 }));
    await renderLibrary(get);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    await settle();

    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 2, limit: 24 },
    });
    expect(screen.getAllByTestId('ebook-shelf-card')).toHaveLength(1);
    expect(screen.getByText('Livro 25')).toBeInTheDocument();
    expect(screen.getByText('25 - 30 de 30 livros')).toBeInTheDocument();
  });

  it('opens a book over the library and goes back to it as it was', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1'), item('2')]));
    await renderLibrary(get);
    fireEvent.change(screen.getByLabelText('Buscar livros'), {
      target: { value: 'Livro' },
    });
    await settle();

    const opener = screen.getByRole('button', {
      name: 'Visualizar o livro Livro 2',
    });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Prévia do livro' });
    expect(within(dialog).getByText('Prévia de 2')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar da prévia' }));
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(screen.getByLabelText('Buscar livros')).toHaveValue('Livro');
    expect(opener).toHaveFocus();
  });

  it('closes the book with Escape', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    await renderLibrary(get);
    fireEvent.click(
      screen.getByRole('button', { name: 'Visualizar o livro Livro 1' })
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('says when no book matches, without pagination', async () => {
    const get = jest.fn().mockResolvedValue(page([]));
    await renderLibrary(get);

    expect(screen.getByText('Nenhum livro encontrado')).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Paginação' })
    ).not.toBeInTheDocument();
  });

  it('offers to try again when the library fails', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce(page([item('1')]));
    await renderLibrary(get);

    expect(
      screen.getByText('Não foi possível carregar os livros.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await settle();

    expect(screen.getByText('Livro 1')).toBeInTheDocument();
  });
});
