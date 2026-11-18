import { isPackagePath, resolvePackagePath } from './sanitizeEbookHtml';
import { EBOOK_FORMAT } from './types';

/** `@import` rules: they would load stylesheets from outside the package. */
const IMPORT_RULE = /@import\s[^;]*;?/gi;

/** Every `url(...)`, with or without quotes. */
const URL_FUNCTION = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

/** What an address that may not load becomes: an empty, invalid URL the browser ignores. */
const BLOCKED_URL = 'url("")';

/**
 * A theme rule the upload left on the document root, in front of the stage:
 * `:root[data-theme="dark"] .ebook-content`, or
 * `:root:not([data-theme="light"]) .ebook-content` (under
 * `prefers-color-scheme: dark`).
 */
const ROOT_THEME_RULE = new RegExp(
  String.raw`:root((?:\[data-theme[^\]]*\]|:not\(\[data-theme[^\]]*\]\))+)\s+\.${EBOOK_FORMAT.STAGE_CLASS}(?![\w-])`,
  'g'
);

/**
 * Moves the book's theme rules from the document root to the stage. The
 * platform's `<html data-theme>` holds its own theme names
 * (`enem-parana-light`, `base-dark`), never the book's `light` and `dark`;
 * the reader sets those on the stage, from the platform's theme. Left on the
 * root, a dark platform would show a light book, and a light platform on a
 * dark device a dark one.
 * @param css - The book's CSS
 * @returns The CSS with its theme rules on the stage
 */
const scopeThemeToStage = (css: string): string =>
  css.replace(ROOT_THEME_RULE, `.${EBOOK_FORMAT.STAGE_CLASS}$1`);

/**
 * Points the book's CSS at the version's files.
 *
 * The upload already scopes the selectors to `.ebook-content`; here the files
 * the CSS points at are dealt with. Inside the platform page a relative
 * `url(fonts/x.woff2)` would resolve against the platform, not the CDN, so
 * package paths are resolved against the version's files, as image sources
 * are; an address already inside the version's folder is kept. Addresses
 * outside it (another `https:` or `//host` address, an absolute path, a `..`
 * step) are dropped and `@import` rules removed, so a book never loads files
 * from elsewhere by mistake. Inline `data:` URIs and `#fragment` references
 * load nothing and are kept.
 *
 * Theme rules the upload left on the document root move to the stage,
 * where the reader sets the book's theme (see scopeThemeToStage).
 *
 * This is not a security boundary: the CSS comes from a package approved in
 * the backoffice (AE-3318), and a regular expression cannot follow every CSS
 * escape (`u\72l(…)`) or `image-set()` with bare strings.
 *
 * @param css - The book's CSS, as stored by the upload
 * @param assetBaseUrl - Base URL of the version's files
 * @returns CSS whose addresses all point inside the package
 */
export const sanitizeEbookCss = (css: string, assetBaseUrl?: string): string =>
  scopeThemeToStage(css)
    .replace(IMPORT_RULE, '')
    .replace(URL_FUNCTION, (whole, _quote: string, value: string) => {
      const address = value.trim();
      if (address.startsWith('#') || /^data:/i.test(address)) return whole;
      if (!assetBaseUrl) return isPackagePath(address) ? whole : BLOCKED_URL;
      const resolved = resolvePackagePath(address, assetBaseUrl);
      return resolved ? `url("${resolved}")` : BLOCKED_URL;
    });
