import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type {
  ProfileLabelsMap,
  ProfileLabelsApiClient,
  ProfileLabelsFlagVersion,
} from '../types/profileLabels';
import { PROFILE_ROLES } from '../types/chat';

export interface UseProfileLabelsConfig {
  apiClient: ProfileLabelsApiClient;
}

export interface UseProfileLabelsReturn {
  customLabels: ProfileLabelsMap | undefined;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch custom profile labels from the PROFILE_LABELS feature flag.
 * Returns a map of profile roles to their institution-specific custom names.
 */
export const useProfileLabels = (
  config: UseProfileLabelsConfig
): UseProfileLabelsReturn => {
  const [customLabels, setCustomLabels] = useState<
    ProfileLabelsMap | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { institutionId } = useAppStore();

  useEffect(() => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    const fetchProfileLabels = async () => {
      try {
        const { data: response } = await config.apiClient.get<{
          data: { featureFlags: { version: ProfileLabelsFlagVersion } };
        }>(`/featureFlags/institution/${institutionId}/page/PROFILE_LABELS`);

        const version = response?.data?.featureFlags?.version;
        if (version && typeof version === 'object') {
          const labels: ProfileLabelsMap = {};
          for (const role of Object.values(PROFILE_ROLES)) {
            const label = version[role];
            if (typeof label === 'string' && label.trim()) {
              labels[role] = label.trim();
            }
          }
          setCustomLabels(Object.keys(labels).length > 0 ? labels : undefined);
        } else {
          setCustomLabels(undefined);
        }
      } catch {
        // Feature flag doesn't exist or API error - use default labels
        setCustomLabels(undefined);
        setError(null); // Don't surface error since missing flag is expected
      } finally {
        setLoading(false);
      }
    };

    fetchProfileLabels();
  }, [institutionId, config.apiClient]);

  return {
    customLabels,
    loading,
    error,
  };
};
