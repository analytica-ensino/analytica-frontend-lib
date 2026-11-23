import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import Button from '../Button/Button';
import { EbookShelfCard } from './EbookShelfCard';
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
}: Readonly<EbookPickerCardProps>) => (
  <EbookShelfCard
    ebook={ebook}
    onOpen={onOpen}
    selected={selected}
    data-testid="ebook-picker-card"
    footer={
      selected ? (
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
      )
    }
  />
);
