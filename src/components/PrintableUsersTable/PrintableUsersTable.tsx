import { useMemo } from 'react';
import TableProvider, {
  type ColumnConfig,
} from '../TableProvider/TableProvider';

/**
 * Props for the PrintableUsersTable component.
 */
export interface PrintableUsersTableProps<T extends Record<string, unknown>> {
  /** Row data shared by both printed tables */
  readonly data: T[];
  /** Full ordered list of columns as displayed on screen */
  readonly columns: ColumnConfig<T>[];
  /**
   * Column index at which to split. The first printed table renders columns
   * [0, splitAfter] inclusive, the second renders the anchor column followed
   * by columns [splitAfter + 1, end).
   *
   * Example: columns.length = 8, splitAfter = 3 → first table shows cols 0..3,
   * second shows anchor + cols 4..7.
   */
  readonly splitAfter: number;
  /** Key of the anchor column (usually "name") repeated as first column of the second half */
  readonly anchorColumnKey: string;
}

/**
 * Inline CSS rules applied only during print to make table content fit on
 * the page. Consumers should configure `@page { size: ... }` themselves
 * because page orientation is a page-level concern that can clash with
 * other print rules in the host application.
 */
const PRINT_STYLES = `
@media print {
  [data-print-table] .overflow-x-auto,
  [data-print-table] div[class*="overflow-x-auto"] {
    overflow: visible !important;
  }

  [data-print-table] table {
    font-size: 9px !important;
    width: 100% !important;
    table-layout: fixed !important;
    page-break-inside: auto;
  }

  [data-print-table] table th,
  [data-print-table] table td {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    padding: 4px 6px !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  [data-print-table] table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  [data-print-table] table thead {
    display: table-header-group;
  }
}
`;

/**
 * Renders the same row data as two stacked tables optimized for PDF print.
 *
 * On screen the component is hidden (`hidden print:block`); during
 * `window.print()` it replaces the single scrollable TableProvider, so wide
 * tables no longer clip columns to the viewport width. An inline `<style>`
 * tag embeds the `@media print` rules so the component is drop-in with no
 * extra CSS wiring in the consumer.
 *
 * The anchor column (by convention "name") is repeated as the first column
 * of the second printed table so the reader can match rows across halves.
 *
 * NOTE: Set `@page { size: A4 landscape }` (or equivalent) in the host app
 * global print stylesheet — this component does not define page orientation
 * to avoid conflicts with other print rules.
 */
function PrintableUsersTable<T extends Record<string, unknown>>({
  data,
  columns,
  splitAfter,
  anchorColumnKey,
}: PrintableUsersTableProps<T>) {
  const { firstHeaders, secondHeaders } = useMemo(() => {
    const anchor = columns.find((col) => col.key === anchorColumnKey);
    const first = columns.slice(0, splitAfter + 1);
    const rest = columns.slice(splitAfter + 1);
    const second =
      anchor && !rest.some((col) => col.key === anchorColumnKey)
        ? [anchor, ...rest]
        : rest;
    return { firstHeaders: first, secondHeaders: second };
  }, [columns, splitAfter, anchorColumnKey]);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="hidden print:block space-y-4" data-print-table>
      <style>{PRINT_STYLES}</style>
      <TableProvider<T>
        data={data}
        headers={firstHeaders}
        variant="borderless"
        containerClassName="bg-background rounded-xl p-4 space-y-2"
      />
      {secondHeaders.length > 0 && (
        <TableProvider<T>
          data={data}
          headers={secondHeaders}
          variant="borderless"
          containerClassName="bg-background rounded-xl p-4 space-y-2"
        />
      )}
    </div>
  );
}

export default PrintableUsersTable;
