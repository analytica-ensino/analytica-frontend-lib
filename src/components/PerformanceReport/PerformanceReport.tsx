import { type HTMLAttributes, type ReactNode, useState } from 'react';
import Text from '../Text/Text';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import { cn } from '../../utils/utils';
import { PROFILE_ROLES } from '../../types/chat';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';

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
 * Get responsive grid columns class based on item count
 */
const getGridColumnsClass = (count: number): string => {
  if (count >= 5) return 'lg:grid-cols-5';
  if (count === 4) return 'lg:grid-cols-4';
  if (count === 3) return 'lg:grid-cols-3';
  if (count === 2) return 'lg:grid-cols-2';
  return '';
};

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
  activeTab: controlledTab,
  onTabChange,
  className,
  ...props
}: PerformanceReportProps) => {
  const firstTabValue = tabs[0]?.value ?? '';
  const [internalTab, setInternalTab] = useState(defaultTab ?? firstTabValue);

  const isControlled = controlledTab !== undefined;
  const activeTabValue = isControlled ? controlledTab : internalTab;
  const activeTabData = tabs.find((t) => t.value === activeTabValue);
  const cards = activeTabData?.cards ?? [];

  const handleTabChange = (value: string) => {
    if (!isControlled) {
      setInternalTab(value);
    }
    onTabChange?.(value);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      {/* Tab Navigation */}
      {tabs.length > 1 && (
        <Menu
          defaultValue={defaultTab ?? firstTabValue}
          value={controlledTab}
          variant="menu2"
          onValueChange={handleTabChange}
        >
          <MenuContent variant="menu2">
            {tabs.map((tab) => (
              <MenuItem
                key={tab.value}
                value={tab.value}
                variant="menu-overflow"
                className="!text-sm !leading-[100%] !tracking-[0.2px]"
              >
                {tab.icon && (
                  <span className="[&>svg]:w-[21px] [&>svg]:h-[21px]">
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      )}

      {/* Cards Grid */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
          getGridColumnsClass(cards.length)
        )}
        data-testid="performance-report-cards"
      >
        {cards.map((card) => (
          <PerformanceCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
};

export default PerformanceReport;
