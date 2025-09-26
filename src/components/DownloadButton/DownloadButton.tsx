import { useCallback, useState } from 'react';
import { Download } from 'phosphor-react';
import IconButton from '../IconButton/IconButton';
import { cn } from '../../utils/utils';

/**
 * Download content interface for lesson materials
 */
export interface DownloadContent {
  /** Document URL (PDF) */
  urlDoc?: string;
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

/**
 * Get MIME type based on file extension
 * @param url - URL to extract extension from
 * @returns MIME type string
 */
const getMimeType = (url: string): string => {
  const extension = getFileExtension(url);
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    vtt: 'text/vtt',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Download file via fetch and blob to ensure proper download behavior
 * @param url - URL to download
 * @param filename - Filename for the download
 * @returns Promise<void>
 */
const triggerDownload = async (
  url: string,
  filename: string
): Promise<void> => {
  try {
    // Fetch the file as blob
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const mimeType = getMimeType(url);

    // Create a blob with the correct MIME type
    const typedBlob = new Blob([blob], { type: mimeType });

    // Create object URL
    const blobUrl = URL.createObjectURL(typedBlob);

    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.rel = 'noopener noreferrer';

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    // Fallback to direct link if fetch fails
    console.warn('Fetch download failed, falling back to direct link:', error);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    link.target = '_blank'; // Open in new tab as fallback

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Get file extension from URL
 * @param url - URL to extract extension from
 * @returns File extension or default
 */
const getFileExtension = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    return extension || 'file';
  } catch {
    return 'file';
  }
};

/**
 * Generate filename for download
 * @param contentType - Type of content being downloaded
 * @param lessonTitle - Title of the lesson
 * @param url - URL to get extension from
 * @returns Generated filename
 */
const generateFilename = (
  contentType: string,
  url: string,
  lessonTitle: string = 'aula'
): string => {
  const sanitizedTitle = lessonTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const extension = getFileExtension(url);
  return `${sanitizedTitle}-${contentType}.${extension}`;
};

/**
 * DownloadButton component for downloading lesson content
 * Provides a single button that downloads all available content for a lesson
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
  const getAvailableContent = useCallback(() => {
    const downloads: Array<{ type: string; url: string; label: string }> = [];

    if (isValidUrl(content.urlDoc)) {
      downloads.push({
        type: 'documento',
        url: content.urlDoc!,
        label: 'Documento',
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

    if (isValidUrl(content.urlPodcast)) {
      downloads.push({
        type: 'podcast',
        url: content.urlPodcast!,
        label: 'Podcast',
      });
    }

    if (isValidUrl(content.urlVideo)) {
      downloads.push({ type: 'video', url: content.urlVideo!, label: 'Vídeo' });
    }

    return downloads;
  }, [content, isValidUrl]);

  /**
   * Handle download of all available content
   */
  const handleDownload = useCallback(async () => {
    if (disabled || isDownloading) return;

    const availableContent = getAvailableContent();

    if (availableContent.length === 0) {
      return;
    }

    setIsDownloading(true);

    try {
      // Download each available content sequentially with small delay
      for (let i = 0; i < availableContent.length; i++) {
        const item = availableContent[i];

        try {
          onDownloadStart?.(item.type);

          const filename = generateFilename(item.type, item.url, lessonTitle);
          await triggerDownload(item.url, filename);

          onDownloadComplete?.(item.type);

          // Add small delay between downloads to prevent browser blocking
          if (i < availableContent.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error(`Erro ao baixar ${item.label}:`, error);
          onDownloadError?.(
            item.type,
            error instanceof Error
              ? error
              : new Error(`Falha ao baixar ${item.label}`)
          );
        }
      }
    } finally {
      setIsDownloading(false);
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
  const hasContent = getAvailableContent().length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={cn('flex items-center', className)}>
      <IconButton
        icon={<Download size={24} />}
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        aria-label={(() => {
          if (isDownloading) {
            return 'Baixando conteúdo...';
          }
          const contentCount = getAvailableContent().length;
          const suffix = contentCount > 1 ? 's' : '';
          return `Baixar conteúdo da aula (${contentCount} arquivo${suffix})`;
        })()}
        className={cn(
          '!bg-transparent hover:!bg-black/10 transition-colors',
          isDownloading && 'opacity-60 cursor-not-allowed'
        )}
      />
    </div>
  );
};

export default DownloadButton;
