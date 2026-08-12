/** Characters that change the meaning of HTML, and their entities. */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value before interpolating it into hand-built HTML.
 *
 * The printable sheets are assembled by string concatenation from API data —
 * exam titles, student names — and rendered in a print window. Without this, a
 * title carrying markup would execute there.
 *
 * Quotes are escaped too, so a value is safe inside an attribute as well as in
 * a text node.
 *
 * @param value - Raw text; `null`/`undefined` become an empty string
 * @returns The value with HTML-significant characters replaced by entities
 */
export const escapeHtml = (value: string | null | undefined): string =>
  (value ?? '').replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
