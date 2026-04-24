import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HtmlMathRenderer from '../HtmlMathRenderer/HtmlMathRenderer';
import { containsMath } from '../HtmlMathRenderer/utils';
import { cn } from '../../utils/utils';

/**
 * Props for the assistant content renderer
 */
export interface ChatbotContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Unambiguous math detection: only treats content as math when there is a
 * `$$...$$` display block, an explicit LaTeX block
 * (`\begin{...}...\end{...}`), or an inline `$...$` whose inner content
 * contains an unmistakably mathematical character (backslash / caret /
 * underscore / curly brace). This avoids false positives on prose that
 * contains currency like "R$ 20" or "por $20 e o livro $ 5".
 *
 * Instead of `matchAll` with a lazy regex (which would greedily consume
 * adjacent `$`s left-to-right and could miss a valid formula following a
 * currency span on the same line, e.g. "Preço R$ 20 e a fórmula $x^2+1$"),
 * we collect every `$` index and probe all pairs — detection is O(N²) in
 * the worst case but N here is the count of `$` on a single line, so in
 * practice it remains linear on realistic input.
 */
const MATH_CHAR_PATTERN = /[\\^_{}]/;

/**
 * Collect every unescaped `$` index in the content.
 */
function collectDollarIndices(content: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '$' && content[i - 1] !== '\\') {
      result.push(i);
    }
  }
  return result;
}

/**
 * Return true if any `$...$` pair spanning a single line contains a
 * math-only character.
 */
function hasInlineMathSpan(content: string, indices: number[]): boolean {
  for (let i = 0; i < indices.length; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      const inner = content.slice(indices[i] + 1, indices[j]);
      if (inner.includes('\n')) break;
      if (MATH_CHAR_PATTERN.test(inner)) return true;
    }
  }
  return false;
}

function looksLikeMath(content: string): boolean {
  if (!containsMath(content)) return false;
  if (/\$\$[\s\S]+?\$\$/.test(content)) return true;
  if (/\\begin\{[^}]+\}[\s\S]+?\\end\{[^}]+\}/.test(content)) return true;
  return hasInlineMathSpan(content, collectDollarIndices(content));
}

/**
 * Renders a markdown string safely. When the content contains inline LaTeX
 * ($...$ or $$...$$) we fallback to `HtmlMathRenderer`, which already
 * supports math. For plain markdown we use `react-markdown` with GFM
 * (tables, task lists, strikethrough) and no raw HTML — escape by default.
 */
export default function ChatbotContentRenderer({
  content,
  className,
}: Readonly<ChatbotContentRendererProps>) {
  if (looksLikeMath(content)) {
    return (
      <HtmlMathRenderer
        content={content}
        className={cn('whitespace-pre-wrap break-words', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none break-words',
        // tighten prose defaults so the bubble feels compact
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
    >
      {/*
        SECURITY: do NOT add `rehype-raw` or any raw-HTML plugin to
        `rehypePlugins` here. Chatbot content is untrusted (LLM output) and
        must be escaped by react-markdown's default sanitization. Enabling
        raw HTML would reintroduce an XSS vector — any change requires an
        explicit security review and a dedicated sanitization pipeline.
      */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
