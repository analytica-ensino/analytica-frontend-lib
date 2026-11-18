import type { EbookContent, EbookPageChange } from '../types';
import type { EbookLayout, EbookTocEntry } from '../useEbookBook';

/**
 * How the app talks to the reader inside a React Native WebView (AE-3323).
 *
 * The app sends commands by calling `window[EBOOK_WEBVIEW_BRIDGE].receive`
 * (`injectJavaScript`); the reader answers through
 * `window.ReactNativeWebView.postMessage`, one JSON event per message.
 */

/** Global the app calls to send a command into the WebView. */
export const EBOOK_WEBVIEW_BRIDGE = 'ebookReaderBridge';

/** What the app asks the reader to do. */
export const EBOOK_WEBVIEW_COMMAND = {
  /** Shows a book, at a section; the reader waits for it after `ready` */
  OPEN: 'open',
  NEXT: 'next',
  PREVIOUS: 'previous',
  /** Opens the page of a section or element id (a contents entry) */
  GO_TO: 'goTo',
  /** Book layout ↔ scroll */
  TOGGLE_LAYOUT: 'toggleLayout',
  /** "Ouvir" / "Parar" */
  TOGGLE_NARRATION: 'toggleNarration',
  TOGGLE_AUDIO_DESCRIPTION: 'toggleAudioDescription',
} as const;

/** What the reader tells the app. */
export const EBOOK_WEBVIEW_EVENT = {
  /** The page is loaded and waits for OPEN */
  READY: 'ready',
  /** Everything the app's controls show, whenever it changes */
  STATE: 'state',
  /** The pages on screen changed: what the reading telemetry reports */
  PAGE_CHANGE: 'pageChange',
} as const;

/** Theme of the book; the app passes its own. */
export type EbookWebViewTheme = 'light' | 'dark';

export interface EbookWebViewOpenCommand {
  type: typeof EBOOK_WEBVIEW_COMMAND.OPEN;
  content: EbookContent;
  /** Section (`data-section`) to open at: where the student left off */
  initialSection?: string;
  theme?: EbookWebViewTheme;
}

export type EbookWebViewCommand =
  | EbookWebViewOpenCommand
  | { type: typeof EBOOK_WEBVIEW_COMMAND.NEXT }
  | { type: typeof EBOOK_WEBVIEW_COMMAND.PREVIOUS }
  | { type: typeof EBOOK_WEBVIEW_COMMAND.GO_TO; target: string }
  | { type: typeof EBOOK_WEBVIEW_COMMAND.TOGGLE_LAYOUT }
  | { type: typeof EBOOK_WEBVIEW_COMMAND.TOGGLE_NARRATION }
  | { type: typeof EBOOK_WEBVIEW_COMMAND.TOGGLE_AUDIO_DESCRIPTION };

/** The reader as the app's header and footer show it. */
export interface EbookWebViewState {
  layout: EbookLayout;
  /** False for materials that only scroll */
  hasBookLayout: boolean;
  pageIndex: number;
  pageCount: number;
  spread: boolean;
  /** "Capa", "3 de 24", "Contracapa" */
  pageLabel: string;
  /** Share of the book behind the page on screen, 0–100 */
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
  /** The book's contents, for the "Sumário" sheet */
  toc: EbookTocEntry[];
  activeTocTarget?: string;
  hasNarration: boolean;
  isPlaying: boolean;
  hasAudioDescription: boolean;
  withAudioDescription: boolean;
}

export type EbookWebViewEvent =
  | { type: typeof EBOOK_WEBVIEW_EVENT.READY }
  | { type: typeof EBOOK_WEBVIEW_EVENT.STATE; state: EbookWebViewState }
  | { type: typeof EBOOK_WEBVIEW_EVENT.PAGE_CHANGE; page: EbookPageChange };

const COMMAND_TYPES = new Set<string>(Object.values(EBOOK_WEBVIEW_COMMAND));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * The command the app sent, or `null` for anything that is not one. A command
 * may come as an object or as its JSON text.
 * @param raw - What reached the bridge
 */
export const parseEbookWebViewCommand = (
  raw: unknown
): EbookWebViewCommand | null => {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  if (!COMMAND_TYPES.has(value.type)) return null;
  if (value.type === EBOOK_WEBVIEW_COMMAND.OPEN && !isRecord(value.content)) {
    return null;
  }
  if (
    value.type === EBOOK_WEBVIEW_COMMAND.GO_TO &&
    typeof value.target !== 'string'
  ) {
    return null;
  }
  return value as EbookWebViewCommand;
};
