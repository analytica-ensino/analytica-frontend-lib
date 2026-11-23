import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbookPicker } from './EbookPicker';
import type { BaseApiClient } from '../../types/api';
import type {
  AttachableEbook,
  EbookLibraryItem,
  EbookLibraryPage,
} from '../../types/ebookAttachment';

jest.mock('./EbookPickerPreview', () => ({
  EbookPickerPreview: ({
    ebookId,
    selected,
    addLabel,
    onToggle,
    onBack,
  }: {
    ebookId: string;
    selected: boolean;
    addLabel: string;
    onToggle: () => void;
    onBack: () => void;
  }) => (
    <div data-testid="preview">
      <span>Prévia de {ebookId}</span>
      <button type="button" onClick={onToggle}>
        {selected ? 'Remover da seleção' : addLabel}
      </button>
      <button type="button" onClick={onBack}>
        Voltar da prévia
      </button>
    </div>
  ),
}));

const item = (
  id: string,
  overrides: Partial<EbookLibraryItem> = {}
): EbookLibraryItem => ({
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
  ...overrides,
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

const makeApi = (get: jest.Mock): BaseApiClient =>
  ({ get }) as unknown as BaseApiClient;

const attached = (id: string): AttachableEbook => ({
  id,
  code: `EB${id}`,
  title: `Livro ${id}`,
  subtitle: null,
  coverUrl: null,
  category: 'Educação Financeira',
});

/** Lets the requests resolve and the search debounce run. */
const settle = async () => {
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
};

const renderPicker = async (
  get: jest.Mock,
  props: Partial<Parameters<typeof EbookPicker>[0]> = {}
) => {
  const handlers = { onBack: jest.fn(), onConfirm: jest.fn() };
  render(
    <EbookPicker
      apiClient={makeApi(get)}
      target="lesson"
      initialSelected={[]}
      {...handlers}
      {...props}
    />
  );
  await settle();
  return handlers;
};

const count = () => screen.getByTestId('ebook-picker-count');
const conclude = () => screen.getByRole('button', { name: 'Concluir seleção' });

describe('EbookPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists the staff library with its count', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1'), item('2')]));
    await renderPicker(get);

    expect(get).toHaveBeenCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24 },
    });
    expect(
      screen.getByRole('heading', { name: 'Adicionar livro à aula' })
    ).toBeInTheDocument();
    expect(screen.getByText('2 livros na estante')).toBeInTheDocument();
    expect(screen.getAllByTestId('ebook-picker-card')).toHaveLength(2);
    expect(count()).toHaveTextContent('0');
    expect(conclude()).toBeDisabled();
  });

  it('selects several books and concludes with them, in order', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1'), item('2')]));
    const { onConfirm } = await renderPicker(get);

    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar à aula: Livro 2' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar à aula: Livro 1' })
    );

    expect(count()).toHaveTextContent('2');
    expect(screen.getAllByText('Remover da seleção')).toHaveLength(2);
    fireEvent.click(conclude());
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ id: '2', segment: 'Anos Iniciais' }),
      expect.objectContaining({ id: '1' }),
    ]);
  });

  it('opens with the attached books selected, and takes one out', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1'), item('2')]));
    const { onConfirm } = await renderPicker(get, {
      initialSelected: [attached('1'), attached('9')],
    });

    expect(count()).toHaveTextContent('2');
    const [first] = screen.getAllByTestId('ebook-picker-card');
    expect(first).toHaveAttribute('data-selected', 'true');

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover da seleção: Livro 1' })
    );
    fireEvent.click(conclude());
    expect(onConfirm).toHaveBeenCalledWith([attached('9')]);
  });

  it('names the buttons after an activity', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    await renderPicker(get, { target: 'activity' });

    expect(
      screen.getByRole('heading', { name: 'Adicionar livro à atividade' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar à atividade: Livro 1' })
    ).toBeInTheDocument();
  });

  it('stops adding at the limit of 20 books', async () => {
    const get = jest.fn().mockResolvedValue(page([item('new')]));
    const full = Array.from({ length: 20 }, (_, index) =>
      attached(`a${index}`)
    );
    await renderPicker(get, { initialSelected: full });

    expect(
      screen.getByText('Você chegou ao limite de 20 livros.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar à aula: Livro new' })
    ).toBeDisabled();
  });

  it('searches after the typing stops', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    await renderPicker(get);
    get.mockClear();

    fireEvent.change(screen.getByLabelText('Buscar livros'), {
      target: { value: 'EF04MA25' },
    });
    expect(get).not.toHaveBeenCalled();
    await settle();

    expect(get).toHaveBeenCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24, search: 'EF04MA25' },
    });
  });

  it('filters by theme and audience', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    await renderPicker(get);

    fireEvent.click(screen.getByRole('combobox', { name: /^Tema/ }));
    fireEvent.click(screen.getByText('Educação 4.0 e 5.0'));
    await settle();
    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24, theme: 'I' },
    });

    fireEvent.click(screen.getByRole('combobox', { name: /^Público/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Anos Iniciais' }));
    await settle();
    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 1, limit: 24, theme: 'I', segment: 'Anos Iniciais' },
    });
  });

  it('loads further pages', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(page([item('1')], { total: 2 }))
      .mockResolvedValueOnce(page([item('2')], { total: 2, page: 2 }));
    await renderPicker(get);

    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
    await settle();

    expect(get).toHaveBeenLastCalledWith('/ebooks/library', {
      params: { page: 2, limit: 24 },
    });
    expect(screen.getAllByTestId('ebook-picker-card')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: 'Carregar mais' })
    ).not.toBeInTheDocument();
  });

  it('says when no book matches', async () => {
    const get = jest.fn().mockResolvedValue(page([]));
    await renderPicker(get);

    expect(screen.getByText('Nenhum livro encontrado')).toBeInTheDocument();
    expect(screen.getByText('0 livros na estante')).toBeInTheDocument();
  });

  it('offers to try again when the library fails', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([item('1')]));
    await renderPicker(get);

    expect(
      screen.getByText('Não foi possível carregar os livros.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await settle();

    expect(screen.getAllByTestId('ebook-picker-card')).toHaveLength(1);
  });

  it('opens a book in preview from its cover and selects it there', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    const { onConfirm } = await renderPicker(get);

    fireEvent.click(
      screen.getByRole('button', { name: 'Visualizar o livro Livro 1' })
    );
    expect(screen.getByText('Prévia de 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à aula' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar da prévia' }));

    expect(count()).toHaveTextContent('1');
    fireEvent.click(conclude());
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ id: '1' }),
    ]);
  });

  it('goes back without changing anything', async () => {
    const get = jest.fn().mockResolvedValue(page([item('1')]));
    const { onBack, onConfirm } = await renderPicker(get);

    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar à aula: Livro 1' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
