import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../utils/utils';
import { pageLabel, readingProgress } from './bookLayout';
import { EbookNarrationControls } from './EbookNarrationControls';
import { EbookReaderControls } from './EbookReaderControls';
import { EbookReaderDetails } from './EbookReaderDetails';
import { EbookReaderHeader } from './EbookReaderHeader';
import { sanitizeEbookCss } from './sanitizeEbookCss';
import { sanitizeEbookHtml } from './sanitizeEbookHtml';
import {
  EBOOK_FORMAT,
  EBOOK_MATERIAL_TYPE,
  type EbookContent,
  type EbookDetails,
  type EbookMaterialType,
  type EbookNarration,
  type EbookNarrationPage,
  type EbookNarrationSegment,
  type EbookPageChange,
  type EbookReaderMode,
} from './types';
import { useEbookBook } from './useEbookBook';
import { useEbookNarration } from './useEbookNarration';
import { useFullscreen } from './useFullscreen';

export { EBOOK_MATERIAL_TYPE };
export type {
  EbookContent,
  EbookDetails,
  EbookMaterialType,
  EbookNarration,
  EbookNarrationPage,
  EbookNarrationSegment,
  EbookPageChange,
  EbookReaderMode,
};

/** The details panel starts open on screens at least this wide. */
const DETAILS_OPEN_QUERY = '(min-width: 768px)';

export interface EbookReaderProps {
  /** The processed version to show */
  content: EbookContent;
  /** Title of the material, in the header */
  title: string;
  /** Line under the title (e.g. "4º ano · Educação 4.0 e 5.0") */
  subtitle?: string;
  /** What the "Ficha do material" panel shows */
  details?: EbookDetails;
  /** Material on screen; the Guia do Professor uses the design system's typography */
  material?: EbookMaterialType;
  /** Teacher and manager switch between the student book and the guide; the tabs show only with it */
  onMaterialChange?: (material: EbookMaterialType) => void;
  /** Back button of the header; hidden without it */
  onBack?: () => void;
  /** `student` records reading; `preview` records nothing */
  mode?: EbookReaderMode;
  /** Section (`data-section`) or element id to open at */
  initialSection?: string;
  /** Called with every section the first time it comes into view (never in preview) */
  onSectionsSeen?: (sections: string[]) => void;
  /**
   * Called whenever the pages on screen change, with the section to resume at
   * and every section on screen (never in preview): what the reading
   * telemetry reports.
   */
  onPageChange?: (page: EbookPageChange) => void;
  /** Extra controls in the footer, before the round buttons */
  footerExtra?: ReactNode;
  className?: string;
}

const startsWithDetailsOpen = (): boolean =>
  typeof globalThis.matchMedia === 'function' &&
  globalThis.matchMedia(DETAILS_OPEN_QUERY).matches;

/**
 * Reader of authored ebooks: draws the book inside the platform page, so the
 * accessibility widget and VLibras reach its text, and turns its pages.
 *
 * The book's CSS is applied inside a `.ebook-content` container that follows
 * the platform theme through `data-theme`. No script of the package ever
 * runs: the HTML is sanitized again here, and turning pages is this reader's.
 * Around the book: the header (title, material tabs, details toggle), the
 * "Ficha do material" panel and the footer controls.
 */
export const EbookReader = ({
  content,
  title,
  subtitle,
  details,
  material = EBOOK_MATERIAL_TYPE.STUDENT,
  onMaterialChange,
  onBack,
  mode = 'student',
  initialSection,
  onSectionsSeen,
  onPageChange,
  footerExtra,
  className,
}: Readonly<EbookReaderProps>) => {
  const isDark = useThemeStore((state) => state.isDark);
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const detailsId = useId();
  const [detailsOpen, setDetailsOpen] = useState(startsWithDetailsOpen);
  const fullscreen = useFullscreen(rootRef);

  const html = useMemo(
    () => sanitizeEbookHtml(content.html, content.assetBaseUrl),
    [content.html, content.assetBaseUrl]
  );
  const css = useMemo(
    () => sanitizeEbookCss(content.css, content.assetBaseUrl),
    [content.css, content.assetBaseUrl]
  );
  const isPreview = mode === 'preview';

  const book = useEbookBook({
    contentRef,
    html,
    initialSection,
    onSectionsSeen: isPreview ? undefined : onSectionsSeen,
    onPageChange: isPreview ? undefined : onPageChange,
  });

  const narration = useEbookNarration({
    narration: content.narration,
    assetBaseUrl: content.assetBaseUrl,
    contentRef,
    book,
  });

  const isBook = book.layout === 'book';
  const showChrome = !fullscreen.isFullscreen;
  const showDetails = showChrome && detailsOpen && !!details;

  return (
    <section
      ref={rootRef}
      aria-label={title}
      data-layout={book.layout}
      className={cn('ebook-reader bg-background', className)}
    >
      {showChrome && (
        <EbookReaderHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          material={material}
          onMaterialChange={onMaterialChange}
          detailsId={detailsId}
          detailsOpen={showDetails}
          onToggleDetails={() => setDetailsOpen((open) => !open)}
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* The frame keeps the book inside: the book's CSS reaches
              `.ebook-content` and below, never this element. */}
          <div className="ebook-reader__frame" data-testid="ebook-reader-frame">
            <div
              className={`${EBOOK_FORMAT.STAGE_CLASS} ebook-reader__stage`}
              data-theme={isDark ? 'dark' : 'light'}
              data-ds-typography={
                material === EBOOK_MATERIAL_TYPE.TEACHER ? '' : undefined
              }
            >
              <style>{css}</style>
              <div
                ref={contentRef}
                className="ebook-reader__content"
                data-testid="ebook-reader-content"
              />
            </div>
          </div>
          {isBook && (
            <div className="h-1 w-full bg-background-200" aria-hidden="true">
              <div
                className="h-full bg-primary-700 transition-[width]"
                data-testid="ebook-reader-progress"
                style={{
                  width: `${readingProgress(book.pageIndex, book.pageCount)}%`,
                }}
              />
            </div>
          )}
        </div>
        {showDetails && details && (
          <EbookReaderDetails
            id={detailsId}
            details={details}
            className="absolute inset-0 z-10 md:static md:w-80 md:border-l md:border-border-100 xl:w-96"
          />
        )}
      </div>

      <EbookReaderControls
        showPaging={isBook}
        pageLabel={pageLabel(book.pageIndex, book.pageCount, book.spread)}
        canGoBack={book.pageIndex > 0}
        canGoForward={book.pageIndex < book.pageCount - 1}
        onPrevious={book.previous}
        onNext={book.next}
        toc={book.toc}
        activeTocTarget={book.activeTocTarget}
        onGoTo={book.goTo}
        canToggleLayout={book.hasBookLayout}
        isBookLayout={isBook}
        onToggleLayout={book.toggleLayout}
        canFullscreen={fullscreen.isSupported}
        isFullscreen={fullscreen.isFullscreen}
        onToggleFullscreen={fullscreen.toggle}
        extra={
          <>
            {narration.hasNarration && (
              <EbookNarrationControls
                isPlaying={narration.isPlaying}
                onToggle={narration.toggle}
                hasAudioDescription={narration.hasAudioDescription}
                withAudioDescription={narration.withAudioDescription}
                onToggleAudioDescription={narration.toggleAudioDescription}
              />
            )}
            {footerExtra}
          </>
        }
      />
    </section>
  );
};

export default EbookReader;
