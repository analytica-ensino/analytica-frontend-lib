/**
 * Canonical LaTeX delimiter handling shared by the two sides of the pipeline:
 *
 * - the write path (`RichEditor`, which turns `$...$` / `$$...$$` into TipTap
 *   `mathInline` nodes and serializes them back as `<span data-type="math-inline">`)
 * - the display path (`HtmlMathRenderer`, which turns the stored HTML into
 *   KaTeX renders for the student/teacher surfaces)
 *
 * Both used to implement their own delimiter scanning with different regexes and
 * different currency heuristics, so a formula could render in the editor and
 * vanish (or change from inline to block) in "Ver como estudante". Everything
 * that decides "is this math, and is it inline or display?" lives here now.
 */

/** `data-type` value the editor writes for a math node. */
export const MATH_SPAN_TYPE = 'math-inline';

/** Attribute that flags a math node as display (block) math. */
export const MATH_DISPLAY_ATTR = 'data-display-mode';

/**
 * Matches a `<span data-type="math-inline" ...>` element, including a possible
 * (always empty in practice) body. Attribute order is not fixed — TipTap's
 * `mergeAttributes` decides it — so the LaTeX itself is pulled from the matched
 * tag with {@link readMathSpanAttributes} instead of a capture group.
 */
export const createMathSpanPattern = (): RegExp =>
  new RegExp(
    String.raw`<span\b[^>]*\bdata-type="${MATH_SPAN_TYPE}"[^>]*>[\s\S]*?<\/span>`,
    'g'
  );

/**
 * Matches a standalone LaTeX environment (`\begin{pmatrix}...\end{pmatrix}`).
 * Returned as a factory so callers never share `lastIndex` state.
 */
export const createLatexEnvPattern = (): RegExp =>
  /\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}/g;

/** Reads `data-latex` / `data-display-mode` out of a matched math span tag. */
export const readMathSpanAttributes = (
  spanHtml: string
): { latex: string; display: boolean } => {
  const latexMatch = /\bdata-latex="([^"]*)"/.exec(spanHtml);
  return {
    latex: latexMatch ? latexMatch[1] : '',
    display: new RegExp(String.raw`\b${MATH_DISPLAY_ATTR}="true"`).test(
      spanHtml
    ),
  };
};

/**
 * Serializes a math node back to the canonical span the editor persists.
 *
 * Only `"` is escaped: the input already comes from an HTML string, so its `&`
 * is either a bare alignment character (valid inside an attribute) or an
 * already-encoded entity that must not be double-encoded into `&amp;amp;`.
 */
export const buildMathSpan = (latex: string, display = false): string => {
  const escaped = latex.replaceAll('"', '&quot;');
  const displayAttr = display ? ` ${MATH_DISPLAY_ATTR}="true"` : '';
  return `<span data-type="${MATH_SPAN_TYPE}"${displayAttr} data-latex="${escaped}"></span>`;
};

/**
 * Letters that immediately precede `$` in the currency sigils used across the
 * Brazilian question bank: `R$` (real), `US$` / `U$` (dollar).
 */
const CURRENCY_SIGIL_PATTERN = /(?:R|US|U)$/;

/** Any construct that only appears in real LaTeX, never in a price. */
const LATEX_COMMAND_PATTERN = /[\\^_{}]/;

/**
 * True when a `$` opens a monetary amount rather than a math block.
 *
 * The failure this guards against: `"Guardava moedas de R$1,00 e de R$0,50"`
 * has two `$`, so a naive pairing sends `"1,00 e de R"` to KaTeX and renders
 * `R 1,00edeR 0,50`. Prose alone is not enough to detect it — `"1,00 e de R"`
 * has no word of 3+ letters, so the {@link looksLikeMath} heuristic passes it.
 *
 * @param before - the (up to) two characters preceding the `$`
 * @param captured - the text between this `$` and the next one
 */
export const isCurrencyAmount = (before: string, captured: string): boolean => {
  // Math expressions do not start a currency amount, and a real command
  // anywhere in the block settles it regardless of what precedes the `$`.
  if (!/^\s*\d/.test(captured)) return false;
  if (LATEX_COMMAND_PATTERN.test(captured)) return false;

  // `R$ 15,00 ...` / `US$ 3,50 ...`
  if (CURRENCY_SIGIL_PATTERN.test(before)) return true;

  // `$1,00 e de R$` — a number followed by prose. Two letters are enough here
  // ("e de" would slip past the 3-letter word count used for generic prose).
  return /[a-zA-Z]{2,}/.test(captured);
};

/** Position-based wrapper over {@link isCurrencyAmount}. */
export const isCurrencyDollar = (
  source: string,
  dollarIndex: number,
  captured: string
): boolean =>
  isCurrencyAmount(
    source.slice(Math.max(0, dollarIndex - 2), dollarIndex),
    captured
  );

/**
 * Heuristic that flags a string as "likely real math" vs prose. Used to reject
 * `$...$` blocks that wrap regular text — typically an author typing `$` as a
 * currency symbol, which pairs unrelated occurrences and sends Portuguese prose
 * to KaTeX (rendering every letter as a math variable).
 *
 * - Backslash commands / sub-super / grouping braces → definitely math.
 * - Otherwise it is PROSE once it holds enough real words (runs of 3+ letters).
 *   `x = 1`, `a + b`, `1 < 2`, `f0` and even a lone `abc` stay math.
 * - The word threshold drops to one when the block also contains a decimal
 *   number, since `"1,00 e vale"` is a price far more often than an equation.
 */
export const looksLikeMath = (str: string): boolean => {
  if (LATEX_COMMAND_PATTERN.test(str)) return true;
  const words = str.match(/[a-zA-Z]{3,}/g);
  if (!words) return true;
  const proseThreshold = /\d+[.,]\d/.test(str) ? 1 : 2;
  return words.length < proseThreshold;
};

/** A `$...$` or `$$...$$` region located inside a source string. */
export interface DollarMathMatch {
  /** Index of the first `$` of the opening delimiter. */
  start: number;
  /** Index just past the last `$` of the closing delimiter. */
  end: number;
  /** Raw LaTeX between the delimiters. */
  latex: string;
  /** `true` for `$$...$$`, which renders as centered display math. */
  display: boolean;
}

/**
 * Finds the next occurrence of `token` that is not preceded by a backslash.
 * Escapes are consumed two characters at a time, so `\$` never closes a block
 * and the `\\` row separator inside a matrix is stepped over safely.
 */
const indexOfUnescaped = (
  source: string,
  token: string,
  from: number
): number => {
  let index = from;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source.startsWith(token, index)) return index;
    index += 1;
  }
  return -1;
};

/**
 * Scans `source` left to right and returns every dollar-delimited math region.
 *
 * `$$...$$` is always tested before `$...$`, which is what the old single regex
 * got wrong: it matched the inner `$x$` of `$$x$$` and left orphan dollars
 * behind. A rejected candidate (currency or prose) only advances the cursor by
 * one character, so a real formula later in the same sentence is still found —
 * consuming the whole rejected span would swallow it.
 */
export const findDollarMath = (source: string): DollarMathMatch[] => {
  const matches: DollarMathMatch[] = [];
  if (!source) return matches;

  let index = 0;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] !== '$') {
      index += 1;
      continue;
    }

    if (source.startsWith('$$', index)) {
      const close = indexOfUnescaped(source, '$$', index + 2);
      const latex = close === -1 ? '' : source.slice(index + 2, close);
      if (close !== -1 && latex.trim()) {
        matches.push({ start: index, end: close + 2, latex, display: true });
        index = close + 2;
      } else {
        index += 2;
      }
      continue;
    }

    const close = indexOfUnescaped(source, '$', index + 1);
    if (close === -1) break;

    const latex = source.slice(index + 1, close);
    if (
      latex.trim() &&
      !isCurrencyDollar(source, index, latex) &&
      looksLikeMath(latex)
    ) {
      matches.push({ start: index, end: close + 1, latex, display: false });
      index = close + 1;
    } else {
      index += 1;
    }
  }

  return matches;
};

/**
 * Rewrites every dollar-delimited math region of `source` using `replacer`,
 * leaving the surrounding text untouched.
 */
export const replaceDollarMath = (
  source: string,
  replacer: (match: DollarMathMatch) => string
): string => {
  const matches = findDollarMath(source);
  if (matches.length === 0) return source;

  let output = '';
  let cursor = 0;
  for (const match of matches) {
    output += source.slice(cursor, match.start) + replacer(match);
    cursor = match.end;
  }
  return output + source.slice(cursor);
};

/**
 * Input-rule regex for `$$formula$$`, anchored at the caret so it fires the
 * moment the closing delimiter is typed.
 */
export const BLOCK_INPUT_RULE = /\$\$([^$]+)\$\$$/;

/**
 * Input-rule regex for `$formula$`. The lookbehind keeps it from claiming the
 * second `$` of a `$$` opener, so block math is never split into inline math.
 */
export const INLINE_INPUT_RULE = /(?<!\$)\$([^$\n]+)\$$/;
