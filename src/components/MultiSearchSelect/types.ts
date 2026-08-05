export interface MultiSearchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type MultiSearchSelectSize = 'small' | 'medium' | 'large';

export type MultiSearchSelectVariant = 'outlined' | 'underlined' | 'rounded';

export interface MultiSearchSelectProps {
  /** Currently selected values. */
  values: string[];
  /** Receives the full next selection, never a delta. */
  onValuesChange: (values: string[]) => void;
  /** Options to pick from. Filtering happens locally. */
  options: MultiSearchSelectOption[];
  /** Caption rendered above the field. */
  label?: string;
  /** Shown inside the trigger while nothing is selected. */
  placeholder?: string;
  /** Placeholder of the search field inside the dropdown. */
  searchPlaceholder?: string;
  /** Shown when there is nothing left to pick. */
  emptyText?: string;
  /** Shown while `loading` is true. */
  loadingText?: string;
  /** Chip caption for a selected value that is missing from `options`. */
  unknownValueLabel?: string;
  /** Hint rendered below the field, hidden while `errorMessage` is set. */
  helperText?: string;
  /** Error rendered below the field; also marks the trigger as invalid. */
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: MultiSearchSelectSize;
  variant?: MultiSearchSelectVariant;
  className?: string;
  id?: string;
  /** How many chips to render before collapsing the rest into a "+N" chip. */
  maxVisibleChips?: number;
}
