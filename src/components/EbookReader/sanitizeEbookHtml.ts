import DOMPurify from 'dompurify';

type Purifier = ReturnType<typeof DOMPurify>;

/** Tags a book may use (backend `docs/EBOOKS-FORMATO.md`, "O que é permitido"). */
const ALLOWED_TAGS = [
  'main',
  'section',
  'header',
  'nav',
  'div',
  'span',
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'a',
  'img',
  'figure',
  'figcaption',
  'table',
  'caption',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'button',
  'svg',
  'path',
  'rect',
  'circle',
  'title',
];

/** Attributes a book may use, plus SVG geometry. `data-*` and `aria-*` are kept by DOMPurify's defaults. */
const ALLOWED_ATTR = [
  'class',
  'id',
  'style',
  'lang',
  'hidden',
  'title',
  'alt',
  'src',
  'href',
  'colspan',
  'rowspan',
  'scope',
  'role',
  'type',
  'loading',
  'width',
  'height',
  'viewBox',
  'xmlns',
  'focusable',
  'd',
  'x',
  'y',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
  'fill',
  'fill-rule',
  'clip-rule',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'transform',
];

let purifier: Purifier | null = null;

/** Base of the version being sanitized; read by the hooks during one synchronous call. */
let currentBase: string | null = null;

/**
 * True for a file inside the package (`img/x.webp`, `audio/narration.mp3`).
 * False for anything that would load from elsewhere: a URL with a scheme
 * (`https:`, `data:`, `javascript:`), a host (`//host/…`), an absolute path
 * (`/x`), a backslash (browsers read it as a slash) or a `..` step out of the
 * version's folder.
 * @param value - Path as written in the package
 */
export const isPackagePath = (value: string): boolean =>
  value !== '' &&
  !/^([a-z][a-z\d+.-]*:|\/)/i.test(value) &&
  !value.includes('\\') &&
  !value.split('/').includes('..');

/** Absolute URL of a path already known to be inside the package. */
const joinToBase = (path: string, base: string): string =>
  new URL(path, base.endsWith('/') ? base : `${base}/`).href;

/**
 * Resolves a package path against the version's base URL.
 * @param path - Path inside the package (e.g. `img/EB40_A01.webp`)
 * @param base - Base URL of the version's files
 * @returns Absolute URL, or `null` when the path is not inside the package
 */
export const resolvePackagePath = (
  path: string,
  base: string
): string | null => (isPackagePath(path) ? joinToBase(path, base) : null);

/**
 * Dedicated DOMPurify instance, so these hooks never leak into the global one
 * that LatexRenderer and other components share.
 */
const getPurifier = (): Purifier => {
  if (purifier) return purifier;
  purifier = DOMPurify(globalThis.window);

  purifier.addHook('afterSanitizeAttributes', (node) => {
    const element = node as Element;
    if (element.tagName === 'A') {
      // Only links inside the book: anything else would leave the reader.
      if (!(element.getAttribute('href') ?? '').startsWith('#')) {
        element.removeAttribute('href');
      }
      return;
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') ?? '';
      if (!isPackagePath(src)) {
        // Every image comes from the package; anything else is dropped.
        element.removeAttribute('src');
      } else if (currentBase) {
        element.setAttribute('src', joinToBase(src, currentBase));
      }
      return;
    }
    if (element.tagName === 'BUTTON') {
      element.setAttribute('type', 'button');
    }
  });

  return purifier;
};

/**
 * Sanitizes a book's `<main>` for display inside the platform page.
 *
 * The upload (AE-3318) already cleans the HTML; this runs again on display
 * with the same allowlist, as ArticleContent does. Scripts, event handlers
 * and outside resources never survive: links only point inside the book and
 * image paths are resolved against the version's files.
 *
 * @param html - The book's `<main>` as stored by the upload
 * @param assetBaseUrl - Base URL of the version's files; relative `src` resolve against it
 * @returns Safe HTML
 */
export const sanitizeEbookHtml = (
  html: string,
  assetBaseUrl?: string
): string => {
  const instance = getPurifier();
  currentBase = assetBaseUrl ?? null;
  try {
    return instance.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  } finally {
    currentBase = null;
  }
};
