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

interface UseInstitutionConfig {
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
    setLoading(true);

    config.apiClient
      .get<{ data: InstitutionData }>(`/institution/filter?filter=${config.institutionId}`)
      .then(({ data: response }) => {
        if (!cancelled) setInstitution(response.data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.institutionId]);

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
