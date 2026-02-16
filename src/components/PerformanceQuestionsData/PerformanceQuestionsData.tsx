import { type HTMLAttributes, type ReactNode } from 'react';
import Text from '../Text/Text';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import { cn } from '../../utils/utils';
import { PROFILE_ROLES } from '../../types/chat';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';

/**
 * Re-export period type for API consumers
 */
export type { StudentsHighlightPeriod as PerformanceQuestionsPeriod } from '../../hooks/useStudentsHighlight';

// --- Variant data shapes ---

/**
 * Data for STUDENT variant: question statistics
 */
export interface QuestionsVariantData {
  total: number;
  corretas: number;
  incorretas: number;
  emBranco: number;
}

/**
 * Data for non-STUDENT variant: material produced
 */
export interface MaterialVariantData {
  total: number;
  totalAtividades: number;
  totalAulasRecomendadas: number;
}

// --- Filter types ---

export interface PerformanceFilterOption {
  value: string;
  label: string;
}

export interface PerformanceFilterConfig {
  options: PerformanceFilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Icon rendered before the select value */
  icon?: ReactNode;
}

// --- API types ---

export interface PerformanceQuestionsRequest {
  period: StudentsHighlightPeriod;
  targetProfile: PROFILE_ROLES;
  schoolIds?: string[];
  schoolGroupIds?: string[];
  allSchoolGroupsSelected?: boolean;
  subjectIds?: string[];
  allSubjectsSelected?: boolean;
  activityTypes?: string[];
}

export interface PerformanceQuestionsStudentResponse {
  message: string;
  data: QuestionsVariantData;
}

export interface PerformanceQuestionsDefaultResponse {
  message: string;
  data: MaterialVariantData;
}

// --- Component types ---

export enum PerformanceQuestionsVariant {
  QUESTIONS = 'questions',
  MATERIAL = 'material',
}

export interface PerformanceQuestionsDataProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Variant determines title, bars, and colors */
  variant: PerformanceQuestionsVariant;
  /** Chart data (shape depends on variant) */
  data: QuestionsVariantData | MaterialVariantData;
  /** Subject/discipline filter configuration */
  subjectFilter?: PerformanceFilterConfig;
  /** Activity type filter configuration */
  activityTypeFilter?: PerformanceFilterConfig;
  /** Maximum value for the chart scale (defaults to total) */
  maxValue?: number;
  /** Height of the chart area in pixels */
  chartHeight?: number;
}

// --- Internal types ---

interface BarItemConfig {
  key: string;
  label: string;
  legendLabel: string;
  value: number;
  colorClass: string;
}

// --- Bar color constants ---

const QUESTIONS_COLORS = {
  total: 'bg-info-600',
  corretas: 'bg-success-200',
  incorretas: 'bg-warning-400',
  emBranco: 'bg-background-300',
} as const;

const MATERIAL_COLORS = {
  total: 'bg-info-600',
  totalAtividades: 'bg-success-700',
  totalAulasRecomendadas: 'bg-warning-300',
} as const;

// --- Variant titles ---

const VARIANT_TITLES: Record<PerformanceQuestionsVariant, string> = {
  questions: 'Dados de questões',
  material: 'Dados de material produzido',
};

// --- Helper functions ---

/**
 * Calculate Y-axis tick values based on max value
 */
const calculateYAxisTicks = (maxValue: number): number[] => {
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
 * Build bar items for the "questions" variant (STUDENT)
 */
const buildQuestionsBarItems = (
  data: QuestionsVariantData
): BarItemConfig[] => [
  {
    key: 'total',
    label: 'Total',
    legendLabel: 'Total de questões respondidas',
    value: data.total,
    colorClass: QUESTIONS_COLORS.total,
  },
  {
    key: 'corretas',
    label: 'Corretas',
    legendLabel: 'Questões corretas',
    value: data.corretas,
    colorClass: QUESTIONS_COLORS.corretas,
  },
  {
    key: 'incorretas',
    label: 'Incorretas',
    legendLabel: 'Questões incorretas',
    value: data.incorretas,
    colorClass: QUESTIONS_COLORS.incorretas,
  },
  {
    key: 'emBranco',
    label: 'Em branco',
    legendLabel: 'Questões em branco',
    value: data.emBranco,
    colorClass: QUESTIONS_COLORS.emBranco,
  },
];

/**
 * Build bar items for the "material" variant (non-STUDENT)
 */
const buildMaterialBarItems = (data: MaterialVariantData): BarItemConfig[] => [
  {
    key: 'total',
    label: 'Total',
    legendLabel: 'Total',
    value: data.total,
    colorClass: MATERIAL_COLORS.total,
  },
  {
    key: 'totalAtividades',
    label: 'Atividades',
    legendLabel: 'Atividades',
    value: data.totalAtividades,
    colorClass: MATERIAL_COLORS.totalAtividades,
  },
  {
    key: 'totalAulasRecomendadas',
    label: 'Aulas recomendadas',
    legendLabel: 'Aulas recomendadas',
    value: data.totalAulasRecomendadas,
    colorClass: MATERIAL_COLORS.totalAulasRecomendadas,
  },
];

// --- Sub-components ---

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex flex-row items-center gap-2">
    <div className={cn('w-2 h-2 rounded-full', color)} />
    <Text size="xs" weight="medium" className="text-text-600">
      {label}
    </Text>
  </div>
);

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
        key={`${tick}-${index}`}
        className="w-full border-t border-dashed border-border-200"
        style={{ marginTop: index === 0 ? 0 : undefined }}
      />
    ))}
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
        {tick}
      </Text>
    ))}
  </div>
);

const FilterSelect = ({ filter }: { filter: PerformanceFilterConfig }) => (
  <Select
    value={filter.value}
    onValueChange={filter.onChange}
    size="small"
    className="w-auto"
  >
    <SelectTrigger
      variant="outlined"
      className="whitespace-nowrap overflow-hidden"
    >
      {filter.icon && (
        <span className="text-text-700 [&>svg]:w-4 [&>svg]:h-4 mr-2 flex-shrink-0">
          {filter.icon}
        </span>
      )}
      <span className="truncate">
        <SelectValue placeholder={filter.placeholder} />
      </span>
    </SelectTrigger>
    <SelectContent>
      {filter.options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// --- Main component ---

/**
 * PerformanceQuestionsData component - displays a vertical bar chart
 * with variant-specific data for performance reports.
 *
 * - `variant="questions"` (STUDENT): Total, Corretas, Incorretas, Em branco
 * - `variant="material"` (non-STUDENT): Total, Atividades, Aulas recomendadas
 *
 * Includes optional integrated Select filters for subjects and activity types.
 *
 * @example
 * ```tsx
 * <PerformanceQuestionsData
 *   variant="questions"
 *   data={{ total: 100, corretas: 60, incorretas: 30, emBranco: 10 }}
 *   subjectFilter={{
 *     options: [{ value: 'all', label: 'Todos componentes' }],
 *     value: 'all',
 *     onChange: (v) => setSubject(v),
 *     placeholder: 'Todos componentes',
 *   }}
 * />
 * ```
 */
export const PerformanceQuestionsData = ({
  variant,
  data,
  subjectFilter,
  activityTypeFilter,
  maxValue,
  chartHeight = 180,
  className,
  ...props
}: PerformanceQuestionsDataProps) => {
  const title = VARIANT_TITLES[variant];

  const barItems =
    variant === PerformanceQuestionsVariant.QUESTIONS
      ? buildQuestionsBarItems(data as QuestionsVariantData)
      : buildMaterialBarItems(data as MaterialVariantData);

  const chartMaxValue = maxValue ?? data.total;
  const yAxisTicks = calculateYAxisTicks(chartMaxValue);
  const adjustedMaxValue = yAxisTicks[0];

  return (
    <div
      className={cn(
        'flex flex-col p-5 gap-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      {...props}
    >
      {/* Header: title + filters */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Text
          as="h3"
          size="lg"
          weight="bold"
          className="text-text-950 tracking-[0.2px]"
        >
          {title}
        </Text>

        {(subjectFilter || activityTypeFilter) && (
          <div className="flex flex-row gap-3">
            {subjectFilter && <FilterSelect filter={subjectFilter} />}
            {activityTypeFilter && <FilterSelect filter={activityTypeFilter} />}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 mb-4">
        {barItems.map((item) => (
          <LegendItem
            key={item.key}
            color={item.colorClass}
            label={item.legendLabel}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="flex flex-row">
        <YAxis ticks={yAxisTicks} chartHeight={chartHeight} />
        <div className="w-4" />
        <div className="flex-1 relative">
          <GridLines ticks={yAxisTicks} chartHeight={chartHeight} />
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

export default PerformanceQuestionsData;
