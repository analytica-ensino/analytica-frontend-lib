import type { ReactNode } from 'react';
import { BasePageLayout } from '../BasePageLayout/BasePageLayout';
import type { TableParams, ColumnConfig } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';

/**
 * Enum for activity page tabs
 */
export enum ActivityTab {
  HISTORY = 'historico',
  DRAFTS = 'rascunhos',
  MODELS = 'modelos',
}

/**
 * Tab configuration for activity pages
 */
const ACTIVITY_TABS = [
  { value: ActivityTab.HISTORY, label: 'Histórico', testId: 'menu-item-history' },
  { value: ActivityTab.DRAFTS, label: 'Rascunhos', testId: 'menu-item-drafts' },
  { value: ActivityTab.MODELS, label: 'Modelos', testId: 'menu-item-models' },
];

/**
 * Props for the ActivityPageLayout component
 */
export interface ActivityPageLayoutProps<T extends Record<string, unknown>> {
  /** Current active tab */
  activeTab: ActivityTab;
  /** Page title displayed in the header */
  pageTitle: string;
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
  /** Label for pagination items (e.g., "atividades", "rascunhos") */
  itemLabel: string;
  /** Search placeholder text */
  searchPlaceholder: string;
  /** Empty state component rendered inside the table */
  emptyState: ReactNode;
  /** Image shown when search returns no results */
  noSearchImage: string;
  /** Callback when table params change (search, sort, pagination) */
  onParamsChange: (params: TableParams) => void;
  /** Callback when a row is clicked */
  onRowClick: (row: T) => void;
  /** Callback when a tab is changed */
  onTabChange: (tab: ActivityTab) => void;
  /** Callback when the create activity button is clicked */
  onCreateActivity: () => void;
  /** Label for the create button (default: "Criar atividade") */
  createButtonLabel?: string;
}

/**
 * Layout component for activity pages (History, Drafts, Models).
 * Wraps BasePageLayout with activity-specific configuration.
 * @returns JSX element representing the activity page layout
 */
export function ActivityPageLayout<T extends Record<string, unknown>>({
  activeTab,
  pageTitle,
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
  onParamsChange,
  onRowClick,
  onTabChange,
  onCreateActivity,
  createButtonLabel = 'Criar atividade',
}: Readonly<ActivityPageLayoutProps<T>>) {
  return (
    <BasePageLayout
      activeTab={activeTab}
      pageTitle={pageTitle}
      testId={testId}
      data={data}
      headers={headers}
      loading={loading}
      error={error}
      pagination={pagination}
      initialFilters={initialFilters}
      itemLabel={itemLabel}
      searchPlaceholder={searchPlaceholder}
      emptyState={emptyState}
      noSearchImage={noSearchImage}
      tabs={ACTIVITY_TABS}
      createButtonLabel={createButtonLabel}
      onParamsChange={onParamsChange}
      onRowClick={onRowClick}
      onTabChange={(tab) => onTabChange(tab as ActivityTab)}
      onCreate={onCreateActivity}
    />
  );
}
