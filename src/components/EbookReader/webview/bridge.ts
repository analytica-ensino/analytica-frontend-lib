import {
  EBOOK_WEBVIEW_BRIDGE,
  parseEbookWebViewCommand,
  type EbookWebViewCommand,
  type EbookWebViewEvent,
} from './protocol';

/** What the reader page exposes to the app, under EBOOK_WEBVIEW_BRIDGE. */
export interface EbookWebViewGlobalBridge {
  /** Takes one command, as an object or as JSON text */
  receive: (command: unknown) => void;
}

declare global {
  interface Window {
    /** Set by react-native-webview inside the WebView */
    ReactNativeWebView?: { postMessage: (message: string) => void };
    [EBOOK_WEBVIEW_BRIDGE]?: EbookWebViewGlobalBridge;
  }
}

export type EbookWebViewListener = (command: EbookWebViewCommand) => void;

/** The two directions of the bridge, as the reader uses them. */
export interface EbookWebViewBridge {
  /** Listens to the app's commands; returns the way to stop */
  subscribe: (listener: EbookWebViewListener) => () => void;
  /** Sends an event to the app */
  post: (event: EbookWebViewEvent) => void;
}

/**
 * Exposes the bridge on the page and returns the reader's side of it.
 * Commands that are not valid are dropped; without a React Native WebView
 * around the page (a browser), events go nowhere.
 * @param target - The page's window
 */
export const installEbookWebViewBridge = (
  target: Window = globalThis.window
): EbookWebViewBridge => {
  const listeners = new Set<EbookWebViewListener>();
  target[EBOOK_WEBVIEW_BRIDGE] = {
    receive: (raw) => {
      const command = parseEbookWebViewCommand(raw);
      if (!command) return;
      listeners.forEach((listener) => listener(command));
    },
  };
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    post: (event) => {
      target.ReactNativeWebView?.postMessage(JSON.stringify(event));
    },
  };
};
