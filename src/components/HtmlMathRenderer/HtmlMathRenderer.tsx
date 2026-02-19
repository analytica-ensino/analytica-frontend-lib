import { CSSProperties, forwardRef, memo, ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { cn } from '../../utils/utils';
import { processHtmlWithMath, sanitizeHtmlForDisplay } from './utils';

export interface HtmlMathRendererProps {
  /** HTML content to render, may contain LaTeX math expressions */
  content: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Whether to sanitize HTML before rendering (default: true) */
  sanitize?: boolean;
  /** Custom error renderer for math errors */
  renderMathError?: (latex: string) => ReactNode;
  /** Test ID for testing */
  testId?: string;
}

/**
 * HtmlMathRenderer - Renders HTML content with LaTeX math expressions
 *
 * Supports multiple LaTeX formats:
 * - Display mode: $$...$$ (centered block)
 * - Inline mode: $...$ (inline with text)
 * - LaTeX tags: <latex>...</latex>
 * - Editor spans: <span class="math-formula" data-latex="...">
 * - Legacy spans: <span class="math-expression" data-math="...">
 * - LaTeX environments: \begin{...}...\end{...}
 *
 * @example
 * ```tsx
 * <HtmlMathRenderer
 *   content="<p>A fórmula é: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$</p>"
 * />
 * ```
 */
const HtmlMathRenderer = forwardRef<HTMLDivElement, HtmlMathRendererProps>(
  (
    { content, className, style, sanitize = true, renderMathError, testId },
    ref
  ) => {
    const defaultErrorRenderer = (latex: string) => (
      <span className="text-error-600 text-sm">Math Error: {latex}</span>
    );

    const errorRenderer = renderMathError || defaultErrorRenderer;

    const renderContent = () => {
      if (!content) return null;

      const processedContent = sanitize
        ? sanitizeHtmlForDisplay(content)
        : content;

      const parts = processHtmlWithMath(processedContent);

      // If no parts or all text, render as plain HTML
      if (parts.length === 0 || parts.every((part) => part.type === 'text')) {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: processedContent,
            }}
          />
        );
      }

      return (
        <>
          {parts.map((part, index) => {
            if (part.type === 'math' && part.latex) {
              return (
                <InlineMath
                  key={index}
                  math={part.latex}
                  renderError={() => errorRenderer(part.latex!)}
                />
              );
            } else if (part.type === 'block-math' && part.latex) {
              return (
                <div key={index} className="my-2.5 text-center">
                  <BlockMath
                    math={part.latex}
                    renderError={() => errorRenderer(part.latex!)}
                  />
                </div>
              );
            } else {
              return (
                <span
                  key={index}
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
        ref={ref}
        className={cn(
          // Base styles
          'whitespace-pre-wrap leading-relaxed',
          // Paragraph styles
          '[&_p]:mb-0',
          // Table styles
          '[&_table]:border-collapse [&_table]:w-full [&_table]:my-2.5 [&_table]:table-auto',
          '[&_table_td]:border [&_table_td]:border-border-200 [&_table_td]:p-2 [&_table_td]:min-w-[50px] [&_table_td]:align-top',
          '[&_table_th]:border [&_table_th]:border-border-200 [&_table_th]:p-2 [&_table_th]:min-w-[50px] [&_table_th]:align-top [&_table_th]:bg-background-50 [&_table_th]:font-semibold',
          '[&_table_tr:nth-child(even)]:bg-background-50/50',
          '[&_table_tr:hover]:bg-background-100/50',
          // Image styles
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-2',
          // Link styles
          '[&_a]:text-primary-500 [&_a]:underline [&_a:hover]:text-primary-600',
          className
        )}
        style={style}
        data-testid={testId}
      >
        {renderContent()}
      </div>
    );
  }
);

HtmlMathRenderer.displayName = 'HtmlMathRenderer';

export default memo(HtmlMathRenderer);
