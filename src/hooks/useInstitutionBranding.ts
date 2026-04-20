import { useEffect, useState, useRef } from 'react';
import { useBranding } from './useBranding';
import type { BrandingData } from '../types/branding';

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

    // Check if branding already exists in localStorage for this institution
    const cachedBranding = getBranding();

    if (cachedBranding?.institutionId === institutionId) {
      // Apply cached branding without fetching (only if it's for the same institution)
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
          `/institution/filter?filter=${institutionId}`,
          {}
        );

        // Handle Axios response structure (response.data.data)
        const axiosResponse = response as {
          data?: {
            data?: {
              id: string;
              theme?: string | null;
              favicon?: string | null;
              icon?: string | null;
              mainLogo?: string | null;
              internalLogo?: string | null;
              loginImage?: string | null;
            };
          };
        };
        const institution = axiosResponse.data?.data;

        if (institution) {
          const brandingData: BrandingData = {
            institutionId,
            theme: institution.theme || null,
            favicon: institution.favicon || null,
            icon: institution.icon || null,
            mainLogo: institution.mainLogo || null,
            internalLogo: institution.internalLogo || null,
            loginImage: institution.loginImage || null,
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
