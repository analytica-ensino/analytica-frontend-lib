import { createRoot } from 'react-dom/client';
import '../ebookReader.css';
import { installEbookWebViewBridge } from './bridge';
import { EbookWebViewApp } from './EbookWebViewApp';

/**
 * Entry of the page inside the WebView. `scripts/ebook-webview/htmlPlugin.mjs`
 * bundles it, with React, page-flip and DOMPurify, into EBOOK_WEBVIEW_HTML.
 * The page has a single `#root`.
 */
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <EbookWebViewApp bridge={installEbookWebViewBridge()} />
  );
}
