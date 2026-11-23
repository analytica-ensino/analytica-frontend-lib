import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { EbookCover } from './EbookCover';
import { ebookAudience, ebookKicker } from './ebookAttachment.utils';
import type { EbookLibraryItem } from '../../types/ebookAttachment';

export interface EbookPickerCardProps {
  ebook: EbookLibraryItem;
  selected: boolean;
  /** No more books fit; a selected one can still be removed */
  canAdd: boolean;
  /** "Adicionar à aula" or "Adicionar à atividade" */
  addLabel: string;
  onToggle: () => void;
  /** Opens the book in preview */
  onOpen: () => void;
}

/**
 * A book of the selection grid: the cover opens it in preview, the button
 * adds it to the selection or takes it out. A selected book gets a
 * highlighted border and a filled button.
 */
export const EbookPickerCard = ({
  ebook,
  selected,
  canAdd,
  addLabel,
  onToggle,
  onOpen,
}: Readonly<EbookPickerCardProps>) => {
  const kicker = ebookKicker(ebook);
  const audience = ebookAudience(ebook);

  return (
    <li
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-background',
        selected ? 'border-2 border-primary-950' : 'border-border-100'
      )}
      data-testid="ebook-picker-card"
      data-selected={selected}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Visualizar o livro ${ebook.title}`}
        className="aspect-[2/3] w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indicator-info"
      >
        <EbookCover coverUrl={ebook.coverUrl} iconSize={40} />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3">
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
        <div className="mt-auto pt-2">
          {selected ? (
            <Button
              size="small"
              className="w-full"
              onClick={onToggle}
              aria-label={`Remover da seleção: ${ebook.title}`}
            >
              Remover da seleção
            </Button>
          ) : (
            <Button
              size="small"
              variant="outline"
              className="w-full"
              iconLeft={<PlusIcon />}
              disabled={!canAdd}
              onClick={onToggle}
              aria-label={`${addLabel}: ${ebook.title}`}
            >
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
};
