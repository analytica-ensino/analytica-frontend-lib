import { useEffect, useMemo, useState } from 'react';
import type { EbookLibraryFilters } from '../../types/ebookAttachment';

/** Value of a filter that shows every option. */
export const ALL_EBOOKS_FILTER = 'all';
/** How long the search waits for the typing to stop. */
const SEARCH_DEBOUNCE_MS = 300;

export interface UseEbookLibraryFiltersReturn {
  /** What is typed in the search box */
  searchInput: string;
  setSearchInput: (value: string) => void;
  /** Theme code, or ALL_EBOOKS_FILTER */
  theme: string;
  setTheme: (value: string) => void;
  /** Segment, or ALL_EBOOKS_FILTER */
  segment: string;
  setSegment: (value: string) => void;
  /** What the staff library is asked for: the search once typing stops */
  filters: EbookLibraryFilters;
}

/**
 * The "Filtrar acervo" state of a staff library screen: theme, segment and a
 * search that only reaches the library once the typing stops.
 *
 * @returns The fields and the filters to load the library with
 */
export const useEbookLibraryFilters = (): UseEbookLibraryFiltersReturn => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(ALL_EBOOKS_FILTER);
  const [segment, setSegment] = useState(ALL_EBOOKS_FILTER);

  useEffect(() => {
    const timeout = setTimeout(
      () => setSearch(searchInput),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      search,
      theme: theme === ALL_EBOOKS_FILTER ? '' : theme,
      segment: segment === ALL_EBOOKS_FILTER ? '' : segment,
    }),
    [search, theme, segment]
  );

  return {
    searchInput,
    setSearchInput,
    theme,
    setTheme,
    segment,
    setSegment,
    filters,
  };
};
