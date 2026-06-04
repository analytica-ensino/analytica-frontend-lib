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
export const KatexMath = ({
  math,
  displayMode = false,
  renderError,
}: KatexMathProps) => {
  let html: string;
  try {
    html = katex.renderToString(math, {
      displayMode,
      throwOnError: true,
    });
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
