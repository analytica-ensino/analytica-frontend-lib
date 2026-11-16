import { resolvePackagePath, sanitizeEbookHtml } from './sanitizeEbookHtml';

const BASE = 'https://cdn.example.com/ebooks/eb40/3';

describe('sanitizeEbookHtml', () => {
  it('keeps the book markup the reader relies on', () => {
    const html =
      '<main class="ebook-livro"><div id="livro" class="livro"><div class="pg pg-hq" data-secao="caso" data-density="hard" style="--cx:30%" role="region" aria-labelledby="t"><p data-trecho="p3-2" lang="en">Hi</p></div></div></main>';

    const safe = sanitizeEbookHtml(html, BASE);

    expect(safe).toContain('class="ebook-livro"');
    expect(safe).toContain('id="livro"');
    expect(safe).toContain('data-secao="caso"');
    expect(safe).toContain('data-density="hard"');
    expect(safe).toContain('style="--cx:30%"');
    expect(safe).toContain('aria-labelledby="t"');
    expect(safe).toContain('data-trecho="p3-2"');
    expect(safe).toContain('lang="en"');
  });

  it('removes scripts, event handlers and forbidden tags', () => {
    const html =
      '<p onclick="steal()">a</p><script>steal()</script><iframe src="https://x.com"></iframe><form><input></form><video src="v.mp4"></video>';

    const safe = sanitizeEbookHtml(html, BASE);

    expect(safe).toBe('<p>a</p>');
  });

  it('resolves package image paths against the version base and keeps lazy loading', () => {
    const safe = sanitizeEbookHtml(
      '<img src="img/EB40_A01.webp" alt="Capa" loading="lazy">',
      BASE
    );

    expect(safe).toBe(
      `<img src="${BASE}/img/EB40_A01.webp" alt="Capa" loading="lazy">`
    );
  });

  it.each([
    'https://evil.example.com/x.png',
    '//evil.example.com/x.png',
    '/img/x.png',
    'data:image/png;base64,AAAA',
  ])('drops the image source %s, which is outside the package', (src) => {
    const safe = sanitizeEbookHtml(`<img src="${src}" alt="x">`, BASE);

    expect(safe).toBe('<img alt="x">');
  });

  it('leaves an image without a source as it is', () => {
    expect(sanitizeEbookHtml('<img alt="x"><a>sem link</a>', BASE)).toBe(
      '<img alt="x"><a>sem link</a>'
    );
  });

  it('keeps links inside the book and drops the others', () => {
    const safe = sanitizeEbookHtml(
      '<a href="#p6">Seis</a><a href="https://x.com">Fora</a><a href="javascript:alert(1)">JS</a>',
      BASE
    );

    expect(safe).toBe('<a href="#p6">Seis</a><a>Fora</a><a>JS</a>');
  });

  it('turns every button into a plain button, so "ver resposta" never submits', () => {
    const safe = sanitizeEbookHtml(
      '<button class="ver-resposta" aria-expanded="false">Ver resposta</button>',
      BASE
    );

    expect(safe).toContain('type="button"');
    expect(safe).toContain('aria-expanded="false"');
  });

  it('leaves package paths relative when no base is given', () => {
    const safe = sanitizeEbookHtml('<img src="img/a.webp" alt="a">');

    expect(safe).toBe('<img src="img/a.webp" alt="a">');
  });

  it('does not carry the base of one call into the next', () => {
    sanitizeEbookHtml('<img src="img/a.webp" alt="a">', BASE);

    expect(sanitizeEbookHtml('<img src="img/b.webp" alt="b">')).toBe(
      '<img src="img/b.webp" alt="b">'
    );
  });
});

describe('resolvePackagePath', () => {
  it.each([
    [BASE, `${BASE}/audio/narracao.mp3`],
    [`${BASE}/`, `${BASE}/audio/narracao.mp3`],
  ])('joins the path to the base %s', (base, expected) => {
    expect(resolvePackagePath('audio/narracao.mp3', base)).toBe(expected);
  });
});
