import { useEffect, useState, useRef } from 'react';
import { useBranding } from './useBranding';
import type { BrandingData } from '../store/brandingStore';

/**
 * Hook to fetch and apply institution branding before login
 * Uses the institutionId from meta tag to fetch branding data
 */
export const useInstitutionBranding = (apiUrl: string, institutionId: string | null) => {
  const { initializeBranding, branding } = useBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip if already fetched, no institutionId, or branding already loaded
    if (fetchedRef.current || !institutionId || branding) {
      return;
    }

    const fetchBranding = async () => {
      setIsLoading(true);
      setError(null);
      fetchedRef.current = true;

      try {
        const response = await fetch(
          `${apiUrl}/auth/institution/${institutionId}/branding`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch branding: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const brandingData: BrandingData = {
            theme: result.data.theme || null,
            favicon: result.data.favicon || null,
            icon: result.data.icon || null,
            mainLogo: result.data.mainLogo || null,
            internalLogo: result.data.internalLogo || null,
            loginImage: result.data.loginImage || null,
          };

          initializeBranding(brandingData);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('Error fetching institution branding:', error);
        fetchedRef.current = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [institutionId, apiUrl, branding, initializeBranding]);

  return {
    isLoading,
    error,
    branding,
  };
};
