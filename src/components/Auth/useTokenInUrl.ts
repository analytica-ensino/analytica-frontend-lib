import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to check if authentication tokens are present in the URL
 *
 * @returns {object} Object with hasTokenInUrl boolean indicating if tokens are present
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
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const sessionId = searchParams.get('sessionId');

    return !!(token && refreshToken && sessionId);
  }, [location.search]);

  return { hasTokenInUrl };
}
