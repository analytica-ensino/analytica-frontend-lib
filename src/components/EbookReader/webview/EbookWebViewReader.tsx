import { useEffect, useMemo, useRef } from 'react';
import { pageLabel, readingProgress } from '../bookLayout';
import { sanitizeEbookCss } from '../sanitizeEbookCss';
import { sanitizeEbookHtml } from '../sanitizeEbookHtml';
import { EBOOK_FORMAT, type EbookContent } from '../types';
import { useEbookBook } from '../useEbookBook';
import { useEbookNarration } from '../useEbookNarration';
import type { EbookWebViewBridge } from './bridge';
import {
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
  type EbookWebViewCommand,
  type EbookWebViewState,
  type EbookWebViewTheme,
} from './protocol';

export interface EbookWebViewReaderProps {
  content: EbookContent;
  /** Section (`data-section`) to open at */
  initialSection?: string;
  theme?: EbookWebViewTheme;
  bridge: EbookWebViewBridge;
}

/**
 * The book of the ebook reader, alone, for a React Native WebView (AE-3323):
 * the same page turns, scroll and narration as the web reader, while the app
 * draws the header, the controls and the sheets natively. The app drives it
 * with commands and follows it through the state and page events.
 */
export const EbookWebViewReader = ({
  content,
  initialSection,
  theme = 'light',
  bridge,
}: Readonly<EbookWebViewReaderProps>) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const html = useMemo(
    () => sanitizeEbookHtml(content.html, content.assetBaseUrl),
    [content.html, content.assetBaseUrl]
  );
  const css = useMemo(
    () => sanitizeEbookCss(content.css, content.assetBaseUrl),
    [content.css, content.assetBaseUrl]
  );

  const book = useEbookBook({
    contentRef,
    html,
    initialSection,
    onPageChange: (page) =>
      bridge.post({ type: EBOOK_WEBVIEW_EVENT.PAGE_CHANGE, page }),
  });

  const narration = useEbookNarration({
    narration: content.narration,
    assetBaseUrl: content.assetBaseUrl,
    contentRef,
    book,
  });

  // Commands act on the reader as it is when they arrive.
  const latestRef = useRef({ book, narration });
  latestRef.current = { book, narration };

  useEffect(
    () =>
      bridge.subscribe((command: EbookWebViewCommand) => {
        const { book: current, narration: player } = latestRef.current;
        switch (command.type) {
          case EBOOK_WEBVIEW_COMMAND.NEXT:
            current.next();
            break;
          case EBOOK_WEBVIEW_COMMAND.PREVIOUS:
            current.previous();
            break;
          case EBOOK_WEBVIEW_COMMAND.GO_TO:
            current.goTo(command.target);
            break;
          case EBOOK_WEBVIEW_COMMAND.TOGGLE_LAYOUT:
            current.toggleLayout();
            break;
          case EBOOK_WEBVIEW_COMMAND.TOGGLE_NARRATION:
            player.toggle();
            break;
          case EBOOK_WEBVIEW_COMMAND.TOGGLE_AUDIO_DESCRIPTION:
            player.toggleAudioDescription();
            break;
          default:
            // OPEN is the app's (EbookWebViewApp): a new book remounts this.
            break;
        }
      }),
    [bridge]
  );

  const state: EbookWebViewState = {
    layout: book.layout,
    hasBookLayout: book.hasBookLayout,
    pageIndex: book.pageIndex,
    pageCount: book.pageCount,
    spread: book.spread,
    pageLabel: pageLabel(book.pageIndex, book.pageCount, book.spread),
    progress: readingProgress(book.pageIndex, book.pageCount),
    canGoBack: book.pageIndex > 0,
    canGoForward: book.pageIndex < book.pageCount - 1,
    toc: book.toc,
    activeTocTarget: book.activeTocTarget,
    hasNarration: narration.hasNarration,
    isPlaying: narration.isPlaying,
    hasAudioDescription: narration.hasAudioDescription,
    withAudioDescription: narration.withAudioDescription,
  };
  // The state goes out once per change, not once per render.
  const serialized = JSON.stringify(state);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    bridge.post({ type: EBOOK_WEBVIEW_EVENT.STATE, state: stateRef.current });
  }, [bridge, serialized]);

  return (
    <section className="ebook-reader" data-layout={book.layout}>
      <div className="ebook-reader__frame">
        <div
          className={`${EBOOK_FORMAT.STAGE_CLASS} ebook-reader__stage`}
          data-theme={theme}
        >
          <style>{css}</style>
          <div
            ref={contentRef}
            className="ebook-reader__content"
            data-testid="ebook-reader-content"
          />
        </div>
      </div>
    </section>
  );
};
