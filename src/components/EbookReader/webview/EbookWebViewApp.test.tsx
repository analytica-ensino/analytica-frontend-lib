import { act, render } from '@testing-library/react';
import {
  BOOK,
  GUIDE,
  ebookContent as content,
  installEbookDoubles,
  lastFlip,
  resetEbookDoubles,
} from '../../../testing/ebookReaderDoubles';
import type { EbookWebViewBridge, EbookWebViewListener } from './bridge';
import {
  EBOOK_WEBVIEW_COMMAND,
  EBOOK_WEBVIEW_EVENT,
  type EbookWebViewCommand,
} from './protocol';
import { EbookWebViewApp } from './EbookWebViewApp';

jest.mock('page-flip', () => ({
  PageFlip: jest.requireActual('../../../testing/ebookReaderDoubles')
    .FakePageFlip,
}));

const fakeBridge = () => {
  const listeners = new Set<EbookWebViewListener>();
  const post = jest.fn();
  const bridge: EbookWebViewBridge = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    post,
  };
  const send = (command: EbookWebViewCommand) =>
    act(() => listeners.forEach((listener) => listener(command)));
  return { bridge, post, send };
};

describe('EbookWebViewApp', () => {
  beforeAll(installEbookDoubles);
  beforeEach(resetEbookDoubles);

  it('tells the app it is ready and shows nothing before a book opens', () => {
    const { bridge, post } = fakeBridge();
    const { container } = render(<EbookWebViewApp bridge={bridge} />);

    expect(post).toHaveBeenCalledWith({ type: EBOOK_WEBVIEW_EVENT.READY });
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the book the app sends, at its section', () => {
    const { bridge, send } = fakeBridge();
    const { container } = render(<EbookWebViewApp bridge={bridge} />);

    send({
      type: EBOOK_WEBVIEW_COMMAND.OPEN,
      content: content(),
      initialSection: 'p04',
      theme: 'dark',
    });

    expect(lastFlip().settings.startPage).toBe(4);
    expect(container.querySelector('.ebook-content')).toHaveAttribute(
      'data-theme',
      'dark'
    );
  });

  it('starts over for another book', () => {
    const { bridge, send } = fakeBridge();
    const { container } = render(<EbookWebViewApp bridge={bridge} />);
    send({ type: EBOOK_WEBVIEW_COMMAND.OPEN, content: content(BOOK) });

    send({ type: EBOOK_WEBVIEW_COMMAND.OPEN, content: content(GUIDE) });

    expect(container.querySelector('#book')).toBeNull();
    expect(container.querySelector('[data-section="sala"]')).not.toBeNull();
  });

  it('leaves the other commands to the reader', () => {
    const { bridge, send } = fakeBridge();
    const { container } = render(<EbookWebViewApp bridge={bridge} />);

    send({ type: EBOOK_WEBVIEW_COMMAND.NEXT });

    expect(container).toBeEmptyDOMElement();
  });
});
