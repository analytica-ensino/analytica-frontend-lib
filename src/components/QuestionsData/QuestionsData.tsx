import { HTMLAttributes } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Data structure for questions statistics
 */
export interface QuestionsDataItem {
  /** Total number of questions answered */
  total: number;
  /** Number of correct answers */
  corretas: number;
  /** Number of incorrect answers */
  incorretas: number;
  /** Number of blank (unanswered) questions */
  emBranco?: number;
}

/**
 * Props for the QuestionsData component
 */
export interface QuestionsDataProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Question statistics data */
  data: QuestionsDataItem;
  /** Whether to show blank questions bar */
  showEmBranco?: boolean;
  /** Maximum value for the chart scale (defaults to total) */
  maxValue?: number;
  /** Height of the chart area in pixels */
  chartHeight?: number;
}

/**
 * Bar item configuration
 */
interface BarItemConfig {
  key: string;
  label: string;
  legendLabel: string;
  value: number;
  colorClass: string;
}

/**
 * Color classes for each bar type using design system tokens
 */
const BAR_COLORS = {
  total: 'bg-info-600',
  corretas: 'bg-success-200',
  incorretas: 'bg-warning-400',
  emBranco: 'bg-background-300',
} as const;

/**
 * Legend dot colors
 */
const LEGEND_DOT_COLORS = {
  total: 'bg-info-600',
  corretas: 'bg-success-200',
  incorretas: 'bg-warning-400',
  emBranco: 'bg-background-300',
} as const;

/**
 * Calculate Y-axis tick values based on max value
 */
const calculateYAxisTicks = (maxValue: number): number[] => {
  if (maxValue <= 0) return [0];

  // Round up to nearest "nice" number for the max tick
  const niceMax = Math.ceil(maxValue / 10) * 10;

  // Generate 5 ticks including 0 and max
  const step = niceMax / 4;
  return [niceMax, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
};

/**
 * Legend item component
 */
const LegendItem = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <div className="flex flex-row items-center gap-2">
    <div className={cn('w-2 h-2 rounded-full', color)} />
    <Text size="xs" weight="medium" className="text-text-600">
      {label}
    </Text>
  </div>
);

/**
 * Individual vertical bar component
 */
const DataBar = ({
  label,
  value,
  maxValue,
  colorClass,
  chartHeight,
}: {
  label: string;
  value: number;
  maxValue: number;
  colorClass: string;
  chartHeight: number;
}) => {
  const percentage = maxValue === 0 ? 0 : (value / maxValue) * 100;
  const barHeight = (percentage / 100) * chartHeight;

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* Bar container */}
      <div
        className="w-full flex items-end justify-center"
        style={{ height: chartHeight }}
      >
        <div
          className={cn('w-16 rounded-lg transition-all duration-300', colorClass)}
          style={{ height: `${barHeight}px` }}
        />
      </div>

      {/* Label */}
      <Text size="xs" weight="medium" className="text-text-600 text-center">
        {label}
      </Text>
    </div>
  );
};

/**
 * Grid lines component for the chart background
 */
const GridLines = ({
  ticks,
  chartHeight,
}: {
  ticks: number[];
  chartHeight: number;
}) => {
  const lineCount = ticks.length;
  const spacing = chartHeight / (lineCount - 1);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between pointer-events-none"
      style={{ height: chartHeight }}
    >
      {ticks.map((tick, index) => (
        <div
          key={tick}
          className="w-full border-t border-dashed border-border-200"
          style={{ marginTop: index === 0 ? 0 : undefined }}
        />
      ))}
    </div>
  );
};

/**
 * Y-Axis component
 */
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
  >
    {ticks.map((tick) => (
      <Text key={tick} size="xs" weight="medium" className="text-text-500">
        {tick}
      </Text>
    ))}
  </div>
);

/**
 * QuestionsData component - displays a vertical bar chart showing
 * question statistics (total, correct, incorrect, and optionally blank).
 *
 * @example
 * ```tsx
 * <QuestionsData
 *   title="Dados de questões"
 *   data={{
 *     total: 120,
 *     corretas: 80,
 *     incorretas: 30,
 *     emBranco: 10,
 *   }}
 *   showEmBranco
 * />
 * ```
 */
export const QuestionsData = ({
  title = 'Dados de questões',
  data,
  showEmBranco = false,
  maxValue,
  chartHeight = 180,
  className,
  ...props
}: QuestionsDataProps) => {
  // Calculate the maximum value for the scale
  const chartMaxValue = maxValue ?? data.total;

  // Calculate Y-axis ticks
  const yAxisTicks = calculateYAxisTicks(chartMaxValue);
  const adjustedMaxValue = yAxisTicks[0]; // Use the nice max for calculations

  // Build bar items configuration
  const barItems: BarItemConfig[] = [
    {
      key: 'total',
      label: 'Total',
      legendLabel: 'Total de questões respondidas',
      value: data.total,
      colorClass: BAR_COLORS.total,
    },
    {
      key: 'corretas',
      label: 'Corretas',
      legendLabel: 'Questões corretas',
      value: data.corretas,
      colorClass: BAR_COLORS.corretas,
    },
    {
      key: 'incorretas',
      label: 'Incorretas',
      legendLabel: 'Questões incorretas',
      value: data.incorretas,
      colorClass: BAR_COLORS.incorretas,
    },
  ];

  // Add blank questions bar if enabled
  if (showEmBranco && data.emBranco !== undefined) {
    barItems.push({
      key: 'emBranco',
      label: 'Em branco',
      legendLabel: 'Questões em branco',
      value: data.emBranco,
      colorClass: BAR_COLORS.emBranco,
    });
  }

  return (
    <div
      className={cn(
        'flex flex-col p-5 gap-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      {...props}
    >
      {/* Header */}
      <Text
        as="h3"
        size="lg"
        weight="bold"
        className="text-text-950 tracking-[0.2px]"
      >
        {title}
      </Text>

      {/* Legend */}
      <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 mb-4">
        {barItems.map((item) => (
          <LegendItem
            key={item.key}
            color={LEGEND_DOT_COLORS[item.key as keyof typeof LEGEND_DOT_COLORS]}
            label={item.legendLabel}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="flex flex-row">
        {/* Y-Axis */}
        <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />

        {/* Spacer between Y-axis and chart */}
        <div className="w-4" />

        {/* Chart area with grid and bars */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <GridLines ticks={yAxisTicks} chartHeight={chartHeight} />

          {/* Bars */}
          <div className="flex flex-row flex-1 gap-4 relative z-10">
            {barItems.map((item) => (
              <DataBar
                key={item.key}
                label={item.label}
                value={item.value}
                maxValue={adjustedMaxValue}
                colorClass={item.colorClass}
                chartHeight={chartHeight}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsData;
