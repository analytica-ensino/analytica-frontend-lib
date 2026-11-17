import { act, fireEvent, render, screen } from '@testing-library/react';
import { useThemeStore } from '../../store/themeStore';
import {
  BOOK,
  GUIDE,
  ebookContent as content,
  initBook,
  installEbookDoubles,
  lastFlip,
  resetEbookDoubles,
} from '../../testing/ebookReaderDoubles';
import EbookReader, { EBOOK_MATERIAL_TYPE } from './EbookReader';

jest.mock('page-flip', () => ({
  PageFlip: jest.requireActual('../../testing/ebookReaderDoubles').FakePageFlip,
}));

const DETAILS = {
  code: 'EB40',
  theme: 'Educação 4.0 e 5.0',
  audience: '4º ano',
  authors: ['Equipe Pedagógica Analytica Ensino'],
  bncc: ['EF15LP14', 'EF04MA27'],
  words: 1128,
  readingMinutes: 17,
};

/** Wide screens (≥ 768 px) open the details panel at start. */
const openDetailsOnWideScreens = (wide: boolean) => {
  jest.spyOn(globalThis, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: wide && query === '(min-width: 768px)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList
  );
};

describe('EbookReader', () => {
  beforeAll(installEbookDoubles);

  beforeEach(() => {
    resetEbookDoubles();
    useThemeStore.setState({ isDark: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(document, 'fullscreenEnabled', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    });
  });

  it('draws the sanitized book inside a .ebook-leitor that follows the platform theme', () => {
    useThemeStore.setState({ isDark: true });
    const { container } = render(
      <EbookReader
        content={content(
          `${BOOK}<script>steal()</script><img src="img/a.webp" alt="a">`
        )}
        title="O Caso da Couve Mordida"
        subtitle="4º ano · Educação 4.0 e 5.0"
      />
    );

    const stage = container.querySelector('.ebook-leitor');
    expect(stage).toHaveAttribute('data-theme', 'dark');
    expect(stage?.querySelector('style')?.textContent).toBe(
      '.ebook-leitor .pg { color: red; }'
    );
    expect(container.querySelector('script')).toBeNull();
    expect(
      screen.getByRole('region', { name: 'O Caso da Couve Mordida' })
    ).toBeInTheDocument();
    expect(screen.getByText('4º ano · Educação 4.0 e 5.0')).toBeInTheDocument();
  });

  it('loads the book CSS with its files resolved against the version', () => {
    const { container } = render(
      <EbookReader
        content={{
          ...content(),
          css: "@import url('https://fonts.googleapis.com/css2');.ebook-leitor .capa { background: url(img/capa.webp); }",
        }}
        title="Livro"
      />
    );

    expect(container.querySelector('.ebook-leitor style')?.textContent).toBe(
      '.ebook-leitor .capa { background: url("https://cdn.example.com/ebooks/eb40/3/img/capa.webp"); }'
    );
  });

  describe('details panel', () => {
    it('opens beside the book on a wide screen and closes', () => {
      openDetailsOnWideScreens(true);
      render(
        <EbookReader content={content()} title="Livro" details={DETAILS} />
      );
      const toggle = screen.getByRole('button', {
        name: 'Fechar a ficha do material',
      });

      const panel = screen.getByRole('complementary', {
        name: 'Ficha do material',
      });
      expect(toggle).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveTextContent('EB40');
      expect(panel).toHaveTextContent('EF15LP14, EF04MA27');
      expect(panel).toHaveTextContent('1.128 palavras, cerca de 17 min');

      fireEvent.click(toggle);
      expect(screen.queryByRole('complementary')).toBeNull();
    });

    it('stays closed on a phone until asked', () => {
      openDetailsOnWideScreens(false);
      render(
        <EbookReader content={content()} title="Livro" details={DETAILS} />
      );

      expect(screen.queryByRole('complementary')).toBeNull();
      fireEvent.click(
        screen.getByRole('button', { name: 'Abrir a ficha do material' })
      );
      expect(
        screen.getByRole('complementary', { name: 'Ficha do material' })
      ).toBeInTheDocument();
    });

    it('does not show without details', () => {
      openDetailsOnWideScreens(true);
      render(<EbookReader content={content()} title="Livro" />);

      expect(screen.queryByRole('complementary')).toBeNull();
    });
  });

  describe('materials', () => {
    it('switches material through the tabs', () => {
      const onMaterialChange = jest.fn();
      render(
        <EbookReader
          content={content()}
          title="Livro"
          onMaterialChange={onMaterialChange}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: 'Guia do professor' }));

      expect(onMaterialChange).toHaveBeenCalledWith(
        EBOOK_MATERIAL_TYPE.TEACHER
      );
    });

    it('shows the guide with the design system typography', () => {
      const { container } = render(
        <EbookReader
          content={content(GUIDE)}
          title="Guia"
          material={EBOOK_MATERIAL_TYPE.TEACHER}
        />
      );

      expect(container.querySelector('.ebook-leitor')).toHaveAttribute(
        'data-ds-typography'
      );
    });

    it('keeps the book typography in the student book', () => {
      const { container } = render(
        <EbookReader content={content()} title="Livro" />
      );

      expect(container.querySelector('.ebook-leitor')).not.toHaveAttribute(
        'data-ds-typography'
      );
    });
  });

  describe('full screen', () => {
    it('is not offered where the browser does not allow it', () => {
      render(<EbookReader content={content()} title="Livro" />);

      expect(screen.queryByRole('button', { name: 'Tela cheia' })).toBeNull();
    });

    it('shows only the book and the controls', () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        configurable: true,
        value: true,
      });
      const requestFullscreen = jest.fn().mockResolvedValue(undefined);
      HTMLElement.prototype.requestFullscreen = requestFullscreen;
      render(<EbookReader content={content()} title="Livro" />);
      const reader = screen.getByRole('region', { name: 'Livro' });

      fireEvent.click(screen.getByRole('button', { name: 'Tela cheia' }));
      expect(requestFullscreen).toHaveBeenCalled();

      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: reader,
      });
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(screen.queryByRole('heading', { name: 'Livro' })).toBeNull();
      expect(
        screen.getByRole('button', { name: 'Sair da tela cheia' })
      ).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('shows the reading progress of the book', () => {
      render(<EbookReader content={content()} title="Livro" />);
      lastFlip().index = 3;
      initBook();

      expect(screen.getByTestId('ebook-reader-progress')).toHaveStyle({
        width: '50%',
      });
    });

    it('offers the narration when the book has one', () => {
      render(
        <EbookReader
          content={{
            ...content(),
            narration: [
              {
                section: 'caso',
                file: 'audio/narracao.mp3',
                start: 0,
                end: 10,
                clips: [
                  { id: 'p3-1', start: 0, end: 9, audioDescription: true },
                ],
              },
            ],
          }}
          title="Livro"
        />
      );

      expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Audiodescrição (AD)' })
      ).toBeInTheDocument();
    });

    it('offers no narration without one', () => {
      render(<EbookReader content={content()} title="Livro" />);

      expect(screen.queryByRole('button', { name: 'Ouvir' })).toBeNull();
    });

    it('shows extra controls before the round buttons', () => {
      render(
        <EbookReader
          content={content()}
          title="Livro"
          footerExtra={<button type="button">Baixar</button>}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Baixar' })
      ).toBeInTheDocument();
    });
  });
});
