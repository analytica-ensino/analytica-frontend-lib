import { useState } from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type { BaseApiClient } from '../../types/api';
import {
  MAX_ATTACHED_EBOOKS,
  type AttachableEbook,
  type EbookAttachmentTarget,
} from '../../types/ebookAttachment';
import {
  ADD_TO_TARGET_LABEL,
  PICKER_TITLE,
  shelfCountLabel,
  toAttachableEbook,
} from './ebookAttachment.utils';
import { EbookLibraryFilters } from './EbookLibraryFilters';
import { EbookPickerCard } from './EbookPickerCard';
import { EbookPickerPreview } from './EbookPickerPreview';
import { EbookShelf } from './EbookShelf';
import { useEbookLibrary } from './useEbookLibrary';
import { useEbookLibraryFilters } from './useEbookLibraryFilters';

export interface EbookPickerProps {
  apiClient: BaseApiClient;
  /** Where the books go: it names the title and the buttons */
  target: EbookAttachmentTarget;
  /** The books already attached; they open selected */
  initialSelected: AttachableEbook[];
  /** Leaves without changing the attached books */
  onBack: () => void;
  /** "Concluir seleção": the selected books, in the order they were chosen */
  onConfirm: (ebooks: AttachableEbook[]) => void;
}

/**
 * "Adicionar livro à aula" (AE-3325): the student books of the institution,
 * filtered by theme and audience and searched by title, author, theme, year
 * or BNCC code. Several books can be selected; the cover opens a book in
 * preview, where it can be selected too. The books already attached open
 * selected, and no more than the backend limit can be.
 */
export const EbookPicker = ({
  apiClient,
  target,
  initialSelected,
  onBack,
  onConfirm,
}: Readonly<EbookPickerProps>) => {
  const [selected, setSelected] = useState<AttachableEbook[]>(initialSelected);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const filterState = useEbookLibraryFilters();
  const library = useEbookLibrary(apiClient, filterState.filters);

  const selectedIds = new Set(selected.map((ebook) => ebook.id));
  const canAdd = selected.length < MAX_ATTACHED_EBOOKS;
  const addLabel = ADD_TO_TARGET_LABEL[target];

  const toggle = (ebook: AttachableEbook) =>
    setSelected((current) => {
      if (current.some((item) => item.id === ebook.id)) {
        return current.filter((item) => item.id !== ebook.id);
      }
      return current.length < MAX_ATTACHED_EBOOKS
        ? [...current, ebook]
        : current;
    });

  if (previewId) {
    const inLibrary = library.items.find((item) => item.id === previewId);
    const fromSelection = selected.find((item) => item.id === previewId);
    const ebook = inLibrary ? toAttachableEbook(inLibrary) : fromSelection;
    return (
      <div className="flex h-full w-full flex-col p-4 min-[1200px]:p-5">
        <EbookPickerPreview
          apiClient={apiClient}
          ebookId={previewId}
          selected={selectedIds.has(previewId)}
          canAdd={canAdd}
          addLabel={addLabel}
          onToggle={() => ebook && toggle(ebook)}
          onBack={() => setPreviewId(null)}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-background p-4 min-[1200px]:p-5"
      data-testid="ebook-picker"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-row items-start gap-2">
          <Button
            variant="link"
            action="secondary"
            onClick={onBack}
            aria-label="Voltar"
            className="px-0"
          >
            <CaretLeftIcon size={24} color="currentColor" />
          </Button>
          <div className="flex flex-col gap-1">
            <Text as="h1" size="xl" weight="bold" className="text-text-950">
              {PICKER_TITLE[target]}
            </Text>
            <Text size="sm" className="text-text-700">
              Adicione mais de um livro clicando em {addLabel.toLowerCase()} ou
              clique na capa para visualizar.
            </Text>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 self-end md:self-auto">
          <div className="flex flex-row items-center gap-2">
            <span
              className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-950 px-2 text-sm font-bold text-text"
              data-testid="ebook-picker-count"
            >
              {selected.length}
            </span>
            <Text size="sm" className="text-text-800">
              Livros selecionados
            </Text>
          </div>
          <Button
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected)}
          >
            Concluir seleção
          </Button>
        </div>
      </header>

      {!canAdd && (
        <Text size="sm" className="text-warning-700" role="status">
          Você chegou ao limite de {MAX_ATTACHED_EBOOKS} livros.
        </Text>
      )}

      <EbookLibraryFilters state={filterState} facets={library.facets} />

      {!library.loading && !library.error && (
        <Text size="sm" weight="medium" className="text-text-800">
          {shelfCountLabel(library.total)}
        </Text>
      )}

      <EbookShelf
        loading={library.loading}
        error={library.error}
        empty={library.items.length === 0}
        onRetry={library.retry}
      >
        {library.items.map((item) => (
          <EbookPickerCard
            key={item.id}
            ebook={item}
            selected={selectedIds.has(item.id)}
            canAdd={canAdd}
            addLabel={addLabel}
            onToggle={() => toggle(toAttachableEbook(item))}
            onOpen={() => setPreviewId(item.id)}
          />
        ))}
      </EbookShelf>
      {library.hasMore && !library.loading && !library.error && (
        <Button
          variant="outline"
          size="small"
          className="self-center"
          disabled={library.loadingMore}
          onClick={library.loadMore}
        >
          Carregar mais
        </Button>
      )}
    </div>
  );
};
