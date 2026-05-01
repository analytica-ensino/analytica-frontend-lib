import { useState } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  bgClassToCssVar,
  polarToCartesian,
  describeArc,
} from '../../utils/chartUtils';

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

// ─── Pie chart ────────────────────────────────────────────────

/**
 * A single slice of a pie chart.
 * Provide either `colorClass` (Tailwind bg-* class) or `color` (direct CSS value).
 * When `color` is set it takes precedence over `colorClass`.
 */
export interface PieSlice {
  /** Unique key for the slice (uses label if not provided) */
  key?: string;
  label: string;
  value: number;
  colorClass: string;
  /** Direct CSS color value — takes precedence over colorClass when provided */
  color?: string;
}

/** Default radius ratio (44% of size) */
const PIE_RADIUS_RATIO = 0.44;

/** Default label radius ratio (62% from center) */
const PIE_LABEL_RADIUS_RATIO = 0.62;

/** Default minimum percentage to show label */
const PIE_MIN_PERCENTAGE_FOR_LABEL = 5;

/** Threshold to consider a slice as whole pie */
const PIE_WHOLE_THRESHOLD = 99.99;

/**
 * Props for SimplePieChart component
 */
export interface SimplePieChartProps {
  /** Array of slices to render */
  slices: PieSlice[];
  /** Chart size in pixels (default: 130) */
  size?: number;
  /** Text to show when all values are zero */
  emptyText?: string;
  /** Minimum percentage to display label inside slice (default: 5) */
  minPercentageForLabel?: number;
  /** Label position as ratio of radius (default: 0.62) */
  labelRadiusRatio?: number;
  /** Label text color (default: var(--color-text-950)) */
  labelColor?: string;
  /** Label font weight (default: 500) */
  labelFontWeight?: number;
  /** Label text shadow (default: none) */
  labelTextShadow?: string;
  /** Hover overlay opacity (default: 0.4) */
  hoverOpacity?: number;
  /** External hover state (controlled mode) */
  hoveredSlice?: string | null;
  /** Callback when slice is hovered */
  onSliceHover?: (key: string | null) => void;
}

/**
 * Interactive SVG pie chart built from PieSlice data.
 * Shows percentage labels for slices above minimum threshold.
 * Renders a grey circle when all values are zero.
 */
export const SimplePieChart = ({
  slices,
  size = 130,
  emptyText,
  minPercentageForLabel = PIE_MIN_PERCENTAGE_FOR_LABEL,
  labelRadiusRatio = PIE_LABEL_RADIUS_RATIO,
  labelColor = 'var(--color-text-950)',
  labelFontWeight = 500,
  labelTextShadow,
  hoverOpacity = 0.4,
  hoveredSlice: externalHovered,
  onSliceHover,
}: SimplePieChartProps) => {
  const [internalHovered, setInternalHovered] = useState<string | null>(null);

  // Use external hover state if provided (controlled mode)
  const isControlled = externalHovered !== undefined;
  const hovered = isControlled ? externalHovered : internalHovered;

  const handleSliceHover = (label: string | null) => {
    if (!isControlled) {
      setInternalHovered(label);
    }
    onSliceHover?.(label);
  };

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = size * PIE_RADIUS_RATIO;
  const center = size / 2;

  if (total === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden={!emptyText}
        role={emptyText ? 'img' : undefined}
        aria-label={emptyText || undefined}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-background-200"
        />
        {emptyText && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text-400)"
            style={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {emptyText}
          </text>
        )}
      </svg>
    );
  }

  let cumAngle = 0;
  const computed = slices
    .map((s) => {
      const pct = (s.value / total) * 100;
      const startAngle = cumAngle;
      cumAngle += (pct / 100) * 360;
      const endAngle = cumAngle;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      return { ...s, pct, startAngle, endAngle, midAngle };
    })
    .filter((s) => s.pct > 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      onMouseLeave={() => handleSliceHover(null)}
    >
      {computed.map((slice) => {
        const sliceKey = slice.key ?? slice.label;
        const isHovered = hovered === sliceKey;
        const isWhole = slice.pct >= PIE_WHOLE_THRESHOLD;
        const arcPath = isWhole
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
          radius * labelRadiusRatio,
          slice.midAngle
        );
        const fill = slice.color ?? bgClassToCssVar(slice.colorClass);

        return (
          <g
            key={sliceKey}
            onMouseEnter={() => handleSliceHover(sliceKey)}
            className="cursor-pointer"
          >
            {isWhole ? (
              <circle cx={center} cy={center} r={radius} fill={fill} />
            ) : (
              <path d={arcPath} fill={fill} />
            )}
            {isHovered &&
              (isWhole ? (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="white"
                  opacity={hoverOpacity}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <path
                  d={arcPath}
                  fill="white"
                  opacity={hoverOpacity}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
            {slice.pct >= minPercentageForLabel && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                style={{
                  fontSize: 14,
                  fontWeight: labelFontWeight,
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1,
                  letterSpacing: 0,
                  pointerEvents: 'none',
                  textShadow: labelTextShadow,
                }}
              >
                {`${Math.round(slice.pct)}%`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/**
 * A single legend row: colour dot + label + value.
 */
export const LegendRow = ({
  colorClass,
  color,
  label,
  value,
}: {
  colorClass: string;
  color?: string;
  label: string;
  value: number;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={cn('w-2 h-2 rounded-full shrink-0', !color && colorClass)}
      style={color ? { backgroundColor: color } : undefined}
    />
    <Text size="sm" weight="medium" className="text-text-950 flex-1">
      {label}
    </Text>
    <Text size="sm" weight="medium" className="text-text-600 ml-3">
      {value}
    </Text>
  </div>
);

/**
 * Card with a legend list and a pie chart side by side.
 */
export const LegendPieCard = ({ slices }: { slices: PieSlice[] }) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-background border border-border-50 rounded-xl">
    <div className="flex flex-col gap-2">
      {slices.map((s) => (
        <LegendRow
          key={s.label}
          colorClass={s.colorClass}
          color={s.color}
          label={s.label}
          value={s.value}
        />
      ))}
    </div>
    <SimplePieChart slices={slices} />
  </div>
);
