export interface MultiSearchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Shape of a server-side paginated option source.
 *
 * Mirrors `SearchSelectPagination` so a caller can hand the same object to
 * either component.
 */
export interface MultiSearchSelectPagination {
  page: number;
  limit?: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev?: boolean;
  total: number;
}

export type MultiSearchSelectSize = 'small' | 'medium' | 'large';

export type MultiSearchSelectVariant = 'outlined' | 'underlined' | 'rounded';

export interface MultiSearchSelectProps {
  /** Currently selected values. */
  values: string[];
  /** Receives the full next selection, never a delta. */
  onValuesChange: (values: string[]) => void;
  /**
   * Options to pick from. Filtered locally unless `filterLocally` is false, in
   * which case the list is assumed to already reflect the current query.
   */
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
  /**
   * Called with the debounced query as the user types. Supplying it is what
   * makes the search server-side; pair it with `filterLocally={false}` so the
   * already-filtered response is not filtered a second time on the client.
   */
  onSearch?: (query: string) => void;
  /** Debounce applied to `onSearch`, in ms. */
  searchDebounce?: number;
  /** Page state of the option source; drives infinite scroll and the footer. */
  pagination?: MultiSearchSelectPagination;
  /** Called when the list is scrolled near the bottom and `hasNext` is true. */
  onLoadMore?: () => void | Promise<void>;
  /** True while the next page is in flight. */
  loadingMore?: boolean;
  /**
   * Filter `options` by the typed query on the client. Defaults to true, which
   * is the right answer for a fully loaded list. Set false when the options
   * come back already filtered by `onSearch` — otherwise the local pass runs
   * over a single page and hides results the server did return.
   */
  filterLocally?: boolean;
}
