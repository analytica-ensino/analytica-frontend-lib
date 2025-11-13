import { CSSProperties, ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import DOMPurify from 'dompurify';
import parse, { Element, HTMLReactParserOptions } from 'html-react-parser';
import { cn } from '../../utils/utils';

/**
 * Props for the LatexRenderer component
 */
export interface LatexRendererProps {
  /** HTML content containing LaTeX expressions to render */
  content: string;
  /** Additional CSS classes to apply */
  className?: string;
  /** Inline styles to apply */
  style?: CSSProperties;
  /** Custom error renderer for invalid LaTeX expressions */
  onError?: (latex: string) => ReactNode;
}

/**
 * Helper function to sanitize HTML content to prevent XSS attacks
 */
const sanitizeHtml = (value: string): string => {
  return DOMPurify.sanitize(value, {
    ADD_ATTR: ['data-latex', 'data-display-mode', 'data-math', 'data-math-id'],
  });
};

/**
 * Helper function to clean latex from invisible characters
 */
const cleanLatex = (str: string): string => {
  // Remove zero-width characters, invisible characters, and other problematic Unicode
  return str.replaceAll(/[\u200B-\u200D\uFEFF]/g, '').trim();
};

/**
 * LatexRenderer component for Analytica Ensino platforms
 *
 * Renders HTML content with embedded LaTeX/KaTeX mathematical expressions.
 * Supports multiple LaTeX formats:
 * - Inline math: `$...$` or `<latex>...</latex>`
 * - Block math: `$$...$$`
 * - LaTeX environments: `\begin{equation}...\end{equation}`, etc.
 * - Editor format: `<span class="math-formula" data-latex="...">...</span>`
 *
 * @param content - HTML content with LaTeX expressions
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param onError - Custom error renderer
 * @returns Rendered content with mathematical expressions
 *
 * @example
 * ```tsx
 * <LatexRenderer content="The formula is $E = mc^2$" />
 *
 * <LatexRenderer
 *   content="Block equation: $$\sum_{i=1}^{n} x_i$$"
 *   className="my-custom-class"
 * />
 *
 * <LatexRenderer
 *   content="<p>Matrix: \begin{pmatrix} a & b \\ c & d \end{pmatrix}</p>"
 *   onError={(latex) => <span>Invalid: {latex}</span>}
 * />
 * ```
 */
const LatexRenderer = ({
  content,
  className,
  style,
  onError,
}: LatexRendererProps) => {
  const renderContentWithMath = (htmlContent: string) => {
    if (!htmlContent) return null;

    let processedContent = htmlContent;
    const mathParts: Array<{
      id: number;
      type: 'inline' | 'block';
      latex: string;
    }> = [];

    // Step 1: Handle math-formula spans (from the editor)
    const mathFormulaPattern =
      /<span[^>]*class="math-formula"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/g;
    processedContent = processedContent.replaceAll(
      mathFormulaPattern,
      (match, latex) => {
        const isDisplayMode = match.includes('data-display-mode="true"');
        const id = mathParts.length;
        mathParts.push({
          id,
          type: isDisplayMode ? 'block' : 'inline',
          latex: cleanLatex(latex),
        });
        return `<span data-math-id="${id}"></span>`;
      }
    );

    // Step 2: Handle wrapped math expressions (from math modal - legacy)
    const wrappedMathPattern =
      /<span[^>]*class="math-expression"[^>]*data-math="([^"]*)"[^>]*>.*?<\/span>/g;
    processedContent = processedContent.replaceAll(
      wrappedMathPattern,
      (match, latex) => {
        const id = mathParts.length;
        mathParts.push({
          id,
          type: 'inline',
          latex: cleanLatex(latex),
        });
        return `<span data-math-id="${id}"></span>`;
      }
    );

    // Step 3: Handle raw $$...$$ expressions (manual input or saved content) - BEFORE single $
    const doubleDollarPattern = /(?<!\\)\$\$([\s\S]+?)\$\$/g;
    processedContent = processedContent.replaceAll(
      doubleDollarPattern,
      (match, latex) => {
        const id = mathParts.length;
        mathParts.push({
          id,
          type: 'block',
          latex: cleanLatex(latex),
        });
        return `<span data-math-id="${id}"></span>`;
      }
    );

    // Step 4: Handle single $...$ expressions for inline math
    const singleDollarPattern = /(?<!\\)\$([\s\S]+?)\$/g;
    processedContent = processedContent.replaceAll(
      singleDollarPattern,
      (match, latex) => {
        const id = mathParts.length;
        mathParts.push({
          id,
          type: 'inline',
          latex: cleanLatex(latex),
        });
        return `<span data-math-id="${id}"></span>`;
      }
    );

    // Step 5: Handle <latex>...</latex> tags for inline math
    const latexTagPattern =
      /(?:<latex>|&lt;latex&gt;)([\s\S]*?)(?:<\/latex>|&lt;\/latex&gt;)/g;
    processedContent = processedContent.replaceAll(
      latexTagPattern,
      (match, latex) => {
        const id = mathParts.length;
        mathParts.push({
          id,
          type: 'inline',
          latex: cleanLatex(latex),
        });
        return `<span data-math-id="${id}"></span>`;
      }
    );

    // Step 6: Handle standalone LaTeX environments (align, equation, pmatrix, etc.) for block math
    const latexEnvPattern = /\\begin\{([^}]+)\}([\s\S]*?)\\end\{\1\}/g;
    processedContent = processedContent.replaceAll(latexEnvPattern, (match) => {
      const id = mathParts.length;
      mathParts.push({
        id,
        type: 'block',
        latex: cleanLatex(match),
      });
      return `<span data-math-id="${id}"></span>`;
    });

    // Sanitize the HTML with placeholders
    const sanitizedContent = sanitizeHtml(processedContent);

    // Default error renderer
    const defaultErrorRenderer = (latex: string) => (
      <span className="text-red-600">Math Error: {latex}</span>
    );

    const errorRenderer = onError || defaultErrorRenderer;

    // Parse HTML and replace math placeholders with React components
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (
          domNode instanceof Element &&
          domNode.name === 'span' &&
          domNode.attribs['data-math-id']
        ) {
          const mathId = Number.parseInt(domNode.attribs['data-math-id'], 10);
          const mathPart = mathParts[mathId];

          if (!mathPart) return domNode;

          if (mathPart.type === 'inline') {
            return (
              <InlineMath
                key={`math-${mathId}`}
                math={mathPart.latex}
                renderError={() => errorRenderer(mathPart.latex)}
              />
            );
          } else {
            return (
              <div key={`math-${mathId}`} className="my-2.5 text-center">
                <BlockMath
                  math={mathPart.latex}
                  renderError={() => errorRenderer(mathPart.latex)}
                />
              </div>
            );
          }
        }
        return domNode;
      },
    };

    return <>{parse(sanitizedContent, options)}</>;
  };

  return (
    <div
      className={cn('whitespace-pre-wrap leading-relaxed', className)}
      style={style}
    >
      {renderContentWithMath(content)}
    </div>
  );
};

export default LatexRenderer;
