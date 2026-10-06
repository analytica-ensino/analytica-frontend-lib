import { useId, type HTMLAttributes, type ReactNode } from 'react';
import Text from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';
import { bgClassToCssVar, formatAxisTick } from '../../utils/chartUtils';
import { ChartDataTable } from '../shared/ChartDataTable';

/**
 * Data item for SimpleBarChart
 */
export interface SimpleBarChartDataItem {
  label: string;
  value: number;
}

/**
 * Props for the SimpleBarChart component
 */
export interface SimpleBarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart data with labels and values */
  data: SimpleBarChartDataItem[];
  /** Title for the chart card */
  title: string;
  /** A gray line under the title — the total the bars add up to, say. */
  subtitle?: ReactNode;
  /** Height of the bar chart area in pixels */
  chartHeight?: number;
  /** Tailwind bg- color class for the bars (e.g., "bg-info-500") */
  barColor?: string;
  /**
   * O texto do balão, quando "rótulo: valor" não diz o suficiente.
   *
   * O rótulo do eixo é curto por necessidade — cabe um quinto da largura do
   * card —, e o balão é onde a barra pode se explicar por extenso: "2 a 4"
   * no eixo, "Média de 2 a 4: 24.845 estudantes" no balão. Sem isto, o
   * número do balão também sai sem separador de milhar.
   */
  formatTooltip?: (item: SimpleBarChartDataItem) => string;
}

/**
 * Calculate Y-axis tick values for count display.
 * Rounds up to the nearest multiple of 4 so that dividing into 4 equal
 * intervals always produces integer ticks with uniform spacing.
 */
const calculateTicks = (maxValue: number): number[] => {
  if (maxValue <= 0) return [0];

  const niceMax = Math.ceil(maxValue / 4) * 4;
  const step = niceMax / 4;

  return [niceMax, step * 3, step * 2, step, 0];
};

// ─── Sub-components ──────────────────────────────────────────

const YAxis = ({
  ticks,
  chartHeight,
}: {
  ticks: number[];
  chartHeight: number;
}) => (
  <div
    className="flex flex-col justify-between items-end shrink-0 pr-2 sm:pr-3"
    style={{ height: chartHeight }}
    aria-hidden="true"
  >
    {ticks.map((tick, index) => (
      <Text
        key={`${tick}-${index}`}
        size="2xs"
        weight="medium"
        className="text-text-500 whitespace-nowrap sm:text-xs"
      >
        {formatAxisTick(tick)}
      </Text>
    ))}
  </div>
);

const GridLines = ({
  ticks,
  chartHeight,
}: {
  ticks: number[];
  chartHeight: number;
}) => (
  <div
    className="absolute inset-0 flex flex-col justify-between pointer-events-none"
    style={{ height: chartHeight }}
  >
    {ticks.map((tick, index) => (
      <div
        key={`grid-${tick}-${index}`}
        className="w-full border-t border-dashed border-border-200"
      />
    ))}
  </div>
);

const Bar = ({
  formatTooltip,
  item,
  maxValue,
  chartHeight,
  barColor,
}: {
  item: SimpleBarChartDataItem;
  maxValue: number;
  chartHeight: number;
  barColor: string;
  formatTooltip?: (item: SimpleBarChartDataItem) => string;
}) => {
  const barHeight = maxValue === 0 ? 0 : (item.value / maxValue) * chartHeight;

  const tooltipContent =
    item.value > 0 ? (
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: bgClassToCssVar(barColor) }}
        />
        <Text as="span" size="xs" weight="medium" color="text-white">
          {formatTooltip ? formatTooltip(item) : `${item.label}: ${item.value}`}
        </Text>
      </div>
    ) : null;

  return (
    <Tooltip
      content={tooltipContent ?? ''}
      disabled={!tooltipContent}
      position="top"
      className="flex-1 min-w-0"
      // A column of this chart is a fifth of a card wide, and a balloon
      // rendered inside it is bounded by that: "4 a 6: 670" came out broken
      // over three lines. In the portal it is bounded by the viewport, so it
      // keeps the one line the tooltip is styled for.
      usePortal
    >
      <div className="flex flex-col items-center gap-2 w-full min-w-0 cursor-pointer group/bar">
        <div
          className="w-full flex flex-col-reverse items-center justify-start relative"
          style={{ height: chartHeight }}
        >
          {barHeight > 0 && (
            <div
              data-testid={`bar-${item.label}`}
              // Fluid width capped at the original 32px so the bar shrinks with
              // its column on narrow screens instead of spilling over it.
              className={cn('w-full max-w-8 rounded-md', barColor)}
              style={{ height: `${barHeight}px` }}
            />
          )}
          {item.value > 0 && (
            <div className="absolute inset-0 bg-white/50 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 rounded-md pointer-events-none z-20" />
          )}
        </div>
        <Text
          size="2xs"
          weight="medium"
          className="w-full text-text-600 text-center leading-tight break-words sm:text-xs"
          data-testid={`label-${item.label}`}
        >
          {item.label}
        </Text>
      </div>
    </Tooltip>
  );
};

// ─── Main component ──────────────────────────────────────────

/**
 * SimpleBarChart component - displays a simple bar chart (non-stacked, single color)
 *
 * @example
 * ```tsx
 * <SimpleBarChart
 *   data={[
 *     { label: 'SEG', value: 150 },
 *     { label: 'TER', value: 200 },
 *     { label: 'QUA', value: 100 },
 *   ]}
 *   title="Quantidade de acessos por periodo"
 *   barColor="bg-info-500"
 * />
 * ```
 */
export const SimpleBarChart = ({
  data,
  title,
  subtitle,
  chartHeight = 180,
  barColor = 'bg-info-500',
  formatTooltip,
  className,
  ...props
}: SimpleBarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const yAxisTicks = calculateTicks(maxValue);
  const adjustedMax = yAxisTicks[0];
  const tableId = useId();

  return (
    <div
      className={cn(
        'flex flex-col min-w-0 p-5 gap-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <Text
          as="h3"
          size="lg"
          weight="bold"
          className="text-text-950 tracking-[0.2px]"
        >
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text size="sm" className="text-text-600">
            {subtitle}
          </Text>
        )}
      </div>
      {/* As barras são divs sem semântica: o gráfico vira uma imagem nomeada
          pelo título e descrita pela tabela sr-only com os mesmos dados. */}
      <div
        role="img"
        aria-label={title}
        aria-describedby={tableId}
        className="flex flex-row min-w-0"
      >
        <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />
        <div className="w-2 shrink-0 sm:w-4" />
        <div className="flex-1 min-w-0 relative">
          <GridLines ticks={yAxisTicks} chartHeight={chartHeight} />
          <div className="flex flex-row flex-1 gap-1 sm:gap-2 relative z-10">
            {data.map((item, index) => (
              // Equal-width column wrapper: keeps every bucket the same width even
              // when a bar's value is 0 (its Tooltip is disabled and would
              // otherwise drop the flex-1 class, collapsing the column).
              <div
                key={`${item.label}-${index}`}
                className="flex-1 flex min-w-0"
              >
                <Bar
                  item={item}
                  maxValue={adjustedMax}
                  chartHeight={chartHeight}
                  barColor={barColor}
                  formatTooltip={formatTooltip}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ChartDataTable
        id={tableId}
        caption={`Dados do gráfico: ${title}`}
        columns={['Rótulo', 'Valor']}
        rows={data.map((item) => [
          item.label,
          formatTooltip ? formatTooltip(item) : item.value,
        ])}
      />
    </div>
  );
};

export default SimpleBarChart;
