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

/** Anything that is not a letter or a digit — the server folds these to spaces. */
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]/u;

/** A combining mark: the accent half of a decomposed (NFD) character. */
const COMBINING_MARK = /\p{M}/u;

/**
 * A text projected into the space the server matches in, plus the map back.
 *
 * `normalized[i]` came from `sourceIndex[i]` of the original string, so a match
 * found in the normalized text can be sliced out of the original one — which is
 * what keeps the accents and punctuation on screen while matching without them.
 */
type NormalizedProjection = {
  normalized: string;
  /** Original index each normalized character came from. */
  sourceIndex: number[];
  /** Index just past the original character each normalized char came from. */
  sourceEnd: number[];
};

/**
 * Project a string the way the server's `question_search_text` does: drop
 * accents, lowercase, turn every non-alphanumeric character into a space and
 * collapse runs of spaces.
 *
 * Iterates by code point rather than by UTF-16 index so surrogate pairs (emoji,
 * some math symbols) are never split in half.
 */
function project(text: string): NormalizedProjection {
  let normalized = '';
  const sourceIndex: number[] = [];
  const sourceEnd: number[] = [];
  let cursor = 0;

  for (const char of text) {
    const start = cursor;
    cursor += char.length;

    // A decomposed accent (NFD: "c" + U+0327) has to vanish exactly as it does
    // inside normalizeText, which strips marks after its own NFD pass. It is
    // neither a letter nor a digit, so without this it would fall into the
    // branch below and become a SEPARATOR: "Educação" written decomposed
    // projected to "educac a o" while the precomposed form gave "educacao", and
    // a search for "educacao" then matched one and not the other.
    if (COMBINING_MARK.test(char)) {
      // Absorb it into the base character's range so a match ending on an
      // accented letter still slices the accent along with it, instead of
      // leaving a stray mark just outside the highlight span.
      if (sourceEnd.length > 0) sourceEnd[sourceEnd.length - 1] = cursor;
      continue;
    }

    if (NON_ALPHANUMERIC.test(char)) {
      // Collapse: a space is only worth emitting after real content.
      if (normalized.length > 0 && !normalized.endsWith(' ')) {
        normalized += ' ';
        sourceIndex.push(start);
        sourceEnd.push(cursor);
      }
      continue;
    }

    // A single source character can normalize to more than one (and a
    // combining mark to none), so every emitted character maps back on its own.
    //
    // The map is indexed in UTF-16 code units, not code points, because that is
    // what reads it: `findRanges` locates matches with `indexOf` and measures
    // them with `needle.length`, both UTF-16. A non-BMP letter (𝐀, CJK ext B)
    // is one code point but two units, so iterating it by code point would push
    // one entry while `normalized` grew by two and shift every later index.
    //
    // So this counts units down rather than indexing: a plain `for-of` walks
    // code points and would reintroduce that bug, and an ascending index over
    // `.length` reads no element, which is all `prefer-for-of` asks about.
    const projected = normalizeText(char);
    normalized += projected;
    for (let unit = projected.length; unit > 0; unit--) {
      sourceIndex.push(start);
      sourceEnd.push(cursor);
    }
  }

  return { normalized, sourceIndex, sourceEnd };
}

/** Ranges of the ORIGINAL text to highlight, in order and non-overlapping. */
function findRanges(
  projection: NormalizedProjection,
  needles: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];

  for (const needle of needles) {
    let from = 0;
    let at = projection.normalized.indexOf(needle, from);
    while (at !== -1) {
      ranges.push({
        start: projection.sourceIndex[at],
        end: projection.sourceEnd[at + needle.length - 1],
      });
      from = at + needle.length;
      at = projection.normalized.indexOf(needle, from);
    }
  }

  // Different needles can overlap (the tokens of a phrase against each other),
  // and a fragment must not be built from overlapping slices. Longest-first on
  // a tie keeps the wider match. Comparing against the last KEPT range, not the
  // previous one in the array: a dropped range must not become the reference,
  // or a third range nested inside the first would be let back in.
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const kept: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = kept.at(-1);
    if (!last || range.start >= last.end) kept.push(range);
  }
  return kept;
}

/**
 * Wrap every occurrence of a search term in a highlight `<span>` inside an HTML string.
 *
 * Traverses only text nodes so HTML tags, attributes, and entities are never touched.
 * SSR-safe: returns the original HTML unchanged when running outside a browser context.
 *
 * Matching mirrors the server's `question_search_text`: accents, case,
 * punctuation and repeated whitespace are all ignored, so the phrase the server
 * matched is the phrase that lights up. Before this, matching was a plain
 * case-insensitive regex — the server answered `"educacao"` with a question
 * about `"educação"` and the frontend then highlighted nothing at all, leaving
 * the person to guess why the result was in the list.
 *
 * The whole term is highlighted when it is present; otherwise each of its words
 * is, which is what the results matched by scattered words need.
 *
 * Known limitation: a phrase split across tags (`<b>fotossíntese</b> é`) is not
 * highlighted, because the walk works one text node at a time and the phrase
 * exists in neither node alone. The server strips the tags before matching, so
 * such a question can be a legitimate result with nothing lit up in it.
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
 * highlightSearchTerm('<p>Educação básica</p>', 'educacao')
 * // '<p><span style="color:#2883D7;font-weight:600">Educação</span> básica</p>'
 *
 * highlightSearchTerm('<span class="katex">math</span>', 'katex')
 * // '<span class="katex">math</span>'  ← tag/attribute left intact
 */
export function highlightSearchTerm(html: string, term: string): string {
  if (!term || !html) return html;
  if (globalThis.window === undefined) return html;

  const phrase = project(term).normalized.trim();
  if (!phrase) return html;

  const tokens = phrase.split(' ').filter(Boolean);

  const container = document.createElement('div');
  container.innerHTML = html;

  const highlightTextNode = (textNode: Text): void => {
    const text = textNode.data;
    const projection = project(text);

    // The phrase as typed wins; the individual words are the fallback for the
    // results the server matched with the words out of order.
    let ranges = findRanges(projection, [phrase]);
    if (ranges.length === 0 && tokens.length > 1) {
      ranges = findRanges(projection, tokens);
    }
    if (ranges.length === 0) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const range of ranges) {
      if (range.start > cursor) {
        fragment.append(
          document.createTextNode(text.slice(cursor, range.start))
        );
      }
      const span = document.createElement('span');
      span.style.color = HIGHLIGHT_COLOR;
      span.style.fontWeight = '600';
      span.textContent = text.slice(range.start, range.end);
      fragment.append(span);
      cursor = range.end;
    }
    if (cursor < text.length) {
      fragment.append(document.createTextNode(text.slice(cursor)));
    }

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
