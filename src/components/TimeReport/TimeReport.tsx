import { type HTMLAttributes, type ReactNode } from 'react';
import { TrendUp, TrendDown } from 'phosphor-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { PROFILE_ROLES } from '../../types/chat';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';
import { ReportLayout } from '../shared/ReportLayout';

dayjs.extend(duration);

/**
 * API types - reusing existing enums/types from the project
 */
export { PROFILE_ROLES } from '../../types/chat';
export type { StudentsHighlightPeriod as TimeReportPeriod } from '../../hooks/useStudentsHighlight';

export interface TimeReportRequest {
  period: StudentsHighlightPeriod;
  profile?: PROFILE_ROLES;
  school_group_ids?: string[];
  school_ids?: string[];
  all_school_groups?: boolean;
}

export interface TimeMetric {
  hours: number;
  variation_percent: number | null;
}

export interface TimeReportData {
  total_platform_time: TimeMetric;
  activity_time: TimeMetric;
  exam_simulation_time?: TimeMetric;
  content_time?: TimeMetric;
  recommended_classes_time: TimeMetric;
}

export interface TimeReportResponse {
  message: string;
  data: TimeReportData;
}

/**
 * Format decimal hours to "Xh Ymin" display string
 */
export const formatHoursToTime = (hours: number): string => {
  const d = dayjs.duration(hours, 'hours');
  const h = Math.floor(d.asHours());
  const min = d.minutes();
  return `${h}h ${min}min`;
};

/**
 * Get trend direction from variation percentage
 */
export const getTrendDirection = (
  variationPercent: number | null
): TimeCardTrend | undefined => {
  if (variationPercent === null) return undefined;
  return variationPercent >= 0 ? 'up' : 'down';
};

/**
 * Format variation percentage to display string (e.g., "+12.3%", "-5.2%")
 */
export const formatVariation = (
  variationPercent: number | null
): string | undefined => {
  if (variationPercent === null) return undefined;
  const sign = variationPercent >= 0 ? '+' : '';
  return `${sign}${variationPercent}%`;
};

/**
 * Trend direction for time card indicators
 */
export type TimeCardTrend = 'up' | 'down';

/**
 * Data for a single time card
 */
export interface TimeCardData {
  /** Unique identifier */
  id: string;
  /** Uppercase label (e.g., "TEMPO NA PLATAFORMA") */
  label: string;
  /** Formatted time value (e.g., "12h 20min") */
  value: string;
  /** Icon element for the card */
  icon: ReactNode;
  /** Trend percentage string (e.g., "+10%", "-5%") */
  trendValue?: string;
  /** Trend direction - determines color */
  trendDirection?: TimeCardTrend;
}

/**
 * Tab configuration for the TimeReport component
 */
export interface TimeReportTab {
  /** Unique value identifying this tab */
  value: string;
  /** Display label */
  label: string;
  /** Icon element for the tab header */
  icon?: ReactNode;
  /** Cards to display when this tab is active */
  cards: TimeCardData[];
}

/**
 * Props for the TimeCard component
 */
export interface TimeCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card data */
  data: TimeCardData;
}

/**
 * Props for the TimeReport component
 */
export interface TimeReportProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab configurations with associated card data */
  tabs: TimeReportTab[];
  /** Default active tab value */
  defaultTab?: string;
  /** Controlled active tab value */
  activeTab?: string;
  /** Callback when active tab changes */
  onTabChange?: (value: string) => void;
}

/**
 * Trend styling configuration
 */
const TREND_CONFIG = {
  up: {
    colorClass: 'text-success-500',
    Icon: TrendUp,
  },
  down: {
    colorClass: 'text-error-500',
    Icon: TrendDown,
  },
} as const;

/**
 * TimeCard component - displays a single time statistic
 */
export const TimeCard = ({ data, className, ...props }: TimeCardProps) => {
  const { label, value, icon, trendValue, trendDirection } = data;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-5 bg-background border border-border-50 rounded-xl',
        className
      )}
      data-testid={`time-card-${data.id}`}
      {...props}
    >
      {/* Icon + Label */}
      <div className="flex flex-row items-center gap-2">
        <span className="text-text-600 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        <Text
          weight="bold"
          className="text-text-600 uppercase text-[8px] leading-[100%]"
        >
          {label}
        </Text>
      </div>

      {/* Time value */}
      <Text
        size="2xl"
        weight="bold"
        className="text-primary-800 leading-[100%] tracking-[0.2px]"
      >
        {value}
      </Text>

      {/* Trend indicator */}
      {trendValue && trendDirection && (
        <div
          className={cn(
            'flex flex-row items-center gap-1',
            TREND_CONFIG[trendDirection].colorClass
          )}
          data-testid={`trend-${data.id}`}
        >
          {(() => {
            const TrendIcon = TREND_CONFIG[trendDirection].Icon;
            return <TrendIcon size={16} weight="bold" />;
          })()}
          <Text
            size="xs"
            weight="bold"
            color="inherit"
            className="leading-[100%] uppercase"
          >
            {trendValue}
          </Text>
        </div>
      )}
    </div>
  );
};

/**
 * TimeReport component
 *
 * Displays time statistics organized in tabs, each with configurable cards.
 * Used in the manager report page to show platform access time metrics.
 *
 * @example
 * ```tsx
 * <TimeReport
 *   tabs={[
 *     {
 *       value: 'student',
 *       label: 'Estudante',
 *       icon: <Student size={17} />,
 *       cards: [
 *         { id: 'platform', label: 'TEMPO NA PLATAFORMA', value: '12h 20min', icon: <Monitor />, trendValue: '+10%', trendDirection: 'up' },
 *       ],
 *     },
 *   ]}
 *   onTabChange={(tab) => console.log(tab)}
 * />
 * ```
 */
export const TimeReport = ({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  className,
  ...props
}: TimeReportProps) => (
  <ReportLayout
    tabs={tabs}
    defaultTab={defaultTab}
    activeTab={activeTab}
    onTabChange={onTabChange}
    renderCard={(card) => <TimeCard key={card.id} data={card} />}
    gridTestId="time-report-cards"
    className={className}
    {...props}
  />
);

export default TimeReport;
