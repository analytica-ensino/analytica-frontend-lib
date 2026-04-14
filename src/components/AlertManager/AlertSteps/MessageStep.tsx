import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import Input from '../../Input/Input';
import TextArea from '../../TextArea/TextArea';
import ImageUpload from '../../ImageUpload/ImageUpload';
import Text from '../../Text/Text';
import { useAlertFormStore } from '../useAlertForm';
import { LabelsConfig } from '../types';

interface MessageStepProps {
  labels?: LabelsConfig;
  allowImageAttachment?: boolean;
}

const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.webp,.svg';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE_LABEL = '5MB';

export const MessageStep = ({
  labels,
  allowImageAttachment = true,
}: MessageStepProps) => {
  const [imageError, setImageError] = useState<string | null>(null);
  const { title, message, image, setTitle, setMessage, setImage } =
    useAlertFormStore(
      useShallow((state) => ({
        title: state.title,
        message: state.message,
        image: state.image,
        setTitle: state.setTitle,
        setMessage: state.setMessage,
        setImage: state.setImage,
      }))
    );

  const handleFileSelect = (file: File) => {
    setImageError(null);
    setImage(file);
  };

  const handleRemoveFile = () => {
    setImageError(null);
    setImage(null);
  };

  const handleTypeError = () => {
    setImageError(
      'Formato de imagem não suportado. Use jpg, jpeg, png, gif, webp ou svg.'
    );
  };

  const handleSizeError = () => {
    setImageError(
      `Imagem muito grande. O tamanho máximo permitido é ${MAX_IMAGE_SIZE_LABEL}.`
    );
  };

  const isImageFile = image instanceof File;
  return (
    <section className="flex flex-col gap-4">
      <Input
        required
        label={labels?.titleLabel || 'Título'}
        placeholder={labels?.titlePlaceholder || 'Digite o título do aviso'}
        variant="rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextArea
        required
        label={labels?.messageLabel || 'Mensagem'}
        placeholder={labels?.messagePlaceholder || 'Digite a mensagem do aviso'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {allowImageAttachment && (
        <div className="flex flex-col gap-2">
          <ImageUpload
            selectedFile={isImageFile ? image : null}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
            accept={ACCEPTED_IMAGE_EXTENSIONS}
            maxSize={MAX_IMAGE_SIZE_BYTES}
            onTypeError={handleTypeError}
            onSizeError={handleSizeError}
          />
          {imageError && (
            <Text size="sm" className="text-error-600" role="alert">
              {imageError}
            </Text>
          )}
        </div>
      )}
    </section>
  );
};
