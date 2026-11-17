import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { useThemeStore } from '../../store/themeStore';
import {
  BOOK,
  GUIDE,
  FakeIntersectionObserver,
  FakeResizeObserver,
  ebookContent as content,
  flips,
  initBook,
  installEbookDoubles,
  lastFlip,
  resetEbookDoubles,
} from '../../testing/ebookReaderDoubles';
import EbookReader from './EbookReader';
import { useEbookBook } from './useEbookBook';

jest.mock('page-flip', () => ({
  PageFlip: jest.requireActual('../../testing/ebookReaderDoubles').FakePageFlip,
}));

/**
 * The book behaviour (layouts, page turning, seen sections, contents), mostly
 * seen through the reader that renders its controls.
 */
describe('useEbookBook', () => {
  beforeAll(installEbookDoubles);

  beforeEach(() => {
    resetEbookDoubles();
    useThemeStore.setState({ isDark: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('book layout', () => {
    it('turns the #livro pages into a book that opens at the cover', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();

      const book = screen
        .getByTestId('ebook-reader-content')
        .querySelector('#livro');
      expect(book).toHaveClass('aberto');
      expect(lastFlip().pages).toHaveLength(7);
      expect(lastFlip().settings.startPage).toBe(0);
      expect(book).toHaveClass('na-capa');
      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        'Capa'
      );
      expect(
        screen.getByRole('button', { name: 'Página anterior' })
      ).toBeDisabled();
    });

    it('turns pages with the buttons and counts the pages on screen', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();

      fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        '1–2 de 5'
      );

      fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        'Capa'
      );
    });

    it('shows one page at a time in portrait', () => {
      render(<EbookReader content={content()} title="Livro" />);
      lastFlip().orientation = 'portrait';
      lastFlip().index = 3;
      initBook();

      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        '3 de 5'
      );
    });

    it('disables "next" at the back cover', () => {
      render(<EbookReader content={content()} title="Livro" />);
      lastFlip().index = 6;
      initBook();

      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        'Contracapa'
      );
      expect(
        screen.getByRole('button', { name: 'Próxima página' })
      ).toBeDisabled();
      expect(
        screen.getByTestId('ebook-reader-content').querySelector('#livro')
      ).toHaveClass('na-contracapa');
    });

    it('reports each section once, the end marker included', () => {
      const onSectionsSeen = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onSectionsSeen={onSectionsSeen}
        />
      );
      initBook();
      act(() => lastFlip().flip(5));
      act(() => lastFlip().flip(0));

      expect(onSectionsSeen.mock.calls).toEqual([
        [['capa']],
        [['ficha', 'fim']],
      ]);
    });

    it('reports nothing in preview', () => {
      const onSectionsSeen = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          mode="preview"
          onSectionsSeen={onSectionsSeen}
        />
      );
      initBook();
      act(() => lastFlip().flip(5));

      expect(onSectionsSeen).not.toHaveBeenCalled();
    });

    it('opens at the page of the requested section', () => {
      render(
        <EbookReader content={content()} title="Livro" initialSection="caso" />
      );

      expect(lastFlip().settings.startPage).toBe(3);
    });

    it('opens at the cover when the section does not exist', () => {
      render(
        <EbookReader content={content()} title="Livro" initialSection="nada" />
      );

      expect(lastFlip().settings.startPage).toBe(0);
    });

    it('turns to the page of a link in the contents', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();

      fireEvent.click(screen.getByText('Ir para a página 4'));

      expect(lastFlip().index).toBe(4);
    });

    it('opens and closes the answer of "ver resposta"', () => {
      render(<EbookReader content={content()} title="Livro" />);
      const button = screen.getByText('Ver resposta');
      const answer = screen.getByText('Resposta');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveTextContent('Esconder');
      expect(answer).not.toHaveAttribute('hidden');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveTextContent('Ver resposta');
      expect(answer).toHaveAttribute('hidden');
    });

    it('turns pages with the arrow keys, but not while typing', () => {
      render(
        <>
          <input aria-label="busca" />
          <EbookReader content={content()} title="Livro" />
        </>
      );
      initBook();

      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(lastFlip().index).toBe(1);
      fireEvent.keyDown(document, { key: 'PageDown' });
      expect(lastFlip().index).toBe(3);
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(lastFlip().index).toBe(1);
      fireEvent.keyDown(document, { key: 'PageUp' });
      expect(lastFlip().index).toBe(0);

      fireEvent.keyDown(screen.getByLabelText('busca'), { key: 'ArrowRight' });
      expect(lastFlip().index).toBe(0);
    });

    it('rebuilds the book for a new size, at the same page', () => {
      jest.useFakeTimers();
      render(<EbookReader content={content()} title="Livro" />);
      initBook();
      act(() => lastFlip().flip(3));
      const first = lastFlip();
      jest
        .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
        .mockReturnValue(1440);
      jest
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(800);

      act(() => {
        FakeResizeObserver.instances[0].resize();
        jest.advanceTimersByTime(300);
      });

      expect(first.destroyed).toBe(true);
      expect(lastFlip()).not.toBe(first);
      expect(lastFlip().settings.startPage).toBe(3);
      expect(lastFlip().settings.height).toBe(799);
    });

    it('waits for a page to finish turning before rebuilding', () => {
      jest.useFakeTimers();
      render(<EbookReader content={content()} title="Livro" />);
      initBook();
      const first = lastFlip();
      first.state = 'flipping';
      jest
        .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
        .mockReturnValue(1440);
      jest
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(800);

      act(() => {
        FakeResizeObserver.instances[0].resize();
        jest.advanceTimersByTime(300);
      });
      expect(lastFlip()).toBe(first);

      first.state = 'read';
      act(() => first.flip(3));
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(first.destroyed).toBe(true);
      expect(lastFlip().settings.startPage).toBe(3);
    });

    it('keeps the book when the size barely changes', () => {
      jest.useFakeTimers();
      render(<EbookReader content={content()} title="Livro" />);
      const first = lastFlip();

      act(() => {
        FakeResizeObserver.instances[0].resize();
        jest.advanceTimersByTime(300);
      });

      expect(lastFlip()).toBe(first);
    });

    it('stops the book when the reader closes', () => {
      const { unmount } = render(
        <EbookReader content={content()} title="Livro" />
      );
      const flip = lastFlip();

      unmount();

      expect(flip.destroyed).toBe(true);
    });
  });

  describe('scroll layout', () => {
    it('switches to pages one under the other at the same page, and back', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();
      act(() => lastFlip().flip(3));
      const flip = lastFlip();

      fireEvent.click(screen.getByRole('button', { name: 'Ler em rolagem' }));

      const book = screen
        .getByTestId('ebook-reader-content')
        .querySelector('#livro');
      expect(flip.destroyed).toBe(true);
      expect(book).toHaveClass('rolagem');
      expect(book).not.toHaveAttribute('style');
      expect(
        screen.queryByRole('button', { name: 'Próxima página' })
      ).toBeNull();
      expect(
        book?.querySelector('[data-ix="3"]')?.scrollIntoView
      ).toHaveBeenCalled();

      fireEvent.click(
        screen.getByRole('button', { name: 'Voltar ao modo livro' })
      );
      expect(lastFlip().settings.startPage).toBe(3);
    });

    it('counts a page as seen when it scrolls into view', () => {
      const onSectionsSeen = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onSectionsSeen={onSectionsSeen}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Ler em rolagem' }));
      const observer = FakeIntersectionObserver.instances[0];

      act(() => observer.show(observer.targets[5]));

      expect(onSectionsSeen).toHaveBeenLastCalledWith(['ficha', 'fim']);
      expect(observer.targets).toHaveLength(7);
    });

    it('scrolls to a link target', () => {
      render(<EbookReader content={content()} title="Livro" />);
      fireEvent.click(screen.getByRole('button', { name: 'Ler em rolagem' }));
      const link = screen.getByText('Ir para a página 4');

      fireEvent.click(link);

      expect(
        screen
          .getByTestId('ebook-reader-content')
          .querySelector('[data-ix="4"]')?.scrollIntoView
      ).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });
  });

  describe('scroll-only material (Guia do Professor)', () => {
    it('only scrolls and has no book controls', () => {
      render(<EbookReader content={content(GUIDE)} title="Guia" />);

      expect(flips).toHaveLength(0);
      expect(
        screen.queryByRole('button', { name: 'Ler em rolagem' })
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Próxima página' })
      ).toBeNull();
    });

    it('counts each section as it comes into view', () => {
      const onSectionsSeen = jest.fn();
      render(
        <EbookReader
          content={content(GUIDE)}
          title="Guia"
          onSectionsSeen={onSectionsSeen}
        />
      );
      const observer = FakeIntersectionObserver.instances[0];

      act(() => observer.show(observer.targets[1]));

      expect(onSectionsSeen).toHaveBeenCalledWith(['sala']);
    });

    it('scrolls to the section of a link', () => {
      render(<EbookReader content={content(GUIDE)} title="Guia" />);

      fireEvent.click(screen.getByText('Ir para a sala'));

      expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });

  it('starts over when another book is shown', () => {
    const onSectionsSeen = jest.fn();
    const { rerender } = render(
      <EbookReader
        content={content()}
        title="Livro"
        onSectionsSeen={onSectionsSeen}
      />
    );
    initBook();

    rerender(
      <EbookReader
        content={{ ...content(), html: BOOK.replace('Capa', 'Outra capa') }}
        title="Livro"
        onSectionsSeen={onSectionsSeen}
      />
    );
    initBook();

    expect(onSectionsSeen.mock.calls).toEqual([[['capa']], [['capa']]]);
  });

  describe('pages on screen, for the narration', () => {
    const renderBook = () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const contentRef = { current: element };
      const hook = renderHook(() => useEbookBook({ contentRef, html: BOOK }));
      return { hook, element };
    };

    it('lists both pages of a spread', () => {
      const { hook } = renderBook();
      act(() => lastFlip().flip(1));

      expect(
        hook.result.current.getVisiblePages().map((page) => page.dataset.secao)
      ).toEqual(['rosto', 'sumario']);
    });

    it('lists the single page in portrait', () => {
      const { hook } = renderBook();
      lastFlip().orientation = 'portrait';
      act(() => lastFlip().flip(3));

      expect(
        hook.result.current.getVisiblePages().map((page) => page.dataset.secao)
      ).toEqual(['caso']);
    });

    it('lists the page being read in scroll', () => {
      const { hook } = renderBook();
      act(() => lastFlip().flip(3));
      act(() => hook.result.current.toggleLayout());

      expect(
        hook.result.current.getVisiblePages().map((page) => page.dataset.secao)
      ).toEqual(['caso']);
    });

    it('lists nothing before the reader is drawn', () => {
      const contentRef = { current: null };
      const { result } = renderHook(() =>
        useEbookBook({ contentRef, html: BOOK })
      );

      expect(result.current.getVisiblePages()).toEqual([]);
    });
  });

  describe('contents', () => {
    it('lists the links of the book contents and turns to the chosen one', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();

      fireEvent.click(screen.getByRole('button', { name: 'Sumário' }));
      const entries = screen.getAllByRole('menuitem');
      expect(entries.map((entry) => entry.textContent)).toEqual([
        'O caso',
        'Ir para a página 4',
      ]);

      fireEvent.click(entries[1]);
      expect(lastFlip().index).toBe(4);
    });

    it('marks the entry being read', () => {
      render(<EbookReader content={content()} title="Livro" />);
      initBook();
      act(() => lastFlip().flip(3));

      fireEvent.click(screen.getByRole('button', { name: 'Sumário' }));

      expect(screen.getByRole('menuitem', { name: 'O caso' })).toHaveAttribute(
        'aria-current',
        'true'
      );
      expect(
        screen.getByRole('menuitem', { name: 'Ir para a página 4' })
      ).not.toHaveAttribute('aria-current');
    });

    it('marks the guide entry of the section in view', () => {
      render(<EbookReader content={content(GUIDE)} title="Guia" />);
      const observer = FakeIntersectionObserver.instances[0];
      act(() => observer.show(observer.targets[1]));

      fireEvent.click(screen.getByRole('button', { name: 'Sumário' }));

      expect(
        screen.getByRole('menuitem', { name: 'Ir para a sala' })
      ).toHaveAttribute('aria-current', 'true');
    });

    it('has no contents button when the book has no contents', () => {
      render(
        <EbookReader
          content={content(BOOK.replace(/<nav[^]*?<\/nav>/, ''))}
          title="Livro"
        />
      );

      expect(screen.queryByRole('button', { name: 'Sumário' })).toBeNull();
    });
  });

  describe('page changes, for the reading telemetry', () => {
    it('reports the page being read and every section on screen', () => {
      const onPageChange = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onPageChange={onPageChange}
        />
      );
      initBook();
      act(() => lastFlip().flip(3));
      act(() => lastFlip().flip(5));

      expect(onPageChange.mock.calls).toEqual([
        [{ section: 'capa', sections: ['capa'] }],
        [{ section: 'caso', sections: ['caso', 'p04'] }],
        [{ section: 'ficha', sections: ['ficha', 'fim'] }],
      ]);
    });

    it('reports a page once, however many times it is drawn', () => {
      const onPageChange = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onPageChange={onPageChange}
        />
      );
      initBook();
      initBook();
      act(() => lastFlip().flip(0));

      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('reports the page that scrolls into view', () => {
      const onPageChange = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onPageChange={onPageChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Ler em rolagem' }));
      const observer = FakeIntersectionObserver.instances[0];

      act(() => observer.show(observer.targets[3]));

      expect(onPageChange).toHaveBeenLastCalledWith({
        section: 'caso',
        sections: ['caso'],
      });
    });

    it('reports the section of a scroll-only material in view', () => {
      const onPageChange = jest.fn();
      render(
        <EbookReader
          content={content(GUIDE)}
          title="Guia"
          onPageChange={onPageChange}
        />
      );
      const observer = FakeIntersectionObserver.instances[0];

      act(() => observer.show(observer.targets[1]));

      expect(onPageChange).toHaveBeenLastCalledWith({
        section: 'sala',
        sections: ['sala'],
      });
    });

    it('reports nothing in preview', () => {
      const onPageChange = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          mode="preview"
          onPageChange={onPageChange}
        />
      );
      initBook();

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('reports the cover again when another book is shown', () => {
      const onPageChange = jest.fn();
      const { rerender } = render(
        <EbookReader
          content={content()}
          title="Livro"
          onPageChange={onPageChange}
        />
      );
      initBook();

      rerender(
        <EbookReader
          content={{ ...content(), html: BOOK.replace('Capa', 'Outra capa') }}
          title="Livro"
          onPageChange={onPageChange}
        />
      );
      initBook();

      expect(onPageChange).toHaveBeenCalledTimes(2);
    });
  });
});
