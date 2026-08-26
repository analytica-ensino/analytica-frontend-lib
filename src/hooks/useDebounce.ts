import { useEffect, useState } from 'react';

/**
 * Debounce a value: returns the last one that stayed put for `delay` ms.
 *
 * Used by the searchable selects to turn a per-keystroke query into one
 * request. Shared so `SearchSelect` and `MultiSearchSelect` cannot drift apart
 * on timing.
 *
 * @param value - Value to debounce
 * @param delay - Quiet period in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const debouncedQuery = useDebounce(query, 300);
 * useEffect(() => onSearch(debouncedQuery), [debouncedQuery, onSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
