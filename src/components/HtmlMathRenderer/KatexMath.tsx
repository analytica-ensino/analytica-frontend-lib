import { ReactNode } from 'react';
import katex from 'katex';

export interface KatexMathProps {
  /** LaTeX source to render */
  math: string;
  /** Render as centered display math (block) instead of inline */
  displayMode?: boolean;
  /** Called with the thrown error when KaTeX fails to parse `math` */
  renderError?: (error: unknown) => ReactNode;
}

/**
 * Renders a single LaTeX expression with KaTeX, calling `katex.renderToString`
 * directly instead of going through `react-katex`.
 *
 * Why not `react-katex`: when bundlers (Vite/esbuild dev optimizer, Rollup)
 * bundle `react-katex` they inline their OWN copy of KaTeX whose function
 * registry ends up broken — symbols render but `\`-commands (`\frac`, `\cdot`,
 * `\left`, ...) fail with a parse error. Importing `katex` directly here uses
 * the shared, correctly-bundled KaTeX (the same one `rehype-katex` uses), so
 * every command renders. See HtmlMathRenderer for the surrounding pipeline.
 */
/**
 * Esconde do leitor de tela o `<annotation encoding="application/x-tex">` que o
 * KaTeX embute dentro do MathML.
 *
 * Esse nó guarda o LaTeX de origem, como metadado. Leitor que entende MathML
 * pula o `<annotation>` sozinho — mas o cálculo de NOME ACESSÍVEL não pula, e
 * ele entra em cena sempre que a fórmula está dentro de um elemento cujo papel
 * achata o conteúdo (`radio`, `button`, `option`, `tab`...). Sem isto a frase
 * falada sai com a marcação no meio:
 *
 *   "x igual a menos b sobre 2 a, x = \frac{-b}{2a}"
 */
const hideLatexAnnotation = (html: string) =>
  html.replaceAll('<annotation ', '<annotation aria-hidden="true" ');

export const KatexMath = ({
  math,
  displayMode = false,
  renderError,
}: KatexMathProps) => {
  let html: string;
  try {
    html = hideLatexAnnotation(
      katex.renderToString(math, {
        displayMode,
        throwOnError: true,
      })
    );
  } catch (error_) {
    return <>{renderError ? renderError(error_) : null}</>;
  }

  const Tag = displayMode ? 'div' : 'span';
  return (
    <Tag
      data-testid="react-katex"
      // KaTeX output is sanitized markup it generates itself from the parsed
      // LaTeX; there is no untrusted HTML passthrough here.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default KatexMath;
