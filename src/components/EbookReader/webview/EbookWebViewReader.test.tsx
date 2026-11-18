import { act, render, waitFor } from '@testing-library/react';
import {
  BOOK,
  ebookContent as content,
  initBook,
  installEbookDoubles,
  lastFlip,
  resetEbookDoubles,
} from '../../../testing/ebookReaderDoubles';
import type { EbookNarration } from '../types';
import type { EbookWebViewBridge, EbookWebViewListener } from './bridge';
import {
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
  type EbookWebViewCommand,
  type EbookWebViewEvent,
} from './protocol';
import { EbookWebViewReader } from './EbookWebViewReader';

jest.mock('page-flip', () => ({
  PageFlip: jest.requireActual('../../../testing/ebookReaderDoubles')
    .FakePageFlip,
}));

/** The app's side of the bridge: it sends commands and keeps the events. */
const fakeBridge = () => {
  const listeners = new Set<EbookWebViewListener>();
  const events: EbookWebViewEvent[] = [];
  const bridge: EbookWebViewBridge = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    post: (event) => {
      events.push(event);
    },
  };
  const send = (command: EbookWebViewCommand) =>
    act(() => listeners.forEach((listener) => listener(command)));
  const states = () =>
    events.flatMap((event) =>
      event.type === EBOOK_WEBVIEW_EVENT.STATE ? [event.state] : []
    );
  const lastState = () => states().at(-1);
  return { bridge, events, listeners, send, states, lastState };
};

/** Audio element double: plays at once. */
class FakeAudio {
  src = '';
  currentTime = 0;
  readyState = 1;
  seeking = false;
  muted = false;
  play = jest.fn(() => Promise.resolve());
  pause = jest.fn();
  removeAttribute = jest.fn();
  addEventListener = jest.fn();
}

/** Narration of page "caso": an audio description, then a line. */
const NARRATION: EbookNarration = {
  '3': {
    section: 'caso',
    start: 0,
    end: 10,
    segments: [
      { segment: 'p3-1', start: 0, end: 4, ad: true },
      { segment: 'p3-2', start: 4, end: 9 },
    ],
  },
};

describe('EbookWebViewReader', () => {
  beforeAll(() => {
    installEbookDoubles();
    Object.assign(globalThis, { Audio: FakeAudio });
  });

  beforeEach(() => {
    resetEbookDoubles();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('draws the sanitized book on the stage, in the theme the app asks for', () => {
    const { bridge } = fakeBridge();
    const { container } = render(
      <EbookWebViewReader
        content={content(`${BOOK}<script>steal()</script>`)}
        theme="dark"
        bridge={bridge}
      />
    );

    const stage = container.querySelector('.ebook-content');
    expect(stage).toHaveAttribute('data-theme', 'dark');
    expect(stage?.querySelector('style')?.textContent).toBe(
      '.ebook-content .page { color: red; }'
    );
    expect(container.querySelector('script')).toBeNull();
  });

  it('marks the document with the book theme too, for CSS that reads it there', () => {
    const { bridge } = fakeBridge();
    const { rerender } = render(
      <EbookWebViewReader content={content()} theme="dark" bridge={bridge} />
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    rerender(
      <EbookWebViewReader content={content()} theme="light" bridge={bridge} />
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('uses the light theme unless told otherwise', () => {
    const { bridge } = fakeBridge();
    const { container } = render(
      <EbookWebViewReader content={content()} bridge={bridge} />
    );

    expect(container.querySelector('.ebook-content')).toHaveAttribute(
      'data-theme',
      'light'
    );
  });

  it('tells the app where the book is once it opens', () => {
    const { bridge, lastState } = fakeBridge();
    render(<EbookWebViewReader content={content()} bridge={bridge} />);
    initBook();

    expect(lastState()).toEqual({
      layout: 'book',
      hasBookLayout: true,
      pageIndex: 0,
      pageCount: 7,
      spread: true,
      pageLabel: 'Capa',
      progress: 0,
      canGoBack: false,
      canGoForward: true,
      toc: [
        { label: 'O caso', target: 'caso' },
        { label: 'Ir para a página 4', target: 'p04' },
      ],
      activeTocTarget: undefined,
      hasNarration: false,
      isPlaying: false,
      hasAudioDescription: false,
      withAudioDescription: true,
    });
  });

  it('opens at the section where the student left off', () => {
    const { bridge } = fakeBridge();
    render(
      <EbookWebViewReader
        content={content()}
        initialSection="p04"
        bridge={bridge}
      />
    );

    expect(lastFlip().settings.startPage).toBe(4);
  });

  it('turns the pages the app asks for', () => {
    const { bridge, send, lastState } = fakeBridge();
    render(<EbookWebViewReader content={content()} bridge={bridge} />);
    initBook();

    send({ type: EBOOK_WEBVIEW_COMMAND.NEXT });
    expect(lastState()).toMatchObject({
      pageIndex: 1,
      pageLabel: '1–2 de 5',
      canGoBack: true,
    });

    send({ type: EBOOK_WEBVIEW_COMMAND.PREVIOUS });
    expect(lastState()?.pageIndex).toBe(0);

    send({ type: EBOOK_WEBVIEW_COMMAND.GO_TO, target: 'p04' });
    expect(lastState()).toMatchObject({
      pageIndex: 4,
      activeTocTarget: 'p04',
    });
  });

  it('switches between the book and the scroll layouts', () => {
    const { bridge, send, lastState } = fakeBridge();
    render(<EbookWebViewReader content={content()} bridge={bridge} />);
    initBook();

    send({ type: EBOOK_WEBVIEW_COMMAND.TOGGLE_LAYOUT });

    expect(lastState()?.layout).toBe('scroll');
  });

  it('reports the pages on screen, for the reading telemetry', () => {
    const { bridge, events } = fakeBridge();
    render(<EbookWebViewReader content={content()} bridge={bridge} />);
    initBook();

    expect(events).toContainEqual({
      type: EBOOK_WEBVIEW_EVENT.PAGE_CHANGE,
      page: { section: 'capa', sections: ['capa'] },
    });
  });

  it('sends the state again only when it changes', () => {
    const { bridge, states } = fakeBridge();
    const { rerender } = render(
      <EbookWebViewReader content={content()} bridge={bridge} />
    );
    initBook();
    const sent = states().length;

    rerender(<EbookWebViewReader content={content()} bridge={bridge} />);

    expect(states()).toHaveLength(sent);
  });

  it('plays the narration and switches the audio description off', async () => {
    const { bridge, send, lastState } = fakeBridge();
    render(
      <EbookWebViewReader
        content={{ ...content(), narration: NARRATION }}
        bridge={bridge}
      />
    );
    initBook();
    expect(lastState()).toMatchObject({
      hasNarration: true,
      hasAudioDescription: true,
    });

    send({ type: EBOOK_WEBVIEW_COMMAND.GO_TO, target: 'caso' });
    await act(async () => {
      send({ type: EBOOK_WEBVIEW_COMMAND.TOGGLE_NARRATION });
    });
    await waitFor(() => expect(lastState()?.isPlaying).toBe(true));

    send({ type: EBOOK_WEBVIEW_COMMAND.TOGGLE_AUDIO_DESCRIPTION });
    expect(lastState()?.withAudioDescription).toBe(false);
  });

  it('leaves opening a book to the app', () => {
    const { bridge, send, states } = fakeBridge();
    render(<EbookWebViewReader content={content()} bridge={bridge} />);
    initBook();
    const sent = states().length;

    send({ type: EBOOK_WEBVIEW_COMMAND.OPEN, content: content() });

    expect(states()).toHaveLength(sent);
  });

  it('stops listening to the app once it is gone', () => {
    const { bridge, listeners } = fakeBridge();
    const { unmount } = render(
      <EbookWebViewReader content={content()} bridge={bridge} />
    );

    unmount();

    expect(listeners.size).toBe(0);
  });
});
