import { useCallback, useMemo } from 'react';
import Text from '../Text/Text';
import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import Button from '../Button/Button';
import TableProvider from '../TableProvider/TableProvider';
import type { TableParams, ColumnConfig } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';
import { Plus } from 'phosphor-react';
import type { ReactNode } from 'react';

/**
 * Tab configuration for BasePageLayout
 */
export interface TabConfig {
  value: string;
  label: string;
  testId: string;
}

/**
 * Props for the BasePageLayout component
 */
export interface BasePageLayoutProps<T extends Record<string, unknown>> {
  /** Current active tab value */
  activeTab: string;
  /** Page title displayed in the header */
  pageTitle: string;
  /** Optional content rendered to the right of the page title (e.g., type selector) */
  headerLeftContent?: ReactNode;
  /** Test ID for the page container */
  testId: string;
  /** Data to display in the table */
  data: T[];
  /** Table column headers configuration */
  headers: ColumnConfig<T>[];
  /** Whether data is loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Pagination configuration */
  pagination: {
    total: number;
    totalPages: number;
  };
  /** Initial filter configuration */
  initialFilters?: FilterConfig[];
  /** Label for pagination items (e.g., "provas", "atividades") */
  itemLabel: string;
  /** Search placeholder text */
  searchPlaceholder: string;
  /** Empty state component rendered inside the table */
  emptyState: ReactNode;
  /** Image shown when search returns no results */
  noSearchImage: string;
  /** Tab configuration */
  tabs: TabConfig[];
  /** Label for the create button */
  createButtonLabel: string;
  /** Callback when table params change (search, sort, pagination) */
  onParamsChange: (params: TableParams) => void;
  /** Callback when a row is clicked */
  onRowClick: (row: T) => void;
  /** Callback when a tab is changed */
  onTabChange: (tab: string) => void;
  /** Callback when the create button is clicked */
  onCreate: () => void;
}

/**
 * Shared base layout component for list pages (History, Drafts, Models).
 * Provides consistent structure with tabs navigation, search, filters, and table display.
 * Used by ExamPageLayout and ActivityPageLayout.
 * @returns JSX element representing the page layout
 */
export function BasePageLayout<T extends Record<string, unknown>>({
  activeTab,
  pageTitle,
  headerLeftContent,
  testId,
  data,
  headers,
  loading,
  error,
  pagination,
  initialFilters,
  itemLabel,
  searchPlaceholder,
  emptyState,
  noSearchImage,
  tabs,
  createButtonLabel,
  onParamsChange,
  onRowClick,
  onTabChange,
  onCreate,
}: Readonly<BasePageLayoutProps<T>>) {
  /**
   * Compute a stable key for TableProvider based on filter options availability.
   * Forces remount when userData loads and filter options become available,
   * ensuring TableProvider initializes with correct filter data.
   */
  const tableKey = useMemo(() => {
    const totalOptions = Array.isArray(initialFilters)
      ? initialFilters
          .flatMap((group) => group.categories)
          .reduce(
            (sum, cat: FilterConfig['categories'][number]) =>
              sum + (cat.itens?.length ?? 0),
            0
          )
      : 0;
    return `filters-${totalOptions}`;
  }, [initialFilters]);

  /**
   * Whether filters should be enabled — only when at least one filter has options.
   */
  const enableFilters = useMemo(
    () =>
      Array.isArray(initialFilters) &&
      initialFilters
        .flatMap((g) => g.categories)
        .some((c) => (c.itens?.length ?? 0) > 0),
    [initialFilters]
  );

  /**
   * Handles tab change by forwarding to the onTabChange callback.
   * @param value - Tab value selected by the user
   */
  const handleTabChange = useCallback(
    (value: string) => {
      onTabChange(value);
    },
    [onTabChange]
  );

  return (
    <div
      data-testid={testId}
      className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden"
    >
      {/* Background decoration */}
      <span className="absolute top-0 left-0 h-[150px] w-full z-0" />

      {/* Main container */}
      <div className="flex flex-col w-full h-full max-w-[1350px] mx-auto z-10 lg:px-0 px-4 pt-4 sm:pt-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row w-full mb-6 items-start sm:items-center sm:justify-between gap-0 sm:gap-4">
          {/* Page Title + Optional Left Content */}
          <div className="flex items-center gap-3">
            <Text
              as="h1"
              className="font-bold leading-[28px] tracking-[0.2px] text-text-950 text-xl lg:text-2xl whitespace-nowrap"
            >
              {pageTitle}
            </Text>
            {headerLeftContent}
          </div>

          {/* Tabs Menu */}
          <div className="shrink-0 lg:w-auto self-center sm:self-auto">
            <Menu
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              variant="menu2"
              className="bg-transparent shadow-none px-0"
            >
              <MenuContent
                variant="menu2"
                className="w-full lg:w-auto max-w-full min-w-0"
              >
                {tabs.map((tab) => (
                  <MenuItem
                    key={tab.value}
                    variant="menu2"
                    value={tab.value}
                    data-testid={tab.testId}
                    className="whitespace-nowrap flex-1 lg:flex-none"
                  >
                    {tab.label}
                  </MenuItem>
                ))}
              </MenuContent>
            </Menu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center w-full min-h-0 flex-1">
          {/* Error State */}
          {error ? (
            <div className="flex items-center justify-center bg-background rounded-xl w-full min-h-[705px]">
              <Text size="lg" color="text-error-500">
                {error}
              </Text>
            </div>
          ) : (
            <div className="w-full">
              <TableProvider
                key={tableKey}
                data={data}
                headers={headers}
                loading={loading}
                variant="borderless"
                enableSearch
                enableFilters={enableFilters}
                enableTableSort
                enablePagination
                enableRowClick
                initialFilters={initialFilters}
                paginationConfig={{
                  itemLabel,
                  itemsPerPageOptions: [10, 20, 50, 100],
                  defaultItemsPerPage: 10,
                  totalItems: pagination.total,
                  totalPages: pagination.totalPages,
                }}
                searchPlaceholder={searchPlaceholder}
                noSearchResultState={{
                  image: noSearchImage,
                }}
                emptyState={{
                  component: emptyState,
                }}
                onParamsChange={onParamsChange}
                onRowClick={onRowClick}
                headerContent={
                  <Button
                    variant="solid"
                    action="primary"
                    size="medium"
                    onClick={onCreate}
                    iconLeft={<Plus size={18} weight="bold" />}
                  >
                    {createButtonLabel}
                  </Button>
                }
                containerClassName="bg-background rounded-xl p-6 space-y-4"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
