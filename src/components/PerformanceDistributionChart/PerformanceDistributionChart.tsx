import { useMemo, useState } from 'react';
import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';
import {
  bgClassToCssVar,
  polarToCartesian,
  describeArc,
} from '../../utils/utils';
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

/** Pie chart radius as a proportion of chart size (0.44 = 44%) */
const RADIUS_RATIO = 0.44;

/** Minimum percentage threshold to display label inside slice */
const MIN_PERCENTAGE_FOR_LABEL = 8;

/** Radius multiplier for positioning labels inside slices (0.65 = 65% from center) */
const LABEL_RADIUS_RATIO = 0.65;

/** Threshold to consider a slice as "whole" pie (avoids arc rendering issues) */
const WHOLE_PIE_THRESHOLD = 99.99;

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

  const computedSlices = useMemo(() => {
    let cumAngle = 0;
    return slices
      .filter((s) => s.percentage > 0)
      .map((s) => {
        const startAngle = cumAngle;
        cumAngle += (s.percentage / 100) * 360;
        const endAngle = cumAngle;
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        return { ...s, startAngle, endAngle, midAngle };
      });
  }, [slices]);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (loading) {
    return <SkeletonCard className="min-h-[280px]" />;
  }

  /** Pie chart radius calculated from chart size */
  const radius = CHART_SIZE * RADIUS_RATIO;

  /** Center point of the SVG (x and y coordinates) */
  const center = CHART_SIZE / 2;

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
          {total === 0 ? (
            <svg
              width={CHART_SIZE}
              height={CHART_SIZE}
              viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
              aria-hidden="true"
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                className="fill-background-200"
              />
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
                Sem dados
              </text>
            </svg>
          ) : (
            <svg
              width={CHART_SIZE}
              height={CHART_SIZE}
              viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
              aria-hidden="true"
              onMouseLeave={() => setHoveredSlice(null)}
            >
              {computedSlices.map((slice) => {
                const isHovered = hoveredSlice === slice.key;
                const isWholePie = slice.percentage >= WHOLE_PIE_THRESHOLD;
                const arcPath = isWholePie
                  ? undefined
                  : describeArc(
                      center,
                      center,
                      radius,
                      slice.startAngle,
                      slice.endAngle
                    );
                const labelPosition = polarToCartesian(
                  center,
                  center,
                  radius * LABEL_RADIUS_RATIO,
                  slice.midAngle
                );
                const fillColor = bgClassToCssVar(slice.colorClass);

                return (
                  <g
                    key={slice.key}
                    onMouseEnter={() => setHoveredSlice(slice.key)}
                    className="cursor-pointer"
                  >
                    {isWholePie ? (
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill={fillColor}
                      />
                    ) : (
                      <path d={arcPath} fill={fillColor} />
                    )}
                    {isHovered &&
                      (isWholePie ? (
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          fill="white"
                          opacity={0.3}
                          style={{ pointerEvents: 'none' }}
                        />
                      ) : (
                        <path
                          d={arcPath}
                          fill="white"
                          opacity={0.3}
                          style={{ pointerEvents: 'none' }}
                        />
                      ))}
                    {slice.percentage >= MIN_PERCENTAGE_FOR_LABEL && (
                      <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: 'Roboto, sans-serif',
                          pointerEvents: 'none',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                      >
                        {`${Math.round(slice.percentage)}%`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
