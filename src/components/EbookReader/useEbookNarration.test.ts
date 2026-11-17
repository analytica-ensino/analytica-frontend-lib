import { act, renderHook } from '@testing-library/react';
import type { EbookNarration, EbookNarrationPage } from './types';
import type { EbookLayout } from './useEbookBook';
import {
  AUDIO_DESCRIPTION_STORAGE_KEY,
  useEbookNarration,
} from './useEbookNarration';

/** Audio element double: tests move its clock and fire its events. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  /** Makes `play` fail, as a browser that refuses to play does. */
  static refuse = false;
  src = '';
  currentTime = 0;
  readyState = 1;
  seeking = false;
  muted = false;
  onended: (() => void) | null = null;
  listeners: Record<string, (() => void)[]> = {};
  play = jest.fn(() =>
    FakeAudio.refuse
      ? Promise.reject(new Error('NotAllowedError'))
      : Promise.resolve()
  );
  pause = jest.fn();
  removeAttribute = jest.fn();
  constructor() {
    FakeAudio.instances.push(this);
  }
  addEventListener(type: string, callback: () => void) {
    (this.listeners[type] ??= []).push(callback);
  }
  emit(type: string) {
    const callbacks = this.listeners[type] ?? [];
    this.listeners[type] = [];
    callbacks.forEach((callback) => callback());
  }
}

const audio = () => FakeAudio.instances[0];

const BASE = 'https://cdn.example.com/ebooks/eb40/3/';

const CASO: EbookNarrationPage = {
  section: 'caso',
  file: 'audio/narration.mp3',
  start: 10,
  end: 32,
  segments: [
    { segment: 'p3-1', start: 0, end: 13.5, ad: true },
    { segment: 'p3-2', start: 14, end: 18 },
    { segment: 'p3-3', start: 18.5, end: 21.5 },
  ],
};

const P04: EbookNarrationPage = {
  section: 'p04',
  file: 'audio/narration.mp3',
  start: 32,
  end: 50,
  segments: [
    { segment: 'p4-1', start: 0, end: 2 },
    { segment: 'p4-2', start: 2.5, end: 5, ad: true },
    { segment: 'p4-3', start: 5.5, end: 17 },
  ],
};

/** A page that only describes an image. */
const QUADRO: EbookNarrationPage = {
  section: 'quadro',
  file: 'audio/narration.mp3',
  start: 50,
  end: 60,
  segments: [{ segment: 'p5-1', start: 0, end: 9, ad: true }],
};

const pageHtml = (index: number, section: string, clipIds: string[]) =>
  `<div class="page" data-ix="${index}" data-section="${section}">${clipIds
    .map((id) => `<p data-segment="${id}">${id}</p>`)
    .join('')}</div>`;

const buildContent = () => {
  const content = document.createElement('div');
  content.innerHTML = [
    pageHtml(0, 'capa', ['p0-1']),
    pageHtml(1, 'caso', ['p3-1', 'p3-2', 'p3-3']),
    pageHtml(2, 'p04', ['p4-1', 'p4-2', 'p4-3']),
    pageHtml(3, 'quadro', ['p5-1']),
  ].join('');
  document.body.appendChild(content);
  return content;
};

interface FakeBook {
  layout: EbookLayout;
  pageIndex: number;
  pageCount: number;
  next: jest.Mock;
  getVisiblePages: () => HTMLElement[];
}

const page = (content: HTMLElement, index: number) =>
  content.querySelector<HTMLElement>(`[data-ix="${index}"]`) as HTMLElement;

const reading = (content: HTMLElement) =>
  Array.from(content.querySelectorAll('.lendo')).map((element) =>
    element.getAttribute('data-segment')
  );

/** The pages as the upload stores them: the package's map, keyed by page number. */
const stored = (pages: EbookNarrationPage[] | null): EbookNarration | null =>
  pages &&
  Object.fromEntries(
    pages.map((narrated, index) => [String(index + 3), narrated])
  );

const setup = ({
  narration = [CASO, P04, QUADRO] as EbookNarrationPage[] | null,
  layout = 'book' as EbookLayout,
  visible = [1, 2],
} = {}) => {
  const content = buildContent();
  const book: FakeBook = {
    layout,
    pageIndex: visible[0],
    pageCount: 4,
    next: jest.fn(),
    getVisiblePages: () => visible.map((index) => page(content, index)),
  };
  const contentRef = { current: content as HTMLDivElement };
  // One object for the whole test, as the reader's content keeps it.
  const storedNarration = stored(narration);
  const hook = renderHook(
    (props: { book: FakeBook; narration: EbookNarration | null }) =>
      useEbookNarration({
        narration: props.narration,
        assetBaseUrl: BASE,
        contentRef,
        book: props.book,
      }),
    { initialProps: { book, narration: storedNarration } }
  );
  const tick = (time: number) => {
    audio().currentTime = time;
    act(() => {
      jest.advanceTimersByTime(30);
    });
  };
  const rerenderBook = (changes: Partial<FakeBook>) => {
    Object.assign(book, changes);
    hook.rerender({ book: { ...book }, narration: storedNarration });
  };
  return { content, book, hook, tick, rerenderBook };
};

describe('useEbookNarration', () => {
  beforeAll(() => {
    Object.assign(globalThis, { Audio: FakeAudio });
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    jest.useFakeTimers();
    FakeAudio.instances = [];
    FakeAudio.refuse = false;
    localStorage.clear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('offers nothing for a book without narration', () => {
    const { hook } = setup({ narration: null });

    expect(hook.result.current.hasNarration).toBe(false);
    expect(hook.result.current.hasAudioDescription).toBe(false);
  });

  it('offers listening, and the audio description switch when there are descriptions', () => {
    const { hook } = setup();

    expect(hook.result.current.hasNarration).toBe(true);
    expect(hook.result.current.hasAudioDescription).toBe(true);
    expect(hook.result.current.withAudioDescription).toBe(true);
  });

  it('plays the page on screen from its start in the mp3 and highlights the segment being read', async () => {
    const { content, hook, tick } = setup();

    await act(async () => hook.result.current.toggle());

    expect(hook.result.current.isPlaying).toBe(true);
    expect(audio().src).toBe(`${BASE}audio/narration.mp3`);
    expect(audio().currentTime).toBe(10);
    expect(audio().play).toHaveBeenCalled();

    tick(11);
    expect(reading(content)).toEqual(['p3-1']);
    tick(24.1);
    expect(reading(content)).toEqual(['p3-2']);
  });

  it('goes on to the next page on screen and then turns the page', async () => {
    const { content, book, hook, tick } = setup();
    await act(async () => hook.result.current.toggle());

    tick(31.8);
    expect(audio().currentTime).toBe(32);
    tick(32.1);
    expect(reading(content)).toEqual(['p4-1']);

    tick(49.8);
    expect(book.next).toHaveBeenCalled();
    expect(reading(content)).toEqual([]);
    expect(FakeAudio.instances).toHaveLength(1);
  });

  it('reads on from the new page when the page turns', async () => {
    const { content, hook, rerenderBook } = setup();
    await act(async () => hook.result.current.toggle());

    await act(async () => {
      rerenderBook({ pageIndex: 2, getVisiblePages: () => [page(content, 2)] });
    });

    expect(hook.result.current.isPlaying).toBe(true);
    expect(audio().currentTime).toBe(32);
  });

  it('stops when the new page has no narration', async () => {
    const { content, hook, rerenderBook } = setup();
    await act(async () => hook.result.current.toggle());

    await act(async () => {
      rerenderBook({ pageIndex: 0, getVisiblePages: () => [page(content, 0)] });
    });

    expect(hook.result.current.isPlaying).toBe(false);
  });

  it('moves to the end of the page when the segment ends on its own', async () => {
    const { book, hook } = setup({ visible: [2] });
    await act(async () => hook.result.current.toggle());

    act(() => audio().onended?.());

    expect(book.next).toHaveBeenCalled();
  });

  it('stops at the last page', async () => {
    const { hook, tick } = setup({ visible: [3] });
    await act(async () => hook.result.current.toggle());

    tick(59.8);

    expect(hook.result.current.isPlaying).toBe(false);
  });

  it.each([
    'https://evil.example.com/narration.mp3',
    '../other-book/audio/narration.mp3',
    `${BASE}%2e%2e/4/audio/narration.mp3`,
  ])('ignores a page whose mp3 is not in the package (%s)', (file) => {
    const { hook } = setup({ narration: [{ ...CASO, file }] });

    expect(hook.result.current.hasNarration).toBe(false);
  });

  it.each([
    ['names no mp3', null, `${BASE}audio/narration.mp3`],
    [
      'gives its mp3 as an address of the version',
      `${BASE}audio/b.mp3`,
      `${BASE}audio/b.mp3`,
    ],
  ])('plays a page that %s', (_case, file, src) => {
    const { hook } = setup({ visible: [1], narration: [{ ...CASO, file }] });

    act(() => hook.result.current.toggle());

    expect(audio().src).toBe(src);
  });

  it('plays a segment without `data-segment`, highlighting nothing', () => {
    const { content, hook, tick } = setup({
      visible: [1],
      narration: [
        {
          ...CASO,
          segments: [{ key: 'Bené olhou a horta', start: 0, end: 13 }],
        },
      ],
    });

    act(() => hook.result.current.toggle());
    tick(10 + 1);

    expect(hook.result.current.isPlaying).toBe(true);
    expect(reading(content)).toEqual([]);
  });

  it('highlights the segment on the book as it is now, after a rebuild', async () => {
    const { content, hook, tick } = setup({ visible: [1] });
    await act(async () => hook.result.current.toggle());
    const rebuilt = page(content, 1).cloneNode(true) as HTMLElement;
    page(content, 1).replaceWith(rebuilt);

    tick(24.1);

    expect(
      rebuilt
        .querySelector('[data-segment="p3-2"]')
        ?.classList.contains('lendo')
    ).toBe(true);
  });

  it('stops right away when no page on screen is narrated', async () => {
    const { hook } = setup({ visible: [0] });

    await act(async () => hook.result.current.toggle());

    expect(hook.result.current.isPlaying).toBe(false);
    expect(audio()).toBeUndefined();
  });

  describe('audio description off', () => {
    it('starts after the description and remembers the choice', async () => {
      const { hook } = setup();
      act(() => hook.result.current.toggleAudioDescription());

      await act(async () => hook.result.current.toggle());

      expect(hook.result.current.withAudioDescription).toBe(false);
      expect(localStorage.getItem(AUDIO_DESCRIPTION_STORAGE_KEY)).toBe('off');
      expect(audio().currentTime).toBeCloseTo(23.52);
    });

    it('jumps a description in the middle of the page without letting it sound', async () => {
      const { hook, tick } = setup({ visible: [2] });
      act(() => hook.result.current.toggleAudioDescription());
      await act(async () => hook.result.current.toggle());

      tick(34.35);

      expect(audio().muted).toBe(true);
      expect(audio().currentTime).toBeCloseTo(37.02);
      audio().emit('seeked');
      expect(audio().muted).toBe(false);
    });

    it('waits while the player is seeking', async () => {
      const { content, hook, tick } = setup({ visible: [2] });
      await act(async () => hook.result.current.toggle());
      audio().seeking = true;

      tick(32.5);

      expect(reading(content)).toEqual([]);
    });

    it('leaves out a page that only describes an image', async () => {
      const { book, hook } = setup({ visible: [3] });
      act(() => hook.result.current.toggleAudioDescription());

      await act(async () => hook.result.current.toggle());

      expect(audio()).toBeUndefined();
      expect(book.next).not.toHaveBeenCalled();
      expect(hook.result.current.isPlaying).toBe(false);
    });

    it('starts off when the student turned it off before', () => {
      localStorage.setItem(AUDIO_DESCRIPTION_STORAGE_KEY, 'off');

      const { hook } = setup();

      expect(hook.result.current.withAudioDescription).toBe(false);
    });

    it('starts on when the browser keeps no storage', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      const { hook } = setup();
      expect(hook.result.current.withAudioDescription).toBe(true);

      act(() => hook.result.current.toggleAudioDescription());
      expect(hook.result.current.withAudioDescription).toBe(false);
    });
  });

  it('stops and clears the highlight when asked', async () => {
    const { content, hook, tick } = setup();
    await act(async () => hook.result.current.toggle());
    tick(11);

    await act(async () => hook.result.current.toggle());

    expect(hook.result.current.isPlaying).toBe(false);
    expect(audio().pause).toHaveBeenCalled();
    expect(reading(content)).toEqual([]);
    tick(25);
    expect(reading(content)).toEqual([]);
  });

  it('stops when the browser refuses to play', async () => {
    FakeAudio.refuse = true;
    const { hook } = setup();

    await act(async () => hook.result.current.toggle());

    expect(hook.result.current.isPlaying).toBe(false);
  });

  it('waits for the mp3 to load before seeking', async () => {
    const { hook } = setup();
    await act(async () => hook.result.current.toggle());
    await act(async () => hook.result.current.toggle());
    audio().readyState = 0;
    audio().play.mockClear();

    await act(async () => hook.result.current.toggle());
    expect(audio().play).not.toHaveBeenCalled();

    await act(async () => audio().emit('loadedmetadata'));
    expect(audio().play).toHaveBeenCalled();
  });

  it('scrolls to the next page and reads on in scroll', async () => {
    const { content, hook, tick } = setup({ layout: 'scroll', visible: [1] });
    await act(async () => hook.result.current.toggle());

    tick(31.8);

    expect(page(content, 2).scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
    expect(audio().currentTime).toBe(32);
  });

  it('stops in scroll when the next page is not there', async () => {
    const { content, hook, tick } = setup({ layout: 'scroll', visible: [2] });
    await act(async () => hook.result.current.toggle());
    page(content, 3).remove();

    tick(49.8);

    expect(hook.result.current.isPlaying).toBe(false);
  });

  it('stops when switching between book and scroll', async () => {
    const { hook, rerenderBook } = setup();
    await act(async () => hook.result.current.toggle());

    act(() => rerenderBook({ layout: 'scroll' }));

    expect(hook.result.current.isPlaying).toBe(false);
  });

  it('lets go of the audio when the reader closes', async () => {
    const { hook } = setup();
    await act(async () => hook.result.current.toggle());

    hook.unmount();

    expect(audio().removeAttribute).toHaveBeenCalledWith('src');
  });
});
