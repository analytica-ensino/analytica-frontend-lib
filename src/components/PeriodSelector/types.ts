/**
 * Period enum for time-based filtering
 */
export enum Period {
  SEVEN_DAYS = '7_DAYS',
  ONE_MONTH = '1_MONTH',
  THREE_MONTHS = '3_MONTHS',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
}

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
  { value: Period.SEVEN_DAYS, label: '7 dias' },
  { value: Period.ONE_MONTH, label: '1 mês' },
  { value: Period.THREE_MONTHS, label: '3 meses' },
  { value: Period.SIX_MONTHS, label: '6 meses' },
  { value: Period.ONE_YEAR, label: '1 ano' },
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
