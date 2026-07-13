/** Highlight color applied to matched search terms */
const HIGHLIGHT_COLOR = '#2883D7';

/**
 * Strip HTML tags from a string
 * SSR-safe: uses DOMParser in browser, iterative fallback on server
 *
 * @param html - String that may contain HTML tags
 * @returns String with HTML tags removed
 *
 * @example
 * stripHtmlTags('<p>Hello <strong>World</strong></p>') // 'Hello World'
 * stripHtmlTags('No tags here') // 'No tags here'
 */
export function stripHtmlTags(html: string): string {
  if (globalThis.window !== undefined && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  // Server-side fallback: iterative O(n) approach to avoid regex backtracking
  let result = '';
  let inTag = false;
  for (const char of html) {
    if (char === '<') {
      inTag = true;
    } else if (char === '>') {
      inTag = false;
    } else if (!inTag) {
      result += char;
    }
  }
  return result;
}

/**
 * Normalize a string for case- and accent-insensitive comparison.
 * Decomposes characters via NFD, strips diacritic marks, then lowercases.
 *
 * @param value - The string to normalize
 * @returns Normalized string suitable for comparison
 *
 * @example
 * normalizeText('Matemática') // 'matematica'
 * normalizeText('Ação')       // 'acao'
 */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Wrap every occurrence of a search term in a highlight `<span>` inside an HTML string.
 *
 * Traverses only text nodes so HTML tags, attributes, and entities are never touched.
 * Matching is case-insensitive and regex special characters in the term are escaped.
 * SSR-safe: returns the original HTML unchanged when running outside a browser context.
 *
 * @param html - The HTML string to annotate (e.g. a question statement)
 * @param term - The search term to highlight
 * @returns HTML string with match occurrences wrapped in highlight spans,
 *          or the original string when `term`/`html` is empty or in an SSR environment
 *
 * @example
 * highlightSearchTerm('<p>Hello World</p>', 'world')
 * // '<p>Hello <span style="color:#2883D7;font-weight:600">World</span></p>'
 *
 * highlightSearchTerm('<span class="katex">math</span>', 'katex')
 * // '<span class="katex">math</span>'  ← tag/attribute left intact
 */
export function highlightSearchTerm(html: string, term: string): string {
  if (!term || !html) return html;
  if (globalThis.window === undefined) return html;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const matchRegex = new RegExp(escaped, 'gi');

  const container = document.createElement('div');
  container.innerHTML = html;

  const highlightTextNode = (textNode: Text): void => {
    const text = textNode.data;
    const matches = text.match(matchRegex);
    if (!matches) return;

    const parts = text.split(matchRegex);
    const fragment = document.createDocumentFragment();

    parts.forEach((part, i) => {
      if (part) fragment.append(document.createTextNode(part));
      if (i < matches.length) {
        const span = document.createElement('span');
        span.style.color = HIGHLIGHT_COLOR;
        span.style.fontWeight = '600';
        span.textContent = matches[i];
        fragment.append(span);
      }
    });

    textNode.replaceWith(fragment);
  };

  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      highlightTextNode(node as Text);
    } else {
      // Snapshot childNodes before mutating so the loop is not affected by replacements
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(container);
  return container.innerHTML;
}
