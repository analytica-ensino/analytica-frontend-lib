import {
  buildMathSpan,
  createLatexEnvPattern,
  createMathSpanPattern,
  readMathSpanAttributes,
  replaceDollarMath,
} from '../../../utils/latexMath';

// Re-exported so RichEditor consumers keep a single import surface.
export { normalizeLineBreaksInHtml } from '../../../utils/htmlLineBreaks';

/**
 * Escapes plain text so it can be safely spliced into an HTML string.
 * Used before {@link processLatexInHtml} on clipboard `text/plain` payloads,
 * which carry no markup of their own.
 */
export function escapeHtmlText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Applies `convert` only to the stretches of `html` that sit outside an
 * existing math span.
 *
 * Every conversion stage has to be wrapped in this: a `data-latex` payload
 * routinely holds `\begin{pmatrix}` or `$`, and re-scanning it would nest a
 * second span inside the attribute and destroy the stored formula. That
 * includes spans a previous stage just created.
 */
function outsideMathSpans(
  html: string,
  convert: (segment: string) => string
): string {
  let result = '';
  let cursor = 0;

  for (const match of html.matchAll(createMathSpanPattern())) {
    result += convert(html.slice(cursor, match.index)) + match[0];
    cursor = match.index + match[0].length;
  }

  return result + convert(html.slice(cursor));
}

/**
 * Converte LaTeX escrito em texto (`$...$`, `$$...$$` ou um ambiente
 * `\begin{...}\end{...}` solto) nos spans `math-inline` que o TipTap reconhece.
 *
 * `$$...$$` é resolvido antes de `$...$` — a regex única anterior casava o `$x$`
 * interno de `$$x$$` e deixava cifrões órfãos na tela. Valores monetários
 * (`R$1,00 e de R$0,50`) são ignorados pelo scanner compartilhado, então nunca
 * viram fórmula.
 */
export function processLatexInHtml(html: string): string {
  if (!html) return html;

  const withDollarMath = outsideMathSpans(html, (segment) =>
    replaceDollarMath(segment, ({ latex, display }) =>
      buildMathSpan(latex, display)
    )
  );

  // Standalone environments (`\begin{pmatrix}...\end{pmatrix}` with no
  // delimiters around them) reach the editor from AI generation and from older
  // saves. The display renderer already treats them as block math, so the
  // editor has to agree — otherwise the same content is a formula for the
  // student and raw text for the author.
  return outsideMathSpans(withDollarMath, (segment) =>
    segment.replaceAll(createLatexEnvPattern(), (match) =>
      buildMathSpan(match, true)
    )
  );
}

/**
 * Converte spans math-inline de volta para o formato `$...$` / `$$...$$`.
 * Útil para exportar o conteúdo em formato mais simples.
 */
export function unprocessLatexInHtml(html: string): string {
  if (!html) return html;

  return html.replaceAll(createMathSpanPattern(), (match) => {
    const { latex, display } = readMathSpanAttributes(match);
    // Desescapa aspas
    const unescapedLatex = latex.replaceAll('&quot;', '"');
    const delimiter = display ? '$$' : '$';
    return `${delimiter}${unescapedLatex}${delimiter}`;
  });
}
