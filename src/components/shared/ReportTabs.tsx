import { type ReactNode, useState } from 'react';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';

/** One tab of a report's strip. */
export interface ReportTabsItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

/**
 * Props for the ReportTabs component.
 */
export interface ReportTabsProps {
  tabs: ReportTabsItem[];
  /** Controlled active tab */
  value?: string;
  /** Active tab when uncontrolled; defaults to the first one */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Print the active tab alone: the others are navigation, not content, and
   * get `data-print-hide`.
   */
  printActiveOnly?: boolean;
}

/**
 * The tab strip of the reports — left-aligned, each tab underlined to its
 * label's width. The profile tabs of TimeReport and PerformanceReport, and
 * exported for a report whose tabs sit above more than a row of cards (the
 * "Geral" / "Momento N" tabs of the Momento ENEM report of the gestor app).
 *
 * @example
 * ```tsx
 * <ReportTabs
 *   tabs={[{ value: 'geral', label: 'Geral' }, { value: 'm1', label: 'Momento 1' }]}
 *   value={tab}
 *   onValueChange={setTab}
 * />
 * ```
 */
export const ReportTabs = ({
  tabs,
  value,
  defaultValue,
  onValueChange,
  printActiveOnly = false,
}: ReportTabsProps) => {
  const initial = defaultValue ?? tabs[0]?.value ?? '';
  // Followed even when uncontrolled: what prints is the tab on screen.
  const [internal, setInternal] = useState(initial);
  const active = value ?? internal;

  const handleValueChange = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <Menu
      defaultValue={initial}
      value={value}
      variant="menu2"
      onValueChange={handleValueChange}
    >
      <MenuContent variant="menu2">
        {tabs.map((tab) => (
          <MenuItem
            key={tab.value}
            value={tab.value}
            variant="menu-overflow"
            className="!text-sm !leading-[100%] !tracking-[0.2px]"
            data-print-hide={
              printActiveOnly && tab.value !== active ? true : undefined
            }
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
  );
};

export default ReportTabs;
