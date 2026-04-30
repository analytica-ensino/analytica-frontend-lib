import { useEffect, useState } from 'react';
import type { BaseApiClient } from '../types/api';

export interface InstitutionData {
  id: string;
  name: string;
  companyName: string;
  type: string;
  domain: string;
  email: string;
  phone: string;
  active: boolean;
  mainLogo: string | null;
  internalLogo: string | null;
  icon: string | null;
  favicon: string | null;
  loginImage: string | null;
  theme: string | null;
  city: string | null;
  state: string | null;
}

export interface UseInstitutionConfig {
  apiClient: BaseApiClient;
  institutionId: string | null;
}

export function useInstitution(config: UseInstitutionConfig) {
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!config.institutionId) return;

    let cancelled = false;

    const fetchInstitution = async () => {
      setLoading(true);
      setInstitution(null);
      setError(null);
      try {
        const { data: response } = await config.apiClient.get<{
          data: InstitutionData;
        }>('/institution/filter', {
          params: { filter: config.institutionId },
        });
        if (!cancelled) setInstitution(response.data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInstitution();

    return () => {
      cancelled = true;
    };
  }, [config.institutionId, config.apiClient]);

  return { institution, loading, error };
}

export function useInstitutionId() {
  const [institutionId, setInstitutionId] = useState<string | null>(() => {
    return (
      document
        .querySelector('meta[name="institution-id"]')
        ?.getAttribute('content') ?? null
    );
  });

  useEffect(() => {
    const metaTag = document.querySelector('meta[name="institution-id"]');

    if (!metaTag) return;

    const observer = new MutationObserver(() => {
      const newValue = metaTag.getAttribute('content');
      setInstitutionId(newValue);
    });

    observer.observe(metaTag, {
      attributes: true,
      attributeFilter: ['content'],
    });

    return () => observer.disconnect();
  }, []);

  return institutionId;
}
