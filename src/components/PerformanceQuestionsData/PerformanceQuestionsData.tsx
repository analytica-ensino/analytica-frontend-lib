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
import {
  calculateYAxisTicks,
  LegendItem,
  DataBar,
  GridLines,
  YAxis,
  type BarItemConfig,
} from '../shared/ChartComponents';

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
  correct: number;
  incorrect: number;
  blank: number;
}

/**
 * Data for non-STUDENT variant: produced content
 */
export interface ContentVariantData {
  total: number;
  totalActivities: number;
  totalRecommendedLessons: number;
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
  data: ContentVariantData;
}

// --- Component types ---

export enum PerformanceQuestionsVariant {
  QUESTIONS = 'questions',
  CONTENT = 'content',
}

export interface PerformanceQuestionsDataProps extends HTMLAttributes<HTMLDivElement> {
  /** Variant determines title, bars, and colors */
  variant: PerformanceQuestionsVariant;
  /** Chart data (shape depends on variant) */
  data: QuestionsVariantData | ContentVariantData;
  /** Subject/discipline filter configuration */
  subjectFilter?: PerformanceFilterConfig;
  /** Activity type filter configuration */
  activityTypeFilter?: PerformanceFilterConfig;
  /** Maximum value for the chart scale (defaults to total) */
  maxValue?: number;
  /** Height of the chart area in pixels */
  chartHeight?: number;
}

// --- Bar color constants ---

const QUESTIONS_COLORS = {
  total: 'bg-info-600',
  correct: 'bg-success-200',
  incorrect: 'bg-warning-400',
  blank: 'bg-background-300',
} as const;

const CONTENT_COLORS = {
  total: 'bg-info-600',
  totalActivities: 'bg-success-700',
  totalRecommendedLessons: 'bg-warning-300',
} as const;

// --- Variant titles ---

const VARIANT_TITLES: Record<PerformanceQuestionsVariant, string> = {
  questions: 'Dados de questões',
  content: 'Dados de material produzido',
};

// --- Bar builders ---

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
    key: 'correct',
    label: 'Corretas',
    legendLabel: 'Questões corretas',
    value: data.correct,
    colorClass: QUESTIONS_COLORS.correct,
  },
  {
    key: 'incorrect',
    label: 'Incorretas',
    legendLabel: 'Questões incorretas',
    value: data.incorrect,
    colorClass: QUESTIONS_COLORS.incorrect,
  },
  {
    key: 'blank',
    label: 'Em branco',
    legendLabel: 'Questões em branco',
    value: data.blank,
    colorClass: QUESTIONS_COLORS.blank,
  },
];

/**
 * Build bar items for the "content" variant (non-STUDENT)
 */
const buildContentBarItems = (data: ContentVariantData): BarItemConfig[] => [
  {
    key: 'total',
    label: 'Total',
    legendLabel: 'Total',
    value: data.total,
    colorClass: CONTENT_COLORS.total,
  },
  {
    key: 'totalActivities',
    label: 'Atividades',
    legendLabel: 'Atividades',
    value: data.totalActivities,
    colorClass: CONTENT_COLORS.totalActivities,
  },
  {
    key: 'totalRecommendedLessons',
    label: 'Aulas recomendadas',
    legendLabel: 'Aulas recomendadas',
    value: data.totalRecommendedLessons,
    colorClass: CONTENT_COLORS.totalRecommendedLessons,
  },
];

// --- Sub-components ---

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
 * - `variant="questions"` (STUDENT): Total, Correct, Incorrect, Blank
 * - `variant="content"` (non-STUDENT): Total, Activities, Recommended Lessons
 *
 * Includes optional integrated Select filters for subjects and activity types.
 *
 * @example
 * ```tsx
 * <PerformanceQuestionsData
 *   variant="questions"
 *   data={{ total: 100, correct: 60, incorrect: 30, blank: 10 }}
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
      : buildContentBarItems(data as ContentVariantData);

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
