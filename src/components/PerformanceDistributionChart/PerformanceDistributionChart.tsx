import { useMemo, useState } from 'react';
import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';
import type {
  SimulatedPerformanceCounters,
  SliceData,
  PerformanceDistributionChartProps,
} from './types';

/**
 * Converts polar coordinates to Cartesian for SVG arc path calculations.
 * Angles are in degrees, with 0° at the top (12 o'clock position).
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Generates an SVG filled arc (pie slice) path string.
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
}

/**
 * Maps Tailwind bg-* class to CSS variable
 */
function bgClassToCssVar(bgClass: string): string {
  return `var(--color-${bgClass.replace('bg-', '')})`;
}

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

  const size = 180;
  const r = size * 0.44;
  const c = size / 2;

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
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              aria-hidden="true"
            >
              <circle cx={c} cy={c} r={r} className="fill-background-200" />
              <text
                x={c}
                y={c}
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
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              aria-hidden="true"
              onMouseLeave={() => setHoveredSlice(null)}
            >
              {computedSlices.map((slice) => {
                const isHovered = hoveredSlice === slice.key;
                const isWhole = slice.percentage >= 99.99;
                const path = isWhole
                  ? undefined
                  : describeArc(c, c, r, slice.startAngle, slice.endAngle);
                const labelPos = polarToCartesian(
                  c,
                  c,
                  r * 0.65,
                  slice.midAngle
                );
                const fill = bgClassToCssVar(slice.colorClass);

                return (
                  <g
                    key={slice.key}
                    onMouseEnter={() => setHoveredSlice(slice.key)}
                    className="cursor-pointer"
                  >
                    {isWhole ? (
                      <circle cx={c} cy={c} r={r} fill={fill} />
                    ) : (
                      <path d={path} fill={fill} />
                    )}
                    {isHovered &&
                      (isWhole ? (
                        <circle
                          cx={c}
                          cy={c}
                          r={r}
                          fill="white"
                          opacity={0.3}
                          style={{ pointerEvents: 'none' }}
                        />
                      ) : (
                        <path
                          d={path}
                          fill="white"
                          opacity={0.3}
                          style={{ pointerEvents: 'none' }}
                        />
                      ))}
                    {/* Show percentage label for slices >= 8% */}
                    {slice.percentage >= 8 && (
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
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
