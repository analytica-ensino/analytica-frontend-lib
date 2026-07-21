/**
 * Block-level containers that indicate the content is already structured HTML.
 * Void/inline elements (img, br, b, span) are deliberately excluded: content can
 * mix them with plain-text line breaks and still need normalization.
 */
const BLOCK_LEVEL_TAG =
  /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|table|figure|section|article)\b/i;

/** A block whose entire content is a single image tag. */
const STANDALONE_IMAGE = /^<img\b[^>]*\/?>$/i;

export interface NormalizeLineBreaksOptions {
  /**
   * Render breaks using only `<br>` instead of `<p>` blocks. Required when the
   * output is placed inside phrasing content (a `<span>` or `<label>`), where
   * block elements are invalid HTML.
   */
  inline?: boolean;
}

/**
 * Converte quebras de linha de texto puro em estrutura HTML.
 *
 * Parte do conteúdo das questões é armazenada como texto puro com `\n`,
 * misturado a tags inline soltas (`<b>`) e LaTeX. Como `\n` é espaço em branco
 * insignificante em HTML, os parsers colapsam tudo em uma única linha corrida.
 * Esta função restaura a intenção antes da renderização.
 *
 * Conteúdo que já possui blocos é devolvido intacto — reconvertê-lo duplicaria
 * parágrafos e corromperia o que já está correto.
 */
export function normalizeLineBreaksInHtml(
  html: string,
  options: NormalizeLineBreaksOptions = {}
): string {
  if (!html?.includes('\n')) return html;
  if (BLOCK_LEVEL_TAG.test(html)) return html;

  const blocks = html
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return html;

  if (options.inline) {
    // A blank line still reads as a stronger separation than a soft break.
    return blocks
      .map((block) => block.replaceAll('\n', '<br>'))
      .join('<br><br>');
  }

  return blocks
    .map((block) => {
      // Images are block-level nodes: wrapping one in <p> makes editors lift it
      // out and leave an empty paragraph behind.
      if (STANDALONE_IMAGE.test(block)) return block;
      // A single newline is a soft break inside the same paragraph.
      return `<p>${block.replaceAll('\n', '<br>')}</p>`;
    })
    .join('');
}
