import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import type {
  SupportType,
  SupportFeatureFlags,
  SupportApiClient,
} from '@/types/support';

export interface UseSupportFeatureFlagConfig {
  apiClient: SupportApiClient;
}

export interface UseSupportFeatureFlagReturn {
  supportType: SupportType;
  loading: boolean;
  isZendesk: boolean;
  isNative: boolean;
  openZendeskChat: () => void;
}

export const useSupportFeatureFlag = (
  config: UseSupportFeatureFlagConfig
): UseSupportFeatureFlagReturn => {
  const [supportType, setSupportType] = useState<SupportType>('NATIVE');
  const [loading, setLoading] = useState(true);
  const { institutionId } = useAppStore();

  useEffect(() => {
    if (!institutionId) return;

    const fetchSupportFlag = async () => {
      try {
        const { data: response } = await config.apiClient.get<{
          data: { featureFlags: SupportFeatureFlags };
        }>(`/featureFlags/institution/${institutionId}/page/SUPPORT`);

        const type = response?.data?.featureFlags?.version?.supportType;
        if (type) {
          setSupportType(type);
        }
      } catch {
        setSupportType('NATIVE');
      } finally {
        setLoading(false);
      }
    };

    fetchSupportFlag();
  }, [institutionId]);

  const openZendeskChat = () => {
    if (
      typeof globalThis !== 'undefined' &&
      (globalThis as unknown as Record<string, unknown>).zE
    ) {
      (
        (globalThis as unknown as Record<string, unknown>).zE as (
          ...args: unknown[]
        ) => void
      )('messenger', 'open');
    }
  };

  return {
    supportType,
    loading,
    isZendesk: supportType === 'ZENDESK',
    isNative: supportType === 'NATIVE',
    openZendeskChat,
  };
};
