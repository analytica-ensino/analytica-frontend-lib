import { render, screen, within } from '@testing-library/react';
import { ChartDataTable } from './ChartDataTable';

describe('ChartDataTable', () => {
  it('renders a visually hidden table with caption, headers and rows', () => {
    render(
      <ChartDataTable
        id="chart-table"
        caption="Acessos por dia"
        columns={['Dia', 'Acessos']}
        rows={[
          ['SEG', 1500],
          ['TER', '20%'],
        ]}
      />
    );

    const table = screen.getByRole('table', { name: 'Acessos por dia' });
    expect(table).toHaveAttribute('id', 'chart-table');
    expect(table).toHaveClass('sr-only');

    expect(
      within(table).getByRole('columnheader', { name: 'Dia' })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'Acessos' })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('rowheader', { name: 'SEG' })
    ).toBeInTheDocument();
    // Numbers use pt-BR formatting
    expect(within(table).getByRole('cell', { name: '1.500' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: '20%' })).toBeTruthy();
  });

  it('falls back to the index as key when a row has more cells than columns', () => {
    render(
      <ChartDataTable id="t" caption="C" columns={['A']} rows={[['x', 1, 2]]} />
    );
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });
});
