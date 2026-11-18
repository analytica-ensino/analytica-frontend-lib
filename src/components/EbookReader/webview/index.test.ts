import {
  EBOOK_WEBVIEW_BRIDGE,
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
  EBOOK_WEBVIEW_HTML,
} from './index';

describe('ebook-reader/webview', () => {
  it('hands the app the WebView page and the bridge protocol', () => {
    // The real page is built at build time; jest maps it to a stub.
    expect(EBOOK_WEBVIEW_HTML).toContain('<div id="root"></div>');
    expect(EBOOK_WEBVIEW_BRIDGE).toBe('ebookReaderBridge');
    expect(EBOOK_WEBVIEW_COMMAND.OPEN).toBe('open');
    expect(EBOOK_WEBVIEW_EVENT.STATE).toBe('state');
  });
});
