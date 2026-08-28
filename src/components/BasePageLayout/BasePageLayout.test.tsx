import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BasePageLayout } from './BasePageLayout';
import type { BasePageLayoutProps } from './BasePageLayout';
import type { FilterConfig } from '../Filter/useTableFilter';
import type { ColumnConfig } from '../TableProvider/TableProvider';

interface Row extends Record<string, unknown> {
  id: string;
  title: string;
}

const headers: ColumnConfig<Row>[] = [
  { key: 'title', label: 'Título', sortable: true },
];

const data: Row[] = [
  { id: '1', title: 'Modelo A' },
  { id: '2', title: 'Modelo B' },
];

/**
 * Filter config with a variable number of options, mirroring pages whose
 * filter options are discovered from the fetched rows.
 */
const filtersWith = (names: string[]): FilterConfig[] => [
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Componente curricular',
        selectedIds: [],
        itens: names.map((name, index) => ({ id: `s${index}`, name })),
      },
    ],
  },
];

const createProps = (
  onParamsChange: jest.Mock,
  initialFilters: FilterConfig[]
): BasePageLayoutProps<Row> => ({
  activeTab: 'modelos',
  pageTitle: 'Modelos de atividades',
  testId: 'page',
  data,
  headers,
  loading: false,
  error: null,
  pagination: { total: 2786, totalPages: 280 },
  initialFilters,
  itemLabel: 'modelos',
  searchPlaceholder: 'Buscar modelo',
  emptyState: <div>vazio</div>,
  noSearchImage: 'no-search.png',
  tabs: [{ value: 'modelos', label: 'Modelos', testId: 'tab-models' }],
  createButtonLabel: 'Criar atividade',
  onParamsChange,
  onRowClick: jest.fn(),
  onTabChange: jest.fn(),
  onCreate: jest.fn(),
});

const lastParams = (mock: jest.Mock) => mock.mock.calls.at(-1)?.[0];

describe('BasePageLayout - table state survives new filter options', () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.window.history.replaceState({}, '', '/');
  });

  it('keeps the selected items per page when new filter options arrive', async () => {
    const onParamsChange = jest.fn();
    const { rerender } = render(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia']))}
      />
    );

    fireEvent.change(screen.getByLabelText('Items por página'), {
      target: { value: '100' },
    });

    await waitFor(() => {
      expect(lastParams(onParamsChange).limit).toBe(100);
    });

    // The larger page brings a subject that was not in the first response.
    rerender(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia', 'História']))}
      />
    );

    await waitFor(() => {
      expect(onParamsChange).toHaveBeenCalled();
    });

    // Assert the last call, never the call count: discovering a new option
    // legitimately re-emits the same params once.
    expect(lastParams(onParamsChange).limit).toBe(100);
  });

  it('keeps the active search when new filter options arrive', async () => {
    const onParamsChange = jest.fn();
    const { rerender } = render(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia']))}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar modelo'), {
      target: { value: 'álgebra' },
    });

    await waitFor(() => {
      expect(lastParams(onParamsChange).search).toBe('álgebra');
    });

    rerender(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia', 'História']))}
      />
    );

    await waitFor(() => {
      expect(onParamsChange).toHaveBeenCalled();
    });

    expect(lastParams(onParamsChange).search).toBe('álgebra');
  });

  it('lists filter options that arrive after the first render', async () => {
    const onParamsChange = jest.fn();
    const { rerender } = render(
      <BasePageLayout {...createProps(onParamsChange, filtersWith([]))} />
    );

    rerender(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia', 'História']))}
      />
    );

    fireEvent.click(screen.getByText('Filtros'));

    await waitFor(() => {
      expect(screen.getByText('História')).toBeInTheDocument();
    });
    expect(screen.getByText('Biologia')).toBeInTheDocument();
  });

  it('keeps a selection in a single-option category across re-renders', async () => {
    // Opening the modal must not select anything on the user's behalf, but the
    // selection the user does make used to be wiped by the remount; now it must
    // survive — including a re-render carrying fresh data.
    const onParamsChange = jest.fn();
    const { rerender } = render(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia']))}
      />
    );

    fireEvent.click(screen.getByText('Filtros'));

    await waitFor(() => {
      expect(screen.getByText('Componente curricular')).toBeInTheDocument();
    });
    expect(lastParams(onParamsChange).subject).toBeUndefined();

    fireEvent.click(screen.getByText('Componente curricular'));
    fireEvent.click(screen.getByLabelText('Biologia'));

    await waitFor(() => {
      expect(lastParams(onParamsChange).subject).toEqual(['s0']);
    });

    rerender(
      <BasePageLayout
        {...createProps(onParamsChange, filtersWith(['Biologia']))}
      />
    );

    expect(lastParams(onParamsChange).subject).toEqual(['s0']);
  });
});
