import { useCallback, useState } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
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

/** A single downloadable asset resolved from the lesson content */
interface DownloadItem {
  type: string;
  url: string;
  label: string;
}

/**
 * Minimal shape of the File System Access API we rely on.
 *
 * Typed locally because `showDirectoryPicker` is not in the DOM lib yet, and
 * because only Chromium ships it — every use goes through `supportsDirectoryPicker`.
 */
interface FileSystemWritable {
  write: (chunk: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  abort?: () => Promise<void>;
}

interface FileSystemFileHandleLike {
  createWritable: () => Promise<FileSystemWritable>;
}

interface FileSystemDirectoryHandleLike {
  getFileHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<FileSystemFileHandleLike>;
}

type DirectoryPicker = (options?: {
  mode?: string;
  id?: string;
}) => Promise<FileSystemDirectoryHandleLike>;

/**
 * Whether the browser can stream downloads straight to a folder on disk.
 *
 * Chromium-based browsers ship the File System Access API; Safari and Firefox
 * do not, and fall back to plain per-file downloads.
 *
 * @returns Whether `showDirectoryPicker` is available
 */
const supportsDirectoryPicker = (): boolean =>
  typeof (globalThis as { showDirectoryPicker?: DirectoryPicker })
    .showDirectoryPicker === 'function';

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
 * Generate the filename an asset is saved as
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
 * Weights per-file progress against the real payload — a lesson video can be
 * hundreds of MB while the board frames are ~1MB, so counting files would make
 * the bar jump. Returns 0 when the server omits `content-length` or the request
 * fails, and callers then fall back to counting files.
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
 * Stream a remote file straight into a file on disk.
 *
 * Nothing is buffered in memory: each chunk is written to the file handle as it
 * arrives. This is what makes a ~900MB lesson video downloadable — holding it
 * in a Blob (and zipping it) exhausts the tab's memory and silently drops the
 * assets queued behind it.
 *
 * @param url - URL to download
 * @param dirHandle - Directory the user granted write access to
 * @param filename - Name to save the file as
 * @param onBytes - Called with the byte length of each chunk written
 */
const streamToDisk = async (
  url: string,
  dirHandle: FileSystemDirectoryHandleLike,
  filename: string,
  onBytes: (chunkSize: number) => void
): Promise<void> => {
  const response = await fetch(url, { mode: 'cors' });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file: ${response.status} ${response.statusText}`
    );
  }
  if (!response.body) {
    throw new Error('Response has no readable body');
  }

  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();

  try {
    const reader = response.body.getReader();

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      onBytes(value.length);
    }

    await writable.close();
  } catch (error) {
    await writable.abort?.();
    throw error;
  }
};

/**
 * Save a file through a plain anchor click, letting the browser download it.
 *
 * Fallback for browsers without the File System Access API (Safari, Firefox).
 * Note the `download` attribute is ignored cross-origin, and the CDN does not
 * send `Content-Disposition: attachment`, so these browsers may open the asset
 * in a tab rather than save it. Fixing that properly means setting that header
 * on the CDN — it cannot be forced from the client.
 *
 * The browser streams the response to its own downloads folder, so memory is
 * not a concern — but it
 * cannot report progress, and firing several in a row is unreliable, which is
 * why the caller spaces them out.
 *
 * @param url - URL to download
 * @param filename - Suggested filename
 */
const triggerBrowserDownload = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * DownloadButton component for downloading lesson content
 *
 * Downloads every asset of a lesson (video, podcast and board frames), matching
 * the mobile app's "baixar aula completa". Where the browser supports it, the
 * user picks a folder and each file is streamed straight to disk with real
 * progress; elsewhere the browser downloads them one by one.
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
   * Download every asset by streaming it into the folder the user picked.
   *
   * @param items - Assets to download
   * @param dirHandle - Directory the user granted write access to
   */
  const downloadToFolder = useCallback(
    async (items: DownloadItem[], dirHandle: FileSystemDirectoryHandleLike) => {
      const sizes = await Promise.all(
        items.map((item) => getRemoteFileSize(item.url))
      );
      const totalBytes = sizes.reduce((sum, size) => sum + size, 0);
      // No content-length anywhere: weight each file equally instead of by bytes.
      const weighByFile = totalBytes === 0;

      let downloadedBytes = 0;
      let succeeded = 0;

      for (const [index, item] of items.entries()) {
        try {
          onDownloadStart?.(item.type);

          await streamToDisk(
            item.url,
            dirHandle,
            generateFilename(item.type, item.url, lessonTitle),
            (chunkSize) => {
              downloadedBytes += chunkSize;
              if (!weighByFile) {
                setProgress(
                  Math.min(99, Math.round((downloadedBytes / totalBytes) * 100))
                );
              }
            }
          );

          succeeded++;
          onDownloadComplete?.(item.type);
        } catch (error) {
          onDownloadError?.(
            item.type,
            error instanceof Error
              ? error
              : new Error(`Falha ao baixar ${item.label}`)
          );
        } finally {
          if (weighByFile) {
            setProgress(
              Math.min(99, Math.round(((index + 1) / items.length) * 100))
            );
          }
        }
      }

      if (succeeded === 0) {
        throw new Error('Nenhum conteúdo da aula pôde ser baixado');
      }

      setProgress(100);
    },
    [lessonTitle, onDownloadStart, onDownloadComplete, onDownloadError]
  );

  /**
   * Hand each asset to the browser's own downloader, one at a time.
   *
   * Used where the File System Access API is missing. Downloads are spaced out
   * because browsers throttle several programmatic downloads fired at once.
   *
   * @param items - Assets to download
   */
  const downloadViaBrowser = useCallback(
    async (items: DownloadItem[]) => {
      for (const [index, item] of items.entries()) {
        onDownloadStart?.(item.type);

        triggerBrowserDownload(
          item.url,
          generateFilename(item.type, item.url, lessonTitle)
        );

        onDownloadComplete?.(item.type);
        setProgress(Math.round(((index + 1) / items.length) * 100));

        if (index < items.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    },
    [lessonTitle, onDownloadStart, onDownloadComplete]
  );

  /**
   * Download every asset of the lesson.
   *
   * Prefers streaming to a user-picked folder, which is the only approach that
   * survives a large lesson video. Falls back to the browser's downloader when
   * the File System Access API is unavailable.
   */
  const handleDownload = useCallback(async () => {
    if (disabled || isDownloading) return;

    const availableContent = getAvailableContent();
    if (availableContent.length === 0) return;

    let dirHandle: FileSystemDirectoryHandleLike | null = null;

    if (supportsDirectoryPicker()) {
      try {
        const picker = (globalThis as { showDirectoryPicker?: DirectoryPicker })
          .showDirectoryPicker!;
        dirHandle = await picker({ mode: 'readwrite', id: 'aulas' });
      } catch {
        // The user dismissed the folder picker: abort quietly, nothing to report.
        return;
      }
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      if (dirHandle) {
        await downloadToFolder(availableContent, dirHandle);
      } else {
        await downloadViaBrowser(availableContent);
      }
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
    downloadToFolder,
    downloadViaBrowser,
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
