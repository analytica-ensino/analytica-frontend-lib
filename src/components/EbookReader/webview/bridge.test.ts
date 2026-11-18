import { installEbookWebViewBridge } from './bridge';
import {
  EBOOK_WEBVIEW_BRIDGE,
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
} from './protocol';

describe('installEbookWebViewBridge', () => {
  afterEach(() => {
    delete globalThis.window[EBOOK_WEBVIEW_BRIDGE];
    delete globalThis.window.ReactNativeWebView;
  });

  it('hands the commands the app sends to every listener', () => {
    const bridge = installEbookWebViewBridge();
    const first = jest.fn();
    const second = jest.fn();
    bridge.subscribe(first);
    bridge.subscribe(second);

    globalThis.window[EBOOK_WEBVIEW_BRIDGE]?.receive({
      type: EBOOK_WEBVIEW_COMMAND.NEXT,
    });

    expect(first).toHaveBeenCalledWith({ type: EBOOK_WEBVIEW_COMMAND.NEXT });
    expect(second).toHaveBeenCalledWith({ type: EBOOK_WEBVIEW_COMMAND.NEXT });
  });

  it('drops what is not a command', () => {
    const bridge = installEbookWebViewBridge();
    const listener = jest.fn();
    bridge.subscribe(listener);

    globalThis.window[EBOOK_WEBVIEW_BRIDGE]?.receive({ type: 'delete' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops a listener that unsubscribed', () => {
    const bridge = installEbookWebViewBridge();
    const listener = jest.fn();
    const unsubscribe = bridge.subscribe(listener);

    unsubscribe();
    globalThis.window[EBOOK_WEBVIEW_BRIDGE]?.receive({
      type: EBOOK_WEBVIEW_COMMAND.NEXT,
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it('sends each event to the app as JSON', () => {
    const postMessage = jest.fn();
    globalThis.window.ReactNativeWebView = { postMessage };
    const bridge = installEbookWebViewBridge();

    bridge.post({ type: EBOOK_WEBVIEW_EVENT.READY });

    expect(postMessage).toHaveBeenCalledWith('{"type":"ready"}');
  });

  it('sends nothing outside a React Native WebView', () => {
    const bridge = installEbookWebViewBridge();

    expect(() =>
      bridge.post({ type: EBOOK_WEBVIEW_EVENT.READY })
    ).not.toThrow();
  });
});
