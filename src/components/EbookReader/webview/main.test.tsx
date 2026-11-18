import { EBOOK_WEBVIEW_BRIDGE } from './protocol';

jest.mock('page-flip', () => ({
  PageFlip: jest.fn(),
}));

/**
 * Loads the WebView page's entry, as the bundled script runs. Fresh modules
 * each time, with `act` from the same React the entry renders with.
 */
const runEntry = async () => {
  jest.resetModules();
  const { act } = jest.requireActual<typeof import('react')>('react');
  await act(async () => {
    jest.requireActual('./main');
  });
};

describe('WebView page entry', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete globalThis.window[EBOOK_WEBVIEW_BRIDGE];
    delete globalThis.window.ReactNativeWebView;
  });

  it('mounts the reader in #root and tells the app it is ready', async () => {
    const postMessage = jest.fn();
    globalThis.window.ReactNativeWebView = { postMessage };
    document.body.innerHTML = '<div id="root"></div>';

    await runEntry();

    expect(globalThis.window[EBOOK_WEBVIEW_BRIDGE]).toBeDefined();
    expect(postMessage).toHaveBeenCalledWith('{"type":"ready"}');
  });

  it('does nothing on a page without #root', async () => {
    await runEntry();

    expect(globalThis.window[EBOOK_WEBVIEW_BRIDGE]).toBeUndefined();
  });
});
