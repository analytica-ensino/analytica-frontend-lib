import { useEffect, useState } from 'react';
import type { EbookWebViewBridge } from './bridge';
import {
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
  type EbookWebViewOpenCommand,
} from './protocol';
import { EbookWebViewReader } from './EbookWebViewReader';

/**
 * The page inside the WebView: tells the app it is ready, waits for the book
 * to open and shows it. Opening another book starts it over.
 */
export const EbookWebViewApp = ({
  bridge,
}: Readonly<{ bridge: EbookWebViewBridge }>) => {
  const [opened, setOpened] = useState<{
    command: EbookWebViewOpenCommand;
    key: number;
  } | null>(null);

  useEffect(
    () =>
      bridge.subscribe((command) => {
        if (command.type !== EBOOK_WEBVIEW_COMMAND.OPEN) return;
        setOpened((previous) => ({
          command,
          key: (previous?.key ?? 0) + 1,
        }));
      }),
    [bridge]
  );

  // After the subscription above: an OPEN sent on READY is never missed.
  useEffect(() => {
    bridge.post({ type: EBOOK_WEBVIEW_EVENT.READY });
  }, [bridge]);

  if (!opened) return null;
  const { command, key } = opened;
  return (
    <EbookWebViewReader
      key={key}
      content={command.content}
      initialSection={command.initialSection}
      theme={command.theme}
      bridge={bridge}
    />
  );
};
