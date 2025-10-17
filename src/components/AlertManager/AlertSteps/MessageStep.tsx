import { useState } from 'react';
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const title = useAlertFormStore((state) => state.title);
  const message = useAlertFormStore((state) => state.message);
  const image = useAlertFormStore((state) => state.image);
  const setTitle = useAlertFormStore((state) => state.setTitle);
  const setMessage = useAlertFormStore((state) => state.setMessage);
  const setImage = useAlertFormStore((state) => state.setImage);

  const handleFileSelect = (file: File) => {
    setImage(file);
    // Simula o progresso de upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleRemoveFile = () => {
    setImage(null);
    setUploadProgress(0);
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
          selectedFile={image}
          uploadProgress={uploadProgress}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />
      )}
    </section>
  );
};
