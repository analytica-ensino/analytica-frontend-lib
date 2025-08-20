import { HTMLAttributes, useCallback } from 'react';
import { DownloadSimple } from 'phosphor-react';
import { cn } from '../../utils/utils';

/**
 * Whiteboard image item interface
 */
export interface WhiteboardImage {
  id: string;
  imageUrl: string;
  title?: string;
}

/**
 * Whiteboard component props interface
 */
export interface WhiteboardProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of images to display in the whiteboard */
  images: WhiteboardImage[];
  /** Whether to show download button on images */
  showDownload?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Callback when download button is clicked */
  onDownload?: (image: WhiteboardImage) => void;
  /** Maximum number of images to display per row on desktop */
  imagesPerRow?: 2 | 3 | 4;
}

/**
 * Whiteboard component for displaying classroom board images
 * @param props Component properties
 * @returns Whiteboard component
 */
const Whiteboard = ({
  images,
  showDownload = true,
  className,
  onDownload,
  imagesPerRow = 2,
  ...rest
}: WhiteboardProps) => {
  /**
   * Handle image download
   */
  const handleDownload = useCallback(
    (image: WhiteboardImage) => {
      if (onDownload) {
        onDownload(image);
      } else {
        const link = document.createElement('a');
        link.href = image.imageUrl;
        link.download = image.title || `whiteboard-${image.id}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [onDownload]
  );

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[imagesPerRow];

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-8 bg-background border border-border-50 rounded-xl',
          className
        )}
        {...rest}
      >
        <p className="text-text-400 text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      {...rest}
    >
      <div className={cn('grid gap-4', gridColsClass)}>
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group overflow-hidden rounded-lg bg-background-100"
          >
            <div className="relative aspect-[5/2] sm:aspect-[5/2] lg:aspect-[5/2] w-full">
              <img
                src={image.imageUrl}
                alt={image.title || `Whiteboard ${image.id}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            {showDownload && (
              <button
                onClick={() => handleDownload(image)}
                className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors duration-200 group/button"
                aria-label={`Download ${image.title || 'imagem'}`}
              >
                <DownloadSimple
                  size={18}
                  weight="bold"
                  className="text-text group-hover/button:scale-110 transition-transform duration-200"
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;
