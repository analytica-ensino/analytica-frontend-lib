import { CSSProperties, forwardRef, memo, ReactNode, Ref, useId } from 'react';
import 'katex/dist/katex.min.css';
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';
import { KatexMath } from './KatexMath';
import { cn } from '../../utils/utils';
import { normalizeLineBreaksInHtml } from '../../utils/htmlLineBreaks';
import MarkdownMathRenderer from '../MarkdownMathRenderer/MarkdownMathRenderer';
import {
  isLikelyMarkdown,
  processHtmlWithMath,
  sanitizeHtmlForDisplay,
  type MathPart,
} from './utils';

/**
 * Attribute that ties a placeholder span to the renderer instance that emitted
 * it. `data-math-id` alone is guessable, and `LatexRenderer` in this same
 * library emits exactly that attribute — without the owner check, a span coming
 * from the author's own content could be swapped for an unrelated formula.
 */
const MATH_OWNER_ATTR = 'data-math-owner';

/**
 * Builds the `html-react-parser` callback that swaps placeholder spans for
 * KaTeX components.
 *
 * Kept at module level so the parent does not declare a new component on every
 * render.
 * @param config - the parts to resolve, the owning instance id, whether the
 * renderer is in inline mode, and the error renderer to use
 * @returns A `replace` callback for `HTMLReactParserOptions`
 */
const createMathReplacer = ({
  parts,
  owner,
  inline,
  errorRenderer,
}: {
  parts: MathPart[];
  owner: string;
  inline: boolean;
  errorRenderer: (latex: string) => ReactNode;
}) => {
  return (domNode: DOMNode) => {
    if (
      !(domNode instanceof Element) ||
      domNode.name !== 'span' ||
      domNode.attribs[MATH_OWNER_ATTR] !== owner
    ) {
      return;
    }

    const part = parts[Number(domNode.attribs['data-math-id'])];
    if (!part?.latex) return <></>;

    const math = (
      <KatexMath
        math={part.latex}
        displayMode={part.type === 'block-math' && !inline}
        renderError={() => errorRenderer(part.latex!)}
      />
    );

    // In inline mode block math stays inline: a <div> would be invalid
    // inside the phrasing content this renderer is nested in.
    if (part.type !== 'block-math' || inline) return math;

    return <div className="my-2.5 text-center">{math}</div>;
  };
};

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
    // Declared before the early return below so the hook order stays stable.
    const mathOwner = useId();

    // AI-generated questions/resolutions arrive as Markdown + LaTeX. The HTML
    // pipeline below would render their `**`/`####`/`*` tokens literally and
    // collapse line breaks, so route that content to the Markdown renderer.
    // Inline usage stays on the HTML path to keep phrasing-content validity
    // (Markdown emits block elements: <p>, <ul>, <h4>, ...).
    //
    // Note: `renderMathError` is intentionally not forwarded here. The Markdown
    // path renders math via rehype-katex, which already degrades gracefully on
    // invalid LaTeX (KaTeX's built-in red error output) rather than throwing.
    // `renderMathError` is an HTML-path-only customization and is currently
    // unused by any consumer; honoring it on the Markdown path would require a
    // bespoke rehype plugin for no practical gain.
    if (!inline && content && isLikelyMarkdown(content)) {
      return (
        <MarkdownMathRenderer
          ref={ref as Ref<HTMLDivElement>}
          content={content}
          className={className}
          style={style}
          testId={testId}
        />
      );
    }

    const defaultErrorRenderer = (latex: string) => (
      <span className="text-error-600 text-sm">Math Error: {latex}</span>
    );

    const errorRenderer = renderMathError || defaultErrorRenderer;

    const renderContent = () => {
      if (!content) return null;

      // Question content is stored as plain text with `\n` line breaks mixed
      // with loose inline tags. Newlines are insignificant whitespace in HTML,
      // so without this the whole thing renders as one collapsed run of text.
      // Content that is already structured HTML passes through untouched.
      //
      // Breaks are always emitted as <br>, never <p>: the mixed text+math path
      // below wraps each part in its own element, which would cut a paragraph
      // in half across a math expression. <br> is inline and survives the split
      // intact — and `[&_p]:mb-0` below means paragraphs carry no spacing here
      // anyway, so there is nothing to gain from block elements.
      const normalizedContent = normalizeLineBreaksInHtml(content, {
        inline: true,
      });

      const processedContent = sanitize
        ? sanitizeHtmlForDisplay(normalizedContent)
        : normalizedContent;

      const parts = processHtmlWithMath(processedContent);

      // If all parts are text (or empty), render as plain HTML. Use the
      // joined parts (not the raw `processedContent`) so post-split fixes
      // applied inside `processHtmlWithMath` — like decoding `\$` escapes
      // to literal `$` — actually reach the rendered output.
      if (parts.every((part) => part.type === 'text')) {
        const joinedHtml = parts.map((part) => part.content).join('');
        // Use span for inline mode to allow valid nesting in labels
        const Element = inline ? 'span' : 'div';
        return (
          <Element
            dangerouslySetInnerHTML={{
              __html: joinedHtml || processedContent,
            }}
          />
        );
      }

      // Rebuild the document with inert placeholders where the math was, then
      // parse it ONCE.
      //
      // Rendering each part in its own `dangerouslySetInnerHTML` span (what this
      // used to do) cuts block tags in half: a statement like
      // `<p>Ao final da rodada <math/>, qual é…</p>` splits into a text part
      // ending with an unclosed `<p>` and another starting with a stray `</p>`.
      // The browser closes the dangling `<p>`, which is display:block, and the
      // paragraph breaks right before the formula. Re-emitting the text parts
      // verbatim and concatenating them restores the original markup, so the
      // paragraph survives as a single element.
      const withPlaceholders = parts
        .map((part, index) =>
          part.type === 'text'
            ? part.content
            : `<span ${MATH_OWNER_ATTR}="${mathOwner}" data-math-id="${index}"></span>`
        )
        .join('');

      const options: HTMLReactParserOptions = {
        replace: createMathReplacer({
          parts,
          owner: mathOwner,
          inline,
          errorRenderer,
        }),
      };

      return <>{parse(withPlaceholders, options)}</>;
    };

    const sharedClassName = cn(
      // Base styles
      'leading-relaxed',
      // Paragraph styles
      '[&_p]:mb-0',
      // Hide the KaTeX MathML accessibility layer visually (still readable
      // to screen readers). Tailwind preflight overrides the KaTeX default
      // `position: absolute; clip:...` rule, so the MathML layer ends up
      // duplicating every formula as raw text next to the visual render.
      '[&_.katex-mathml]:sr-only',
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
      // Text formatting styles
      '[&_b]:font-bold [&_strong]:font-bold',
      '[&_i]:italic [&_em]:italic',
      '[&_u]:underline',
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
