import { useEffect, useState, useRef } from 'react';
import { useBranding } from './useBranding';
import type { BrandingData } from '../store/brandingStore';

/**
 * Hook to fetch and apply institution branding before login
 * Uses the institutionId from meta tag to fetch branding data
 */
export const useInstitutionBranding = (
  api: { get: (endpoint: string, config?: unknown) => Promise<unknown> },
  institutionId: string | null
) => {
  const { initializeBranding, branding, getBranding } = useBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip if no institutionId or no api
    if (!institutionId || !api) {
      return;
    }

    // Check if branding already exists in localStorage
    const cachedBranding = getBranding();

    if (cachedBranding) {
      // Apply cached branding without fetching
      if (!fetchedRef.current) {
        initializeBranding(cachedBranding);
        fetchedRef.current = true;
      }
      return;
    }

    // Skip if already fetched
    if (fetchedRef.current) {
      return;
    }

    const fetchBranding = async () => {
      setIsLoading(true);
      setError(null);
      fetchedRef.current = true;

      try {
        const response = await api.get(
          `/auth/institution/${institutionId}/branding`,
          {}
        );

        // Handle Axios response structure (response.data.data)
        const axiosResponse = response as { data?: { data?: BrandingData } };
        const brandingPayload = axiosResponse.data?.data;

        if (brandingPayload) {
          const brandingData: BrandingData = {
            theme: brandingPayload.theme || null,
            favicon: brandingPayload.favicon || null,
            icon: brandingPayload.icon || null,
            mainLogo: brandingPayload.mainLogo || null,
            internalLogo: brandingPayload.internalLogo || null,
            loginImage: brandingPayload.loginImage || null,
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
  }, [institutionId, api]);

  return {
    isLoading,
    error,
    branding,
  };
};
