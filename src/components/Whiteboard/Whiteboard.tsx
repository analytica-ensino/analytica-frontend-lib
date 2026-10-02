import { HTMLAttributes, useCallback, useState } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import Modal from '../Modal/Modal';
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
  /**
   * Called when the user activates an image — ao ampliar OU ao baixar.
   * Lets a consumer observe the interaction (marking a board as viewed, say)
   * without wrapping these buttons in an outer control of its own.
   */
  onImageActivate?: (image: WhiteboardImage) => void;
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
  onImageActivate,
  imagesPerRow = 2,
  ...rest
}: WhiteboardProps) => {
  // State to track images that failed to load
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  /**
   * Quadro aberto em tamanho grande, guardado pelo ID e resolvido na lista
   * ATUAL — não pelo objeto.
   *
   * Guardar o objeto deixava o preview exibindo uma imagem que já não está mais
   * em `images` (a aula muda, a lista é trocada e o modal segue mostrando a
   * antiga). Resolvendo por ID, o preview fecha sozinho quando o quadro sai da
   * lista, e uma lista vazia não deixa o diálogo armado para reabrir sozinho
   * depois.
   */
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const previewImage =
    images?.find((image) => image.id === previewImageId) ?? null;

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
   * Clique na imagem: abre o quadro ampliado.
   *
   * Antes isto baixava o arquivo, igual ao botão do canto — o rótulo dizia
   * "Ampliar" e nada ampliava. Cada um dos dois botões agora faz o que o seu
   * rótulo promete, e os dois seguem avisando o consumidor: `onImageActivate` é
   * "o aluno interagiu com este quadro" (quem marca progresso de quadro visto),
   * então ampliar e baixar continuam valendo igual.
   */
  const handleExpand = useCallback(
    (image: WhiteboardImage) => {
      setPreviewImageId(image.id);
      onImageActivate?.(image);
    },
    [onImageActivate]
  );

  /** Clique no botão do canto: baixa o arquivo. */
  const handleDownloadClick = useCallback(
    (image: WhiteboardImage) => {
      handleDownload(image);
      onImageActivate?.(image);
    },
    [handleDownload, onImageActivate]
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
                <button
                  type="button"
                  onClick={() => handleExpand(image)}
                  className="absolute inset-0 w-full h-full cursor-pointer border-none p-0 bg-transparent"
                  aria-label={`Ampliar ${image.title || 'imagem'}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title || `Whiteboard ${image.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(image.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </button>
              )}
            </div>
            {showDownload && (
              <button
                type="button"
                onClick={() => handleDownloadClick(image)}
                className="cursor-pointer absolute bottom-3 right-3 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded hover:bg-black/30 transition-colors duration-200 group/button w-6 h-6"
                aria-label={`Baixar ${image.title || 'imagem'}`}
              >
                {/* Ícone de download. Era o `ArrowsOut` (expandir) num botão que
                    baixava — quem olhava esperava ampliar. Decorativo: o rótulo
                    do botão já diz o que ele faz. */}
                <DownloadSimpleIcon
                  size={24}
                  weight="regular"
                  aria-hidden="true"
                  className="text-white group-hover/button:scale-110 transition-transform duration-200"
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quadro ampliado. Usa o `Modal` da lib, que já traz Escape, trava de
          scroll e gerenciamento de foco (`useModalFocus`). */}
      <Modal
        isOpen={previewImage !== null}
        onClose={() => setPreviewImageId(null)}
        title={previewImage?.title || 'Quadro da aula'}
        size="xl"
      >
        {previewImage && (
          <img
            src={previewImage.imageUrl}
            // Com título, o `<dialog>` já é nomeado por ele e repetir aqui faria
            // o leitor anunciar a mesma coisa duas vezes. Sem título, o diálogo
            // cai num nome genérico e um `alt` vazio tornaria a imagem — que é
            // todo o conteúdo dele — invisível pro leitor; daí a descrição
            // própria.
            alt={previewImage.title ? '' : 'Quadro da aula ampliado'}
            className="w-full h-auto rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
};

export default Whiteboard;
