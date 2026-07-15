import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface ColumnFilterOption {
  value: string;
  label: ReactNode;
  /**
   * Text a local search matches against. Needed because `label` is a ReactNode
   * (a badge, an icon + text) and `value` is often an opaque id — neither is
   * searchable. Ignored when the config supplies `onSearch`, since the server
   * does the matching then.
   */
  searchText?: string;
}

export interface ColumnFilterConfig {
  /** Choices shown in the header menu. */
  options: ColumnFilterOption[];
  /** Allow more than one value at a time (default: false). */
  multiple?: boolean;
  /** Label of the "clear filter" entry at the top of the menu (default: "Todos"). */
  allLabel?: string;
  /**
   * Key this filter is emitted under in the table params — i.e. the field name
   * the API expects. Defaults to the column's `key`.
   */
  paramKey?: string;
  /**
   * Show a search box at the top of the menu.
   *
   * Needed whenever the option list is too long to scan — a school manager sees
   * over a thousand schools, and a plain list of those is unusable.
   */
  searchable?: boolean;
  /** Placeholder of the search box (default: "Buscar..."). */
  searchPlaceholder?: string;
  /**
   * Called (debounced) as the user types, for options fetched from a server.
   *
   * The consumer keeps owning `options`: it refreshes them as results arrive.
   * When omitted, a `searchable` menu filters the given `options` in place.
   */
  onSearch?: (query: string) => void;
  /** Show a loading state in the menu while the search is in flight. */
  loading?: boolean;
}

/** Minimum shape `useColumnFilters` needs out of a column definition. */
export interface FilterableColumn {
  key: string;
  filter?: ColumnFilterConfig;
}

export interface UseColumnFiltersOptions {
  /** Persist the active filters in the query string. */
  syncWithUrl?: boolean;
  /** Prefix for the URL keys, so two tables on one page don't collide. */
  urlKeyPrefix?: string;
  /** Called on every change (the TableProvider uses it to go back to page 1). */
  onFiltersChange?: () => void;
}

export interface UseColumnFiltersReturn {
  /** Active values per paramKey. Columns with no selection are absent. */
  columnFilters: Record<string, string[]>;
  /**
   * The same thing, shaped for the request: single-value filters unwrapped,
   * multi-value ones left as arrays. Stable identity — safe to spread into a
   * memo that feeds `onParamsChange`.
   */
  columnFilterParams: Record<string, string | string[]>;
  setColumnFilter: (paramKey: string, values: string[]) => void;
}

const urlKeyOf = (paramKey: string, prefix?: string) =>
  prefix ? `${prefix}_colfilter_${paramKey}` : `colfilter_${paramKey}`;

/**
 * State for the per-column filter menus rendered in the table header.
 *
 * Single-phase on purpose: picking a value applies it immediately. (The modal
 * filters in `useTableFilter` are two-phase — draft, then "Apply" — which is
 * the wrong shape for a dropdown that closes on selection.)
 */
export function useColumnFilters(
  columns: FilterableColumn[],
  options: UseColumnFiltersOptions = {}
): UseColumnFiltersReturn {
  const { syncWithUrl = false, urlKeyPrefix, onFiltersChange } = options;

  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  // Callers rarely memoize their column array, so keying off its identity would
  // re-run the effects below on every render. Key off what actually matters
  // instead: which columns filter, under which param, single or multiple.
  const signature = columns
    .filter((column) => column.filter)
    .map(
      (column) =>
        `${column.filter?.paramKey ?? column.key}:${column.filter?.multiple ? 'm' : 's'}`
    )
    .join('|');

  const filterSpecs = useMemo(
    () =>
      signature
        ? signature.split('|').map((entry) => {
            const [paramKey, mode] = entry.split(':');
            return { paramKey, multiple: mode === 'm' };
          })
        : [],
    [signature]
  );

  const readFromUrl = useCallback((): Record<string, string[]> => {
    if (!syncWithUrl || globalThis.window === undefined) return {};

    const params = new URLSearchParams(globalThis.location.search);
    const result: Record<string, string[]> = {};

    for (const { paramKey, multiple } of filterSpecs) {
      const raw = params.get(urlKeyOf(paramKey, urlKeyPrefix));
      const values = raw?.split(',').filter(Boolean) ?? [];
      if (values.length === 0) continue;

      // A hand-edited URL can carry several values for a single-select column.
      // The request would still go out with one (see columnFilterParams), but the
      // menu reads this state directly and would tick every one of them.
      result[paramKey] = multiple ? values : [values[0]];
    }

    return result;
  }, [syncWithUrl, urlKeyPrefix, filterSpecs]);

  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    () => readFromUrl()
  );

  useEffect(() => {
    if (!syncWithUrl || globalThis.window === undefined) return;

    const url = new URL(globalThis.location.href);

    for (const { paramKey } of filterSpecs) {
      const urlKey = urlKeyOf(paramKey, urlKeyPrefix);
      const values = columnFilters[paramKey];

      if (values?.length) {
        url.searchParams.set(urlKey, values.join(','));
      } else {
        url.searchParams.delete(urlKey);
      }
    }

    // Only touch history when something actually changed: mounting with no
    // active filter must leave the URL — and anyone else's params — alone.
    const next = url.toString();
    if (next !== globalThis.location.href) {
      globalThis.history.replaceState({}, '', next);
    }
  }, [columnFilters, filterSpecs, syncWithUrl, urlKeyPrefix]);

  useEffect(() => {
    if (!syncWithUrl || globalThis.window === undefined) return;

    const handlePopState = () => setColumnFilters(readFromUrl());

    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, [syncWithUrl, readFromUrl]);

  const setColumnFilter = useCallback((paramKey: string, values: string[]) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (values.length > 0) {
        next[paramKey] = values;
      } else {
        // An empty selection means "all": the key must vanish from the request
        // rather than go out as an empty string.
        delete next[paramKey];
      }
      return next;
    });

    onFiltersChangeRef.current?.();
  }, []);

  const columnFilterParams = useMemo(() => {
    const params: Record<string, string | string[]> = {};

    for (const { paramKey, multiple } of filterSpecs) {
      const values = columnFilters[paramKey];
      if (!values?.length) continue;
      params[paramKey] = multiple ? values : values[0];
    }

    return params;
  }, [columnFilters, filterSpecs]);

  return { columnFilters, columnFilterParams, setColumnFilter };
}
