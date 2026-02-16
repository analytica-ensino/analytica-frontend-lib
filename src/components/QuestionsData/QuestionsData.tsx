import { HTMLAttributes } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  calculateYAxisTicks,
  LegendItem,
  DataBar,
  GridLines,
  YAxis,
  type BarItemConfig,
} from '../shared/ChartComponents';

/**
 * Data structure for questions statistics.
 * Compatible with useQuestionsData hook output (hook data can be passed directly).
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
 * Color classes for bars and legend dots using design system tokens
 */
const BAR_COLORS = {
  total: 'bg-info-600',
  corretas: 'bg-success-200',
  incorretas: 'bg-warning-400',
  emBranco: 'bg-background-300',
} as const;

/**
 * QuestionsData component - displays a vertical bar chart showing
 * question statistics (total, correct, incorrect, and optionally blank).
 *
 * @example
 * ```tsx
 * // Basic usage with static data
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
 *
 * @example
 * ```tsx
 * // Usage with useQuestionsData hook (direct usage - no transformation needed)
 * const fetchQuestionsData = async (filters) => {
 *   const response = await api.get('/performance/questions-data', { params: filters });
 *   return response.data;
 * };
 *
 * const useQuestionsData = createUseQuestionsData(fetchQuestionsData);
 *
 * function MyComponent() {
 *   const { data, loading, fetchQuestionsData } = useQuestionsData();
 *
 *   useEffect(() => {
 *     fetchQuestionsData({ period: '1_MONTH' });
 *   }, [fetchQuestionsData]);
 *
 *   if (loading || !data) return <Skeleton />;
 *
 *   return <QuestionsData data={data} showEmBranco />;
 * }
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

  // Build accessible chart description
  const blankSuffix =
    showEmBranco && data.emBranco !== undefined
      ? `, ${data.emBranco} em branco`
      : '';
  const chartDescription = `Gráfico de barras mostrando ${data.total} questões respondidas, ${data.corretas} corretas, ${data.incorretas} incorretas${blankSuffix}`;

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
            color={BAR_COLORS[item.key as keyof typeof BAR_COLORS]}
            label={item.legendLabel}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="flex flex-row" aria-label={chartDescription}>
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
