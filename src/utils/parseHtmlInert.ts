/**
 * Parses HTML in a separate document, where nothing runs.
 *
 * `innerHTML` on an element of the page runs `<img onerror>` even when the
 * element is never attached, and starts loading its images. In a document from
 * `DOMParser` there are no scripts and no fetches, so it is safe to read HTML
 * that was not sanitized yet.
 *
 * @param html - HTML to parse
 * @returns The body of the inert document, holding the parsed content
 * @example
 * parseHtmlInert('<img src=x onerror=alert(1)>text').textContent; // 'text'
 */
export const parseHtmlInert = (html: string): HTMLElement =>
  new DOMParser().parseFromString(`<!doctype html><body>${html}`, 'text/html')
    .body;
