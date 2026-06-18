import { ReactNode } from 'react';
import { PaperclipIcon } from '@phosphor-icons/react/dist/csr/Paperclip';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import Text from '../Text/Text';
import Button from '../Button/Button';

export interface ImagePreviewCardProps {
  /** URL da imagem a ser exibida */
  imageUrl: string;
  /** Nome do arquivo (exibido no chip abaixo da imagem) */
  fileName: string;
  /** Callback ao remover — se omitido, o X não é renderizado */
  onRemove?: () => void;
  /** Callback ao atualizar — se omitido, o botão de atualizar não é renderizado */
  onUpdate?: () => void;
  /** Label acima do card. Default: "Imagem" */
  label?: ReactNode;
  /** Texto do botão de atualizar. Default: "Atualizar imagem" */
  updateButtonLabel?: string;
  /** aria-label do botão X de remover. Default: "Remover imagem" */
  removeAriaLabel?: string;
  /** Classes adicionais pro container externo */
  className?: string;
}

/**
 * Card de preview de imagem com chip de nome de arquivo e ação de atualização.
 *
 * Útil em fluxos de upload onde o usuário precisa ver a imagem enviada,
 * remover, e/ou substituir.
 *
 * @example
 * ```tsx
 * <ImagePreviewCard
 *   imageUrl={objectUrl}
 *   fileName="redacao.jpg"
 *   onRemove={() => setFile(null)}
 *   onUpdate={() => openFilePicker()}
 * />
 * ```
 */
const ImagePreviewCard = ({
  imageUrl,
  fileName,
  onRemove,
  onUpdate,
  label = 'Imagem',
  updateButtonLabel = 'Atualizar imagem',
  removeAriaLabel = 'Remover imagem',
  className = '',
}: ImagePreviewCardProps) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {label && (
        <Text size="md" weight="bold" className="text-text-950">
          {label}
        </Text>
      )}

      <div className="flex flex-col items-center gap-3 border border-border-200 rounded-xl p-4 bg-background">
        <img
          src={imageUrl}
          alt={fileName}
          className="w-full max-h-80 object-contain rounded-lg"
        />

        <div className="flex flex-row items-center gap-2 border border-border-200 rounded-full px-3 py-1.5 bg-secondary-50 max-w-full min-w-0">
          <PaperclipIcon size={16} className="shrink-0 text-text-700" />
          <Text size="sm" className="text-text-800 truncate min-w-0">
            {fileName}
          </Text>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={removeAriaLabel}
              className="shrink-0 text-text-700 hover:text-text-950 cursor-pointer"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {onUpdate && (
          <Button variant="outline" size="small" onClick={onUpdate}>
            {updateButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImagePreviewCard;
