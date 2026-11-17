import { isPackagePath, resolvePackagePath } from './sanitizeEbookHtml';

/** `@import` rules: they would load stylesheets from outside the package. */
const IMPORT_RULE = /@import\s[^;]*;?/gi;

/** Every `url(...)`, with or without quotes. */
const URL_FUNCTION = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

/** What an address that may not load becomes: an empty, invalid URL the browser ignores. */
const BLOCKED_URL = 'url("")';

/**
 * Points the book's CSS at the version's files.
 *
 * The upload already scopes the selectors to `.ebook-content`; here the files
 * the CSS points at are dealt with. Inside the platform page a relative
 * `url(fonts/x.woff2)` would resolve against the platform, not the CDN, so
 * package paths are resolved against the version's files, as image sources
 * are. Addresses outside the package (an `https:` or `//host` address, an
 * absolute path, a `..` step) are dropped and `@import` rules removed, so a
 * book never loads files from elsewhere by mistake. Inline `data:` URIs and
 * `#fragment` references load nothing and are kept.
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
  css
    .replace(IMPORT_RULE, '')
    .replace(URL_FUNCTION, (whole, _quote: string, value: string) => {
      const address = value.trim();
      if (address.startsWith('#') || /^data:/i.test(address)) return whole;
      if (!isPackagePath(address)) return BLOCKED_URL;
      if (!assetBaseUrl) return whole;
      return `url("${resolvePackagePath(address, assetBaseUrl)}")`;
    });
