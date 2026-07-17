import { type HTMLAttributes } from 'react';
import Text from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';
import { bgClassToCssVar } from '../../utils/chartUtils';

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
  /** Height of the bar chart area in pixels */
  chartHeight?: number;
  /** Tailwind bg- color class for the bars (e.g., "bg-info-500") */
  barColor?: string;
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
    className="flex flex-col justify-between items-end pr-3"
    style={{ height: chartHeight }}
    aria-hidden="true"
  >
    {ticks.map((tick, index) => (
      <Text
        key={`${tick}-${index}`}
        size="xs"
        weight="medium"
        className="text-text-500"
      >
        {tick}
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
  item,
  maxValue,
  chartHeight,
  barColor,
}: {
  item: SimpleBarChartDataItem;
  maxValue: number;
  chartHeight: number;
  barColor: string;
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
          {item.label}: {item.value}
        </Text>
      </div>
    ) : null;

  return (
    <Tooltip
      content={tooltipContent ?? ''}
      disabled={!tooltipContent}
      position="top"
      className="flex-1"
      contentClassName="whitespace-normal"
    >
      <div className="flex flex-col items-center gap-2 w-full cursor-pointer group/bar">
        <div
          className="w-full flex flex-col-reverse items-center justify-start relative"
          style={{ height: chartHeight }}
        >
          {barHeight > 0 && (
            <div
              data-testid={`bar-${item.label}`}
              className={cn('w-8 rounded-md', barColor)}
              style={{ height: `${barHeight}px` }}
              aria-label={`${item.label}: ${item.value}`}
            />
          )}
          {item.value > 0 && (
            <div className="absolute inset-0 bg-white/50 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 rounded-md pointer-events-none z-20" />
          )}
        </div>
        <Text
          size="xs"
          weight="medium"
          className="text-text-600 text-center"
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
  chartHeight = 180,
  barColor = 'bg-info-500',
  className,
  ...props
}: SimpleBarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const yAxisTicks = calculateTicks(maxValue);
  const adjustedMax = yAxisTicks[0];

  return (
    <div
      className={cn(
        'flex flex-col p-5 gap-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      aria-label={title}
      {...props}
    >
      <Text
        as="h3"
        size="lg"
        weight="bold"
        className="text-text-950 tracking-[0.2px]"
      >
        {title}
      </Text>
      <div className="flex flex-row">
        <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />
        <div className="w-4" />
        <div className="flex-1 relative">
          <GridLines ticks={yAxisTicks} chartHeight={chartHeight} />
          <div className="flex flex-row flex-1 gap-2 relative z-10">
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
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBarChart;
