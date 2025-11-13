import { CSSProperties, ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
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
    const parts: Array<{
      type: 'text' | 'math' | 'block-math';
      content: string;
      latex?: string;
    }> = [];

    // Step 1: Handle math-formula spans (from the editor)
    const mathFormulaPattern =
      /<span[^>]*class="math-formula"[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/g;
    processedContent = processedContent.replaceAll(
      mathFormulaPattern,
      (match, latex) => {
        const isDisplayMode = match.includes('data-display-mode="true"');
        const placeholder = `__MATH_${parts.length}__`;
        parts.push({
          type: isDisplayMode ? 'block-math' : 'math',
          content: match,
          latex: cleanLatex(latex),
        });
        return placeholder;
      }
    );

    // Step 2: Handle wrapped math expressions (from math modal - legacy)
    const wrappedMathPattern =
      /<span[^>]*class="math-expression"[^>]*data-math="([^"]*)"[^>]*>.*?<\/span>/g;
    processedContent = processedContent.replaceAll(
      wrappedMathPattern,
      (match, latex) => {
        const placeholder = `__MATH_${parts.length}__`;
        parts.push({
          type: 'math',
          content: match,
          latex: cleanLatex(latex),
        });
        return placeholder;
      }
    );

    // Step 3: Handle raw $$...$$ expressions (manual input or saved content) - BEFORE single $
    // Use non-greedy match to avoid matching nested content
    // Use negative lookbehind to avoid matching \$$ (escaped dollars)
    const doubleDollarPattern = /(?<!\\)\$\$([\s\S]+?)\$\$/g;
    processedContent = processedContent.replaceAll(
      doubleDollarPattern,
      (match, latex) => {
        const placeholder = `__MATH_${parts.length}__`;
        parts.push({
          type: 'block-math',
          content: match,
          latex: cleanLatex(latex),
        });
        return placeholder;
      }
    );

    // Step 4: Handle single $...$ expressions for inline math - BEFORE standalone \begin...\end
    // Use non-greedy match to capture everything including \begin...\end within $...$
    // Use negative lookbehind to avoid matching \$ (escaped dollar)
    const singleDollarPattern = /(?<!\\)\$([\s\S]+?)\$/g;
    processedContent = processedContent.replaceAll(
      singleDollarPattern,
      (match, latex) => {
        const placeholder = `__MATH_${parts.length}__`;
        parts.push({
          type: 'math',
          content: match,
          latex: cleanLatex(latex),
        });
        return placeholder;
      }
    );

    // Step 5: Handle <latex>...</latex> tags for inline math
    // This handles both: actual HTML tags and escaped text like &lt;latex&gt;
    const latexTagPattern =
      /(?:<latex>|&lt;latex&gt;)([\s\S]*?)(?:<\/latex>|&lt;\/latex&gt;)/g;
    processedContent = processedContent.replaceAll(
      latexTagPattern,
      (match, latex) => {
        const placeholder = `__MATH_${parts.length}__`;
        parts.push({
          type: 'math',
          content: match,
          latex: cleanLatex(latex),
        });
        return placeholder;
      }
    );

    // Step 6: Handle standalone LaTeX environments (align, equation, pmatrix, etc.) for block math
    // This is now last to only catch environments NOT already within $ delimiters
    const latexEnvPattern = /\\begin\{([^}]+)\}([\s\S]*?)\\end\{\1\}/g;
    processedContent = processedContent.replaceAll(latexEnvPattern, (match) => {
      const placeholder = `__MATH_${parts.length}__`;
      parts.push({
        type: 'block-math',
        content: match,
        latex: cleanLatex(match), // Use the full environment and clean it
      });
      return placeholder;
    });

    // Step 7: Split remaining content by placeholders
    const finalParts: Array<{
      type: 'text' | 'math' | 'block-math';
      content: string;
      latex?: string;
    }> = [];

    let currentIndex = 0;
    const placeholderPattern = /__MATH_(\d+)__/g;
    let match;

    while ((match = placeholderPattern.exec(processedContent)) !== null) {
      // Add text before math
      if (match.index > currentIndex) {
        finalParts.push({
          type: 'text',
          content: processedContent.slice(currentIndex, match.index),
        });
      }

      // Add math expression
      const mathIndex = Number.parseInt(match[1], 10);
      if (parts[mathIndex]) {
        finalParts.push(parts[mathIndex]);
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < processedContent.length) {
      finalParts.push({
        type: 'text',
        content: processedContent.slice(currentIndex),
      });
    }

    // If no math found, return original content as HTML
    if (finalParts.every((part) => part.type === 'text')) {
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    // Default error renderer
    const defaultErrorRenderer = (latex: string) => (
      <span className="text-red-600">Math Error: {latex}</span>
    );

    const errorRenderer = onError || defaultErrorRenderer;

    return (
      <>
        {finalParts?.map((part, index) => {
          // Generate a stable key based on content and position
          const key = `${part.type}-${index}-${part.latex?.slice(0, 20) || part.content.slice(0, 20)}`;

          if (part.type === 'math' && part.latex) {
            return (
              <InlineMath
                key={key}
                math={part.latex}
                renderError={() => errorRenderer(part.latex!)}
              />
            );
          } else if (part.type === 'block-math' && part.latex) {
            return (
              <div key={key} className="my-2.5 text-center">
                <BlockMath
                  math={part.latex}
                  renderError={() => errorRenderer(part.latex!)}
                />
              </div>
            );
          } else {
            return (
              <span
                key={key}
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            );
          }
        })}
      </>
    );
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
