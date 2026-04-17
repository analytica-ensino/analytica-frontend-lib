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
 * Renders a markdown string safely. When the content contains inline LaTeX
 * ($...$ or $$...$$) we fallback to `HtmlMathRenderer`, which already
 * supports math. For plain markdown we use `react-markdown` with GFM
 * (tables, task lists, strikethrough) and no raw HTML — escape by default.
 */
export default function ChatbotContentRenderer({
  content,
  className,
}: ChatbotContentRendererProps) {
  if (containsMath(content)) {
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
