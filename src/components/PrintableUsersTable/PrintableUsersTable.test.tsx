import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrintableUsersTable from './PrintableUsersTable';
import type { ColumnConfig } from '../TableProvider/TableProvider';

/**
 * Mock TableProvider to keep tests focused on the split/render logic of
 * PrintableUsersTable and avoid pulling in the full table implementation.
 */
jest.mock('../TableProvider/TableProvider', () => {
  const MockTableProvider = ({
    headers,
    data,
  }: {
    headers: Array<{ key: string; label: string }>;
    data: Array<Record<string, unknown>>;
  }) => (
    <div data-testid="table-provider">
      <div data-testid="table-headers">
        {headers.map((h) => h.key).join(',')}
      </div>
      <div data-testid="table-row-count">{data.length}</div>
    </div>
  );
  MockTableProvider.displayName = 'MockTableProvider';
  return {
    __esModule: true,
    default: MockTableProvider,
  };
});

interface Row extends Record<string, unknown> {
  name: string;
  score: number;
  city: string;
  state: string;
  total: number;
}

const columns: ColumnConfig<Row>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'score', label: 'Nota' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'total', label: 'Total' },
];

const data: Row[] = [
  { name: 'Ana', score: 8, city: 'Curitiba', state: 'PR', total: 80 },
  { name: 'Bruno', score: 6, city: 'Londrina', state: 'PR', total: 60 },
];

describe('PrintableUsersTable', () => {
  /**
   * Verifies the happy path: splits columns at the given index and repeats
   * the anchor column as the first header of the second table.
   */
  it('should split columns at splitAfter and prepend anchor column to second table', () => {
    render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={1}
        anchorColumnKey="name"
      />
    );

    const tables = screen.getAllByTestId('table-provider');
    expect(tables).toHaveLength(2);

    const headers = screen.getAllByTestId('table-headers');
    expect(headers[0].textContent).toBe('name,score');
    expect(headers[1].textContent).toBe('name,city,state,total');

    const rowCounts = screen.getAllByTestId('table-row-count');
    expect(rowCounts[0].textContent).toBe('2');
    expect(rowCounts[1].textContent).toBe('2');
  });

  /**
   * Verifies that the anchor column is NOT duplicated when it already
   * appears in the second half by virtue of the split index.
   */
  it('should not duplicate anchor column when second half already contains it', () => {
    const columnsWithAnchorInSecondHalf: ColumnConfig<Row>[] = [
      { key: 'score', label: 'Nota' },
      { key: 'city', label: 'Cidade' },
      { key: 'name', label: 'Nome' },
      { key: 'total', label: 'Total' },
    ];

    render(
      <PrintableUsersTable
        data={data}
        columns={columnsWithAnchorInSecondHalf}
        splitAfter={1}
        anchorColumnKey="name"
      />
    );

    const headers = screen.getAllByTestId('table-headers');
    expect(headers[0].textContent).toBe('score,city');
    expect(headers[1].textContent).toBe('name,total');
  });

  /**
   * Verifies the clamp behavior when splitAfter is negative: must behave as
   * if splitAfter were 0 (first table has only the first column).
   */
  it('should clamp negative splitAfter to 0', () => {
    render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={-5}
        anchorColumnKey="name"
      />
    );

    const headers = screen.getAllByTestId('table-headers');
    expect(headers[0].textContent).toBe('name');
    // rest = [score, city, state, total]; anchor "name" not in rest, so prepend
    expect(headers[1].textContent).toBe('name,score,city,state,total');
  });

  /**
   * Verifies the clamp behavior when splitAfter is larger than the number of
   * columns: first table includes all columns, second table is not rendered
   * (rest.length === 0).
   */
  it('should clamp out-of-range splitAfter and skip empty second table', () => {
    render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={999}
        anchorColumnKey="name"
      />
    );

    const tables = screen.getAllByTestId('table-provider');
    expect(tables).toHaveLength(1);
    const headers = screen.getAllByTestId('table-headers');
    expect(headers[0].textContent).toBe('name,score,city,state,total');
  });

  /**
   * Verifies that when splitAfter lands exactly at the last column, the
   * component renders a single table and does NOT render an anchor-only
   * second table (the rest.length === 0 guard).
   */
  it('should not render anchor-only second table when rest is empty', () => {
    render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={columns.length - 1}
        anchorColumnKey="name"
      />
    );

    const tables = screen.getAllByTestId('table-provider');
    expect(tables).toHaveLength(1);
  });

  /**
   * Verifies that passing an empty columns array returns null (renders
   * nothing), since splitting nothing is a no-op.
   */
  it('should render nothing when columns is empty', () => {
    const { container } = render(
      <PrintableUsersTable
        data={data}
        columns={[]}
        splitAfter={0}
        anchorColumnKey="name"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('table-provider')).not.toBeInTheDocument();
  });

  /**
   * Verifies that a missing anchor key in the columns list does not crash
   * and simply falls back to the raw rest slice for the second table.
   */
  it('should fall back to raw rest when anchor key is not found', () => {
    render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={1}
        anchorColumnKey="doesNotExist"
      />
    );

    const headers = screen.getAllByTestId('table-headers');
    expect(headers[0].textContent).toBe('name,score');
    expect(headers[1].textContent).toBe('city,state,total');
  });

  /**
   * Verifies that the component applies the data-print-table attribute on
   * its root container — this attribute powers the @media print rules.
   */
  it('should set data-print-table attribute on root container', () => {
    const { container } = render(
      <PrintableUsersTable
        data={data}
        columns={columns}
        splitAfter={1}
        anchorColumnKey="name"
      />
    );

    const root = container.querySelector('[data-print-table]');
    expect(root).toBeInTheDocument();
  });
});
