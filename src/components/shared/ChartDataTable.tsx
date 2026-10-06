/**
 * A single cell value of the accessible data table.
 * Numbers are formatted with the pt-BR locale.
 */
export type ChartDataTableCell = string | number;

/**
 * Props for the ChartDataTable component
 */
export interface ChartDataTableProps {
  /** Id referenced by the chart's `aria-describedby` */
  id: string;
  /** Table caption (usually the chart title) */
  caption: string;
  /** Column headers; the first one names the row header column */
  columns: readonly string[];
  /** Rows of cells; the first cell of each row is rendered as the row header */
  rows: ReadonlyArray<ReadonlyArray<ChartDataTableCell>>;
}

/**
 * Formats a cell value for display, using the pt-BR locale for numbers.
 *
 * @param value - Cell value
 * @returns The formatted text
 */
const formatCell = (value: ChartDataTableCell): string =>
  typeof value === 'number' ? value.toLocaleString('pt-BR') : value;

/**
 * ChartDataTable - visually hidden data table that exposes a chart's data
 * to assistive technologies.
 *
 * Gráficos são desenhados com divs/SVG e não têm semântica: o leitor de tela
 * só "vê" a imagem. Esta tabela `sr-only` entrega os mesmos dados de forma
 * navegável (célula a célula), sem nenhuma mudança visual. O container do
 * gráfico usa `role="img"` + `aria-describedby` apontando para o `id` daqui.
 *
 * @example
 * ```tsx
 * <ChartDataTable
 *   id={tableId}
 *   caption="Acessos por dia"
 *   columns={['Dia', 'Acessos']}
 *   rows={[['SEG', 150], ['TER', 200]]}
 * />
 * ```
 */
export const ChartDataTable = ({
  id,
  caption,
  columns,
  rows,
}: ChartDataTableProps) => (
  <table className="sr-only" id={id}>
    <caption>{caption}</caption>
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} scope="col">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, rowIndex) => (
        <tr key={`${String(row[0])}-${rowIndex}`}>
          {row.map((cell, cellIndex) =>
            cellIndex === 0 ? (
              <th key="row-header" scope="row">
                {formatCell(cell)}
              </th>
            ) : (
              <td key={columns[cellIndex] ?? cellIndex}>{formatCell(cell)}</td>
            )
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

export default ChartDataTable;
