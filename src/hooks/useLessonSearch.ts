import { useState, useCallback, useRef, useEffect } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  LessonSearchResultItem,
  LessonSearchResponse,
  LessonSearchQuery,
} from '../types/lessonsCatalog';

/** Minimum number of characters before a search is fired. */
export const MIN_SEARCH_LENGTH = 3;

/** Debounce window (ms) applied before hitting the backend. */
export const SEARCH_DEBOUNCE_MS = 400;

export interface UseLessonSearchReturn {
  results: LessonSearchResultItem[];
  loading: boolean;
  error: string | null;
  /** Whether the current term is long enough to have triggered a search. */
  hasSearched: boolean;
  /**
   * Debounced search. Fires only when the trimmed term has at least
   * MIN_SEARCH_LENGTH characters; shorter terms clear the results.
   */
  search: (query: string, subjectId?: string) => void;
  /** Reset results/error and cancel any pending debounced request. */
  clear: () => void;
}

/**
 * Build the hook for the dynamic lesson search (`GET /knowledge/search`).
 *
 * Debounces input (SEARCH_DEBOUNCE_MS), only queries the backend once the term
 * reaches MIN_SEARCH_LENGTH, and discards out-of-order responses via a request
 * counter so a slow earlier request never overwrites a newer one.
 *
 * The backend scopes results by profile, so the same hook serves the student's
 * trail and the teacher's/manager's preview.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns A hook taking an optional subject to scope every search to (used on
 * the topics screen, where the search is limited to the current subject)
 *
 * @example
 * ```typescript
 * const useLessonSearch = useMemo(() => createUseLessonSearch(api), [api]);
 * const { results, search } = useLessonSearch(subjectId);
 * ```
 */
export const createUseLessonSearch =
  (apiClient: BaseApiClient) =>
  (defaultSubjectId?: string): UseLessonSearchReturn => {
    const [results, setResults] = useState<LessonSearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce timer + monotonically increasing request id for stale-response
    // rejection. Both live in refs so they survive re-renders without retriggering.
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestIdRef = useRef(0);

    const clearDebounce = useCallback(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    }, []);

    const runSearch = useCallback(async (query: string, subjectId?: string) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const params: LessonSearchQuery = { query };
        if (subjectId) {
          params.subjectId = subjectId;
        }
        const response = await apiClient.get<LessonSearchResponse>(
          '/knowledge/search',
          { params: params as unknown as Record<string, unknown> }
        );
        // Ignore if a newer request has been issued since this one started.
        if (requestId !== requestIdRef.current) return;
        setResults(response.data.data.lessons);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err && typeof err === 'object' && 'response' in err
            ? ((err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Erro ao buscar aulas')
            : 'Erro ao buscar aulas';
        setError(message);
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, []);

    const search = useCallback(
      (query: string, subjectId?: string) => {
        clearDebounce();
        const trimmed = query.trim();

        if (trimmed.length < MIN_SEARCH_LENGTH) {
          // Too short: cancel any in-flight request and clear results.
          requestIdRef.current++;
          setResults([]);
          setError(null);
          setLoading(false);
          setHasSearched(false);
          return;
        }

        setHasSearched(true);
        debounceRef.current = setTimeout(() => {
          runSearch(trimmed, subjectId ?? defaultSubjectId);
        }, SEARCH_DEBOUNCE_MS);
      },
      [clearDebounce, runSearch, defaultSubjectId]
    );

    const clear = useCallback(() => {
      clearDebounce();
      requestIdRef.current++;
      setResults([]);
      setError(null);
      setLoading(false);
      setHasSearched(false);
    }, [clearDebounce]);

    // Cancel any pending debounce on unmount.
    useEffect(() => clearDebounce, [clearDebounce]);

    return { results, loading, error, hasSearched, search, clear };
  };
