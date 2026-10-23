import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { ArticleContent } from '../ArticleContent/ArticleContent';
import { embedVideoLinks } from '../../utils/videoEmbed';
import type { SupportChatArticle } from '../../types/supportChat';
import { cn } from '../../utils/utils';

export interface SupportChatArticleViewProps {
  /** Article to show */
  articleId: string;
  /** Title known from the chat, shown while the article loads */
  initialTitle?: string;
  /** Loads the article (adapter.getArticle bound to the institution) */
  loadArticle: (articleId: string) => Promise<SupportChatArticle>;
  /** Whether the chat window is in the wide mode */
  expanded: boolean;
  onToggleExpanded: () => void;
  /** Back to the conversation (it is kept as it was) */
  onBack: () => void;
  /** Page of the article in the help center, for "Abrir em nova aba" */
  externalUrl?: string;
  /** Header background (theme) */
  accentStyle?: { backgroundColor: string };
}

const formatUpdatedAt = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/**
 * FAQ article read inside the support chat, like the Zendesk messenger: the
 * conversation is replaced by the article (no new tab), with back,
 * expand/reduce and open-in-new-tab controls. The big title moves to the
 * header once it scrolls out of view. YouTube/Vimeo links of the article
 * become players.
 */
export const SupportChatArticleView = ({
  articleId,
  initialTitle,
  loadArticle,
  expanded,
  onToggleExpanded,
  onBack,
  externalUrl,
  accentStyle,
}: SupportChatArticleViewProps) => {
  const [article, setArticle] = useState<SupportChatArticle | null>(null);
  const [failed, setFailed] = useState(false);
  const [titleHidden, setTitleHidden] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    setArticle(null);
    setFailed(false);
    loadArticle(articleId)
      .then((loaded) => {
        if (active) setArticle(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [articleId, loadArticle]);

  // The big title leaves the screen → show it in the header
  useEffect(() => {
    const title = titleRef.current;
    if (!title || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setTitleHidden(!entry.isIntersecting)
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [article]);

  const html = useMemo(
    () => (article ? embedVideoLinks(article.body) : ''),
    [article]
  );
  const title = article?.title ?? initialTitle ?? 'Artigo';

  return (
    <div
      data-testid="support-chat-article"
      className="flex min-h-0 flex-1 flex-col"
    >
      <header
        className="flex items-center gap-1 px-2 py-2 bg-primary-500 text-white"
        style={accentStyle}
      >
        <Button
          variant="raw"
          aria-label="Voltar para a janela de mensagens"
          onClick={onBack}
          className="p-1 rounded hover:bg-white/20"
        >
          <ArrowLeftIcon size={18} />
        </Button>
        <Text
          as="span"
          size="sm"
          weight="semibold"
          color=""
          aria-hidden={!titleHidden || undefined}
          className={cn(
            'min-w-0 flex-1 truncate transition-opacity',
            titleHidden ? 'opacity-100' : 'opacity-0'
          )}
        >
          {title}
        </Text>
        <Button
          variant="raw"
          aria-label={expanded ? 'Reduzir artigo' : 'Expandir artigo'}
          onClick={onToggleExpanded}
          className="p-1 rounded hover:bg-white/20"
        >
          {expanded ? (
            <ArrowsInSimpleIcon size={18} />
          ) : (
            <ArrowsOutSimpleIcon size={18} />
          )}
        </Button>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir em nova aba"
            className="p-1 rounded hover:bg-white/20"
          >
            <ArrowSquareOutIcon size={18} />
          </a>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Text
          as="h2"
          ref={titleRef}
          size="xl"
          weight="bold"
          color="text-text-950"
        >
          {title}
        </Text>
        {article?.updatedAt && (
          <Text size="xs" color="text-text-500" className="mt-1">
            Atualizado em {formatUpdatedAt(article.updatedAt)}
          </Text>
        )}

        <div className="mt-4">
          {failed && (
            <Text size="sm" role="alert" color="text-error-700">
              Não foi possível abrir o artigo.
            </Text>
          )}
          {!failed && !article && (
            <Text size="sm" color="text-text-500">
              Carregando…
            </Text>
          )}
          {article && <ArticleContent html={html} />}
        </div>
      </div>
    </div>
  );
};
