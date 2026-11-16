import type { ReactNode } from 'react';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/csr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/csr/ArrowsOutSimple';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { RowsIcon } from '@phosphor-icons/react/dist/csr/Rows';
import Button from '../Button/Button';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import IconRoundedButton from '../IconRoundedButton/IconRoundedButton';
import { cn } from '../../utils/utils';
import type { EbookTocEntry } from './useEbookBook';

/** Round buttons of the footer: outlined in the primary color, as in the design. */
const ROUND_BUTTON = 'h-9 w-9 border-primary-950 text-primary-950';

export interface EbookReaderControlsProps {
  /** Page turning is shown in the book layout only */
  showPaging: boolean;
  pageLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  toc: EbookTocEntry[];
  activeTocTarget?: string;
  onGoTo: (target: string) => void;
  /** Materials with book pages can switch between book and scroll */
  canToggleLayout: boolean;
  isBookLayout: boolean;
  onToggleLayout: () => void;
  canFullscreen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  /** Extra controls before the round buttons (the "Ouvir" button) */
  extra?: ReactNode;
}

/**
 * Bottom of the reader: previous / counter / next in the middle, and the
 * tools on the right (listen, contents, book or scroll, full screen). On a
 * phone, where they do not fit one line, the tools go to a second row.
 */
export const EbookReaderControls = ({
  showPaging,
  pageLabel,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  toc,
  activeTocTarget,
  onGoTo,
  canToggleLayout,
  isBookLayout,
  onToggleLayout,
  canFullscreen,
  isFullscreen,
  onToggleFullscreen,
  extra,
}: Readonly<EbookReaderControlsProps>) => (
  <nav
    aria-label="Navegação do livro"
    className="flex flex-col items-center gap-2 border-t border-border-100 bg-background px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr]"
  >
    <span className="hidden sm:block" />
    <div
      className={cn(
        'flex items-center justify-center gap-2 sm:gap-3',
        !showPaging && 'hidden sm:flex'
      )}
    >
      {showPaging && (
        <>
          <Button
            variant="outline"
            size="small"
            iconLeft={<CaretLeftIcon />}
            onClick={onPrevious}
            disabled={!canGoBack}
            aria-label="Página anterior"
          >
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <span
            className="min-w-16 text-center text-sm font-bold text-text-950"
            aria-live="polite"
            data-testid="ebook-reader-page-label"
          >
            {pageLabel}
          </span>
          <Button
            variant="solid"
            size="small"
            iconRight={<CaretRightIcon />}
            onClick={onNext}
            disabled={!canGoForward}
            aria-label="Próxima página"
          >
            <span className="hidden sm:inline">Próximo</span>
          </Button>
        </>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      {extra}
      {toc.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconRoundedButton
              icon={<ListIcon size={18} />}
              aria-label="Sumário"
              className={ROUND_BUTTON}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            className="w-[382px] max-w-[calc(100vw-2rem)]"
          >
            {toc.map((entry) => (
              <DropdownMenuItem
                key={entry.target}
                onClick={() => onGoTo(entry.target)}
                aria-current={
                  entry.target === activeTocTarget ? 'true' : undefined
                }
                className={cn(
                  entry.target === activeTocTarget && 'bg-background-50'
                )}
              >
                {entry.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {canToggleLayout && (
        <IconRoundedButton
          icon={
            isBookLayout ? <RowsIcon size={18} /> : <BookOpenIcon size={18} />
          }
          aria-label={isBookLayout ? 'Ler em rolagem' : 'Voltar ao modo livro'}
          title={isBookLayout ? 'Rolagem' : 'Modo livro'}
          className={ROUND_BUTTON}
          onClick={onToggleLayout}
        />
      )}
      {canFullscreen && (
        <IconRoundedButton
          icon={
            isFullscreen ? (
              <ArrowsInSimpleIcon size={18} />
            ) : (
              <ArrowsOutSimpleIcon size={18} />
            )
          }
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          aria-pressed={isFullscreen}
          className={ROUND_BUTTON}
          onClick={onToggleFullscreen}
        />
      )}
    </div>
  </nav>
);
