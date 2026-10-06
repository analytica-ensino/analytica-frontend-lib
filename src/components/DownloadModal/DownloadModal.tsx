import { useState, useCallback, useEffect, useRef } from 'react';
import {
  FilePdfIcon,
  FileXlsIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { Skeleton } from '../Skeleton/Skeleton';
import { DOWNLOAD_FORMAT } from '../../enums/DownloadFormat';

/**
 * Download format type alias
 */
export type DownloadFormat = DOWNLOAD_FORMAT;

/**
 * Props for the DownloadModal component
 */
export interface DownloadModalProps {
  /**
   * A pessoa pediu para baixar. NÃO é "mostre o seletor": quando há um formato
   * só e ele é imediato, o pedido se resolve na hora e nenhum `<dialog>` é
   * montado — veja `skipsChooser`.
   */
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isDownloading: boolean;
  readonly error: string | null;
  readonly onDownloadPdf: () => void;
  /**
   * Excel generation. Optional: when it is not supplied there is only one
   * format left, so the chooser has nothing to ask. With an immediate PDF the
   * download fires straight away and no modal is shown; with `asyncPdf` the
   * chooser still opens, because it is where progress and errors appear.
   */
  readonly onDownloadExcel?: () => void;
  /** Modal title. Defaults to "Como deseja baixar o relatório?". */
  readonly title?: string;
  /**
   * Whether the PDF is produced asynchronously too. When true, "Baixar" keeps
   * the modal open on the PDF path as well and it closes like the Excel one,
   * once `isDownloading` falls back to false with no error. Defaults to false:
   * the PDF of most reports is the print of the page already on screen.
   *
   * It also decides the single-format case: a lone async PDF keeps the chooser,
   * since that is the only place its progress and failure are visible.
   */
  readonly asyncPdf?: boolean;
}

/**
 * Format chooser with selectable cards (PDF and Excel) and action buttons.
 * Shows skeleton placeholders while generating files.
 *
 * Renders nothing when there is nothing to choose: a lone immediate PDF is
 * downloaded as soon as `isOpen` turns true.
 */
const DownloadModal = ({
  isOpen,
  onClose,
  isDownloading,
  error,
  onDownloadPdf,
  onDownloadExcel,
  title = 'Como deseja baixar o relatório?',
  asyncPdf = false,
}: DownloadModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat | null>(
    null
  );

  const handleClose = useCallback(() => {
    setSelectedFormat(null);
    onClose();
  }, [onClose]);

  // Auto-close the modal when an async download transitions from loading
  // to idle without an error. Consumers only need to toggle `isDownloading`
  // in their download hook — no extra parent-side logic required.
  const wasDownloadingRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      wasDownloadingRef.current = isDownloading;
      return;
    }
    if (wasDownloadingRef.current && !isDownloading && !error) {
      handleClose();
    }
    wasDownloadingRef.current = isDownloading;
  }, [isOpen, isDownloading, error, handleClose]);

  // Um formato só e imediato: não há o que escolher, então o pedido de
  // download se resolve na hora e o seletor nunca aparece. O ramo assíncrono
  // fica de fora de propósito — o seletor é o único lugar com o skeleton de
  // `isDownloading` e a linha de erro, e um download async sem retorno algum é
  // pior que um clique a mais.
  const skipsChooser = !onDownloadExcel && !asyncPdf;

  // O latch não é defensivo, é o que faz a regra funcionar: sem ele o
  // StrictMode monta o efeito duas vezes em dev e a pessoa leva dois print().
  // Também cobre o consumidor que ignore o `onClose` — `isOpen` fica true, o
  // latch fica true, e nada dispara de novo. Zera só quando o pedido se
  // encerra, para o próximo clique voltar a funcionar.
  const firedRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      firedRef.current = false;
      return;
    }
    if (!skipsChooser || firedRef.current) return;
    firedRef.current = true;
    onDownloadPdf();
    handleClose();
  }, [isOpen, skipsChooser, onDownloadPdf, handleClose]);

  const handleDownload = useCallback(() => {
    if (selectedFormat === DOWNLOAD_FORMAT.PDF) {
      onDownloadPdf();
      if (!asyncPdf) handleClose();
    } else if (selectedFormat === DOWNLOAD_FORMAT.EXCEL) {
      // Excel generation is async. The useEffect above auto-closes the modal
      // once `isDownloading` transitions back to false and there is no error.
      onDownloadExcel?.();
    }
  }, [selectedFormat, onDownloadPdf, onDownloadExcel, asyncPdf, handleClose]);

  // Depois de todos os hooks: o efeito acima é quem atende o pedido, e aqui
  // não há nada para desenhar.
  if (skipsChooser) return null;

  const cardBase =
    'flex flex-1 items-center justify-center h-20 rounded-xl border bg-background shadow-soft-shadow-1 cursor-pointer transition-colors';
  const cardDefault = 'border-border-100 hover:border-primary-300';
  const cardSelected = 'border-primary-300 bg-primary-50';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            action="primary"
            size="small"
            onClick={handleClose}
            data-testid="download-cancel-btn"
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            size="small"
            disabled={!selectedFormat || isDownloading}
            iconLeft={<DownloadSimpleIcon size={16} />}
            onClick={handleDownload}
            data-testid="download-confirm-btn"
          >
            Baixar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {error && (
          <Text size="sm" className="text-indicator-error">
            {error}
          </Text>
        )}

        {isDownloading ? (
          <div className="flex flex-row gap-4" data-testid="download-skeleton">
            <Skeleton variant="rounded" width="100%" height={80} />
            <Skeleton variant="rounded" width="100%" height={80} />
          </div>
        ) : (
          <div className="flex flex-row gap-4">
            <Button
              data-testid="download-pdf-option"
              aria-label="PDF"
              aria-pressed={selectedFormat === DOWNLOAD_FORMAT.PDF}
              variant="outline"
              action="secondary"
              className={`${cardBase} ${selectedFormat === DOWNLOAD_FORMAT.PDF ? cardSelected : cardDefault}`}
              onClick={() => setSelectedFormat(DOWNLOAD_FORMAT.PDF)}
            >
              <FilePdfIcon size={24} className="text-text-700" />
            </Button>

            {onDownloadExcel && (
              <Button
                data-testid="download-excel-option"
                aria-label="Excel"
                aria-pressed={selectedFormat === DOWNLOAD_FORMAT.EXCEL}
                variant="outline"
                action="secondary"
                className={`${cardBase} ${selectedFormat === DOWNLOAD_FORMAT.EXCEL ? cardSelected : cardDefault}`}
                onClick={() => setSelectedFormat(DOWNLOAD_FORMAT.EXCEL)}
              >
                <FileXlsIcon size={24} className="text-text-700" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DownloadModal;
