import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to check if authentication tokens (or the hand-off code) are present in the URL
 *
 * @returns {object} Object with hasTokenInUrl boolean indicating if tokens or a code are present
 *
 * @example
 * ```typescript
 * const { hasTokenInUrl } = useTokenInUrl();
 *
 * if (hasTokenInUrl) {
 *   // Show loading/validation component
 * }
 * ```
 */
export function useTokenInUrl() {
  const location = useLocation();

  const hasTokenInUrl = useMemo(() => {
    // Single-use hand-off code sent by the login app and the backoffice.
    // Tokens in the URL are no longer accepted (useUrlAuthentication)
    return new URLSearchParams(location.search).has('authCode');
  }, [location.search]);

  return { hasTokenInUrl };
}
