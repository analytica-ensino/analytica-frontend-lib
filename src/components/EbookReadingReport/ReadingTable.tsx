import type { ReactNode } from 'react';
import Text from '../Text/Text';
import TableProvider, {
  type ColumnConfig,
  type TableParams,
} from '../TableProvider/TableProvider';
import type { EbookReadingTableParams } from './types';

/** Page sizes the reading tables offer; the API takes up to 100. */
const PAGE_SIZES = [10, 20, 50, 100];

export interface ReadingTableProps<T> {
  /** Namespaces the table's URL params: the report can show two tables */
  tableId: string;
  title: string;
  rows: T[];
  columns: ColumnConfig<T>[];
  /** Rows across every page */
  total: number;
  loading: boolean;
  /** "escolas", "estudantes"… */
  itemLabel: string;
  searchPlaceholder: string;
  rowKey: keyof T;
  onParamsChange: (params: EbookReadingTableParams) => void;
  /** Makes the rows clickable */
  onRowClick?: (row: T) => void;
  /** What a row click does, for screen readers */
  rowActionLabel?: (row: T) => string;
  /** Above the table, next to the title */
  headerContent?: ReactNode;
}

/**
 * A table of the reading report: paginated and searched by the API, sorted
 * as the API returns it.
 * @param {ReadingTableProps<T>} props - The rows and how to ask for others
 * @returns {JSX.Element} The table
 */
export const ReadingTable = <T extends Record<string, unknown>>({
  tableId,
  title,
  rows,
  columns,
  total,
  loading,
  itemLabel,
  searchPlaceholder,
  rowKey,
  onParamsChange,
  onRowClick,
  rowActionLabel,
  headerContent,
}: Readonly<ReadingTableProps<T>>) => (
  <section className="flex flex-col gap-4" aria-label={title}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Text as="h2" size="lg" weight="bold" className="text-text-950">
        {title}
      </Text>
      {headerContent}
    </div>
    <TableProvider<T>
      tableId={tableId}
      data={rows}
      headers={columns}
      variant="borderless"
      loading={loading}
      enableSearch
      enablePagination
      enableRowClick={Boolean(onRowClick)}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
      getRowActionLabel={rowActionLabel}
      caption={title}
      rowKey={rowKey}
      searchPlaceholder={searchPlaceholder}
      paginationConfig={{
        itemLabel,
        itemsPerPageOptions: PAGE_SIZES,
        defaultItemsPerPage: PAGE_SIZES[0],
        totalItems: total,
      }}
      emptyState={{ title: 'Nenhuma leitura no período.' }}
      onParamsChange={({ page, limit, search }: TableParams) =>
        onParamsChange({ page, limit, search: search?.trim() || undefined })
      }
    />
  </section>
);
