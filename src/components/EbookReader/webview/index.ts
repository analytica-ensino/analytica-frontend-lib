import html from 'ebook-webview:html';

/**
 * The ebook reader for a React Native WebView (AE-3323), as one HTML
 * document with its script and styles inline. Load it with
 * `source={{ html: EBOOK_WEBVIEW_HTML }}`, wait for the READY event and send
 * the OPEN command with the book; see `protocol.ts`.
 *
 * The WebView needs:
 * - `javaScriptEnabled` (the reader) and `domStorageEnabled` (it keeps the
 *   audio description choice in localStorage);
 * - `mediaPlaybackRequiresUserAction={false}`: the narration starts from a
 *   command, not from a tap inside the page, and would be refused otherwise;
 * - `allowsInlineMediaPlayback` (iOS): the narration plays in the page.
 *
 * Nothing in this module touches the DOM, so the app imports it without
 * pulling the web reader in.
 */
export const EBOOK_WEBVIEW_HTML: string = html;

export {
  EBOOK_WEBVIEW_BRIDGE,
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
} from './protocol';
export type {
  EbookWebViewCommand,
  EbookWebViewEvent,
  EbookWebViewOpenCommand,
  EbookWebViewState,
  EbookWebViewTheme,
} from './protocol';
export type {
  EbookContent,
  EbookNarration,
  EbookNarrationPage,
  EbookNarrationSegment,
  EbookPageChange,
} from '../types';
export type { EbookLayout, EbookTocEntry } from '../useEbookBook';
