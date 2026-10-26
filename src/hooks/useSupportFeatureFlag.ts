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
  /**
   * Support channel chosen for the institution. `null` while the flag loads
   * and when it could not be read (5xx, network, timeout): in that case no
   * support entry point should be shown, instead of silently falling back to
   * the native form for an institution that chose Zendesk.
   */
  supportType: SupportType | null;
  loading: boolean;
  isZendesk: boolean;
  isNative: boolean;
  /**
   * Key do Web Widget do Zendesk da instituição. `undefined` enquanto a flag
   * carrega, quando o suporte é NATIVE, ou quando a instituição usa Zendesk
   * mas ainda não teve a key preenchida no backoffice.
   */
  zendeskKey: string | undefined;
  /**
   * Link of a FAQ article of the institution (`<faqUrl>/artigo/<id>`), for
   * the support chat. `undefined` while loading or when the institution has
   * no FAQ address.
   */
  faqArticleUrl: ((articleId: string) => string) | undefined;
  /**
   * Whether the native support chat may be shown: the institution kept the
   * internal support ("Suporte interno ativo") and its chat switched on in the
   * backoffice. A flag without these fields keeps them on; `false` while the
   * flag loads or when it could not be read. Only meaningful with `isNative`.
   */
  chatEnabled: boolean;
  openZendeskChat: () => void;
}

/**
 * A missing SUPPORT flag answers 404: the institution never chose a channel,
 * so it keeps the native default. Any other failure means we do not know the
 * choice.
 */
const isFlagNotFound = (error: unknown): boolean =>
  (error as { response?: { status?: number } } | null)?.response?.status ===
  404;

export const useSupportFeatureFlag = (
  config: UseSupportFeatureFlagConfig
): UseSupportFeatureFlagReturn => {
  const [supportType, setSupportType] = useState<SupportType | null>(null);
  const [zendeskKey, setZendeskKey] = useState<string | undefined>(undefined);
  const [faqUrl, setFaqUrl] = useState<string | undefined>(undefined);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { institutionId } = useAppStore();

  useEffect(() => {
    if (!institutionId) {
      setSupportType(SupportType.NATIVE);
      setChatEnabled(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchSupportFlag = async () => {
      try {
        const { data: response } = await config.apiClient.get<{
          data: { featureFlags: SupportFeatureFlags };
        }>(`/featureFlags/institution/${institutionId}/page/SUPPORT`);

        const version = response?.data?.featureFlags?.version;
        setSupportType(version?.supportType ?? SupportType.NATIVE);
        setZendeskKey(version?.zendeskKey || undefined);
        setFaqUrl(version?.faqUrl?.trim().replace(/\/+$/, '') || undefined);
        setChatEnabled(version?.enabled !== false && version?.chat !== false);
      } catch (error) {
        const notFound = isFlagNotFound(error);
        setSupportType(notFound ? SupportType.NATIVE : null);
        setZendeskKey(undefined);
        setFaqUrl(undefined);
        setChatEnabled(notFound);
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
    faqArticleUrl: faqUrl
      ? (articleId: string) => `${faqUrl}/artigo/${articleId}`
      : undefined,
    chatEnabled,
    openZendeskChat,
  };
};
