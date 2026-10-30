import { sanitizeHtmlForDisplay } from './utils';

const XSS_PAYLOADS = [
  '<a href="jav&#9;ascript:alert(1)">x</a>',
  '<a href="&#1;javascript:alert(1)">x</a>',
  '<a href="JaVaScRiPt:alert(1)">x</a>',
  '<a href=" javascript:alert(1)">x</a>',
  '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text y="20">x</text></a></svg>',
  '<svg onload=alert(1)>',
  '<img src=x onerror=alert(1)>',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<div style="position:fixed;inset:0">x</div>',
  '<form action="https://evil/x"><input name="p"><button>ok</button></form>',
  '<base href="https://evil/">',
  '<meta http-equiv="refresh" content="0;url=https://evil">',
  '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
  '<a href="data:text/html,<script>alert(1)</script>">x</a>',
  '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
  '<p style="color: red; background: url(https://evil/x.png)">x</p>',
];

const FORBIDDEN_TAGS =
  'script, form, input, button, svg, math, style, iframe, base, meta, animate';

/** Lowercased, with whitespace and control characters removed, like a browser does. */
const normalizeUrl = (value: string) =>
  // eslint-disable-next-line no-control-regex
  value.replaceAll(/[\u0000- ]/g, '').toLowerCase();

const render = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = sanitizeHtmlForDisplay(html);
  return container;
};

describe('sanitizeHtmlForDisplay', () => {
  it.each(XSS_PAYLOADS)('neutralizes %s', (payload) => {
    const container = render(payload);

    expect(container.querySelector(FORBIDDEN_TAGS)).toBeNull();
    container.querySelectorAll('*').forEach((element) => {
      element.getAttributeNames().forEach((name) => {
        expect(name.startsWith('on')).toBe(false);
        if (['href', 'src', 'action', 'values'].includes(name)) {
          expect(normalizeUrl(element.getAttribute(name) ?? '')).not.toMatch(
            /^(javascript:|vbscript:|data:text|data:image\/svg)/
          );
        }
      });
      const style = element.getAttribute('style') ?? '';
      expect(style).not.toMatch(/position|inset|url\(/i);
    });
  });

  it('keeps formatting untouched', () => {
    const html = '<p>texto <strong>negrito</strong></p>';
    expect(sanitizeHtmlForDisplay(html)).toBe(html);
  });

  it('keeps the math attributes the renderer reads', () => {
    const html =
      '<span class="math-formula" data-latex="x^2" data-type="math-inline" data-display-mode="true"></span><span class="math-expression" data-math="y"></span>';
    expect(sanitizeHtmlForDisplay(html)).toBe(html);
  });

  it('drops data attributes that are not on the list', () => {
    expect(sanitizeHtmlForDisplay('<span data-foo="1">a</span>')).toBe(
      '<span>a</span>'
    );
  });

  it('keeps https links and forces a safe rel/target', () => {
    const link = render('<a href="https://site.com">s</a>').querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://site.com');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer nofollow');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  it('keeps https images', () => {
    const html = '<img src="https://cdn.site.com/a.png" alt="a">';
    expect(sanitizeHtmlForDisplay(html)).toBe(html);
  });

  it('keeps legacy raster base64 and http images', () => {
    const base64 = '<img src="data:image/png;base64,iVBORw0KGgo=">';
    const http = '<img src="http://cdn.site.com/a.png">';
    expect(sanitizeHtmlForDisplay(base64)).toBe(base64);
    expect(sanitizeHtmlForDisplay(http)).toBe(http);
  });

  it('drops http links', () => {
    expect(
      render('<a href="http://site.com">s</a>')
        .querySelector('a')
        ?.hasAttribute('href')
    ).toBe(false);
  });

  it('keeps only presentational inline styles', () => {
    expect(
      sanitizeHtmlForDisplay(
        '<p style="text-align: center; position: fixed; color: red">x</p>'
      )
    ).toBe('<p style="text-align: center; color: red">x</p>');
  });

  it('keeps tables and lists', () => {
    const html =
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td colspan="2">b</td></tr></tbody></table><ul><li>1</li></ul><ol><li>2</li></ol>';
    expect(sanitizeHtmlForDisplay(html)).toBe(html);
  });

  it('returns empty input as is', () => {
    expect(sanitizeHtmlForDisplay('')).toBe('');
  });
});
