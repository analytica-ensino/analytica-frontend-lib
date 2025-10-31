import { useShallow } from 'zustand/react/shallow';
import Input from '../../Input/Input';
import TextArea from '../../TextArea/TextArea';
import ImageUpload from '../../ImageUpload/ImageUpload';
import { useAlertFormStore } from '../useAlertForm';
import { LabelsConfig } from '../types';

interface MessageStepProps {
  labels?: LabelsConfig;
  allowImageAttachment?: boolean;
}

export const MessageStep = ({
  labels,
  allowImageAttachment = true,
}: MessageStepProps) => {
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
    setImage(file);
  };

  const handleRemoveFile = () => {
    setImage(null);
  };

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
        <ImageUpload
          selectedFile={image instanceof File ? image : null}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />
      )}
    </section>
  );
};
