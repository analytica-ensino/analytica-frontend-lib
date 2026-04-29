import { useMemo } from 'react';
import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import type { PeriodSelectorProps } from './types';
import { PERIOD_OPTIONS } from './types';

/**
 * PeriodSelector - Component for selecting time periods
 *
 * Provides a menu-based selector for common time periods (7 days, 1 month, etc.)
 * Uses the Menu component with breadcrumb variant for a clean tab-like appearance.
 *
 * @example
 * ```tsx
 * const [period, setPeriod] = useState('1_MONTH');
 *
 * <PeriodSelector
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 *
 * @example With excluded values
 * ```tsx
 * <PeriodSelector
 *   value={period}
 *   onChange={setPeriod}
 *   excludeValues={['3_MONTHS']}
 * />
 * ```
 *
 * @example With custom options
 * ```tsx
 * <PeriodSelector
 *   value={period}
 *   onChange={setPeriod}
 *   options={[
 *     { value: '7_DAYS', label: '7 dias' },
 *     { value: '30_DAYS', label: '30 dias' },
 *   ]}
 * />
 * ```
 */
export function PeriodSelector({
  value,
  onChange,
  defaultValue = '1_MONTH',
  options = PERIOD_OPTIONS as unknown as typeof options,
  excludeValues = [],
  className,
}: PeriodSelectorProps) {
  // Filter out excluded values
  const filteredOptions = useMemo(() => {
    if (excludeValues.length === 0) {
      return options;
    }
    return options?.filter((opt) => !excludeValues.includes(opt.value)) ?? [];
  }, [options, excludeValues]);

  return (
    <Menu
      defaultValue={defaultValue}
      value={value}
      variant="breadcrumb"
      className={`!px-0 ${className ?? ''}`}
      onValueChange={onChange}
    >
      <MenuContent className="!px-0">
        {filteredOptions?.map((tab) => (
          <MenuItem
            key={tab.value}
            variant="menu2"
            value={tab.value}
            className="w-full flex items-center justify-center"
          >
            {tab.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

export default PeriodSelector;
