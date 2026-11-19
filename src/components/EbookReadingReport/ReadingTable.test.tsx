import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReadingTable } from './ReadingTable';

type Row = { id: string; name: string };

const COLUMNS = [{ key: 'name', label: 'Escola' }];

describe('ReadingTable', () => {
  beforeEach(() => {
    globalThis.window.history.replaceState({}, '', '/');
  });

  it('asks the API for each search, trimmed, and drops an empty one', async () => {
    const onParamsChange = jest.fn();
    render(
      <ReadingTable<Row>
        tableId="schools"
        title="Desempenho por escola"
        rows={[{ id: '1', name: 'Escola A' }]}
        columns={COLUMNS}
        total={1}
        loading={false}
        itemLabel="escolas"
        searchPlaceholder="Buscar escola"
        rowKey="id"
        onParamsChange={onParamsChange}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar escola'), {
      target: { value: '  lobato ' },
    });

    await waitFor(() =>
      expect(onParamsChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'lobato', page: 1 })
      )
    );
    expect(onParamsChange.mock.calls[0][0].search).toBeUndefined();
  });

  it('opens a row only when the report gives it somewhere to go', () => {
    const onRowClick = jest.fn();
    const { rerender } = render(
      <ReadingTable<Row>
        tableId="schools"
        title="Desempenho por escola"
        rows={[{ id: '1', name: 'Escola A' }]}
        columns={COLUMNS}
        total={1}
        loading={false}
        itemLabel="escolas"
        searchPlaceholder="Buscar escola"
        rowKey="id"
        onParamsChange={jest.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /Ver/ })).toBeNull();

    rerender(
      <ReadingTable<Row>
        tableId="schools"
        title="Desempenho por escola"
        rows={[{ id: '1', name: 'Escola A' }]}
        columns={COLUMNS}
        total={1}
        loading={false}
        itemLabel="escolas"
        searchPlaceholder="Buscar escola"
        rowKey="id"
        onParamsChange={jest.fn()}
        onRowClick={onRowClick}
        rowActionLabel={(row) => `Ver ${row.name}`}
      />
    );
    fireEvent.click(screen.getByText('Escola A'));

    expect(onRowClick).toHaveBeenCalledWith({ id: '1', name: 'Escola A' });
  });
});
