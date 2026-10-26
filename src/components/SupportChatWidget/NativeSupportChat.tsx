import { useMemo } from 'react';
import { SupportChatWidget } from './SupportChatWidget';
import { createGuestSupportChatAdapter } from './guestSupportChatAdapter';
import { useSupportFeatureFlag } from '../../hooks/useSupportFeatureFlag';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { SupportType, type SupportApiClient } from '../../types/support';
import type {
  SupportChatHttpClient,
  SupportChatTheme,
} from '../../types/supportChat';

export interface NativeSupportChatProps {
  /** Client of the backend API (the app axios instance fits as it is) */
  apiClient: SupportApiClient & SupportChatHttpClient;
  /** App the chat runs in, sent with the ticket (e.g. "aluno", "login") */
  channel: string;
  /**
   * Extra condition of the app to show the chat, on top of the SUPPORT flag
   * (e.g. logged in and with the support module). Default: true.
   */
  enabled?: boolean;
  /**
   * Link of a FAQ article. Default: the FAQ address of the SUPPORT flag
   * (`<faqUrl>/artigo/<id>`).
   */
  faqArticleUrl?: (articleId: string) => string;
  /** Support WebSocket; without it the chat polls the REST API */
  wsUrl?: string;
  theme?: SupportChatTheme;
}

/**
 * Native support chat ready to drop in an app: reads the SUPPORT feature flag
 * of the institution (from the app store), the logged user (from the auth
 * store) and talks to the support API by itself.
 *
 * Shown only when the institution uses the native support with the internal
 * support and its chat switched on in the backoffice, once the flag is read,
 * and when `enabled`. With Zendesk it renders nothing (the app loads the
 * Zendesk widget). A logged user opens the ticket with their name and e-mail;
 * a visitor gives them to the AI on the first contact.
 *
 * @example
 * <NativeSupportChat apiClient={api} channel="aluno" enabled={hasSupport} />
 */
export const NativeSupportChat = ({
  apiClient,
  channel,
  enabled = true,
  faqArticleUrl,
  wsUrl,
  theme,
}: NativeSupportChatProps) => {
  const { institutionId } = useAppStore();
  const userName = useAuthStore(
    (state) => state.user?.name ?? state.sessionInfo?.userName
  );
  const userEmail = useAuthStore((state) => state.user?.email);
  const flag = useSupportFeatureFlag({ apiClient });
  const adapter = useMemo(
    () => createGuestSupportChatAdapter({ apiClient, wsUrl }),
    [apiClient, wsUrl]
  );

  const user =
    userName || userEmail ? { name: userName, email: userEmail } : undefined;

  return (
    <SupportChatWidget
      adapter={adapter}
      channel={channel}
      institutionId={institutionId || undefined}
      user={user}
      theme={theme}
      faqArticleUrl={faqArticleUrl ?? flag.faqArticleUrl}
      flags={{
        enabled: enabled && !flag.loading && flag.isNative && flag.chatEnabled,
        supportType: flag.isNative ? SupportType.NATIVE : SupportType.ZENDESK,
      }}
    />
  );
};
