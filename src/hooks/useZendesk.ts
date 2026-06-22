import { useCallback, useEffect, useState } from 'react';

export interface UseZendeskConfig {
  /** Chave do canal Zendesk (snippet). */
  zendeskKey: string;
  /**
   * Carrega o messenger apenas quando `true` (ex.: suporte é ZENDESK).
   * Default: `true`.
   */
  enabled?: boolean;
}

export interface UseZendeskReturn {
  /** `true` quando o messenger (`window.zE`) está disponível para abrir. */
  ready: boolean;
  /** Abre o messenger do Zendesk. No-op enquanto não estiver pronto. */
  openChat: () => void;
}

const SCRIPT_ID = 'ze-snippet';
const INITIAL_RETRY_MS = 2000;
const MAX_RETRY_MS = 30_000;
const POLL_MS = 500;

type ZE = (...args: unknown[]) => void;

const getZE = (): ZE | undefined =>
  (globalThis as unknown as Record<string, unknown>).zE as ZE | undefined;

/**
 * Carrega o messenger do Zendesk de forma resiliente e isolada:
 * - injeta o snippet uma única vez (dedupe por id);
 * - se o script falhar (rede), re-injeta com backoff exponencial até carregar;
 * - sinaliza `ready` assim que `window.zE` fica disponível;
 * - `openChat` abre o messenger (no-op enquanto não estiver pronto).
 *
 * O loop de carregamento fica confinado a este hook — não bloqueia o restante
 * da página (form de login, Google, etc. funcionam independentemente).
 */
export const useZendesk = ({
  zendeskKey,
  enabled = true,
}: UseZendeskConfig): UseZendeskReturn => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !zendeskKey) return;

    let cancelled = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    function confirmReady(): boolean {
      const zE = getZE();
      if (!zE) return false;
      zE('messenger:set', 'locale', 'pt-BR');
      if (!cancelled) setReady(true);
      return true;
    }

    function scheduleRetry() {
      if (cancelled) return;
      const delay = Math.min(INITIAL_RETRY_MS * 2 ** attempt, MAX_RETRY_MS);
      attempt += 1;
      retryTimer = setTimeout(inject, delay);
    }

    function inject() {
      if (cancelled || confirmReady()) return;
      // Injeção já em andamento (script presente, ainda não falhou).
      if (document.getElementById(SCRIPT_ID)) return;

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
      script.async = true;
      script.onerror = () => {
        document.getElementById(SCRIPT_ID)?.remove();
        scheduleRetry();
      };
      document.body.appendChild(script);
    }

    inject();

    // Poll leve (sem rede) só para detectar quando o `zE` fica disponível.
    pollTimer = setInterval(() => {
      if (cancelled) return;
      if (confirmReady() && pollTimer) clearInterval(pollTimer);
    }, POLL_MS);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [zendeskKey, enabled]);

  const openChat = useCallback(() => {
    getZE()?.('messenger', 'open');
  }, []);

  return { ready, openChat };
};
