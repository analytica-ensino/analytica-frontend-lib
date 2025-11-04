import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableProvider } from './TableProvider';
import type { ColumnConfig } from './TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';

// Mock para imagens PNG
jest.mock('../../assets/img/mock-content.png', () => 'test-file-stub');
jest.mock('../../assets/img/mock-image-question.png', () => 'test-file-stub');

/**
 * Mock data interface for testing
 */
interface TestData extends Record<string, unknown> {
  id: number;
  name: string;
  age: number;
  status: 'active' | 'inactive';
}

/**
 * Sample test data
 */
const testData: TestData[] = [
  { id: 1, name: 'Alice', age: 25, status: 'active' },
  { id: 2, name: 'Bob', age: 30, status: 'inactive' },
  { id: 3, name: 'Charlie', age: 35, status: 'active' },
];

/**
 * Sample column configurations
 */
const testHeaders: ColumnConfig<TestData>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'status', label: 'Status' },
];

/**
 * Sample filter configurations
 */
const testFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    categories: [
      {
        key: 'status',
        label: 'Status',
        itens: [
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
        ],
        selectedIds: [],
      },
    ],
  },
];

describe('TableProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================
  // GROUP 1: Basic Rendering
  // ======================
  describe('Basic Rendering', () => {
    it('should render with minimal required props', () => {
      render(<TableProvider data={testData} headers={testHeaders} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          variant="default"
        />
      );

      const tableWrapper = container.querySelector('table')?.parentElement;
      expect(tableWrapper).toHaveClass('border');
    });

    it('should render with borderless variant', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          variant="borderless"
        />
      );

      const tableWrapper = container.querySelector('table')?.parentElement;
      expect(tableWrapper).not.toHaveClass('border');
    });

    it('should render loading state', () => {
      render(
        <TableProvider data={testData} headers={testHeaders} loading={true} />
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should render empty data with empty state', () => {
      render(<TableProvider data={[]} headers={testHeaders} />);

      expect(
        screen.getByText('Nenhum dado disponível no momento.')
      ).toBeInTheDocument();
    });

    it('should render all headers correctly', () => {
      render(<TableProvider data={testData} headers={testHeaders} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  // ======================
  // GROUP 2: Headers Rendering
  // ======================
  describe('Headers Rendering', () => {
    it('should render headers with custom render function', () => {
      const customHeaders: ColumnConfig<TestData>[] = [
        {
          key: 'name',
          label: <strong>Custom Name</strong>,
          sortable: true,
        },
      ];

      render(<TableProvider data={testData} headers={customHeaders} />);

      expect(screen.getByText('Custom Name')).toBeInTheDocument();
    });

    it('should render sortable headers when enableTableSort is true', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={true}
        />
      );

      const nameHeader = screen.getByText('Name');
      expect(nameHeader).toBeInTheDocument();
    });

    it('should apply custom className to columns', () => {
      const headersWithClass: ColumnConfig<TestData>[] = [
        { key: 'name', label: 'Name', className: 'custom-header-class' },
      ];

      const { container } = render(
        <TableProvider data={testData} headers={headersWithClass} />
      );

      const header = container.querySelector('.custom-header-class');
      expect(header).toBeInTheDocument();
    });

    it('should apply custom width to columns', () => {
      const headersWithWidth: ColumnConfig<TestData>[] = [
        { key: 'name', label: 'Name', width: '200px' },
      ];

      const { container } = render(
        <TableProvider data={testData} headers={headersWithWidth} />
      );

      const header = container.querySelector('th');
      expect(header).toHaveStyle({ width: '200px' });
    });
  });

  // ======================
  // GROUP 3: Data Rendering
  // ======================
  describe('Data Rendering', () => {
    it('should render all data rows', () => {
      const { container } = render(
        <TableProvider data={testData} headers={testHeaders} />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(testData.length);

      // Verify each row contains the expected data
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render custom cell content with render function', () => {
      const customHeaders: ColumnConfig<TestData>[] = [
        {
          key: 'status',
          label: 'Status',
          render: (value) => (
            <span className="status-badge">{String(value).toUpperCase()}</span>
          ),
        },
      ];

      const { container } = render(
        <TableProvider data={testData} headers={customHeaders} />
      );

      const statusBadges = container.querySelectorAll('.status-badge');
      expect(statusBadges.length).toBeGreaterThan(0);
      expect(screen.getAllByText('ACTIVE')).toHaveLength(2);
      expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    });

    it('should use rowKey for unique row identification', () => {
      const { container } = render(
        <TableProvider data={testData} headers={testHeaders} rowKey="id" />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(testData.length);
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls: TestData[] = [
        { id: 1, name: 'Alice', age: 25, status: 'active' },
      ];

      const headersWithNull: ColumnConfig<TestData>[] = [
        { key: 'name', label: 'Name' },
        { key: 'missing' as string, label: 'Missing' },
      ];

      render(<TableProvider data={dataWithNulls} headers={headersWithNull} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  // ======================
  // GROUP 4: Search Functionality
  // ======================
  describe('Search Functionality', () => {
    it('should not render search when enableSearch is false', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={false}
        />
      );

      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });

    it('should render search when enableSearch is true', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
        />
      );

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should use custom search placeholder', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
          searchPlaceholder="Search users..."
        />
      );

      expect(
        screen.getByPlaceholderText('Search users...')
      ).toBeInTheDocument();
    });

    it('should update search query on input change', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      expect(searchInput).toHaveValue('Alice');
    });
  });

  // ======================
  // GROUP 5: Filter Functionality
  // ======================
  describe('Filter Functionality', () => {
    it('should not render filter button when enableFilters is false', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableFilters={false}
        />
      );

      expect(screen.queryByText('Filtros')).not.toBeInTheDocument();
    });

    it('should render filter button when enableFilters is true', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableFilters={true}
          initialFilters={testFilters}
        />
      );

      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('should open filter modal on button click', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableFilters={true}
          initialFilters={testFilters}
        />
      );

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      expect(screen.getByText('Aplicar')).toBeInTheDocument();
    });

    it('should close filter modal on close button click', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableFilters={true}
          initialFilters={testFilters}
        />
      );

      fireEvent.click(screen.getByText('Filtros'));
      expect(screen.getByText('Aplicar')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Fechar modal'));
      expect(screen.queryByText('Aplicar')).not.toBeInTheDocument();
    });
  });

  // ======================
  // GROUP 6: Table Sort Functionality
  // ======================
  describe('Table Sort Functionality', () => {
    it('should not enable sorting when enableTableSort is false', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={false}
        />
      );

      const nameHeader = container.querySelector('th');
      expect(nameHeader).not.toHaveClass('cursor-pointer');
    });

    it('should enable sorting when enableTableSort is true', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={true}
        />
      );

      const nameHeader = container.querySelector('th');
      expect(nameHeader).toHaveClass('cursor-pointer');
    });

    it('should sort data in ascending order on first click', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={true}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice');
      expect(rows[2]).toHaveTextContent('Bob');
      expect(rows[3]).toHaveTextContent('Charlie');
    });

    it('should clear sort on third click', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={true}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice');
    });
  });

  // ======================
  // GROUP 7: Pagination Functionality
  // ======================
  describe('Pagination Functionality', () => {
    it('should not render pagination when enablePagination is false', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={false}
        />
      );

      expect(
        screen.queryByLabelText('Página anterior')
      ).not.toBeInTheDocument();
    });

    it('should render pagination when enablePagination is true', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={true}
        />
      );

      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próxima página')).toBeInTheDocument();
    });

    it('should use custom itemLabel in pagination', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={true}
          paginationConfig={{ itemLabel: 'usuários' }}
        />
      );

      expect(screen.getByText(/usuários/)).toBeInTheDocument();
    });

    it('should navigate to next page', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        age: 20 + i,
        status: 'active' as const,
      }));

      render(
        <TableProvider
          data={largeData}
          headers={testHeaders}
          enablePagination={true}
        />
      );

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);

      expect(screen.getByText(/Página 2 de 3/)).toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        age: 20 + i,
        status: 'active' as const,
      }));

      render(
        <TableProvider
          data={largeData}
          headers={testHeaders}
          enablePagination={true}
        />
      );

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);

      const prevButton = screen.getByLabelText('Página anterior');
      fireEvent.click(prevButton);

      expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    });

    it('should not render pagination when data is empty', () => {
      render(
        <TableProvider
          data={[]}
          headers={testHeaders}
          enablePagination={true}
        />
      );

      expect(
        screen.queryByLabelText('Página anterior')
      ).not.toBeInTheDocument();
    });
  });

  // ======================
  // GROUP 8: Row Click Functionality
  // ======================
  describe('Row Click Functionality', () => {
    it('should not make rows clickable when enableRowClick is false', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableRowClick={false}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      for (const row of rows) {
        expect(row).not.toHaveClass('cursor-pointer');
      }
    });

    it('should make rows clickable when enableRowClick is true', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableRowClick={true}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      for (const row of rows) {
        expect(row).toHaveClass('cursor-pointer');
      }
    });

    it('should call onRowClick when row is clicked', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableRowClick={true}
          onRowClick={onRowClick}
        />
      );

      const firstRow = screen.getByText('Alice').closest('tr');
      fireEvent.click(firstRow!);

      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick).toHaveBeenCalledWith(testData[0], 0);
    });

    it('should not call onRowClick when enableRowClick is false', () => {
      const onRowClick = jest.fn();
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableRowClick={false}
          onRowClick={onRowClick}
        />
      );

      const firstRow = screen.getByText('Alice').closest('tr');
      fireEvent.click(firstRow!);

      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  // ======================
  // GROUP 9: onParamsChange Callback
  // ======================
  describe('onParamsChange Callback', () => {
    it('should call onParamsChange with initial params', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          onParamsChange={onParamsChange}
        />
      );

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
    });

    it('should call onParamsChange when search changes', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
          onParamsChange={onParamsChange}
        />
      );

      onParamsChange.mockClear();

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          search: 'Alice',
        })
      );
    });

    it('should call onParamsChange when page changes', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        age: 20 + i,
        status: 'active' as const,
      }));

      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={largeData}
          headers={testHeaders}
          enablePagination={true}
          onParamsChange={onParamsChange}
        />
      );

      onParamsChange.mockClear();

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
        })
      );
    });

    it('should call onParamsChange when sort changes', () => {
      const onParamsChange = jest.fn();
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableTableSort={true}
          onParamsChange={onParamsChange}
        />
      );

      onParamsChange.mockClear();

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'desc',
        })
      );
    });
  });

  // ======================
  // GROUP 10: Render Props Pattern
  // ======================
  describe('Render Props Pattern', () => {
    it('should support render props pattern', () => {
      render(
        <TableProvider data={testData} headers={testHeaders}>
          {({ controls, table, pagination }) => (
            <div data-testid="custom-layout">
              <div data-testid="custom-controls">{controls}</div>
              <div data-testid="custom-table">{table}</div>
              <div data-testid="custom-pagination">{pagination}</div>
            </div>
          )}
        </TableProvider>
      );

      expect(screen.getByTestId('custom-layout')).toBeInTheDocument();
      expect(screen.getByTestId('custom-table')).toBeInTheDocument();
    });

    it('should provide controls in render props when search is enabled', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
        >
          {({ controls, table }) => (
            <div>
              {controls}
              {table}
            </div>
          )}
        </TableProvider>
      );

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should provide pagination in render props when enabled', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={true}
        >
          {({ table, pagination }) => (
            <div>
              {table}
              {pagination}
            </div>
          )}
        </TableProvider>
      );

      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
    });

    it('should render default layout when children is not provided', () => {
      const { container } = render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
          enablePagination={true}
        />
      );

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  // ======================
  // GROUP 11: Integration Tests
  // ======================
  describe('Integration Tests', () => {
    it('should work with all features enabled', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
          enableFilters={true}
          enableTableSort={true}
          enablePagination={true}
          enableRowClick={true}
          initialFilters={testFilters}
        />
      );

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
    });

    it('should reset to page 1 when search changes', () => {
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        age: 20 + i,
        status: 'active' as const,
      }));

      render(
        <TableProvider
          data={largeData}
          headers={testHeaders}
          enableSearch={true}
          enablePagination={true}
        />
      );

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);
      expect(screen.getByText(/Página 2 de 3/)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    });

    it('should combine search and sort', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enableSearch={true}
          enableTableSort={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(searchInput).toHaveValue('Alice');
    });
  });

  // ======================
  // GROUP 12: Edge Cases
  // ======================
  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(<TableProvider data={[]} headers={testHeaders} />);

      expect(
        screen.getByText('Nenhum dado disponível no momento.')
      ).toBeInTheDocument();
    });

    it('should handle empty headers array', () => {
      render(<TableProvider data={testData} headers={[]} />);

      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should handle custom noSearchResultImage', () => {
      render(
        <TableProvider
          data={[]}
          headers={testHeaders}
          enableSearch={true}
          noSearchResultImage="/custom-image.png"
        />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(
        screen.getByText('Nenhum resultado encontrado')
      ).toBeInTheDocument();
    });

    it('should handle pagination with totalItems prop', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={true}
          paginationConfig={{ totalItems: 100 }}
        />
      );

      expect(screen.getByText(/de 100 itens/)).toBeInTheDocument();
    });

    it('should handle pagination with totalPages prop', () => {
      render(
        <TableProvider
          data={testData}
          headers={testHeaders}
          enablePagination={true}
          paginationConfig={{ totalPages: 5 }}
        />
      );

      expect(screen.getByText(/Página 1 de 5/)).toBeInTheDocument();
    });
  });
});
