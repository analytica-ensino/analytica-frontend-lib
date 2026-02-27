import { useState, useCallback } from 'react';
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
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isDownloading: boolean;
  readonly error: string | null;
  readonly onDownloadPdf: () => void;
  readonly onDownloadExcel: () => void;
}

/**
 * Modal with two selectable format cards (PDF and Excel) and action buttons.
 * Shows skeleton placeholders while generating files.
 */
const DownloadModal = ({
  isOpen,
  onClose,
  isDownloading,
  error,
  onDownloadPdf,
  onDownloadExcel,
}: DownloadModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat | null>(
    null
  );

  const handleClose = useCallback(() => {
    setSelectedFormat(null);
    onClose();
  }, [onClose]);

  const handleDownload = useCallback(() => {
    if (selectedFormat === DOWNLOAD_FORMAT.PDF) {
      onDownloadPdf();
      handleClose();
    } else if (selectedFormat === DOWNLOAD_FORMAT.EXCEL) {
      // Excel generation is async — the modal stays open to show skeleton
      // loading state. The parent closes it via onClose after completion.
      onDownloadExcel();
    }
  }, [selectedFormat, onDownloadPdf, onDownloadExcel, handleClose]);

  const cardBase =
    'flex flex-1 items-center justify-center h-20 rounded-xl border bg-background shadow-soft-shadow-1 cursor-pointer transition-colors';
  const cardDefault = 'border-border-100 hover:border-primary-300';
  const cardSelected = 'border-primary-300 bg-primary-50';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Como deseja baixar o relatório?"
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
            <button
              data-testid="download-pdf-option"
              type="button"
              aria-label="PDF"
              aria-pressed={selectedFormat === DOWNLOAD_FORMAT.PDF}
              className={`${cardBase} ${selectedFormat === DOWNLOAD_FORMAT.PDF ? cardSelected : cardDefault}`}
              onClick={() => setSelectedFormat(DOWNLOAD_FORMAT.PDF)}
            >
              <FilePdfIcon size={24} className="text-text-700" />
            </button>

            <button
              data-testid="download-excel-option"
              type="button"
              aria-label="Excel"
              aria-pressed={selectedFormat === DOWNLOAD_FORMAT.EXCEL}
              className={`${cardBase} ${selectedFormat === DOWNLOAD_FORMAT.EXCEL ? cardSelected : cardDefault}`}
              onClick={() => setSelectedFormat(DOWNLOAD_FORMAT.EXCEL)}
            >
              <FileXlsIcon size={24} className="text-text-700" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DownloadModal;
