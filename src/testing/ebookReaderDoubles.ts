import { act } from '@testing-library/react';
import type { EbookContent } from '../components/EbookReader/types';

/**
 * Test doubles shared by the EbookReader suites: a fake page-flip whose
 * events the tests fire, IntersectionObserver and ResizeObserver doubles, and
 * small books in the processed format.
 *
 * Use the page-flip fake with
 * `jest.mock('page-flip', () => ({ PageFlip: require('../../testing/ebookReaderDoubles').FakePageFlip }))`.
 */

/** Fake page-flip instance: keeps the pages and lets each test fire its events. */
export interface FakeFlip {
  settings: { startPage: number; width: number; height: number };
  pages: HTMLElement[];
  index: number;
  orientation: 'portrait' | 'landscape';
  handlers: Record<string, () => void>;
  destroyed: boolean;
  /** page-flip's state: `read` when no page is turning */
  state: string;
  emit: (event: string) => void;
  flip: (index: number) => void;
}

/** Every fake page-flip built, in order. */
export const flips: FakeFlip[] = [];

/** The book on screen. */
export const lastFlip = (): FakeFlip => flips[flips.length - 1];

/** Stand-in for page-flip's `PageFlip` class. */
export const FakePageFlip = jest
  .fn()
  .mockImplementation((_block: HTMLElement, settings: FakeFlip['settings']) => {
    const flip: FakeFlip & Record<string, unknown> = {
      settings,
      pages: [],
      index: settings.startPage,
      orientation: 'landscape',
      handlers: {},
      destroyed: false,
      state: 'read',
      emit: (event) => flip.handlers[event]?.(),
      on: (event: string, handler: () => void) => {
        flip.handlers[event] = handler;
      },
      loadFromHTML: (pages: HTMLElement[]) => {
        flip.pages = Array.from(pages);
      },
      getRender: () => ({ render: () => {} }),
      getCurrentPageIndex: () => flip.index,
      getPageCount: () => flip.pages.length,
      getOrientation: () => flip.orientation,
      getState: () => flip.state,
      flip: (index: number) => {
        flip.index = index;
        flip.emit('flip');
      },
      flipNext: () => {
        flip.index +=
          flip.orientation === 'landscape' && flip.index > 0 ? 2 : 1;
        flip.emit('flip');
      },
      flipPrev: () => {
        flip.index = Math.max(0, flip.index - 2);
        flip.emit('flip');
      },
      destroy: () => {
        flip.destroyed = true;
      },
    };
    flips.push(flip);
    return flip;
  });

/** page-flip reports the book ready (it does so a moment after loading). */
export const initBook = () => act(() => lastFlip().emit('init'));

/** IntersectionObserver double: tests decide which targets come into view. */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  targets: Element[] = [];
  disconnected = false;
  constructor(
    public callback: ConstructorParameters<typeof IntersectionObserver>[0]
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  disconnect() {
    this.disconnected = true;
  }
  show(target: Element) {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
        } as unknown as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  }
}

/** ResizeObserver double: tests fire the resize. */
export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  constructor(
    public callback: ConstructorParameters<typeof ResizeObserver>[0]
  ) {
    FakeResizeObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

/** Installs the observer doubles and a no-op `scrollIntoView` (jsdom has neither). */
export const installEbookDoubles = () => {
  Object.assign(globalThis, {
    IntersectionObserver: FakeIntersectionObserver,
    ResizeObserver: FakeResizeObserver,
  });
  Element.prototype.scrollIntoView = jest.fn();
};

/** Forgets the books and observers of the previous test, and keeps page-flip from drawing. */
export const resetEbookDoubles = () => {
  flips.length = 0;
  FakeIntersectionObserver.instances = [];
  FakeResizeObserver.instances = [];
  jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
};

/** A student book: cover, six pages with contents, an answer and the end marker, back cover. */
export const BOOK = `
<main class="ebook-livro">
  <div id="livro" class="livro">
    <div class="pg pg-capa" data-secao="capa" data-density="hard"><h1>Capa</h1></div>
    <div class="pg" data-secao="rosto"><p>Rosto</p></div>
    <div class="pg" data-secao="sumario"><nav class="hq-indice"><a href="#caso">O caso</a><a href="#p04">Ir para a página 4</a></nav></div>
    <div class="pg" data-secao="caso" id="caso"><p>Caso</p></div>
    <div class="pg" data-secao="p04" id="p04">
      <button class="ver-resposta" aria-expanded="false">Ver resposta</button>
      <p class="resposta" hidden>Resposta</p>
    </div>
    <div class="pg" data-secao="ficha"><p data-secao="fim">Fim!</p></div>
    <div class="pg pg-contracapa" data-density="hard"><p>Contracapa</p></div>
  </div>
</main>`;

/** A Guia do Professor: sections in scroll, with contents. */
export const GUIDE = `
<main class="ebook prof">
  <section data-secao="capa"><h1>Guia</h1><nav class="sumario"><a href="#capa">Início</a><a href="#sala">Ir para a sala</a></nav></section>
  <section id="sala" data-secao="sala"><h2>Como usar em sala</h2></section>
</main>`;

/** Base URL of the fake version's files. */
export const EBOOK_BASE = 'https://cdn.example.com/ebooks/eb40/3/';

/** A processed version with the given `<main>`. */
export const ebookContent = (html = BOOK): EbookContent => ({
  html,
  css: '.ebook-leitor .pg { color: red; }',
  assetBaseUrl: EBOOK_BASE,
});
