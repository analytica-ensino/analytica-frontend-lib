import { useEffect } from 'react';

let zendeskWidgetCount = 0;

export interface ZendeskWidgetProps {
  zendeskKey: string;
}

/** @internal Exposed for testing only */
export const _resetWidgetCount = () => {
  zendeskWidgetCount = 0;
};

export const ZendeskWidget = ({ zendeskKey }: ZendeskWidgetProps) => {
  useEffect(() => {
    if (!zendeskKey) return;

    zendeskWidgetCount++;

    if (!document.getElementById('ze-snippet')) {
      const script = document.createElement('script');
      script.id = 'ze-snippet';
      script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
      script.async = true;

      script.onload = () => {
        const zE = (globalThis as unknown as Record<string, unknown>).zE as
          | ((...args: unknown[]) => void)
          | undefined;
        if (zE) {
          zE('messenger:set', 'locale', 'pt-BR');
        }
      };

      document.body.appendChild(script);
    }

    return () => {
      zendeskWidgetCount--;

      if (zendeskWidgetCount <= 0) {
        zendeskWidgetCount = 0;
        const existingScript = document.getElementById('ze-snippet');
        if (existingScript) {
          existingScript.remove();
        }
        const zE = (globalThis as unknown as Record<string, unknown>).zE as
          | ((...args: unknown[]) => void)
          | undefined;
        if (zE) {
          zE('messenger', 'close');
        }
      }
    };
  }, [zendeskKey]);

  return null;
};
