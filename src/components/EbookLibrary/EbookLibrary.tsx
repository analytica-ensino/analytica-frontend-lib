import { useEffect, useRef, useState } from 'react';
import Text from '../Text/Text';
import TablePagination from '../Table/TablePagination';
import { cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import { shelfCountLabel } from '../EbookAttachment/ebookAttachment.utils';
import { EbookLibraryFilters } from '../EbookAttachment/EbookLibraryFilters';
import { EbookPreview } from '../EbookAttachment/EbookPreview';
import { EbookShelf } from '../EbookAttachment/EbookShelf';
import { EbookShelfCard } from '../EbookAttachment/EbookShelfCard';
import {
  EBOOK_LIBRARY_PAGE_SIZE,
  useEbookLibrary,
} from '../EbookAttachment/useEbookLibrary';
import { useEbookLibraryFilters } from '../EbookAttachment/useEbookLibraryFilters';

export interface EbookLibraryProps {
  /** The host's API client */
  apiClient: BaseApiClient;
  className?: string;
}

/**
 * "Biblioteca" of the teacher and the manager (AE-3327): the student books
 * released to the institution, filtered by theme and audience and searched
 * by title, author, theme, year or BNCC code, a page at a time. A book opens
 * over the whole screen in the EBOOK 07 reader, in preview (nothing is
 * recorded), with tabs to its Guia do Professor and back. Closing the book
 * returns to the library as it was.
 */
export const EbookLibrary = ({
  apiClient,
  className,
}: Readonly<EbookLibraryProps>) => {
  const filterState = useEbookLibraryFilters();
  const library = useEbookLibrary(apiClient, filterState.filters);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const closePreview = () => {
    setPreviewId(null);
    // Back to the card the book was opened from
    requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    if (!previewId) return;
    overlayRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [previewId]);

  const ready = !library.loading && !library.error;

  return (
    <div
      className={cn('flex w-full flex-col gap-4', className)}
      data-testid="ebook-library"
    >
      <Text as="h1" size="xl" weight="bold" className="text-text-950">
        Biblioteca
      </Text>

      <EbookLibraryFilters state={filterState} facets={library.facets} />

      {ready && (
        <Text
          size="sm"
          weight="medium"
          className="border-t border-border-100 pt-4 text-text-800"
        >
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
          <EbookShelfCard
            key={item.id}
            ebook={item}
            onOpen={() => {
              openerRef.current = document.activeElement as HTMLElement | null;
              setPreviewId(item.id);
            }}
          />
        ))}
      </EbookShelf>

      {ready && library.total > 0 && (
        <TablePagination
          totalItems={library.total}
          currentPage={library.page}
          totalPages={library.totalPages}
          itemsPerPage={EBOOK_LIBRARY_PAGE_SIZE}
          onPageChange={library.goToPage}
          itemLabel="livros"
        />
      )}

      {previewId && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Prévia do livro"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closePreview();
          }}
          className="fixed inset-0 z-50 flex flex-col bg-background focus:outline-none"
          data-testid="ebook-library-preview"
        >
          <EbookPreview
            apiClient={apiClient}
            ebookId={previewId}
            onBack={closePreview}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};

export default EbookLibrary;
