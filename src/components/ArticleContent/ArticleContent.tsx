import { useMemo, type HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';
import { sanitizeArticleHtml } from './sanitizeArticleHtml';

export interface ArticleContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'dangerouslySetInnerHTML'
> {
  /** Article body as saved by the RichEditor (HTML) */
  html: string;
}

/**
 * Renders a help-center article written in the RichEditor: headings, lists,
 * tables, images, links and YouTube/Vimeo players.
 *
 * The HTML is sanitized again on display (DOMPurify) even though the backend
 * already sanitizes on save — only player iframes from the allowed hosts
 * survive. Typography comes from `articleContent.css` (theme tokens), since
 * the lib does not ship the Tailwind typography plugin.
 */
export const ArticleContent = ({
  html,
  className,
  ...props
}: ArticleContentProps) => {
  const safeHtml = useMemo(() => sanitizeArticleHtml(html), [html]);

  return (
    <div
      data-analytica-article
      className={cn('text-text-950', className)}
      {...props}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};

export default ArticleContent;
