import { HTMLAttributes, useCallback, useState } from 'react';
import { DownloadSimple } from 'phosphor-react';
import { cn } from '../../utils/utils';

// Design constants based on Figma specifications
const CONTAINER_WIDTH = 500;
const CONTAINER_PADDING = 16;
const IMAGE_WIDTH = 225;
const IMAGE_HEIGHT = 90;
const GRID_GAP = 16;
const DOWNLOAD_BUTTON_SIZE = 24;
const IMAGE_BORDER_RADIUS = 8;
const CONTAINER_BORDER_RADIUS = 12;

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

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[imagesPerRow];

  // Calculate dynamic container width based on number of images
  const containerWidth =
    images?.length === 1
      ? IMAGE_WIDTH + 2 * CONTAINER_PADDING
      : CONTAINER_WIDTH;

  // Calculate dynamic container height based on number of images and rows
  const calculateContainerHeight = () => {
    if (!images || images.length === 0) return 'auto';

    const rows = Math.ceil(images.length / imagesPerRow);
    const imagesHeight = rows * IMAGE_HEIGHT;
    const gapsHeight = (rows - 1) * GRID_GAP;
    const containerGap = 8; // gap between container elements
    return imagesHeight + gapsHeight + 2 * CONTAINER_PADDING + containerGap;
  };

  const containerHeight = calculateContainerHeight();

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-8 bg-white border border-gray-100 rounded-xl',
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
      className={cn('flex flex-col bg-white border border-gray-100', className)}
      style={{
        width: `${containerWidth}px`,
        height:
          typeof containerHeight === 'number'
            ? `${containerHeight}px`
            : containerHeight,
        padding: `${CONTAINER_PADDING}px`,
        gap: '8px',
        borderRadius: `${CONTAINER_BORDER_RADIUS}px`,
      }}
      {...rest}
    >
      <div
        className={cn('grid', gridColsClass)}
        style={{
          gap: `${GRID_GAP}px`,
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group overflow-hidden bg-gray-100"
            style={{
              width: `${IMAGE_WIDTH}px`,
              borderRadius: `${IMAGE_BORDER_RADIUS}px`,
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
                onClick={() => handleDownload(image)}
                className="absolute bottom-3 right-3 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded hover:bg-black/30 transition-colors duration-200 group/button"
                style={{
                  width: `${DOWNLOAD_BUTTON_SIZE}px`,
                  height: `${DOWNLOAD_BUTTON_SIZE}px`,
                }}
                aria-label={`Download ${image.title || 'imagem'}`}
              >
                <DownloadSimple
                  size={DOWNLOAD_BUTTON_SIZE}
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
