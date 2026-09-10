import { useMemo, useState } from 'react';
import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { SimplePieChart, type PieSlice } from '../shared/ChartComponents';
import type {
  SimulatedPerformanceCounters,
  SliceData,
  PerformanceDistributionChartProps,
} from './types';

// ============================================================================
// PIE CHART CONFIGURATION
// ============================================================================

/** SVG viewBox size in pixels */
const CHART_SIZE = 160;

/** Minimum percentage threshold to display label inside slice */
const MIN_PERCENTAGE_FOR_LABEL = 8;

/** Radius multiplier for positioning labels inside slices (0.65 = 65% from center) */
const LABEL_RADIUS_RATIO = 0.65;

/** Hover overlay opacity */
const HOVER_OPACITY = 0.3;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Build slices from counters
 */
function buildSlices(counters: SimulatedPerformanceCounters): SliceData[] {
  const total =
    counters.attentionPoint +
    counters.belowAverage +
    counters.aboveAverage +
    counters.highlight;

  if (total === 0) return [];

  // Best band first, as the legend and the pie read top-down / clockwise
  return [
    {
      key: 'highlight',
      label: 'Destaque',
      value: counters.highlight,
      percentage: (counters.highlight / total) * 100,
      colorClass: 'bg-map-highlight',
    },
    {
      key: 'aboveAverage',
      label: 'Acima da média',
      value: counters.aboveAverage,
      percentage: (counters.aboveAverage / total) * 100,
      colorClass: 'bg-map-above-avg',
    },
    {
      key: 'belowAverage',
      label: 'Abaixo da média',
      value: counters.belowAverage,
      percentage: (counters.belowAverage / total) * 100,
      colorClass: 'bg-map-below-avg',
    },
    {
      key: 'attentionPoint',
      label: 'Ponto de atenção',
      value: counters.attentionPoint,
      percentage: (counters.attentionPoint / total) * 100,
      colorClass: 'bg-map-attention',
    },
  ];
}

/**
 * "1 estudante" / "4 estudantes"
 */
function formatStudents(count: number): string {
  return `${count} ${count === 1 ? 'estudante' : 'estudantes'}`;
}

/**
 * Convert SliceData to PieSlice format for SimplePieChart
 */
function toPieSlices(slices: SliceData[]): PieSlice[] {
  return slices.map((s) => ({
    key: s.key,
    label: s.label,
    value: s.value,
    colorClass: s.colorClass,
  }));
}

/**
 * Pie chart showing performance distribution with percentages
 */
export function PerformanceDistributionChart({
  counters,
  totalStudents,
  loading = false,
  title = 'Desempenho por quantidade de estudante',
}: PerformanceDistributionChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const slices = useMemo(() => {
    if (!counters) return [];
    return buildSlices(counters);
  }, [counters]);

  const pieSlices = useMemo(() => toPieSlices(slices), [slices]);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (loading) {
    return <SkeletonCard className="min-h-[280px]" />;
  }

  return (
    <div className="bg-background border border-border-50 rounded-xl p-5">
      <Text as="h3" size="lg" weight="bold" className="text-text-950 mb-4">
        {title}
      </Text>

      {/* Two halves: legend bottom-aligned on the left, pie centred on the right */}
      <div className="flex items-stretch gap-2">
        {/* Legend: one row per band, count right-aligned; total underneath */}
        <div className="flex basis-1/2 min-w-0 flex-col justify-end gap-4">
          {slices.map((slice) => (
            <div
              key={slice.key}
              className={`flex items-center justify-between gap-3 transition-opacity ${
                hoveredSlice && hoveredSlice !== slice.key ? 'opacity-50' : ''
              }`}
              onMouseEnter={() => setHoveredSlice(slice.key)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full ${slice.colorClass} shrink-0`}
                />
                <Text size="sm" weight="medium" className="text-text-950">
                  {slice.label}
                </Text>
              </div>
              <Text
                size="sm"
                weight="medium"
                className="text-text-600 shrink-0"
              >
                {formatStudents(slice.value)} ({Math.round(slice.percentage)}%)
              </Text>
            </div>
          ))}

          {/* Total */}
          <div
            data-testid="performance-distribution-total"
            className="pt-4 border-t border-border-200 flex items-center justify-between gap-3"
          >
            <Text size="sm" weight="medium" className="text-text-950">
              Total
            </Text>
            <Text size="sm" weight="medium" className="text-text-600">
              {formatStudents(totalStudents ?? total)}
            </Text>
          </div>
        </div>

        {/* Pie Chart, centred in the right half */}
        <div
          data-testid="performance-distribution-pie"
          className="flex basis-1/2 min-w-0 items-center justify-center"
        >
          <SimplePieChart
            slices={pieSlices}
            size={CHART_SIZE}
            emptyText="Sem dados"
            minPercentageForLabel={MIN_PERCENTAGE_FOR_LABEL}
            labelRadiusRatio={LABEL_RADIUS_RATIO}
            labelColor="white"
            labelFontWeight={500}
            labelTextShadow="0 1px 2px rgba(0,0,0,0.3)"
            hoverOpacity={HOVER_OPACITY}
            hoveredSlice={hoveredSlice}
            onSliceHover={setHoveredSlice}
          />
        </div>
      </div>
    </div>
  );
}
