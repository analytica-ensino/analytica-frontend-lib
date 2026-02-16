import { type HTMLAttributes, type ReactNode, useState } from 'react';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import { cn } from '../../utils/utils';
import { getGridColumnsClass } from './ReportGridUtils';

/**
 * Base tab shape for the generic ReportLayout.
 * Specific reports extend this with their own card type.
 */
export interface ReportLayoutTab<TCard extends { id: string }> {
  value: string;
  label: string;
  icon?: ReactNode;
  cards: TCard[];
}

/**
 * Props for the ReportLayout component.
 */
export interface ReportLayoutProps<TCard extends { id: string }>
  extends HTMLAttributes<HTMLDivElement> {
  /** Tab configurations */
  tabs: ReportLayoutTab<TCard>[];
  /** Default active tab value */
  defaultTab?: string;
  /** Controlled active tab value */
  activeTab?: string;
  /** Callback when active tab changes */
  onTabChange?: (value: string) => void;
  /** Render function for each card */
  renderCard: (card: TCard) => ReactNode;
  /** data-testid for the cards grid container */
  gridTestId?: string;
}

/**
 * Generic tabbed report layout shared between TimeReport and PerformanceReport.
 * Handles controlled/uncontrolled tab state, tab navigation, and responsive card grid.
 */
export const ReportLayout = <TCard extends { id: string }>({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  renderCard,
  gridTestId,
  className,
  ...props
}: ReportLayoutProps<TCard>) => {
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
        data-testid={gridTestId}
      >
        {cards.map((card) => renderCard(card))}
      </div>
    </div>
  );
};
