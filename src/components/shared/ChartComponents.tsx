import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Bar item configuration used by chart components
 */
export interface BarItemConfig {
  key: string;
  label: string;
  legendLabel: string;
  value: number;
  colorClass: string;
}

/**
 * Calculate Y-axis tick values based on max value.
 * Rounds up to the nearest multiple of 10 and generates 5 evenly spaced ticks.
 */
export const calculateYAxisTicks = (maxValue: number): number[] => {
  if (maxValue <= 0) return [0];

  const niceMax = Math.ceil(maxValue / 10) * 10;
  const step = niceMax / 4;
  return [
    niceMax,
    Math.round(step * 3),
    Math.round(step * 2),
    Math.round(step),
    0,
  ];
};

/**
 * Legend dot + label for chart legends
 */
export const LegendItem = ({
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
export const DataBar = ({
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
      <div
        className="w-full flex items-end justify-center"
        style={{ height: chartHeight }}
      >
        <div
          className={cn(
            'w-16 rounded-lg transition-all duration-300',
            colorClass
          )}
          style={{ height: `${barHeight}px` }}
        />
      </div>
      <Text size="xs" weight="medium" className="text-text-600 text-center">
        {label}
      </Text>
    </div>
  );
};

/**
 * Horizontal dashed grid lines for chart background
 */
export const GridLines = ({
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
        key={`${tick}-${index}`}
        className="w-full border-t border-dashed border-border-200"
        style={{ marginTop: index === 0 ? 0 : undefined }}
      />
    ))}
  </div>
);

/**
 * Y-Axis tick labels
 */
export const YAxis = ({
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
