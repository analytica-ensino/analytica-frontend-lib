import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import Table, {
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  useTableSort,
  TablePagination,
} from '../Table/Table';
import { useTableFilter, FilterConfig } from '../Filter/useTableFilter';
import Search from '../Search/Search';
import { FilterModal } from '../Filter/FilterModal';
import Button from '../Button/Button';
import { Funnel } from 'phosphor-react';

/**
 * Column configuration with flexible rendering options
 */
export interface ColumnConfig<T = Record<string, unknown>> {
  /** Column key (must match data object key) */
  key: string;
  /** Column label - can be string or JSX */
  label: string | ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Column width */
  width?: string;
  /** Additional CSS classes */
  className?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Combined parameters sent via onParamsChange
 */
export interface TableParams {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Search query */
  search?: string;
  /** Active filters (dynamic keys based on filter configs) */
  [key: string]: unknown;
  /** Sort column */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Label for items (e.g., "atividades") */
  itemLabel?: string;
  /** Items per page options */
  itemsPerPageOptions?: number[];
  /** Default items per page */
  defaultItemsPerPage?: number;
  /** Total items (for displaying pagination info) */
  totalItems?: number;
  /** Total pages (if known from backend) */
  totalPages?: number;
}

/**
 * TableProvider Props
 */
export interface TableProviderProps<T = Record<string, unknown>> {
  /** Data to display in the table */
  data: T[];
  /** Column configurations */
  headers: ColumnConfig<T>[];
  /** Loading state */
  loading?: boolean;
  /** Table variant */
  variant?: 'default' | 'borderless';

  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable filters functionality */
  enableFilters?: boolean;
  /** Enable table sorting */
  enableTableSort?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Enable row click functionality */
  enableRowClick?: boolean;

  /** Initial filter configurations */
  initialFilters?: FilterConfig[];
  /** Pagination configuration */
  paginationConfig?: PaginationConfig;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Image for no search result state */
  noSearchResultImage?: string;

  /** Callback when any parameter changes */
  onParamsChange?: (params: TableParams) => void;
  /** Callback when row is clicked */
  onRowClick?: (row: T, index: number) => void;
}

/**
 * TableProvider - Self-contained table component with search, filters, sorting, and pagination
 *
 * @example
 * ```tsx
 * <TableProvider
 *   data={activities}
 *   headers={[
 *     { key: 'title', label: 'Título', sortable: true },
 *     { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> }
 *   ]}
 *   loading={loading}
 *   variant="borderless"
 *   enableSearch
 *   enableFilters
 *   enableTableSort
 *   enablePagination
 *   enableRowClick
 *   initialFilters={filterConfigs}
 *   paginationConfig={{ itemLabel: 'atividades' }}
 *   onParamsChange={handleParamsChange}
 *   onRowClick={handleRowClick}
 * />
 * ```
 */
export function TableProvider<T extends Record<string, unknown>>({
  data,
  headers,
  loading = false,
  variant = 'default',
  enableSearch = false,
  enableFilters = false,
  enableTableSort = false,
  enablePagination = false,
  enableRowClick = false,
  initialFilters = [],
  paginationConfig = {},
  searchPlaceholder = 'Buscar...',
  noSearchResultImage,
  onParamsChange,
  onRowClick,
}: TableProviderProps<T>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state (only if enabled)
  const sortResult = enableTableSort
    ? useTableSort(data, { syncWithUrl: true })
    : {
        sortedData: data,
        sortColumn: null,
        sortDirection: null,
        handleSort: () => {},
      };

  const { sortedData, sortColumn, sortDirection, handleSort } = sortResult;

  // Filter state (only if enabled)
  const filterResult = enableFilters
    ? useTableFilter(initialFilters, { syncWithUrl: true })
    : {
        filterConfigs: [],
        activeFilters: {},
        hasActiveFilters: false,
        updateFilters: () => {},
        applyFilters: () => {},
        clearFilters: () => {},
      };

  const {
    filterConfigs,
    activeFilters,
    hasActiveFilters,
    updateFilters,
    applyFilters,
    clearFilters,
  } = filterResult;

  // Pagination state (only if enabled)
  const {
    defaultItemsPerPage = 10,
    itemsPerPageOptions = [10, 20, 50, 100],
    itemLabel = 'itens',
    totalItems,
    totalPages,
  } = paginationConfig;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Combine all parameters
  const combinedParams = useMemo((): TableParams => {
    const params: TableParams = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (enableSearch && searchQuery) {
      params.search = searchQuery;
    }

    if (enableFilters) {
      Object.assign(params, activeFilters);
    }

    if (enableTableSort && sortColumn && sortDirection) {
      params.sortBy = sortColumn;
      params.sortOrder = sortDirection;
    }

    return params;
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    activeFilters,
    sortColumn,
    sortDirection,
    enableSearch,
    enableFilters,
    enableTableSort,
  ]);

  // Notify parent when parameters change
  useEffect(() => {
    onParamsChange?.(combinedParams);
  }, [combinedParams, onParamsChange]);

  // Handle search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle filter apply
  const handleFilterApply = useCallback(() => {
    applyFilters();
    setIsFilterModalOpen(false);
    setCurrentPage(1); // Reset to first page on filter
  }, [applyFilters]);

  // Handle pagination change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Handle row click
  const handleRowClickInternal = useCallback(
    (row: T, index: number) => {
      if (enableRowClick && onRowClick) {
        onRowClick(row, index);
      }
    },
    [enableRowClick, onRowClick]
  );

  // Calculate total pages from data if not provided
  const calculatedTotalPages =
    totalPages ?? Math.ceil((totalItems ?? data.length) / itemsPerPage);
  const calculatedTotalItems = totalItems ?? data.length;

  // Empty state check
  const isEmpty = data.length === 0;

  return (
    <div className="w-full space-y-4">
      {/* Header with Search and Filters */}
      {(enableSearch || enableFilters) && (
        <div className="flex items-center gap-4">
          {/* Search */}
          {enableSearch && (
            <div className="flex-1">
              <Search
                value={searchQuery}
                onSearch={handleSearchChange}
                options={[]}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          {/* Filter Button */}
          {enableFilters && (
            <Button
              variant="outline"
              size="medium"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Funnel size={20} />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table
          variant={variant}
          searchTerm={enableSearch ? searchQuery : undefined}
          noSearchResultImage={noSearchResultImage}
        >
          {/* Table Header */}
          <thead>
            <TableRow variant={variant}>
              {headers.map((header, index) => (
                <TableHead
                  key={`header-${header.key}-${index}`}
                  sortable={enableTableSort && header.sortable}
                  sortDirection={
                    enableTableSort && sortColumn === header.key
                      ? sortDirection
                      : null
                  }
                  onSort={() =>
                    enableTableSort && header.sortable && handleSort(header.key)
                  }
                  className={header.className}
                  style={header.width ? { width: header.width } : undefined}
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </thead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="text-center py-8"
                >
                  <span className="text-text-400 text-sm">Carregando...</span>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow
                  key={`row-${rowIndex}`}
                  clickable={enableRowClick}
                  onClick={() => handleRowClickInternal(row, rowIndex)}
                >
                  {headers.map((header, cellIndex) => {
                    const value = row[header.key];
                    const content = header.render
                      ? header.render(value, row, rowIndex)
                      : String(value ?? '');

                    return (
                      <TableCell
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={header.className}
                        style={{
                          textAlign: header.align,
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && !isEmpty && (
        <div className="flex justify-end">
          <TablePagination
            currentPage={currentPage}
            totalPages={calculatedTotalPages}
            totalItems={calculatedTotalItems}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={itemsPerPageOptions}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemLabel={itemLabel}
          />
        </div>
      )}

      {/* Filter Modal */}
      {enableFilters && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filterConfigs={filterConfigs}
          onFiltersChange={updateFilters}
          onApply={handleFilterApply}
          onClear={clearFilters}
        />
      )}
    </div>
  );
}

export default TableProvider;
