import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { PROFILE_ROLES } from '../types/chat';
import {
  DEFAULT_PROFILE_LABELS,
  getProfileLabel as resolveProfileLabel,
  type ProfileLabelsMap,
  type ProfileLabelsFeatureFlag,
} from '../types/profileLabels';
import type { BaseApiClient } from '../types/api';

export interface UseProfileLabelsConfig {
  apiClient: Pick<BaseApiClient, 'get'>;
}

export interface UseProfileLabelsReturn {
  /** Full resolved label map (custom labels merged over the defaults). */
  labels: Record<PROFILE_ROLES, string>;
  /**
   * Only the institution's explicit overrides (the raw feature flag `version`),
   * with no defaults merged in. Use this when a consumer has its own fallback
   * label and only wants to replace it when the institution customized it.
   */
  customLabels: ProfileLabelsMap;
  /** Resolve a single role's display label using the resolved map. */
  getProfileLabel: (role: PROFILE_ROLES | string) => string;
  loading: boolean;
}

/**
 * Resolve the institution's custom profile nomenclatura (PROFILE_LABELS feature
 * flag) and expose a label map + resolver. Falls back to DEFAULT_PROFILE_LABELS
 * when the institution has no custom labels, so apps render correctly even
 * without the flag.
 *
 * Mirrors `useSupportFeatureFlag`: `institutionId` comes from `useAppStore` and
 * the HTTP client is injected so each app passes its authenticated instance.
 *
 * @example
 * ```tsx
 * const { getProfileLabel } = useProfileLabels({ apiClient });
 * <span>{getProfileLabel(PROFILE_ROLES.STUDENT)}</span> // "Estudante"
 * ```
 */
export const useProfileLabels = (
  config: UseProfileLabelsConfig
): UseProfileLabelsReturn => {
  const [customLabels, setCustomLabels] = useState<ProfileLabelsMap>({});
  const [loading, setLoading] = useState(true);
  const { institutionId } = useAppStore();

  useEffect(() => {
    // Clear the previous institution's labels so we never render stale
    // nomenclatura while the next fetch is in flight (or when it goes null).
    setCustomLabels({});

    if (!institutionId) {
      setLoading(false);
      return;
    }

    // Guard against out-of-order responses: a slower earlier request must not
    // overwrite the labels of a newer institutionId.
    let active = true;
    setLoading(true);

    const fetchProfileLabels = async () => {
      try {
        const { data: response } = await config.apiClient.get<{
          data: { featureFlags: ProfileLabelsFeatureFlag };
        }>(`/featureFlags/institution/${institutionId}/page/PROFILE_LABELS`);

        if (!active) return;
        const version = response?.data?.featureFlags?.version;
        setCustomLabels(version ?? {});
      } catch {
        if (active) setCustomLabels({});
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfileLabels();

    return () => {
      active = false;
    };
  }, [institutionId, config.apiClient]);

  const labels = useMemo(
    () => ({ ...DEFAULT_PROFILE_LABELS, ...customLabels }),
    [customLabels]
  );

  const getProfileLabel = useMemo(
    () => (role: PROFILE_ROLES | string) => resolveProfileLabel(role, labels),
    [labels]
  );

  return { labels, customLabels, getProfileLabel, loading };
};
