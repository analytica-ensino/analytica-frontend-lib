import type { ReactNode } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { EbookCover } from './EbookCover';
import { ebookAudience, ebookKicker } from './ebookAttachment.utils';
import type { EbookLibraryItem } from '../../types/ebookAttachment';

/** Focus ring of the buttons of a card. */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indicator-info';

export interface EbookShelfCardProps {
  ebook: EbookLibraryItem;
  /** Opens the book in preview */
  onOpen: () => void;
  /** Highlights the card (a book of the selection) */
  selected?: boolean;
  /**
   * An action under the texts. With it, only the cover opens the book; without
   * it, the whole card does.
   */
  footer?: ReactNode;
  'data-testid'?: string;
}

/**
 * A book of a staff library screen: the cover, "EB01 • EDUCAÇÃO FINANCEIRA",
 * the title and "4º ano • Anos Iniciais".
 */
export const EbookShelfCard = ({
  ebook,
  onOpen,
  selected = false,
  footer,
  'data-testid': testId = 'ebook-shelf-card',
}: Readonly<EbookShelfCardProps>) => {
  const kicker = ebookKicker(ebook);
  const audience = ebookAudience(ebook);
  const openLabel = `Visualizar o livro ${ebook.title}`;

  const texts = (
    <div className="flex flex-1 flex-col gap-1 p-3 text-left">
      {kicker && (
        <Text
          size="2xs"
          weight="semibold"
          className="truncate uppercase text-text-600"
        >
          {kicker}
        </Text>
      )}
      <Text size="sm" weight="bold" className="line-clamp-2 text-text-950">
        {ebook.title}
      </Text>
      {audience && (
        <Text size="xs" className="line-clamp-2 text-text-700">
          {audience}
        </Text>
      )}
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </div>
  );

  return (
    <li
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-background',
        selected ? 'border-2 border-primary-950' : 'border-border-100'
      )}
      data-testid={testId}
      data-selected={selected}
    >
      {footer ? (
        <>
          <button
            type="button"
            onClick={onOpen}
            aria-label={openLabel}
            className={cn('aspect-[2/3] w-full', FOCUS_RING)}
          >
            <EbookCover coverUrl={ebook.coverUrl} iconSize={40} />
          </button>
          {texts}
        </>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          aria-label={openLabel}
          className={cn('flex h-full flex-col', FOCUS_RING)}
        >
          <span className="block aspect-[2/3] w-full">
            <EbookCover coverUrl={ebook.coverUrl} iconSize={40} />
          </span>
          {texts}
        </button>
      )}
    </li>
  );
};
