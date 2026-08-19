import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import {
  SupportType,
  type SupportFeatureFlags,
  type SupportApiClient,
} from '../types/support';

export interface UseSupportFeatureFlagConfig {
  apiClient: SupportApiClient;
}

export interface UseSupportFeatureFlagReturn {
  supportType: SupportType;
  loading: boolean;
  isZendesk: boolean;
  isNative: boolean;
  /**
   * Key do Web Widget do Zendesk da instituição. `undefined` enquanto a flag
   * carrega, quando o suporte é NATIVE, ou quando a instituição usa Zendesk
   * mas ainda não teve a key preenchida no backoffice.
   */
  zendeskKey: string | undefined;
  openZendeskChat: () => void;
}

export const useSupportFeatureFlag = (
  config: UseSupportFeatureFlagConfig
): UseSupportFeatureFlagReturn => {
  const [supportType, setSupportType] = useState<SupportType>(
    SupportType.NATIVE
  );
  const [zendeskKey, setZendeskKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { institutionId } = useAppStore();

  useEffect(() => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    const fetchSupportFlag = async () => {
      try {
        const { data: response } = await config.apiClient.get<{
          data: { featureFlags: SupportFeatureFlags };
        }>(`/featureFlags/institution/${institutionId}/page/SUPPORT`);

        const version = response?.data?.featureFlags?.version;
        if (version?.supportType) {
          setSupportType(version.supportType);
        }
        setZendeskKey(version?.zendeskKey || undefined);
      } catch {
        setSupportType(SupportType.NATIVE);
        setZendeskKey(undefined);
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
    isZendesk: supportType === SupportType.ZENDESK,
    isNative: supportType === SupportType.NATIVE,
    zendeskKey,
    openZendeskChat,
  };
};
