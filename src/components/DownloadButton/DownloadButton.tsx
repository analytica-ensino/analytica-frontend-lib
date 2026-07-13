import { useCallback, useState } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import JSZip from 'jszip';
import IconButton from '../IconButton/IconButton';
import ProgressModal from '../ProgressModal/ProgressModal';
import { cn } from '../../utils/utils';

/**
 * Download content interface for lesson materials
 */
export interface DownloadContent {
  /** Initial frame image URL */
  urlInitialFrame?: string;
  /** Final frame image URL */
  urlFinalFrame?: string;
  /** Podcast audio URL */
  urlPodcast?: string;
  /** Video URL */
  urlVideo?: string;
}

/**
 * Props for DownloadButton component
 */
export interface DownloadButtonProps {
  /** Content URLs to download */
  content: DownloadContent;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired when download starts */
  onDownloadStart?: (contentType: string) => void;
  /** Callback fired when download completes */
  onDownloadComplete?: (contentType: string) => void;
  /** Callback fired when download fails */
  onDownloadError?: (contentType: string, error: Error) => void;
  /** Lesson title for download file naming */
  lessonTitle?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/** A single downloadable item resolved from the lesson content */
interface DownloadItem {
  type: string;
  url: string;
  label: string;
}

/**
 * Get file extension from URL
 * @param url - URL to extract extension from
 * @returns File extension or default
 */
const getFileExtension = (url: string): string => {
  try {
    const u = new URL(url, globalThis.location?.origin || 'http://localhost');
    url = u.pathname;
  } catch {
    // keep original url (likely relative)
  }
  const path = url.split(/[?#]/)[0];
  const dot = path.lastIndexOf('.');
  return dot > -1 ? path.slice(dot + 1).toLowerCase() : 'file';
};

/**
 * Slugify a lesson title for safe use in filenames
 * @param lessonTitle - Title of the lesson
 * @returns Sanitized slug
 */
const slugifyTitle = (lessonTitle: string): string =>
  lessonTitle
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s]/g, '')
    .replaceAll(/\s+/g, '-')
    .substring(0, 50);

/**
 * Generate the filename of an entry inside the zip
 * @param contentType - Type of content being downloaded
 * @param url - URL to get extension from
 * @param lessonTitle - Title of the lesson
 * @returns Generated filename
 */
const generateFilename = (
  contentType: string,
  url: string,
  lessonTitle: string = 'aula'
): string =>
  `${slugifyTitle(lessonTitle)}-${contentType}.${getFileExtension(url)}`;

/**
 * Read the byte size of a remote file without downloading it.
 *
 * Used to weight per-file progress so the bar advances proportionally to the
 * real payload (the video dwarfs the images). Returns 0 when the server omits
 * `content-length` or the request fails — callers fall back to equal weights.
 *
 * @param url - URL to probe
 * @returns Size in bytes, or 0 when unknown
 */
const getRemoteFileSize = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    if (!response.ok) return 0;
    return Number(response.headers.get('content-length')) || 0;
  } catch {
    return 0;
  }
};

/**
 * Fetch a file as a Blob, reporting progress as bytes arrive.
 *
 * Streams the body so the caller sees real progress on the large files. When
 * the stream is unavailable (older browsers), falls back to a plain `.blob()`
 * and reports completion in one step.
 *
 * @param url - URL to download
 * @param onBytes - Called with the incremental byte count of each chunk
 * @returns The downloaded Blob
 */
const fetchWithProgress = async (
  url: string,
  onBytes: (chunkSize: number) => void
): Promise<Blob> => {
  const response = await fetch(url, { mode: 'cors' });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    const blob = await response.blob();
    onBytes(blob.size);
    return blob;
  }

  const reader = response.body.getReader();
  // Each chunk is wrapped as a Blob so the array never has to be typed as
  // BlobPart[] — Uint8Array<ArrayBufferLike> does not satisfy it under TS 5.7.
  const chunks: Blob[] = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(new Blob([value]));
    onBytes(value.length);
  }

  return new Blob(chunks);
};

/**
 * Save a Blob to disk through a single programmatic anchor click.
 *
 * Browsers block multiple programmatic downloads in a row, which is why the
 * whole lesson is bundled into one zip and saved with a single click.
 *
 * @param blob - Blob to save
 * @param filename - Filename for the download
 */
const saveBlob = (blob: Blob, filename: string): void => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
};

/**
 * DownloadButton component for downloading lesson content
 *
 * Bundles every available lesson asset (video, podcast and board frames) into a
 * single zip and saves it in one click, mirroring the mobile app's "baixar aula
 * completa" behaviour. A progress modal reports the real byte progress.
 *
 * @param props - DownloadButton component props
 * @returns Download button element
 */
const DownloadButton = ({
  content,
  className,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  lessonTitle = 'aula',
  disabled = false,
}: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Check if URL is valid and not empty
   * @param url - URL to validate
   * @returns Whether URL is valid
   */
  const isValidUrl = useCallback((url?: string): boolean => {
    return Boolean(
      url && url.trim() !== '' && url !== 'undefined' && url !== 'null'
    );
  }, []);

  /**
   * Get available download content
   * @returns Array of available download items
   */
  const getAvailableContent = useCallback((): DownloadItem[] => {
    const downloads: DownloadItem[] = [];

    if (isValidUrl(content.urlVideo)) {
      downloads.push({ type: 'video', url: content.urlVideo!, label: 'Vídeo' });
    }

    if (isValidUrl(content.urlPodcast)) {
      downloads.push({
        type: 'podcast',
        url: content.urlPodcast!,
        label: 'Podcast',
      });
    }

    if (isValidUrl(content.urlInitialFrame)) {
      downloads.push({
        type: 'quadro-inicial',
        url: content.urlInitialFrame!,
        label: 'Quadro Inicial',
      });
    }

    if (isValidUrl(content.urlFinalFrame)) {
      downloads.push({
        type: 'quadro-final',
        url: content.urlFinalFrame!,
        label: 'Quadro Final',
      });
    }

    return downloads;
  }, [content, isValidUrl]);

  /**
   * Bundle every available asset into a zip and save it in a single click.
   *
   * Assets are fetched sequentially so the progress bar tracks one file at a
   * time. A failed asset is reported through `onDownloadError` and skipped —
   * the zip still ships whatever downloaded successfully.
   */
  const handleDownload = useCallback(async () => {
    if (disabled || isDownloading) return;

    const availableContent = getAvailableContent();
    if (availableContent.length === 0) return;

    setIsDownloading(true);
    setProgress(0);

    try {
      const sizes = await Promise.all(
        availableContent.map((item) => getRemoteFileSize(item.url))
      );
      // Unknown sizes (server omitted content-length) fall back to equal weights.
      const totalBytes = sizes.reduce((sum, size) => sum + size, 0);
      const useEqualWeights = totalBytes === 0;

      const zip = new JSZip();
      let downloadedBytes = 0;
      let completedFiles = 0;
      let zippedAny = false;

      for (const [index, item] of availableContent.entries()) {
        try {
          onDownloadStart?.(item.type);

          const blob = await fetchWithProgress(item.url, (chunkSize) => {
            downloadedBytes += chunkSize;
            if (!useEqualWeights) {
              setProgress(
                Math.min(99, Math.round((downloadedBytes / totalBytes) * 100))
              );
            }
          });

          zip.file(generateFilename(item.type, item.url, lessonTitle), blob);
          zippedAny = true;

          onDownloadComplete?.(item.type);
        } catch (error) {
          onDownloadError?.(
            item.type,
            error instanceof Error
              ? error
              : new Error(`Falha ao baixar ${item.label}`)
          );
        } finally {
          completedFiles = index + 1;
          if (useEqualWeights) {
            setProgress(
              Math.min(
                99,
                Math.round((completedFiles / availableContent.length) * 100)
              )
            );
          }
        }
      }

      if (!zippedAny) {
        throw new Error('Nenhum conteúdo da aula pôde ser baixado');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveBlob(zipBlob, `${slugifyTitle(lessonTitle)}.zip`);
      setProgress(100);
    } catch (error) {
      onDownloadError?.(
        'aula',
        error instanceof Error
          ? error
          : new Error('Falha ao baixar o conteúdo da aula')
      );
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  }, [
    disabled,
    isDownloading,
    getAvailableContent,
    lessonTitle,
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
  ]);

  // Don't render if no content is available
  const availableCount = getAvailableContent().length;

  if (availableCount === 0) {
    return null;
  }

  const suffix = availableCount > 1 ? 's' : '';

  return (
    <div className={cn('flex items-center', className)}>
      <IconButton
        icon={<DownloadSimpleIcon size={24} />}
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        aria-label={
          isDownloading
            ? 'Baixando conteúdo...'
            : `Baixar conteúdo da aula (${availableCount} arquivo${suffix})`
        }
        className={cn(
          '!bg-transparent hover:!bg-black/10 transition-colors',
          isDownloading && 'opacity-60 cursor-not-allowed'
        )}
      />

      <ProgressModal
        isOpen={isDownloading}
        onClose={() => {}}
        message="Baixando conteúdo da aula..."
        progress={progress}
      />
    </div>
  );
};

export default DownloadButton;
