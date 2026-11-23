import { useEffect, useState, type ReactNode } from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import Button from '../Button/Button';
import EmptyState from '../EmptyState/EmptyState';
import Search from '../Search/Search';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { SkeletonRounded } from '../Skeleton/Skeleton';
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
import { EbookPickerCard } from './EbookPickerCard';
import { EbookPickerPreview } from './EbookPickerPreview';
import { useEbookLibrary } from './useEbookLibrary';

/** Value of a filter that shows every option. */
const ALL = 'all';
/** How long the search waits for the typing to stop. */
const SEARCH_DEBOUNCE_MS = 300;

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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(ALL);
  const [segment, setSegment] = useState(ALL);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(
      () => setSearch(searchInput),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const library = useEbookLibrary(apiClient, {
    search,
    theme: theme === ALL ? '' : theme,
    segment: segment === ALL ? '' : segment,
  });

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

  const themes = library.facets?.themes ?? [];
  const segments = library.facets?.segments ?? [];

  let shelf: ReactNode;
  if (library.error) {
    shelf = (
      <div className="flex flex-col items-start gap-3" role="alert">
        <Text size="sm" className="text-error-600">
          Não foi possível carregar os livros.
        </Text>
        <Button variant="outline" size="small" onClick={library.retry}>
          Tentar novamente
        </Button>
      </div>
    );
  } else if (library.loading) {
    shelf = (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
        data-testid="ebook-picker-loading"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonRounded key={index} className="aspect-[2/3] w-full" />
        ))}
      </div>
    );
  } else if (library.items.length === 0) {
    shelf = (
      <EmptyState
        title="Nenhum livro encontrado"
        description="Tente outros filtros ou outra busca."
        size="compact"
      />
    );
  } else {
    shelf = (
      <div className="flex flex-col gap-4">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
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
        </ul>
        {library.hasMore && (
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

      <section
        aria-labelledby="ebook-picker-filters-title"
        className="flex flex-col gap-3 rounded-xl border border-border-100 p-4"
      >
        <div className="flex items-center gap-2 text-text-950">
          <SlidersHorizontalIcon size={20} aria-hidden="true" />
          <Text as="h2" id="ebook-picker-filters-title" size="md" weight="bold">
            Filtrar acervo
          </Text>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-col md:w-72">
            <Select value={theme} onValueChange={setTheme} label="Tema">
              <SelectTrigger aria-label="Tema">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {themes.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.name ?? option.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:w-72">
            <Select value={segment} onValueChange={setSegment} label="Público">
              <SelectTrigger aria-label="Público">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {segments.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Search
          options={[]}
          showDropdown={false}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por título, autor, tema, ano ou código BNCC…"
          aria-label="Buscar livros"
          containerClassName="!w-full !max-w-none"
          data-testid="ebook-picker-search"
        />
      </section>

      {!library.loading && !library.error && (
        <Text size="sm" weight="medium" className="text-text-800">
          {shelfCountLabel(library.total)}
        </Text>
      )}

      {shelf}
    </div>
  );
};
