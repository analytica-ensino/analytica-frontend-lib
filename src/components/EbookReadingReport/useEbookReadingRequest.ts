import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type { EbookReadingResponse } from './types';

/** Where one report route is. */
export interface EbookReadingRequestState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

export interface UseEbookReadingRequestReturn<
  T,
> extends EbookReadingRequestState<T> {
  /** Asks again with the same body */
  retry: () => void;
}

/**
 * One route of the ebook reading report: posts `body` and keeps the answer.
 * A new body asks again, and only the answer to the latest request is kept,
 * so a late answer to an old filter never overwrites the current one. While
 * a new answer is on the way, the last one stays on screen.
 * @param {BaseApiClient} api - The app's API client
 * @param {string} route - The report route
 * @param {object | null} body - The request body; `null` asks nothing
 * @returns {UseEbookReadingRequestReturn<T>} The answer, and how to retry
 */
export const useEbookReadingRequest = <T>(
  api: BaseApiClient,
  route: string,
  body: object | null
): UseEbookReadingRequestReturn<T> => {
  const [state, setState] = useState<EbookReadingRequestState<T>>({
    data: null,
    loading: body !== null,
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  const latestRef = useRef(0);
  // The body by value: a new object with the same filters asks nothing.
  const bodyKey = body === null ? null : JSON.stringify(body);

  useEffect(() => {
    const request = ++latestRef.current;
    if (bodyKey === null) {
      setState({ data: null, loading: false, error: false });
      return;
    }
    setState((current) => ({ ...current, loading: true, error: false }));
    api
      .post<EbookReadingResponse<T>>(route, JSON.parse(bodyKey))
      .then((response) => {
        if (request !== latestRef.current) return;
        setState({ data: response.data.data, loading: false, error: false });
      })
      .catch(() => {
        if (request !== latestRef.current) return;
        setState((current) => ({ ...current, loading: false, error: true }));
      });
  }, [api, route, bodyKey, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, retry };
};
