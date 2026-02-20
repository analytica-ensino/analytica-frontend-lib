import { CSSProperties, forwardRef, memo, ReactNode, Ref } from 'react';
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
  /** Whether to render as inline element (span) instead of block (div). Use when inside labels or other phrasing content. */
  inline?: boolean;
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
const HtmlMathRenderer = forwardRef<HTMLElement, HtmlMathRendererProps>(
  (
    {
      content,
      className,
      style,
      sanitize = true,
      renderMathError,
      testId,
      inline = false,
    },
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

      // If all parts are text (or empty), render as plain HTML
      if (parts.every((part) => part.type === 'text')) {
        // Use span for inline mode to allow valid nesting in labels
        const Element = inline ? 'span' : 'div';
        return (
          <Element
            dangerouslySetInnerHTML={{
              __html: processedContent,
            }}
          />
        );
      }

      // Generate stable keys based on content
      const getPartKey = (part: (typeof parts)[0], idx: number) => {
        const contentHash = (part.latex || part.content).slice(0, 20);
        return `${part.type}-${idx}-${contentHash}`;
      };

      return (
        <>
          {parts.map((part, index) => {
            const key = getPartKey(part, index);
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

    const sharedClassName = cn(
      // Base styles
      'leading-relaxed',
      // Paragraph styles
      '[&_p]:mb-0',
      // Table styles (only relevant for block mode, but harmless for inline)
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
    );

    if (inline) {
      return (
        <span
          ref={ref as Ref<HTMLSpanElement>}
          className={sharedClassName}
          style={style}
          data-testid={testId}
        >
          {renderContent()}
        </span>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={sharedClassName}
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
