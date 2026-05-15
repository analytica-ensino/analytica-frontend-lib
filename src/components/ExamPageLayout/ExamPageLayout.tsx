import type { ReactNode } from 'react';
import { BasePageLayout } from '../BasePageLayout/BasePageLayout';
import type { TableParams, ColumnConfig } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';

/**
 * Enum for exam page tabs
 */
export enum ExamTab {
  HISTORY = 'historico',
  DRAFTS = 'rascunhos',
  MODELS = 'modelos',
}

/**
 * Tab configuration for exam pages
 */
const EXAM_TABS = [
  { value: ExamTab.HISTORY, label: 'Histórico', testId: 'menu-item-history' },
  { value: ExamTab.DRAFTS, label: 'Rascunhos', testId: 'menu-item-drafts' },
  { value: ExamTab.MODELS, label: 'Modelos', testId: 'menu-item-models' },
];

/**
 * Props for the ExamPageLayout component
 */
export interface ExamPageLayoutProps<T extends Record<string, unknown>> {
  /** Current active tab */
  activeTab: ExamTab;
  /** Page title displayed in the header */
  pageTitle: string;
  /** Optional content rendered to the right of the page title (e.g., type selector) */
  headerRightContent?: ReactNode;
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
  /** Label for pagination items (e.g., "provas", "rascunhos") */
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
  onTabChange: (tab: ExamTab) => void;
  /** Callback when the create button is clicked */
  onCreateExam: () => void;
  /** Label for the create button (default: "Criar prova") */
  createButtonLabel?: string;
}

/**
 * Layout component for exam pages (History, Drafts, Models).
 * Wraps BasePageLayout with exam-specific configuration.
 * @returns JSX element representing the exam page layout
 */
export function ExamPageLayout<T extends Record<string, unknown>>({
  activeTab,
  pageTitle,
  headerRightContent,
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
  onCreateExam,
  createButtonLabel = 'Criar prova',
}: Readonly<ExamPageLayoutProps<T>>) {
  return (
    <BasePageLayout
      activeTab={activeTab}
      pageTitle={pageTitle}
      headerRightContent={headerRightContent}
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
      tabs={EXAM_TABS}
      createButtonLabel={createButtonLabel}
      onParamsChange={onParamsChange}
      onRowClick={onRowClick}
      onTabChange={(tab) => onTabChange(tab as ExamTab)}
      onCreate={onCreateExam}
    />
  );
}
