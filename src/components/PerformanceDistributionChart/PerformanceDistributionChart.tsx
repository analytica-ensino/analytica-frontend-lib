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
const CHART_SIZE = 180;

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

  return [
    {
      key: 'attentionPoint',
      label: 'Ponto de atenção',
      value: counters.attentionPoint,
      percentage: (counters.attentionPoint / total) * 100,
      colorClass: 'bg-error-600',
    },
    {
      key: 'belowAverage',
      label: 'Abaixo da média',
      value: counters.belowAverage,
      percentage: (counters.belowAverage / total) * 100,
      colorClass: 'bg-warning-400',
    },
    {
      key: 'aboveAverage',
      label: 'Acima da média',
      value: counters.aboveAverage,
      percentage: (counters.aboveAverage / total) * 100,
      colorClass: 'bg-success-400',
    },
    {
      key: 'highlight',
      label: 'Destaque da turma',
      value: counters.highlight,
      percentage: (counters.highlight / total) * 100,
      colorClass: 'bg-success-700',
    },
  ];
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
  title = 'Proficiência por quantidade de estudante',
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
      <Text as="h3" size="md" weight="semibold" className="text-text-950 mb-4">
        {title}
      </Text>

      <div className="flex items-center justify-between gap-6">
        {/* Legend */}
        <div className="flex flex-col gap-3">
          {slices.map((slice) => (
            <div
              key={slice.key}
              className={`flex items-center gap-3 transition-opacity ${
                hoveredSlice && hoveredSlice !== slice.key ? 'opacity-50' : ''
              }`}
              onMouseEnter={() => setHoveredSlice(slice.key)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <span
                className={`w-3 h-3 rounded-full ${slice.colorClass} shrink-0`}
              />
              <div className="flex flex-col">
                <Text size="sm" weight="medium" className="text-text-950">
                  {slice.label}
                </Text>
                <Text size="xs" className="text-text-500">
                  {slice.value} {slice.value === 1 ? 'aluno' : 'alunos'} (
                  {slice.percentage.toFixed(1)}%)
                </Text>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-2 border-t border-border-100">
            <Text size="sm" weight="semibold" className="text-text-950">
              Total: {totalStudents ?? total}{' '}
              {(totalStudents ?? total) === 1 ? 'aluno' : 'alunos'}
            </Text>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="shrink-0">
          <SimplePieChart
            slices={pieSlices}
            size={CHART_SIZE}
            emptyText="Sem dados"
            minPercentageForLabel={MIN_PERCENTAGE_FOR_LABEL}
            labelRadiusRatio={LABEL_RADIUS_RATIO}
            labelColor="white"
            labelFontWeight={600}
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
