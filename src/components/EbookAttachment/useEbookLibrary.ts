import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  EbookLibraryFacets,
  EbookLibraryFilters,
  EbookLibraryItem,
  EbookLibraryPage,
} from '../../types/ebookAttachment';

/** Books per request; the backend accepts up to 50. */
export const EBOOK_LIBRARY_PAGE_SIZE = 24;

export interface UseEbookLibraryReturn {
  items: EbookLibraryItem[];
  total: number;
  facets: EbookLibraryFacets | null;
  /** First page of the current filters on its way */
  loading: boolean;
  /** A further page on its way */
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

/**
 * The staff library (`GET /ebooks/library`): the student books the caller's
 * institution may attach, searched and filtered, a page at a time. A change
 * of filters starts over from the first page; an answer to older filters is
 * dropped.
 *
 * @param apiClient - The host's API client
 * @param filters - Search, theme and segment
 * @returns The books loaded so far, the counts of the filters and the paging
 */
export const useEbookLibrary = (
  apiClient: BaseApiClient,
  filters: EbookLibraryFilters
): UseEbookLibraryReturn => {
  const [items, setItems] = useState<EbookLibraryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<EbookLibraryFacets | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number) => {
      const request = ++requestRef.current;
      const isFirst = pageToLoad === 1;
      if (isFirst) setLoading(true);
      else setLoadingMore(true);
      setError(false);
      try {
        const response = await apiClient.get<{ data: EbookLibraryPage }>(
          '/ebooks/library',
          {
            params: {
              page: pageToLoad,
              limit: EBOOK_LIBRARY_PAGE_SIZE,
              ...(filters.search.trim() && { search: filters.search.trim() }),
              ...(filters.theme && { theme: filters.theme }),
              ...(filters.segment && { segment: filters.segment }),
            },
          }
        );
        if (request !== requestRef.current) return;
        const data = response.data.data;
        setItems((previous) =>
          isFirst ? data.items : [...previous, ...data.items]
        );
        setTotal(data.total);
        setFacets(data.facets);
        setPage(pageToLoad);
      } catch {
        if (request === requestRef.current) setError(true);
      } finally {
        if (request === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [apiClient, filters.search, filters.theme, filters.segment]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage, attempt]);

  const hasMore = items.length < total;
  const loadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) fetchPage(page + 1);
  }, [hasMore, loading, loadingMore, fetchPage, page]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return {
    items,
    total,
    facets,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  };
};
