import { useEffect } from 'react';

export interface ZendeskWidgetProps {
  zendeskKey: string;
}

export const ZendeskWidget = ({ zendeskKey }: ZendeskWidgetProps) => {
  useEffect(() => {
    if (!zendeskKey) return;

    if (document.getElementById('ze-snippet')) return;

    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
    script.async = true;

    script.onload = () => {
      const zE = (window as unknown as Record<string, unknown>).zE as
        | ((...args: unknown[]) => void)
        | undefined;
      if (zE) {
        zE('messenger:set', 'locale', 'pt-BR');
      }
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('ze-snippet');
      if (existingScript) {
        existingScript.remove();
      }
      const zE = (window as unknown as Record<string, unknown>).zE as
        | ((...args: unknown[]) => void)
        | undefined;
      if (zE) {
        zE('messenger', 'close');
      }
    };
  }, [zendeskKey]);

  return null;
};
