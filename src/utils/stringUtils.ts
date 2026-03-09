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
