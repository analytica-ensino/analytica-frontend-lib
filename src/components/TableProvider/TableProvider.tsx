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
import { cn } from '../../utils/utils';

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
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Custom component to render when table is empty (no data and no search active) */
  component?: ReactNode;
  /** Image to display in empty state (path from project) */
  image?: string;
  /** Title text for empty state */
  title?: string;
  /** Description text for empty state */
  description?: string;
  /** Button text for empty state action (optional) */
  buttonText?: string;
  /** Icon to display on button (optional) */
  buttonIcon?: ReactNode;
  /** Callback when empty state button is clicked */
  onButtonClick?: () => void;
  /** Button variant (solid, outline, or link) */
  buttonVariant?: 'solid' | 'outline' | 'link';
  /** Button action color (primary, positive, or negative) */
  buttonAction?: 'primary' | 'positive' | 'negative';
}

/**
 * Loading state configuration
 */
export interface LoadingStateConfig {
  /** Custom component to render when table is loading */
  component?: ReactNode;
}

/**
 * No search result state configuration
 */
export interface NoSearchResultConfig {
  /** Custom component to render when search returns no results */
  component?: ReactNode;
  /** Title for no search result state */
  title?: string;
  /** Description for no search result state */
  description?: string;
  /** Image to display in no search result state */
  image?: string;
}

/**
 * Table components exposed via render prop
 */
export interface TableComponents {
  /** Search and filter controls */
  controls: ReactNode;
  /** Table with data */
  table: ReactNode;
  /** Pagination controls */
  pagination: ReactNode;
}

/**
 * TableProvider Props
 */
export interface TableProviderProps<T = Record<string, unknown>> {
  /** Data to display in the table */
  readonly data: T[];
  /** Column configurations */
  readonly headers: ColumnConfig<T>[];
  /** Loading state */
  readonly loading?: boolean;
  /** Table variant */
  readonly variant?: 'default' | 'borderless';

  /** Enable search functionality */
  readonly enableSearch?: boolean;
  /** Enable filters functionality */
  readonly enableFilters?: boolean;
  /** Enable table sorting */
  readonly enableTableSort?: boolean;
  /** Enable pagination */
  readonly enablePagination?: boolean;
  /** Enable row click functionality */
  readonly enableRowClick?: boolean;

  /** Initial filter configurations */
  readonly initialFilters?: FilterConfig[];
  /** Pagination configuration */
  readonly paginationConfig?: PaginationConfig;
  /** Search placeholder text */
  readonly searchPlaceholder?: string;
  /** Additional CSS classes for the search container */
  readonly searchContainerClassName?: string;
  /** Empty state configuration (when table is empty with no search) */
  readonly emptyState?: EmptyStateConfig;
  /** Loading state configuration (when table is loading) */
  readonly loadingState?: LoadingStateConfig;
  /** No search result state configuration (when search returns no results) */
  readonly noSearchResultState?: NoSearchResultConfig;
  /** Key field name to use for unique row identification (recommended for better performance) */
  readonly rowKey?: keyof T;

  /** Callback when any parameter changes */
  readonly onParamsChange?: (params: TableParams) => void;
  /** Callback when row is clicked */
  readonly onRowClick?: (row: T, index: number) => void;

  /**
   * Content to display in the header area (e.g., action buttons)
   * Rendered above the search/filter controls
   */
  readonly headerContent?: ReactNode;

  /**
   * Additional CSS classes for the container wrapper
   */
  readonly containerClassName?: string;

  /**
   * Render prop for custom layout control
   * When provided, gives full control over component positioning
   * @param components - Table components (controls, table, pagination)
   * @returns Custom layout JSX
   *
   * @example
   * ```tsx
   * <TableProvider {...props}>
   *   {({ controls, table, pagination }) => (
   *     <>
   *       <div className="mb-4">{controls}</div>
   *       <div className="bg-white p-6">
   *         {table}
   *         {pagination}
   *       </div>
   *     </>
   *   )}
   * </TableProvider>
   * ```
   */
  readonly children?: (components: TableComponents) => ReactNode;
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
  searchContainerClassName,
  emptyState,
  loadingState,
  noSearchResultState,
  rowKey,
  onParamsChange,
  onRowClick,
  headerContent,
  containerClassName,
  children,
}: TableProviderProps<T>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state - always call hook (React Rules of Hooks)
  const sortResultRaw = useTableSort(data, { syncWithUrl: true });
  const sortResult = enableTableSort
    ? sortResultRaw
    : {
        sortedData: data,
        sortColumn: null,
        sortDirection: null,
        handleSort: () => {},
      };

  const { sortedData, sortColumn, sortDirection, handleSort } = sortResult;

  // Filter state - always call hook (React Rules of Hooks)
  const filterResultRaw = useTableFilter(initialFilters, { syncWithUrl: true });

  // Memoize disabled filter result to prevent recreating object on every render
  const disabledFilterResult = useMemo(
    () => ({
      filterConfigs: [],
      activeFilters: {},
      hasActiveFilters: false,
      updateFilters: () => {},
      applyFilters: () => {},
      clearFilters: () => {},
    }),
    []
  );

  const filterResult = enableFilters ? filterResultRaw : disabledFilterResult;

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
  // Note: onParamsChange is omitted from dependencies intentionally to prevent infinite loops
  useEffect(() => {
    onParamsChange?.(combinedParams);
  }, [combinedParams]);

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

  // Detect if pagination should be managed internally
  const useInternalPagination = useMemo(
    () =>
      enablePagination &&
      !onParamsChange &&
      totalItems === undefined &&
      totalPages === undefined,
    [enablePagination, onParamsChange, totalItems, totalPages]
  );

  // Calculate total pages from data if not provided
  const calculatedTotalPages =
    totalPages ??
    Math.ceil(
      (totalItems ??
        (useInternalPagination ? sortedData.length : data.length)) /
        itemsPerPage
    );
  const calculatedTotalItems =
    totalItems ?? (useInternalPagination ? sortedData.length : data.length);

  // Apply pagination to data when managed internally
  const displayData = useMemo(() => {
    if (!useInternalPagination) {
      return sortedData;
    }

    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [useInternalPagination, sortedData, currentPage, itemsPerPage]);

  // Empty state check
  const isEmpty = data.length === 0;

  // Calculate state control booleans - Table is responsible for rendering, TableProvider controls WHEN
  const showLoading = loading;
  const showNoSearchResult =
    !loading && data.length === 0 && searchQuery.trim() !== '';
  const showEmpty = !loading && data.length === 0 && searchQuery.trim() === '';

  // Extract components for render prop pattern
  const controls = (enableSearch || enableFilters) && (
    <div className="flex items-center gap-4">
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

      {/* Search */}
      {enableSearch && (
        <div className={cn('flex-1', searchContainerClassName)}>
          <Search
            value={searchQuery}
            onSearch={handleSearchChange}
            onClear={() => handleSearchChange('')}
            options={[]}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
    </div>
  );

  // Header with content and controls
  const headerSection = (headerContent || controls) && (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Header Content (e.g., action buttons) */}
      {headerContent && <div>{headerContent}</div>}

      {/* Controls (search and filters) */}
      {controls && <div className="flex-1 md:flex-none">{controls}</div>}
    </div>
  );

  const table = (
    <div className="w-full overflow-x-auto">
      <Table
        variant={variant}
        showLoading={showLoading}
        loadingState={loadingState}
        showNoSearchResult={showNoSearchResult}
        noSearchResultState={noSearchResultState}
        showEmpty={showEmpty}
        emptyState={emptyState}
      >
        {/* Table Header */}
        <thead>
          <TableRow
            variant={variant === 'borderless' ? 'defaultBorderless' : 'default'}
          >
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
              <TableCell colSpan={headers.length} className="text-center py-8">
                <span className="text-text-400 text-sm">Carregando...</span>
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((row, rowIndex) => {
              // Calculate effective index for row click and keys
              const effectiveIndex = useInternalPagination
                ? (currentPage - 1) * itemsPerPage + rowIndex
                : rowIndex;

              const rowKeyValue = rowKey
                ? (() => {
                    const keyValue = row[rowKey];
                    if (keyValue === null || keyValue === undefined) {
                      return `row-${effectiveIndex}`;
                    }
                    if (typeof keyValue === 'object') {
                      return JSON.stringify(keyValue);
                    }
                    return String(keyValue);
                  })()
                : `row-${effectiveIndex}`;
              return (
                <TableRow
                  key={rowKeyValue}
                  variant={
                    variant === 'borderless' ? 'defaultBorderless' : 'default'
                  }
                  clickable={enableRowClick}
                  onClick={() => handleRowClickInternal(row, effectiveIndex)}
                >
                  {headers.map((header, cellIndex) => {
                    const value = row[header.key];

                    let defaultContent = '';

                    if (value !== null && value !== undefined) {
                      if (
                        typeof value === 'string' ||
                        typeof value === 'number' ||
                        typeof value === 'boolean' ||
                        typeof value === 'bigint'
                      ) {
                        // Only convert primitives directly to string
                        defaultContent = String(value);
                      } else if (typeof value === 'object') {
                        // Serialize objects and arrays with JSON
                        defaultContent = JSON.stringify(value);
                      } else if (typeof value === 'function') {
                        // Handle functions - don't expose function code
                        defaultContent = '[Function]';
                      } else if (typeof value === 'symbol') {
                        // Handle symbols
                        defaultContent = String(value);
                      }
                      // All possible types covered - no else needed
                    }

                    const content = header.render
                      ? header.render(value, row, effectiveIndex)
                      : defaultContent;

                    return (
                      <TableCell
                        key={`cell-${effectiveIndex}-${cellIndex}`}
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  const pagination = enablePagination && !isEmpty && (
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
  );

  // If children prop provided, use render props pattern
  if (children) {
    return (
      <>
        {children({
          controls: headerSection || controls || null,
          table,
          pagination,
        })}
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
      </>
    );
  }

  // Default layout (backward compatible)
  const wrapperClassName = containerClassName || 'w-full space-y-4';
  return (
    <div className={wrapperClassName}>
      {headerSection}
      {table}
      {pagination}

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
