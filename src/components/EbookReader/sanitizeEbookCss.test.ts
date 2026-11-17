import { sanitizeEbookCss } from './sanitizeEbookCss';

const BASE = 'https://cdn.example.com/ebooks/eb40/3/';

describe('sanitizeEbookCss', () => {
  it.each([
    ['url(fonts/baloo.woff2)', `url("${BASE}fonts/baloo.woff2")`],
    ["url('img/fundo.webp')", `url("${BASE}img/fundo.webp")`],
    ['url( "img/fundo.webp" )', `url("${BASE}img/fundo.webp")`],
  ])('resolves the package file %s against the version', (value, expected) => {
    expect(
      sanitizeEbookCss(`.ebook-leitor .capa { background: ${value}; }`, BASE)
    ).toBe(`.ebook-leitor .capa { background: ${expected}; }`);
  });

  it.each([
    'url(https://fonts.gstatic.com/s/baloo.woff2)',
    'url(//evil.example.com/x.png)',
    'url(/static/x.png)',
    'url(../outro-livro/fonts/x.woff2)',
  ])('blocks %s, which loads from outside the package', (value) => {
    expect(sanitizeEbookCss(`.a { background: ${value}; }`, BASE)).toBe(
      '.a { background: url(""); }'
    );
  });

  it.each(['url(data:image/png;base64,AAAA)', 'url(#gradiente)'])(
    'keeps %s, which loads nothing',
    (value) => {
      expect(sanitizeEbookCss(`.a { fill: ${value}; }`, BASE)).toBe(
        `.a { fill: ${value}; }`
      );
    }
  );

  it('removes @import rules', () => {
    const css =
      "@import url('https://fonts.googleapis.com/css2?family=Baloo+2');\n@import 'tema.css' screen;\n.ebook-leitor { color: red; }";

    expect(sanitizeEbookCss(css, BASE)).toBe(
      '\n\n.ebook-leitor { color: red; }'
    );
  });

  it('leaves package paths relative without a base', () => {
    expect(sanitizeEbookCss('.a { background: url(img/a.webp); }')).toBe(
      '.a { background: url(img/a.webp); }'
    );
  });

  it('rewrites every url of a font-face', () => {
    const css =
      "@font-face { font-family: 'Baloo 2'; src: url(fonts/b.woff2) format('woff2'), url(https://x.com/b.woff) format('woff'); }";

    expect(sanitizeEbookCss(css, BASE)).toBe(
      `@font-face { font-family: 'Baloo 2'; src: url("${BASE}fonts/b.woff2") format('woff2'), url("") format('woff'); }`
    );
  });
});
