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
 * underscore / curly brace / tex command). This avoids false positives on
 * prose that contains currency like "R$ 20" or "por $20 e o livro $ 5".
 */
function looksLikeMath(content: string): boolean {
  if (!containsMath(content)) return false;
  if (/\$\$[\s\S]+?\$\$/.test(content)) return true;
  if (/\\begin\{[^}]+\}[\s\S]+?\\end\{[^}]+\}/.test(content)) return true;
  const inlineMatches = content.matchAll(/\$([^$\n]+?)\$/g);
  for (const match of inlineMatches) {
    if (/[\\^_{}]/.test(match[1])) return true;
  }
  return false;
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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
