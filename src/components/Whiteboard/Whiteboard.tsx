import { HTMLAttributes, useCallback, useState } from 'react';
import { ArrowsOut } from 'phosphor-react';
import { cn } from '../../utils/utils';

// Design constants for critical layout dimensions
const IMAGE_WIDTH = 225;
const IMAGE_HEIGHT = 90;

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
  // State to track images that failed to load
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  /**
   * Handle image loading error
   */
  const handleImageError = useCallback((imageId: string) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  }, []);

  const gridColsClass =
    images?.length === 1
      ? 'grid-cols-1'
      : {
          2: 'grid-cols-1 sm:grid-cols-2',
          3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        }[imagesPerRow];

  // Let CSS handle sizing responsively

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-8 bg-background border border-border-50 rounded-xl',
          className
        )}
        {...rest}
      >
        <p className="text-gray-400 text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-background border border-border-50 p-4 gap-2 rounded-xl w-fit mx-auto',
        className
      )}
      {...rest}
    >
      <div className={cn('grid gap-4', gridColsClass)}>
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group overflow-hidden bg-gray-100 rounded-lg"
            style={{
              width: `${IMAGE_WIDTH}px`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${IMAGE_WIDTH}px`,
                height: `${IMAGE_HEIGHT}px`,
              }}
            >
              {imageErrors.has(image.id) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500 text-sm text-center px-2">
                    Imagem indisponível
                  </p>
                </div>
              ) : (
                <>
                  <img
                    src={image.imageUrl}
                    alt={image.title || `Whiteboard ${image.id}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(image.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </>
              )}
            </div>
            {showDownload && (
              <button
                type="button"
                onClick={() => handleDownload(image)}
                className="cursor-pointer absolute bottom-3 right-3 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded hover:bg-black/30 transition-colors duration-200 group/button w-6 h-6"
                aria-label={`Download ${image.title || 'imagem'}`}
              >
                <ArrowsOut
                  size={24}
                  weight="regular"
                  className="text-white group-hover/button:scale-110 transition-transform duration-200"
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
