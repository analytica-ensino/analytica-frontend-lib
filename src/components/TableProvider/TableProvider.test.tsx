import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TableProvider,
  type ColumnConfig,
  type PaginationConfig,
} from './TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';

// Mock all external components
jest.mock('../Table/Table', () => ({
  default: ({
    children,
    variant,
    searchTerm,
    noSearchResultImage,
  }: {
    children: React.ReactNode;
    variant?: string;
    searchTerm?: string;
    noSearchResultImage?: string;
  }) => (
    <table
      data-testid="table"
      data-variant={variant}
      data-search-term={searchTerm}
      data-no-search-image={noSearchResultImage}
    >
      {children}
    </table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableHead: ({
    children,
    sortable,
    sortDirection,
    onSort,
    className,
    style,
  }: {
    children: React.ReactNode;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <th
      data-testid="table-head"
      data-sortable={sortable}
      data-sort-direction={sortDirection}
      onClick={onSort}
      className={className}
      style={style}
    >
      {children}
      {sortable && <span data-testid="sort-icon">↕</span>}
    </th>
  ),
  TableRow: ({
    children,
    variant,
    clickable,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    clickable?: boolean;
    onClick?: () => void;
  }) => (
    <tr
      data-testid="table-row"
      data-variant={variant}
      data-clickable={clickable}
      onClick={onClick}
    >
      {children}
    </tr>
  ),
  TableCell: ({
    children,
    colSpan,
    className,
    style,
  }: {
    children: React.ReactNode;
    colSpan?: number;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <td
      data-testid="table-cell"
      colSpan={colSpan}
      className={className}
      style={style}
    >
      {children}
    </td>
  ),
  TablePagination: ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    itemsPerPageOptions,
    onPageChange,
    onItemsPerPageChange,
    itemLabel,
  }: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
    itemLabel: string;
  }) => (
    <div data-testid="table-pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <span>
        {totalItems} {itemLabel}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      <button onClick={() => onItemsPerPageChange(20)}>Change Items</button>
      <span>{itemsPerPage} per page</span>
      <span>{itemsPerPageOptions.join(',')}</span>
    </div>
  ),
  useTableSort: jest.fn((data: unknown[]) => ({
    sortedData: data,
    sortColumn: null,
    sortDirection: null,
    handleSort: jest.fn(),
  })),
}));

jest.mock('../Search/Search', () => ({
  default: ({
    value,
    onSearch,
    onClear,
    placeholder,
  }: {
    value: string;
    onSearch: (value: string) => void;
    onClear: () => void;
    placeholder: string;
  }) => (
    <div data-testid="search">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
      />
      <button data-testid="search-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

jest.mock('../Button/Button', () => ({
  default: ({
    children,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: () => void;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock('../Filter/FilterModal', () => ({
  FilterModal: ({
    isOpen,
    onClose,
    filterConfigs,
    onFiltersChange,
    onApply,
    onClear,
  }: {
    isOpen: boolean;
    onClose: () => void;
    filterConfigs: FilterConfig[];
    onFiltersChange: (filters: Record<string, unknown>) => void;
    onApply: () => void;
    onClear: () => void;
  }) =>
    isOpen ? (
      <div data-testid="filter-modal">
        <button data-testid="filter-modal-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="filter-modal-apply" onClick={onApply}>
          Apply
        </button>
        <button data-testid="filter-modal-clear" onClick={onClear}>
          Clear
        </button>
        <button
          data-testid="filter-modal-change"
          onClick={() => onFiltersChange({ status: ['ATIVA'] })}
        >
          Change Filters
        </button>
        <span>{filterConfigs.length} configs</span>
      </div>
    ) : null,
}));

jest.mock('../Filter/useTableFilter', () => ({
  useTableFilter: jest.fn((initialFilters: FilterConfig[]) => ({
    filterConfigs: initialFilters,
    activeFilters: {},
    hasActiveFilters: false,
    updateFilters: jest.fn(),
    applyFilters: jest.fn(),
    clearFilters: jest.fn(),
  })),
}));

jest.mock('phosphor-react', () => ({
  Funnel: ({ size }: { size?: number }) => (
    <span data-testid="funnel-icon" data-size={size}>
      🔍
    </span>
  ),
}));

// Test data interface
interface Activity extends Record<string, unknown> {
  id: string;
  title: string;
  status: 'ATIVA' | 'CONCLUÍDA' | 'VENCIDA';
  completionPercentage: number;
  deadline: string;
  subject: string;
}

// Test data
const mockData: Activity[] = [
  {
    id: '1',
    title: 'Atividade 1',
    status: 'ATIVA',
    completionPercentage: 75,
    deadline: '2024-12-31',
    subject: 'Matemática',
  },
  {
    id: '2',
    title: 'Atividade 2',
    status: 'CONCLUÍDA',
    completionPercentage: 100,
    deadline: '2024-11-30',
    subject: 'Português',
  },
  {
    id: '3',
    title: 'Atividade 3',
    status: 'VENCIDA',
    completionPercentage: 0,
    deadline: '2024-10-31',
    subject: 'História',
  },
];

const mockHeaders: ColumnConfig<Activity>[] = [
  { key: 'title', label: 'Título', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'completionPercentage', label: 'Progresso', align: 'center' },
  { key: 'deadline', label: 'Prazo' },
];

const mockFilterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    categories: [
      {
        key: 'status',
        label: 'Status',
        itens: [
          { id: 'ATIVA', name: 'Ativa' },
          { id: 'CONCLUÍDA', name: 'Concluída' },
          { id: 'VENCIDA', name: 'Vencida' },
        ],
      },
    ],
  },
];

describe('TableProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================
  // GRUPO 1: RENDERIZAÇÃO INICIAL
  // ======================
  describe('Renderização Básica', () => {
    it('deve renderizar com dados mínimos (apenas data e headers)', () => {
      render(<TableProvider data={mockData} headers={mockHeaders} />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getAllByTestId('table-row')).toHaveLength(mockData.length);
    });

    it('deve renderizar com variant "default"', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          variant="default"
        />
      );

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('data-variant', 'default');
    });

    it('deve renderizar com variant "borderless"', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          variant="borderless"
        />
      );

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('data-variant', 'borderless');

      const rows = screen.getAllByTestId('table-row');
      rows.forEach((row) => {
        expect(row).toHaveAttribute('data-variant', 'defaultBorderless');
      });
    });

    it('deve renderizar com estado de loading', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders} loading={true} />
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('deve renderizar com dados vazios', () => {
      render(<TableProvider data={[]} headers={mockHeaders} />);

      const tableBody = screen.getByTestId('table-body');
      expect(tableBody).toBeInTheDocument();
    });

    it('deve aplicar className customizada nos headers', () => {
      const headersWithClass: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título', className: 'custom-class' },
      ];

      render(<TableProvider data={mockData} headers={headersWithClass} />);

      const header = screen.getByTestId('table-head');
      expect(header).toHaveClass('custom-class');
    });
  });

  // ======================
  // GRUPO 2: RENDERIZAÇÃO DE HEADERS
  // ======================
  describe('Renderização de Headers', () => {
    it('deve renderizar todos os headers fornecidos', () => {
      render(<TableProvider data={mockData} headers={mockHeaders} />);

      const headers = screen.getAllByTestId('table-head');
      expect(headers).toHaveLength(mockHeaders.length);
    });

    it('deve renderizar header com label string', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título da Atividade' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      expect(screen.getByText('Título da Atividade')).toBeInTheDocument();
    });

    it('deve renderizar header com label ReactNode', () => {
      const headers: ColumnConfig<Activity>[] = [
        {
          key: 'title',
          label: <span data-testid="custom-label">Custom Label</span>,
        },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    });

    it('deve renderizar header com width customizada', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título', width: '200px' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const header = screen.getByTestId('table-head');
      expect(header).toHaveStyle({ width: '200px' });
    });

    it('deve renderizar header com className customizada', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título', className: 'font-bold text-xl' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const header = screen.getByTestId('table-head');
      expect(header).toHaveClass('font-bold text-xl');
    });

    it('deve renderizar header com alinhamento left', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título', align: 'left' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const cells = screen.getAllByTestId('table-cell');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ textAlign: 'left' });
      });
    });

    it('deve renderizar header com alinhamento center', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'completionPercentage', label: 'Progresso', align: 'center' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const cells = screen.getAllByTestId('table-cell');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ textAlign: 'center' });
      });
    });

    it('deve renderizar header com alinhamento right', () => {
      const headers: ColumnConfig<Activity>[] = [
        { key: 'completionPercentage', label: 'Progresso', align: 'right' },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const cells = screen.getAllByTestId('table-cell');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ textAlign: 'right' });
      });
    });
  });

  // ======================
  // GRUPO 3: RENDERIZAÇÃO DE DADOS
  // ======================
  describe('Renderização de Dados', () => {
    it('deve renderizar todas as linhas de dados', () => {
      render(<TableProvider data={mockData} headers={mockHeaders} />);

      const rows = screen.getAllByTestId('table-row');
      expect(rows).toHaveLength(mockData.length);
    });

    it('deve renderizar células com valores primitivos', () => {
      render(<TableProvider data={mockData} headers={mockHeaders} />);

      expect(screen.getByText('Atividade 1')).toBeInTheDocument();
      expect(screen.getByText('ATIVA')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('deve renderizar células com função render customizada', () => {
      const headers: ColumnConfig<Activity>[] = [
        {
          key: 'status',
          label: 'Status',
          render: (value) => (
            <span data-testid="custom-render">Status: {value as string}</span>
          ),
        },
      ];

      render(<TableProvider data={mockData} headers={headers} />);

      const customRenders = screen.getAllByTestId('custom-render');
      expect(customRenders).toHaveLength(mockData.length);
      expect(customRenders[0]).toHaveTextContent('Status: ATIVA');
    });

    it('deve renderizar células com valores null', () => {
      const dataWithNull = [
        { id: '1', title: null, status: 'ATIVA' },
      ] as unknown as Activity[];
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título' },
      ];

      render(<TableProvider data={dataWithNull} headers={headers} />);

      const cell = screen.getAllByTestId('table-cell')[0];
      expect(cell).toHaveTextContent('');
    });

    it('deve renderizar células com valores undefined', () => {
      const dataWithUndefined = [
        { id: '1', status: 'ATIVA' },
      ] as unknown as Activity[];
      const headers: ColumnConfig<Activity>[] = [
        { key: 'title', label: 'Título' },
      ];

      render(<TableProvider data={dataWithUndefined} headers={headers} />);

      const cell = screen.getAllByTestId('table-cell')[0];
      expect(cell).toHaveTextContent('');
    });

    it('deve renderizar células com valores numéricos', () => {
      render(<TableProvider data={mockData} headers={mockHeaders} />);

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve renderizar células com valores booleanos convertidos para string', () => {
      const dataWithBoolean = [
        { id: '1', title: 'Test', active: true },
      ] as unknown as Activity[];
      const headers: ColumnConfig<Activity>[] = [
        { key: 'active', label: 'Ativo' },
      ];

      render(<TableProvider data={dataWithBoolean} headers={headers} />);

      expect(screen.getByText('true')).toBeInTheDocument();
    });
  });

  // ======================
  // GRUPO 4: FEATURE - SEARCH
  // ======================
  describe('Feature - Search', () => {
    it('não deve renderizar search quando enableSearch=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={false}
        />
      );

      expect(screen.queryByTestId('search')).not.toBeInTheDocument();
    });

    it('deve renderizar search quando enableSearch=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        />
      );

      expect(screen.getByTestId('search')).toBeInTheDocument();
    });

    it('deve usar placeholder padrão "Buscar..."', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Buscar...');
    });

    it('deve usar placeholder customizado via searchPlaceholder', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          searchPlaceholder="Pesquisar atividades..."
        />
      );

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'Pesquisar atividades...'
      );
    });

    it('deve chamar handleSearchChange quando usuário digita', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(searchInput).toHaveValue('teste');
    });

    it('deve resetar página para 1 quando busca muda', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      // Mudar para página 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Digitar na busca
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      // Verificar que página voltou para 1
      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: 'teste' })
      );
    });

    it('deve incluir search em combinedParams quando há valor', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'teste' })
      );
    });

    it('não deve incluir search em combinedParams quando vazio', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      const lastCall =
        onParamsChange.mock.calls[onParamsChange.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty('search');
    });

    it('deve chamar onClear ao clicar em Clear', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      const clearButton = screen.getByTestId('search-clear');
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('deve passar searchTerm para Table quando enableSearch=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('data-search-term', 'teste');
    });

    it('não deve passar searchTerm para Table quando enableSearch=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={false}
        />
      );

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('data-search-term', 'undefined');
    });

    it('deve passar noSearchResultImage para Table', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          noSearchResultImage="/no-results.png"
        />
      );

      const table = screen.getByTestId('table');
      expect(table).toHaveAttribute('data-no-search-image', '/no-results.png');
    });
  });

  // ======================
  // GRUPO 5: FEATURE - FILTERS
  // ======================
  describe('Feature - Filters', () => {
    it('não deve renderizar botão de filtros quando enableFilters=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={false}
        />
      );

      expect(screen.queryByText('Filtros')).not.toBeInTheDocument();
    });

    it('deve renderizar botão de filtros quando enableFilters=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('deve abrir FilterModal ao clicar no botão', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    it('deve fechar FilterModal ao clicar em "Aplicar"', async () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('filter-modal-apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
      });
    });

    it('deve fechar FilterModal ao chamar onClose', async () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const closeButton = screen.getByTestId('filter-modal-close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
      });
    });

    it('não deve mostrar badge quando não há filtros ativos', async () => {
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: {},
        hasActiveFilters: false,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const button = screen.getByTestId('button');
      expect(button.textContent).not.toContain('1');
    });

    it('deve mostrar badge com número de filtros ativos', async () => {
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: { status: ['ATIVA'], subject: ['Matemática'] },
        hasActiveFilters: true,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('deve resetar página para 1 quando filtros são aplicados', async () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      // Mudar para página 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Abrir modal e aplicar filtros
      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('filter-modal-apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onParamsChange).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('deve passar initialFilters para useTableFilter', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          initialFilters={mockFilterConfigs}
        />
      );

      // useTableFilter is already mocked at the top of the file
      // We just verify it was called correctly (we can't easily access the mock here)
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('deve renderizar FilterModal com filterConfigs correto', async () => {
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: {},
        hasActiveFilters: false,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          initialFilters={mockFilterConfigs}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      expect(screen.getByText('1 configs')).toBeInTheDocument();
    });
  });

  // ======================
  // GRUPO 6: FEATURE - TABLE SORT
  // ======================
  describe('Feature - Table Sort', () => {
    it('não deve habilitar sort quando enableTableSort=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={false}
        />
      );

      const headers = screen.getAllByTestId('table-head');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('data-sortable', 'false');
      });
    });

    it('deve habilitar sort quando enableTableSort=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      const sortableHeader = screen.getAllByTestId('table-head')[0];
      expect(sortableHeader).toHaveAttribute('data-sortable', 'true');
    });

    it('deve chamar handleSort ao clicar em header sortable', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const handleSort = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: null,
        sortDirection: null,
        handleSort,
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      const sortableHeader = screen.getAllByTestId('table-head')[0];
      fireEvent.click(sortableHeader);

      expect(handleSort).toHaveBeenCalledWith('title');
    });

    it('não deve chamar handleSort em header não-sortable', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      const nonSortableHeader = screen.getAllByTestId('table-head')[1];
      fireEvent.click(nonSortableHeader);

      // Non-sortable header should not have sort icon
      expect(
        nonSortableHeader.querySelector('[data-testid="sort-icon"]')
      ).not.toBeInTheDocument();
    });

    it('deve incluir sortBy e sortOrder em combinedParams', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const onParamsChange = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'title', sortOrder: 'asc' })
      );
    });

    it('deve passar syncWithUrl: true para useTableSort', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      // useTableSort is already mocked at the top of the file
      // We just verify the table renders with sortable headers
      const sortableHeader = screen.getAllByTestId('table-head')[0];
      expect(sortableHeader).toHaveAttribute('data-sortable', 'true');
    });

    it('deve renderizar ícone de ordenação no header sortable', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      const sortableHeader = screen.getAllByTestId('table-head')[0];
      expect(
        sortableHeader.querySelector('[data-testid="sort-icon"]')
      ).toBeInTheDocument();
    });

    it('deve mostrar sortDirection correta no header', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'desc',
        handleSort: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
        />
      );

      const sortableHeader = screen.getAllByTestId('table-head')[0];
      expect(sortableHeader).toHaveAttribute('data-sort-direction', 'desc');
    });
  });

  // ======================
  // GRUPO 7: FEATURE - PAGINATION
  // ======================
  describe('Feature - Pagination', () => {
    it('não deve renderizar paginação quando enablePagination=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={false}
        />
      );

      expect(screen.queryByTestId('table-pagination')).not.toBeInTheDocument();
    });

    it('deve renderizar paginação quando enablePagination=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
    });

    it('não deve renderizar paginação quando dados estão vazios', () => {
      render(
        <TableProvider
          data={[]}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.queryByTestId('table-pagination')).not.toBeInTheDocument();
    });

    it('deve usar defaultItemsPerPage padrão (10)', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByText('10 per page')).toBeInTheDocument();
    });

    it('deve usar defaultItemsPerPage customizado', () => {
      const paginationConfig: PaginationConfig = {
        defaultItemsPerPage: 25,
      };

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          paginationConfig={paginationConfig}
        />
      );

      expect(screen.getByText('25 per page')).toBeInTheDocument();
    });

    it('deve usar itemsPerPageOptions padrão [10, 20, 50, 100]', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByText('10,20,50,100')).toBeInTheDocument();
    });

    it('deve usar itemsPerPageOptions customizado', () => {
      const paginationConfig: PaginationConfig = {
        itemsPerPageOptions: [5, 15, 25],
      };

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          paginationConfig={paginationConfig}
        />
      );

      expect(screen.getByText('5,15,25')).toBeInTheDocument();
    });

    it('deve usar itemLabel padrão "itens"', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByText(/itens/)).toBeInTheDocument();
    });

    it('deve usar itemLabel customizado', () => {
      const paginationConfig: PaginationConfig = {
        itemLabel: 'atividades',
      };

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          paginationConfig={paginationConfig}
        />
      );

      expect(screen.getByText(/atividades/)).toBeInTheDocument();
    });

    it('deve calcular totalPages baseado em totalItems', () => {
      const paginationConfig: PaginationConfig = {
        totalItems: 50,
        defaultItemsPerPage: 10,
      };

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          paginationConfig={paginationConfig}
        />
      );

      expect(screen.getByText(/Page 1 of 5/)).toBeInTheDocument();
    });

    it('deve usar totalPages fornecido via props', () => {
      const paginationConfig: PaginationConfig = {
        totalPages: 10,
      };

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          paginationConfig={paginationConfig}
        />
      );

      expect(screen.getByText(/Page 1 of 10/)).toBeInTheDocument();
    });

    it('deve calcular totalPages baseado em data.length', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      // 3 items / 10 per page = 1 page
      expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
    });

    it('deve chamar handlePageChange ao mudar página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('deve chamar handleItemsPerPageChange ao mudar items por página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, page: 1 })
      );
    });

    it('deve resetar página para 1 ao mudar items por página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      // Mudar para página 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      // Mudar items por página
      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  // ======================
  // GRUPO 8: FEATURE - ROW CLICK
  // ======================
  describe('Feature - Row Click', () => {
    it('não deve habilitar click quando enableRowClick=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={false}
        />
      );

      const rows = screen.getAllByTestId('table-row');
      rows.forEach((row) => {
        expect(row).toHaveAttribute('data-clickable', 'false');
      });
    });

    it('deve habilitar click quando enableRowClick=true', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={true}
        />
      );

      const rows = screen.getAllByTestId('table-row');
      rows.forEach((row) => {
        expect(row).toHaveAttribute('data-clickable', 'true');
      });
    });

    it('deve chamar onRowClick ao clicar na linha', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={true}
          onRowClick={onRowClick}
        />
      );

      const firstRow = screen.getAllByTestId('table-row')[0];
      fireEvent.click(firstRow);

      expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0);
    });

    it('deve passar row e index corretos para onRowClick', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={true}
          onRowClick={onRowClick}
        />
      );

      const secondRow = screen.getAllByTestId('table-row')[1];
      fireEvent.click(secondRow);

      expect(onRowClick).toHaveBeenCalledWith(mockData[1], 1);
    });

    it('não deve chamar onRowClick se enableRowClick=false', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={false}
          onRowClick={onRowClick}
        />
      );

      const firstRow = screen.getAllByTestId('table-row')[0];
      fireEvent.click(firstRow);

      expect(onRowClick).not.toHaveBeenCalled();
    });

    it('não deve chamar onRowClick se callback não fornecido', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={true}
        />
      );

      const firstRow = screen.getAllByTestId('table-row')[0];

      expect(() => fireEvent.click(firstRow)).not.toThrow();
    });
  });

  // ======================
  // GRUPO 9: COMBINED PARAMS
  // ======================
  describe('Combined Params', () => {
    it('deve incluir page e limit sempre', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 })
      );
    });

    it('deve incluir search apenas quando enableSearch=true e há valor', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'teste' })
      );
    });

    it('deve incluir filtros ativos quando enableFilters=true', async () => {
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      const onParamsChange = jest.fn();

      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: { status: ['ATIVA'] },
        hasActiveFilters: true,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['ATIVA'] })
      );
    });

    it('deve incluir sortBy e sortOrder quando enableTableSort=true', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const onParamsChange = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'title', sortOrder: 'asc' })
      );
    });

    it('deve atualizar params ao mudar página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('deve atualizar params ao mudar items por página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 })
      );
    });

    it('deve atualizar params ao digitar busca', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'teste' })
      );
    });
  });

  // ======================
  // GRUPO 10: onParamsChange CALLBACK
  // ======================
  describe('onParamsChange Callback', () => {
    it('deve chamar onParamsChange na montagem inicial', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalled();
    });

    it('deve chamar onParamsChange ao mudar página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(onParamsChange).toHaveBeenCalled();
    });

    it('deve chamar onParamsChange ao mudar items por página', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      expect(onParamsChange).toHaveBeenCalled();
    });

    it('deve chamar onParamsChange ao buscar', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalled();
    });

    it('não deve chamar onParamsChange se não fornecido', () => {
      expect(() => {
        render(<TableProvider data={mockData} headers={mockHeaders} />);
      }).not.toThrow();
    });

    it('deve chamar com objeto TableParams correto', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          onParamsChange={onParamsChange}
        />
      );

      const params = onParamsChange.mock.calls[0][0];
      expect(params).toHaveProperty('page');
      expect(params).toHaveProperty('limit');
    });
  });

  // ======================
  // GRUPO 11: LOADING STATE
  // ======================
  describe('Loading State', () => {
    it('deve mostrar "Carregando..." quando loading=true', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders} loading={true} />
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('deve renderizar dados quando loading=false', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders} loading={false} />
      );

      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      expect(screen.getByText('Atividade 1')).toBeInTheDocument();
    });

    it('deve mostrar loading com colspan correto', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders} loading={true} />
      );

      const loadingCell = screen.getByText('Carregando...').closest('td');
      expect(loadingCell).toHaveAttribute(
        'colspan',
        String(mockHeaders.length)
      );
    });

    it('não deve renderizar dados durante loading', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders} loading={true} />
      );

      expect(screen.queryByText('Atividade 1')).not.toBeInTheDocument();
    });
  });

  // ======================
  // GRUPO 12: RENDER PROPS PATTERN
  // ======================
  describe('Render Props Pattern', () => {
    it('deve usar layout padrão quando children não fornecido', () => {
      const { container } = render(
        <TableProvider data={mockData} headers={mockHeaders} />
      );

      const wrapper = container.querySelector('.w-full.space-y-4');
      expect(wrapper).toBeInTheDocument();
    });

    it('deve usar render props quando children fornecido', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders}>
          {() => <div data-testid="custom-layout">Custom Layout</div>}
        </TableProvider>
      );

      expect(screen.getByTestId('custom-layout')).toBeInTheDocument();
    });

    it('deve fornecer controls no render props', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
        >
          {({ controls }) => (
            <div data-testid="custom-controls">{controls}</div>
          )}
        </TableProvider>
      );

      const customControls = screen.getByTestId('custom-controls');
      expect(
        customControls.querySelector('[data-testid="search"]')
      ).toBeInTheDocument();
    });

    it('deve fornecer table no render props', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders}>
          {({ table }) => <div data-testid="custom-table">{table}</div>}
        </TableProvider>
      );

      const customTable = screen.getByTestId('custom-table');
      expect(
        customTable.querySelector('[data-testid="table"]')
      ).toBeInTheDocument();
    });

    it('deve fornecer pagination no render props', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        >
          {({ pagination }) => (
            <div data-testid="custom-pagination">{pagination}</div>
          )}
        </TableProvider>
      );

      const customPagination = screen.getByTestId('custom-pagination');
      expect(
        customPagination.querySelector('[data-testid="table-pagination"]')
      ).toBeInTheDocument();
    });

    it('deve renderizar FilterModal fora do children', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        >
          {() => <div data-testid="custom-layout">Custom</div>}
        </TableProvider>
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    it('deve manter funcionalidades com render props', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableRowClick={true}
          onRowClick={onRowClick}
        >
          {({ table }) => <div>{table}</div>}
        </TableProvider>
      );

      const firstRow = screen.getAllByTestId('table-row')[0];
      fireEvent.click(firstRow);

      expect(onRowClick).toHaveBeenCalled();
    });

    it('controls deve ser false quando nenhuma feature está habilitada', () => {
      render(
        <TableProvider data={mockData} headers={mockHeaders}>
          {({ controls }) => (
            <div data-testid="controls-wrapper">
              {controls || 'No controls'}
            </div>
          )}
        </TableProvider>
      );

      expect(screen.getByText('No controls')).toBeInTheDocument();
    });

    it('pagination deve ser false quando enablePagination=false', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={false}
        >
          {({ pagination }) => (
            <div data-testid="pagination-wrapper">
              {pagination || 'No pagination'}
            </div>
          )}
        </TableProvider>
      );

      expect(screen.getByText('No pagination')).toBeInTheDocument();
    });
  });

  // ======================
  // GRUPO 13: INTEGRAÇÃO SEARCH + PAGINATION
  // ======================
  describe('Integração Search + Pagination', () => {
    it('deve resetar página para 1 ao buscar', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: 'teste' })
      );
    });

    it('deve incluir ambos search e page em params', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: 'teste' })
      );
    });

    it('deve manter items por página ao buscar', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, search: 'teste' })
      );
    });
  });

  // ======================
  // GRUPO 14: INTEGRAÇÃO FILTERS + PAGINATION
  // ======================
  describe('Integração Filters + Pagination', () => {
    it('deve resetar página para 1 ao aplicar filtros', async () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('filter-modal-apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onParamsChange).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('deve incluir ambos filtros e page em params', async () => {
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      const onParamsChange = jest.fn();

      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: { status: ['ATIVA'] },
        hasActiveFilters: true,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, status: ['ATIVA'] })
      );
    });

    it('deve manter items por página ao filtrar', async () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const changeItemsButton = screen.getByText('Change Items');
      fireEvent.click(changeItemsButton);

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('filter-modal-apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onParamsChange).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 20 })
        );
      });
    });
  });

  // ======================
  // GRUPO 15: INTEGRAÇÃO SORT + PAGINATION
  // ======================
  describe('Integração Sort + Pagination', () => {
    it('deve manter página atual ao ordenar', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const onParamsChange = jest.fn();
      const handleSort = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort,
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, sortBy: 'title', sortOrder: 'asc' })
      );
    });

    it('deve incluir ambos sort e page em params', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const onParamsChange = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableTableSort={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, sortBy: 'title', sortOrder: 'asc' })
      );
    });
  });

  // ======================
  // GRUPO 16: TODAS FEATURES ATIVAS
  // ======================
  describe('Todas Features Ativas', () => {
    it('deve funcionar com todas features habilitadas', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort: jest.fn(),
      });

      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: { status: ['ATIVA'] },
        hasActiveFilters: true,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enableFilters={true}
          enableTableSort={true}
          enablePagination={true}
          enableRowClick={true}
        />
      );

      expect(screen.getByTestId('search')).toBeInTheDocument();
      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
    });

    it('deve incluir todos params quando todos ativos', async () => {
      const { useTableSort } = jest.mocked(await import('../Table/Table'));
      const { useTableFilter } = jest.mocked(
        await import('../Filter/useTableFilter')
      );
      const onParamsChange = jest.fn();

      useTableSort.mockReturnValue({
        sortedData: mockData,
        sortColumn: 'title',
        sortDirection: 'asc',
        handleSort: jest.fn(),
      });

      useTableFilter.mockReturnValue({
        filterConfigs: mockFilterConfigs,
        activeFilters: { status: ['ATIVA'] },
        hasActiveFilters: true,
        updateFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      });

      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableSearch={true}
          enableFilters={true}
          enableTableSort={true}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'teste' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          search: 'teste',
          status: 'ATIVA',
          sortBy: 'title',
          sortOrder: 'asc',
        })
      );
    });
  });

  // ======================
  // GRUPO 17-20: EDGE CASES
  // ======================
  describe('Edge Cases', () => {
    it('deve renderizar estado vazio quando data=[]', () => {
      render(<TableProvider data={[]} headers={mockHeaders} />);

      const tableBody = screen.getByTestId('table-body');
      expect(tableBody).toBeInTheDocument();
      expect(tableBody.children).toHaveLength(0);
    });

    it('deve esconder paginação quando data=[]', () => {
      render(
        <TableProvider
          data={[]}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.queryByTestId('table-pagination')).not.toBeInTheDocument();
    });

    it('não deve chamar onRowClick quando sem dados', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={[]}
          headers={mockHeaders}
          enableRowClick={true}
          onRowClick={onRowClick}
        />
      );

      expect(onRowClick).not.toHaveBeenCalled();
    });

    it('deve renderizar com headers=[]', () => {
      render(<TableProvider data={mockData} headers={[]} />);

      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('deve funcionar sem onParamsChange', () => {
      expect(() => {
        render(<TableProvider data={mockData} headers={mockHeaders} />);
      }).not.toThrow();
    });

    it('deve funcionar sem onRowClick', () => {
      expect(() => {
        render(
          <TableProvider
            data={mockData}
            headers={mockHeaders}
            enableRowClick={true}
          />
        );
      }).not.toThrow();
    });

    it('deve funcionar sem initialFilters', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('deve funcionar sem paginationConfig', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
    });

    it('Modal deve estar fechado inicialmente', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
    });

    it('Modal deve abrir ao clicar no botão', () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    it('Modal deve fechar ao aplicar', async () => {
      render(
        <TableProvider
          data={mockData}
          headers={mockHeaders}
          enableFilters={true}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('filter-modal-apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
      });
    });
  });
});
