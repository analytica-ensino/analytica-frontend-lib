import { useMemo, useState, type HTMLAttributes } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Proficiency level counters
 */
export interface ProficiencyCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
}

/**
 * Props for the ProficiencyChart component
 */
export interface ProficiencyChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Proficiency level counters */
  counters?: ProficiencyCounters;
  /** Total number of students */
  totalStudents?: number;
}

interface SliceData {
  key: string;
  label: string;
  value: number;
  percentage: number;
  colorClass: string;
  fillColor: string;
}

/**
 * Build slices from counters
 */
const buildSlices = (
  counters: ProficiencyCounters,
  total: number
): SliceData[] => {
  if (total === 0) return [];

  return [
    {
      key: 'attentionPoint',
      label: 'Ponto de atenção',
      value: counters.attentionPoint,
      percentage: (counters.attentionPoint / total) * 100,
      colorClass: 'bg-error-600',
      fillColor: '#dc2626', // error-600
    },
    {
      key: 'belowAverage',
      label: 'Abaixo da média',
      value: counters.belowAverage,
      percentage: (counters.belowAverage / total) * 100,
      colorClass: 'bg-warning-400',
      fillColor: '#fbbf24', // warning-400
    },
    {
      key: 'aboveAverage',
      label: 'Acima da média',
      value: counters.aboveAverage,
      percentage: (counters.aboveAverage / total) * 100,
      colorClass: 'bg-success-400',
      fillColor: '#4ade80', // success-400
    },
    {
      key: 'highlight',
      label: 'Destaque da turma',
      value: counters.highlight,
      percentage: (counters.highlight / total) * 100,
      colorClass: 'bg-success-700',
      fillColor: '#15803d', // success-700
    },
  ];
};

/** SVG viewBox size */
const CHART_SIZE = 180;

interface PieChartProps {
  slices: SliceData[];
  hoveredSlice: string | null;
  onSliceHover: (key: string | null) => void;
}

/**
 * Simple pie chart sub-component
 */
const PieChart = ({
  slices,
  hoveredSlice,
  onSliceHover,
}: Readonly<PieChartProps>) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-[180px] h-[180px] bg-background-50 rounded-full">
        <Text size="sm" className="text-text-500">
          Sem dados
        </Text>
      </div>
    );
  }

  const cx = CHART_SIZE / 2;
  const cy = CHART_SIZE / 2;
  const radius = CHART_SIZE / 2 - 5;

  let cumulativePercent = 0;

  const paths = slices.map((slice) => {
    const percent = slice.percentage;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    if (percent === 0) return null;

    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = ((startPercent + percent) / 100) * 360 - 90;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = percent > 50 ? 1 : 0;

    // Handle full circle case
    const d =
      percent >= 100
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Calculate label position (center of slice)
    const midAngle = ((startPercent + percent / 2) / 100) * 360 - 90;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.65;
    const labelX = cx + labelRadius * Math.cos(midRad);
    const labelY = cy + labelRadius * Math.sin(midRad);

    const isOtherHovered = hoveredSlice && hoveredSlice !== slice.key;

    return (
      <g key={slice.key}>
        <path
          d={d}
          className="cursor-pointer transition-opacity"
          style={{ fill: slice.fillColor, opacity: isOtherHovered ? 0.3 : 1 }}
          onMouseEnter={() => onSliceHover(slice.key)}
          onMouseLeave={() => onSliceHover(null)}
        />
        {/* Label inside slice (only if percentage > 8%) */}
        {percent >= 8 && (
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-xs font-semibold pointer-events-none"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              opacity: isOtherHovered ? 0.3 : 1,
            }}
          >
            {slice.percentage.toFixed(0)}%
          </text>
        )}
      </g>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
      className="w-[180px] h-[180px]"
    >
      {paths}
    </svg>
  );
};

/**
 * ProficiencyChart - displays a pie chart showing the distribution of student proficiency levels.
 *
 * @example
 * ```tsx
 * <ProficiencyChart
 *   counters={{
 *     highlight: 10,
 *     aboveAverage: 25,
 *     belowAverage: 15,
 *     attentionPoint: 5,
 *   }}
 *   totalStudents={55}
 * />
 * ```
 */
export const ProficiencyChart = ({
  counters,
  totalStudents,
  className,
  ...props
}: Readonly<ProficiencyChartProps>) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const total = totalStudents ?? 0;

  const slices = useMemo(() => {
    if (!counters) return [];
    return buildSlices(counters, total);
  }, [counters, total]);

  if (!counters || total === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-[200px] bg-background border border-border-50 rounded-xl',
          className
        )}
        {...props}
      >
        <Text size="sm" className="text-text-500">
          Sem dados de proficiência disponíveis
        </Text>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full bg-background border border-border-50 rounded-xl p-5',
        className
      )}
      {...props}
    >
      <Text as="h3" size="md" weight="semibold" className="text-text-950 mb-4">
        Proficiência por quantidade de estudante
      </Text>

      <div className="flex items-center justify-between gap-6">
        {/* Legend */}
        <div className="flex flex-col gap-3">
          {slices.map((slice) => (
            <div
              key={slice.key}
              className={cn(
                'flex items-center gap-3 cursor-pointer transition-opacity',
                hoveredSlice && hoveredSlice !== slice.key && 'opacity-50'
              )}
              onMouseEnter={() => setHoveredSlice(slice.key)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <span
                className={cn('w-3 h-3 rounded-full shrink-0', slice.colorClass)}
              />
              <div className="flex flex-col">
                <Text size="sm" weight="medium" className="text-text-950">
                  {slice.label}
                </Text>
                <Text size="xs" className="text-text-500">
                  {slice.value.toLocaleString('pt-BR')}{' '}
                  {slice.value === 1 ? 'aluno' : 'alunos'} (
                  {slice.percentage.toFixed(1)}%)
                </Text>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-2 border-t border-border-100">
            <Text size="sm" weight="semibold" className="text-text-950">
              Total: {total.toLocaleString('pt-BR')}{' '}
              {total === 1 ? 'aluno' : 'alunos'}
            </Text>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="shrink-0">
          <PieChart
            slices={slices}
            hoveredSlice={hoveredSlice}
            onSliceHover={setHoveredSlice}
          />
        </div>
      </div>
    </div>
  );
};

export default ProficiencyChart;
