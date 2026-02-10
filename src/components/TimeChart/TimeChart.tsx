import { useState, type HTMLAttributes, type ReactNode } from 'react';
import Text from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';
import { PROFILE_ROLES } from '../../types/chat';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';

/**
 * Keys for TimeChart categories, matching the API field names.
 */
export enum TIME_CHART_CATEGORY_KEY {
  ACTIVITIES = 'activities',
  CONTENT = 'content',
  SIMULATIONS = 'simulations',
  QUESTIONNAIRES = 'questionnaires',
  RECOMMENDED_LESSONS = 'recommendedLessons',
}

/**
 * A single category of time data (e.g., "Atividades", "Conteúdo")
 */
export interface TimeChartCategory {
  /** Unique key matching the API field name */
  key: TIME_CHART_CATEGORY_KEY;
  /** Display label for legends */
  label: string;
  /** Tailwind bg- color class (e.g., "bg-success-700") */
  colorClass: string;
}

/**
 * A single period entry from the API hoursByPeriod array.
 * Can be passed directly from the API response.
 * The `label` field is the period label, other fields are hours by category key.
 */
export interface TimeChartDayData {
  label: string;
  [key: string]: string | number;
}

/**
 * Complete data for the TimeChart component
 */
export interface TimeChartData {
  /** Category definitions (determines colors and legend) */
  categories: TimeChartCategory[];
  /** Per-period breakdown for the stacked bar chart (API hoursByPeriod) */
  hoursByPeriod: TimeChartDayData[];
  /** Percentages for pie chart by category key (API hoursByItem, 0-100).
   *  When provided, pie chart uses these. Otherwise computes from hoursByPeriod totals. */
  hoursByItem?: Record<string, number>;
}

/**
 * Props for the TimeChart component
 */
export interface TimeChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart data including categories and period breakdown */
  data: TimeChartData;
  /** Title for the bar chart card */
  barChartTitle?: string;
  /** Title for the pie chart card */
  pieChartTitle?: string;
  /** Height of the bar chart area in pixels */
  chartHeight?: number;
  /** SVG pie chart diameter in pixels */
  pieSize?: number;
}

/**
 * Predefined category configs for student profile
 */
export const STUDENT_CATEGORIES: TimeChartCategory[] = [
  {
    key: TIME_CHART_CATEGORY_KEY.ACTIVITIES,
    label: 'Atividades',
    colorClass: 'bg-success-700',
  },
  {
    key: TIME_CHART_CATEGORY_KEY.CONTENT,
    label: 'Conteúdo',
    colorClass: 'bg-success-300',
  },
  {
    key: TIME_CHART_CATEGORY_KEY.SIMULATIONS,
    label: 'Simulados',
    colorClass: 'bg-warning-300',
  },
  {
    key: TIME_CHART_CATEGORY_KEY.QUESTIONNAIRES,
    label: 'Questionários',
    colorClass: 'bg-indicator-positive',
  },
];

/**
 * Predefined category configs for other profiles (teacher, manager)
 */
export const DEFAULT_CATEGORIES: TimeChartCategory[] = [
  {
    key: TIME_CHART_CATEGORY_KEY.ACTIVITIES,
    label: 'Atividades',
    colorClass: 'bg-success-700',
  },
  {
    key: TIME_CHART_CATEGORY_KEY.RECOMMENDED_LESSONS,
    label: 'Aulas recomendadas',
    colorClass: 'bg-indicator-positive',
  },
];

// ─── API Types ───────────────────────────────────────────────

/**
 * Request body for POST /access-report/access/chart
 */
export interface TimeChartRequest {
  period: StudentsHighlightPeriod;
  targetProfile: PROFILE_ROLES;
  schoolGroupIds?: string[];
  schoolIds?: string[];
  allSchoolGroupsSelected?: boolean;
  allSchoolsSelected?: boolean;
}

/**
 * A single period entry for student profile response
 */
export interface TimeChartStudentPeriodItem {
  label: string;
  activities: number;
  content: number;
  simulations: number;
  questionnaires: number;
}

/**
 * Hours by item breakdown for student profile (percentages 0-100)
 */
export interface TimeChartStudentItemBreakdown {
  activities: number;
  content: number;
  simulations: number;
  questionnaires: number;
}

/**
 * API response data for student profile
 */
export interface TimeChartStudentData {
  labels: string[];
  hoursByPeriod: TimeChartStudentPeriodItem[];
  hoursByItem: TimeChartStudentItemBreakdown;
}

/**
 * A single period entry for non-student profile response
 */
export interface TimeChartDefaultPeriodItem {
  label: string;
  activities: number;
  recommendedLessons: number;
}

/**
 * Hours by item breakdown for non-student profiles (percentages 0-100)
 */
export interface TimeChartDefaultItemBreakdown {
  activities: number;
  recommendedLessons: number;
}

/**
 * API response data for non-student profiles
 */
export interface TimeChartDefaultData {
  labels: string[];
  hoursByPeriod: TimeChartDefaultPeriodItem[];
  hoursByItem: TimeChartDefaultItemBreakdown;
}

/**
 * Full API response wrapper
 */
export interface TimeChartResponse<
  T extends TimeChartStudentData | TimeChartDefaultData,
> {
  message: string;
  data: T;
}

// ─── Utilities ───────────────────────────────────────────────

/**
 * Extracts CSS variable from a Tailwind bg- class for SVG fill/stroke usage.
 * E.g., "bg-success-800" -> "var(--color-success-800)"
 */
export const bgClassToCssVar = (bgClass: string): string => {
  const colorToken = bgClass.replace('bg-', '');
  return `var(--color-${colorToken})`;
};

/**
 * Calculate Y-axis tick values formatted for hours display.
 * Rounds up to the nearest multiple of 3 for clean labels (3h, 6h, 9h, 12h).
 */
export const calculateHourTicks = (maxHours: number): number[] => {
  if (maxHours <= 0) return [0];

  const niceMax = Math.ceil(maxHours / 3) * 3;
  const step = niceMax / 4;

  const ticks = [
    niceMax,
    Math.round(step * 3),
    Math.round(step * 2),
    Math.round(step),
    0,
  ];

  return [...new Set(ticks)];
};

/**
 * Safely reads a numeric value from a day data entry by category key
 */
const getDayValue = (day: TimeChartDayData, key: string): number =>
  Number(day[key]) || 0;

/**
 * Converts polar coordinates to cartesian for SVG path calculations
 */
const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

/**
 * Generates an SVG arc path for a pie slice
 */
const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
};

// ─── Sub-components ──────────────────────────────────────────

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex flex-row items-center gap-2">
    <div className={cn('w-2 h-2 rounded-full', color)} />
    <Text size="xs" weight="medium" className="text-text-600">
      {label}
    </Text>
  </div>
);

const ChartCard = ({
  title,
  categories,
  children,
  className,
  ...props
}: {
  title: string;
  categories: TimeChartCategory[];
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col p-5 gap-4 bg-background border border-border-50 rounded-xl',
      className
    )}
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
    <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
      {categories.map((cat) => (
        <LegendItem key={cat.key} color={cat.colorClass} label={cat.label} />
      ))}
    </div>
    {children}
  </div>
);

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
        {tick === 0 ? '0' : `${tick}h`}
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

const StackedBar = ({
  day,
  categories,
  maxValue,
  chartHeight,
}: {
  day: TimeChartDayData;
  categories: TimeChartCategory[];
  maxValue: number;
  chartHeight: number;
}) => {
  const nonZeroCategories = categories.filter(
    (cat) => getDayValue(day, cat.key) > 0
  );

  const tooltipContent =
    nonZeroCategories.length > 0 ? (
      <div className="flex flex-col gap-1">
        {nonZeroCategories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: bgClassToCssVar(cat.colorClass) }}
            />
            <span className="text-xs font-medium">
              {cat.label}: {getDayValue(day, cat.key)}h
            </span>
          </div>
        ))}
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
          {categories.map((cat) => {
            const value = getDayValue(day, cat.key);
            const segmentHeight =
              maxValue === 0 ? 0 : (value / maxValue) * chartHeight;
            if (segmentHeight === 0) return null;

            const isFirst = cat === nonZeroCategories[0];
            const isLast = cat === nonZeroCategories.at(-1);

            return (
              <div
                key={cat.key}
                data-testid={`bar-segment-${day.label}-${cat.key}`}
                className={cn(
                  'w-8',
                  cat.colorClass,
                  isFirst && 'rounded-b-md',
                  isLast && 'rounded-t-md',
                  isFirst && isLast && 'rounded-md'
                )}
                style={{ height: `${segmentHeight}px` }}
                aria-label={`${cat.label}: ${value}h`}
              />
            );
          })}
          {nonZeroCategories.length > 0 && (
            <div className="absolute inset-0 bg-white/50 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 rounded-md pointer-events-none z-20" />
          )}
        </div>
        <Text
          size="xs"
          weight="medium"
          className="text-text-600 text-center"
          data-testid={`day-label-${day.label}`}
        >
          {day.label}
        </Text>
      </div>
    </Tooltip>
  );
};

const PieChart = ({
  categories,
  totals,
  size,
}: {
  categories: TimeChartCategory[];
  totals: Record<string, number>;
  size: number;
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const grandTotal = categories.reduce((sum, cat) => sum + totals[cat.key], 0);

  if (grandTotal === 0) {
    const radius = size * 0.4;
    const center = size / 2;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        data-testid="pie-chart"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-background-300"
        />
      </svg>
    );
  }

  const radius = size * 0.4;
  const center = size / 2;
  let cumulativeAngle = 0;

  const slices = categories
    .map((cat) => {
      const value = totals[cat.key];
      const percentage = (value / grandTotal) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      const midAngle = startAngle + angle / 2;

      cumulativeAngle = endAngle;

      return { cat, percentage, startAngle, endAngle, midAngle };
    })
    .filter((s) => s.percentage > 0);

  const hoveredData = hoveredSlice
    ? slices.find((s) => s.cat.key === hoveredSlice)
    : null;

  const tooltipPos = hoveredData
    ? polarToCartesian(center, center, radius * 0.6, hoveredData.midAngle)
    : { x: 0, y: 0 };

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        data-testid="pie-chart"
        onMouseLeave={() => setHoveredSlice(null)}
      >
        {slices.map((slice) => {
          const path =
            slice.percentage >= 99.99
              ? undefined
              : describeArc(
                  center,
                  center,
                  radius,
                  slice.startAngle,
                  slice.endAngle
                );

          const labelPos = polarToCartesian(
            center,
            center,
            radius * 0.6,
            slice.midAngle
          );

          return (
            <g
              key={slice.cat.key}
              data-testid={`pie-slice-${slice.cat.key}`}
              onMouseEnter={() => setHoveredSlice(slice.cat.key)}
              className="cursor-pointer"
            >
              {slice.percentage >= 99.99 ? (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  style={{ fill: bgClassToCssVar(slice.cat.colorClass) }}
                />
              ) : (
                <path
                  d={path}
                  style={{ fill: bgClassToCssVar(slice.cat.colorClass) }}
                />
              )}
              {hoveredSlice === slice.cat.key &&
                (slice.percentage >= 99.99 ? (
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="white"
                    opacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <path
                    d={path}
                    fill="white"
                    opacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                ))}
              {slice.percentage >= 5 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-xs font-bold"
                  style={{ fontSize: '12px', pointerEvents: 'none' }}
                >
                  {`${Math.round(slice.percentage)}%`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hoveredData && (
        <div
          className="absolute bg-background-900 text-white px-4 py-2 rounded-lg shadow-[0px_3px_10px_0px_rgba(38,38,38,0.2)] pointer-events-none z-10"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, calc(-100% - 8px))',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: bgClassToCssVar(hoveredData.cat.colorClass),
              }}
            />
            <span className="text-xs font-bold whitespace-nowrap">
              {hoveredData.cat.label}: {Math.round(hoveredData.percentage)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────

/**
 * TimeChart component - displays time data as a stacked bar chart (hours per period)
 * and a pie chart (hours by category) side by side.
 *
 * Data can be passed directly from the API response without transformation:
 *
 * @example
 * ```tsx
 * // Student profile - pass API data directly
 * <TimeChart
 *   data={{
 *     categories: STUDENT_CATEGORIES,
 *     hoursByPeriod: apiResponse.data.hoursByPeriod,
 *     hoursByItem: apiResponse.data.hoursByItem,
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Teacher/Manager profile
 * <TimeChart
 *   data={{
 *     categories: DEFAULT_CATEGORIES,
 *     hoursByPeriod: apiResponse.data.hoursByPeriod,
 *     hoursByItem: apiResponse.data.hoursByItem,
 *   }}
 * />
 * ```
 */
export const TimeChart = ({
  data,
  barChartTitle = 'Dados de horas por semana',
  pieChartTitle = 'Dados de horas por item',
  chartHeight = 180,
  pieSize = 200,
  className,
  ...props
}: TimeChartProps) => {
  const { categories, hoursByPeriod, hoursByItem } = data;

  // Calculate max stacked value across all periods for Y-axis scale
  const periodTotals = hoursByPeriod.map((day) =>
    categories.reduce((sum, cat) => sum + getDayValue(day, cat.key), 0)
  );
  const maxPeriodTotal = Math.max(...periodTotals, 0);
  const yAxisTicks = calculateHourTicks(maxPeriodTotal);
  const adjustedMax = yAxisTicks[0];

  // Use pre-calculated percentages from API hoursByItem or compute from period totals
  const categoryTotals: Record<string, number> = {};
  if (hoursByItem) {
    for (const cat of categories) {
      categoryTotals[cat.key] = hoursByItem[cat.key] ?? 0;
    }
  } else {
    for (const cat of categories) {
      categoryTotals[cat.key] = hoursByPeriod.reduce(
        (sum, day) => sum + getDayValue(day, cat.key),
        0
      );
    }
  }

  return (
    <div
      className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4', className)}
      aria-label="Gráficos de dados de horas por semana e por categoria"
      {...props}
    >
      {/* Stacked Bar Chart */}
      <ChartCard title={barChartTitle} categories={categories}>
        <div className="flex flex-row">
          <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />
          <div className="w-4" />
          <div className="flex-1 relative">
            <GridLines ticks={yAxisTicks} chartHeight={chartHeight} />
            <div className="flex flex-row flex-1 gap-2 relative z-10">
              {hoursByPeriod.map((day, index) => (
                <StackedBar
                  key={`${day.label}-${index}`}
                  day={day}
                  categories={categories}
                  maxValue={adjustedMax}
                  chartHeight={chartHeight}
                />
              ))}
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Pie Chart */}
      <ChartCard title={pieChartTitle} categories={categories}>
        <div className="flex items-center justify-center py-4">
          <PieChart
            categories={categories}
            totals={categoryTotals}
            size={pieSize}
          />
        </div>
      </ChartCard>
    </div>
  );
};

export default TimeChart;
