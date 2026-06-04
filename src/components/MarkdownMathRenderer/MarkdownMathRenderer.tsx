import { CSSProperties, forwardRef, memo } from 'react';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '../../utils/utils';
import { looksLikeLatex } from '../HtmlMathRenderer/utils';

export interface MarkdownMathRendererProps {
  /** Markdown content, may contain LaTeX math expressions ($...$ / $$...$$) */
  content: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Strips zero-width / invisible characters that occasionally leak into
 * AI-generated content and break KaTeX parsing.
 */
const stripInvisibleChars = (str: string): string =>
  str.replaceAll(/[\u200B-\u200D\uFEFF]/g, '');

/**
 * Escapes the `$` of inline `$...$` spans that do NOT look like real math, so
 * `remark-math` leaves them as literal text. Without this, currency prose like
 * "R$ 15,00 ... R$ 42,00" gets paired up and rendered as gibberish math.
 *
 * Reuses the exact `looksLikeLatex` heuristic the HTML renderer applies to
 * single-`$` spans, so both renderers agree on what is math vs currency.
 * Display math (`$$...$$`) is intentionally left untouched (handled below).
 */
export const protectCurrencyInlineMath = (markdown: string): string =>
  markdown.replaceAll(
    /(?<!\\)\$(?!\$)([^\n$]+?)(?<!\\)\$(?!\$)/g,
    (match, inner: string) =>
      looksLikeLatex(inner) ? match : match.replaceAll('$', String.raw`\$`)
  );

/**
 * `remark-math` only renders a `$$...$$` block as centered display math when
 * the delimiters sit on their own lines ("math flow"). AI content usually puts
 * the whole equation on a single line (`$$x = y$$`), which would otherwise be
 * rendered inline. Reflow single-line `$$...$$` into block form so equations
 * stay centered, matching how the HTML renderer treats `$$`.
 */
export const reflowDisplayMath = (markdown: string): string =>
  markdown.replaceAll(
    /(?<!\$)\$\$(?!\$)([^\n]+?)\$\$(?!\$)/g,
    (_match, inner: string) => `\n\n$$\n${inner.trim()}\n$$\n\n`
  );

/**
 * Runs `transform` over the markdown while shielding fenced code blocks and
 * inline code spans: each is stashed behind a placeholder, the transform runs
 * on the rest, then the originals are restored before the markdown reaches
 * react-markdown. Without this, the currency / display-math passes would
 * rewrite literal `$`/`$$` that authors put inside code samples (e.g. a fenced
 * block containing `price = $value`). The placeholder is purely transient (it
 * never reaches the markdown parser) and contains no `$`, so the passes ignore
 * it.
 */
const withProtectedCode = (
  markdown: string,
  transform: (input: string) => string
): string => {
  const stash: string[] = [];
  const tokenized = markdown.replaceAll(
    /```[\s\S]*?```|`[^`\n]*`/g,
    (segment) => {
      const token = `__CODE_SEG_${stash.length}__`;
      stash.push(segment);
      return token;
    }
  );
  return transform(tokenized).replaceAll(
    /__CODE_SEG_(\d+)__/g,
    (_match, index: string) => stash[Number(index)]
  );
};

const preprocessMarkdown = (content: string): string =>
  withProtectedCode(stripInvisibleChars(content), (safe) =>
    reflowDisplayMath(protectCurrencyInlineMath(safe))
  );

/**
 * MarkdownMathRenderer - Renders Markdown content with embedded LaTeX math.
 *
 * Used for AI-generated questions and resolutions, which arrive as Markdown
 * (`**bold**`, `#### headings`, `* lists`, paragraphs) mixed with LaTeX
 * (`$...$` inline, `$$...$$` display). Built on `react-markdown` with
 * `remark-gfm` (tables/lists), `remark-math` + `rehype-katex` (math).
 *
 * SECURITY: raw HTML is intentionally NOT enabled (no `rehype-raw`). This
 * renderer only receives content classified as Markdown (no HTML tags) by
 * `isLikelyMarkdown`; HTML content keeps flowing through `HtmlMathRenderer`,
 * which sanitizes it. Adding raw-HTML support here would reintroduce an XSS
 * vector and requires a dedicated sanitization pipeline + security review.
 */
const MarkdownMathRenderer = forwardRef<
  HTMLDivElement,
  MarkdownMathRendererProps
>(({ content, className, style, testId }, ref) => {
  const sharedClassName = cn(
    'leading-relaxed',
    // Paragraph spacing
    '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
    // Headings
    '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-2',
    '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2',
    '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-1.5',
    '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2.5 [&_h4]:mb-1.5',
    '[&_h5]:font-semibold [&_h6]:font-semibold',
    // Lists
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2',
    '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2',
    '[&_li]:my-1 [&_li>ul]:my-1 [&_li>ol]:my-1',
    // Text formatting
    '[&_b]:font-bold [&_strong]:font-bold',
    '[&_i]:italic [&_em]:italic',
    '[&_u]:underline',
    '[&_blockquote]:border-l-4 [&_blockquote]:border-border-200 [&_blockquote]:pl-3 [&_blockquote]:text-text-700',
    '[&_code]:rounded [&_code]:bg-background-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm',
    // Hide the KaTeX MathML accessibility layer visually (still readable to
    // screen readers). Tailwind preflight overrides KaTeX's default clip
    // rule, so without this the MathML layer duplicates every formula as
    // raw text next to the visual render.
    '[&_.katex-mathml]:sr-only',
    // Display math spacing
    '[&_.katex-display]:my-2.5',
    // Tables (GFM)
    '[&_table]:border-collapse [&_table]:w-full [&_table]:my-2.5 [&_table]:table-auto',
    '[&_table_td]:border [&_table_td]:border-border-200 [&_table_td]:p-2 [&_table_td]:min-w-[50px] [&_table_td]:align-top',
    '[&_table_th]:border [&_table_th]:border-border-200 [&_table_th]:p-2 [&_table_th]:min-w-[50px] [&_table_th]:align-top [&_table_th]:bg-background-50 [&_table_th]:font-semibold',
    // Images and links
    '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-2',
    '[&_a]:text-primary-500 [&_a]:underline [&_a:hover]:text-primary-600',
    className
  );

  return (
    <div
      ref={ref}
      className={sharedClassName}
      style={style}
      data-testid={testId}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
});

MarkdownMathRenderer.displayName = 'MarkdownMathRenderer';

export default memo(MarkdownMathRenderer);
