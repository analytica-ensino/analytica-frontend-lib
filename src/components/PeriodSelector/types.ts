/**
 * Period tab configuration
 */
export interface PeriodTab {
  value: string;
  label: string;
}

/**
 * Default period tabs matching the design system
 */
export const PERIOD_OPTIONS = [
  { value: '7_DAYS', label: '7 dias' },
  { value: '1_MONTH', label: '1 mês' },
  { value: '3_MONTHS', label: '3 meses' },
  { value: '6_MONTHS', label: '6 meses' },
  { value: '1_YEAR', label: '1 ano' },
] as const;

/**
 * Period value type (derived from PERIOD_OPTIONS)
 */
export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value'];

/**
 * Props for PeriodSelector component
 */
export interface PeriodSelectorProps {
  /** Currently selected period value */
  value: string;
  /** Callback when period changes */
  onChange: (value: string) => void;
  /** Default value (used for uncontrolled mode) */
  defaultValue?: string;
  /** Custom period options (defaults to PERIOD_OPTIONS) */
  options?: readonly PeriodTab[];
  /** Period values to exclude from the list */
  excludeValues?: string[];
  /** Additional className for the container */
  className?: string;
}
