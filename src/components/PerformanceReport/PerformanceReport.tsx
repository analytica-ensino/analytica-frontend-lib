import { type HTMLAttributes, type ReactNode } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { PROFILE_ROLES } from '../../types/chat';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';
import { ReportLayout } from '../shared/ReportLayout';

/**
 * API types - reusing existing enums/types from the project
 */
export { PROFILE_ROLES } from '../../types/chat';
export type { StudentsHighlightPeriod as PerformanceReportPeriod } from '../../hooks/useStudentsHighlight';

export interface PerformanceReportRequest {
  period: StudentsHighlightPeriod;
  profile?: PROFILE_ROLES;
  schoolGroupIds?: string[];
  schoolIds?: string[];
  allSchoolGroups?: boolean;
}

export interface PerformanceStudentData {
  cities: number;
  schools: number;
  classes: number;
  students: number;
  teachers: number;
}

export interface PerformanceDefaultData {
  activities: number;
  recommendedLessons: number;
}

export interface PerformanceReportResponse {
  message: string;
  data: PerformanceStudentData | PerformanceDefaultData;
}

/**
 * Data for a single performance card
 */
export interface PerformanceCardData {
  /** Unique identifier */
  id: string;
  /** Uppercase label (e.g., "CIDADES", "ESCOLAS") */
  label: string;
  /** Numeric or formatted value (e.g., 42, "1.200") */
  value: string | number;
  /** Icon element for the card */
  icon: ReactNode;
}

/**
 * Tab configuration for the PerformanceReport component
 */
export interface PerformanceReportTab {
  /** Unique value identifying this tab */
  value: string;
  /** Display label */
  label: string;
  /** Icon element for the tab header */
  icon?: ReactNode;
  /** Cards to display when this tab is active */
  cards: PerformanceCardData[];
}

/**
 * Props for the PerformanceCard component
 */
export interface PerformanceCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card data */
  data: PerformanceCardData;
}

/**
 * Props for the PerformanceReport component
 */
export interface PerformanceReportProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab configurations with associated card data */
  tabs: PerformanceReportTab[];
  /** Default active tab value */
  defaultTab?: string;
  /** Controlled active tab value */
  activeTab?: string;
  /** Callback when active tab changes */
  onTabChange?: (value: string) => void;
}

/**
 * PerformanceCard component - displays a single performance statistic
 */
export const PerformanceCard = ({
  data,
  className,
  ...props
}: PerformanceCardProps) => {
  const { label, value, icon } = data;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-5 bg-background border border-border-50 rounded-xl',
        className
      )}
      data-testid={`performance-card-${data.id}`}
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

      {/* Value */}
      <Text
        size="2xl"
        weight="bold"
        className="text-primary-800 leading-[100%] tracking-[0.2px]"
      >
        {value}
      </Text>
    </div>
  );
};

/**
 * PerformanceReport component
 *
 * Displays performance statistics organized in tabs, each with configurable cards.
 * Used in the manager report page to show performance metrics (counts, not time).
 *
 * @example
 * ```tsx
 * <PerformanceReport
 *   tabs={[
 *     {
 *       value: 'student',
 *       label: 'Estudante',
 *       icon: <Student size={17} />,
 *       cards: [
 *         { id: 'cities', label: 'CIDADES', value: 42, icon: <MapPin /> },
 *       ],
 *     },
 *   ]}
 *   onTabChange={(tab) => console.log(tab)}
 * />
 * ```
 */
export const PerformanceReport = ({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  className,
  ...props
}: PerformanceReportProps) => (
  <ReportLayout
    tabs={tabs}
    defaultTab={defaultTab}
    activeTab={activeTab}
    onTabChange={onTabChange}
    renderCard={(card) => <PerformanceCard key={card.id} data={card} />}
    gridTestId="performance-report-cards"
    className={className}
    {...props}
  />
);

export default PerformanceReport;
