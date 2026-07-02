import { useState, useMemo, type HTMLAttributes } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { calculateTicks } from './utils';

/**
 * Data item for VerticalBarChart
 */
export interface VerticalBarChartDataItem {
  label: string;
  value: number;
}

/**
 * Props for the VerticalBarChart component
 */
export interface VerticalBarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart data with labels and values */
  data: VerticalBarChartDataItem[];
  /** Title for the chart card */
  title: string;
  /** Height of the bar chart area in pixels */
  chartHeight?: number;
  /** Color for the bars (hex, rgb, or CSS color) */
  barColor?: string;
}

// --- Sub-components ---

const YAxis = ({
  ticks,
  chartHeight,
}: {
  ticks: number[];
  chartHeight: number;
}) => (
  <div
    // w-12 (48px) matches ml-12 on XAxisLabels for alignment
    className="flex flex-col justify-between text-right pr-2 w-12 shrink-0"
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
        {tick.toLocaleString('pt-BR')}
      </Text>
    ))}
  </div>
);

const Bar = ({
  item,
  maxValue,
  chartHeight,
  barColor,
  isHovered,
  anyHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  item: VerticalBarChartDataItem;
  maxValue: number;
  chartHeight: number;
  barColor: string;
  isHovered: boolean;
  anyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const barHeight = maxValue === 0 ? 0 : (item.value / maxValue) * chartHeight;

  return (
    <div
      className="flex-1 flex flex-col items-center justify-end h-full relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tooltip */}
      {isHovered && item.value > 0 && (
        <div className="absolute bottom-full mb-2 px-2 py-1 bg-text-950 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
          {item.value.toLocaleString('pt-BR')}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-950" />
        </div>
      )}
      <div
        data-testid={`bar-${item.label}`}
        className="w-full max-w-[40px] rounded-t transition-all duration-300 cursor-pointer"
        style={{
          height: `${(barHeight / chartHeight) * 100}%`,
          backgroundColor: barColor,
          minHeight: item.value > 0 ? '4px' : '0',
          opacity: !anyHovered || isHovered ? 1 : 0.5,
        }}
        aria-label={`${item.label}: ${item.value}`}
      />
    </div>
  );
};

const XAxisLabels = ({ data }: { data: VerticalBarChartDataItem[] }) => (
  // ml-12 (48px) matches w-12 on YAxis for alignment
  <div className="flex gap-1 ml-12">
    {data.map((item) => (
      <div key={item.label} className="flex-1 text-center">
        <Text
          size="xs"
          className="text-text-500"
          data-testid={`label-${item.label}`}
        >
          {item.label}
        </Text>
      </div>
    ))}
  </div>
);

// --- Main component ---

/**
 * VerticalBarChart component - displays a vertical bar chart with bars going upward.
 *
 * @example
 * ```tsx
 * <VerticalBarChart
 *   data={[
 *     { label: 'SEG', value: 150 },
 *     { label: 'TER', value: 200 },
 *     { label: 'QUA', value: 100 },
 *   ]}
 *   title="Atividades por período"
 *   barColor="#4a7c59"
 * />
 * ```
 */
export const VerticalBarChart = ({
  data,
  title,
  chartHeight = 200,
  barColor = '#4a7c59',
  className,
  ...props
}: VerticalBarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const yAxisTicks = useMemo(() => calculateTicks(maxValue), [maxValue]);
  const chartMaxValue = yAxisTicks[0] || maxValue || 1;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 bg-background border border-border-50 rounded-xl p-5',
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
      <div className="flex gap-2">
        <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />
        <div
          className="flex-1 flex items-end gap-1 border-l border-b border-border-100"
          style={{ height: chartHeight }}
        >
          {data.map((item, index) => (
            <Bar
              key={`${item.label}-${index}`}
              item={item}
              maxValue={chartMaxValue}
              chartHeight={chartHeight}
              barColor={barColor}
              isHovered={hoveredIndex === index}
              anyHovered={hoveredIndex !== null}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
      <XAxisLabels data={data} />
    </div>
  );
};

export default VerticalBarChart;
