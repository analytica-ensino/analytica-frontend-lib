import { useState } from 'react';
import type { Story } from '@ladle/react';
import FileDropzone, { FileType } from './FileDropzone';
import Text from '../Text/Text';

/**
 * Helper component to manage file state
 */
const FileDropzoneWithState = ({
  fileType,
  accept,
  label,
  helperText,
  showPreview = true,
  maxSize,
  initialFileUrl,
  disabled,
  required,
}: {
  fileType: FileType;
  accept: string;
  label?: string;
  helperText?: string;
  showPreview?: boolean;
  maxSize?: number;
  initialFileUrl?: string;
  disabled?: boolean;
  required?: boolean;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(undefined);
    console.log('File selected:', file.name, file.size, file.type);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileUrl(null);
    console.log('File removed');
  };

  const handleSizeError = (file: File, maxSizeBytes: number) => {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(1);
    setErrorMessage(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    console.log('Size error:', file.name, file.size);
  };

  const handleTypeError = (file: File) => {
    setErrorMessage(`Tipo de arquivo não permitido: ${file.type || file.name}`);
    console.log('Type error:', file.name, file.type);
  };

  return (
    <FileDropzone
      label={label}
      helperText={helperText}
      errorMessage={errorMessage}
      fileUrl={fileUrl}
      selectedFile={selectedFile}
      onFileSelect={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      accept={accept}
      fileType={fileType}
      showPreview={showPreview}
      maxSize={maxSize}
      onSizeError={handleSizeError}
      onTypeError={handleTypeError}
      disabled={disabled}
      required={required}
    />
  );
};

/**
 * Showcase principal: todas as variações do FileDropzone
 */
export const AllVariations: Story = () => (
  <div className="flex flex-col gap-8 p-4 max-w-2xl">
    <h2 className="font-bold text-3xl text-text-900">FileDropzone</h2>
    <p className="text-text-700">
      Componente de upload de arquivos com suporte a drag-and-drop, preview de
      imagens e validação de tipo/tamanho.
    </p>

    <div className="flex flex-col gap-6">
      <h3 className="font-bold text-xl text-text-900">Tipos de arquivo</h3>

      <FileDropzoneWithState
        fileType="image"
        accept="image/*"
        label="Imagem"
        helperText="JPG, PNG ou GIF. Máximo 5MB."
        maxSize={5 * 1024 * 1024}
      />

      <FileDropzoneWithState
        fileType="video"
        accept="video/mp4,.mp4,.webm"
        label="Vídeo"
        helperText="MP4 ou WebM. Máximo 500MB."
        maxSize={500 * 1024 * 1024}
      />

      <FileDropzoneWithState
        fileType="audio"
        accept="audio/*,.mp3,.wav"
        label="Áudio"
        helperText="MP3 ou WAV. Máximo 50MB."
        maxSize={50 * 1024 * 1024}
      />

      <FileDropzoneWithState
        fileType="pdf"
        accept=".pdf,application/pdf"
        label="Documento PDF"
        helperText="Apenas arquivos PDF."
      />

      <FileDropzoneWithState
        fileType="subtitle"
        accept=".vtt,.srt"
        label="Legenda"
        helperText="VTT ou SRT."
      />
    </div>
  </div>
);

/**
 * Upload de imagem com preview
 */
export const ImageUpload: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="image"
      accept="image/*"
      label="Foto de perfil"
      helperText="Selecione uma imagem para seu perfil"
      showPreview={true}
      maxSize={2 * 1024 * 1024}
    />
  </div>
);

/**
 * Upload de vídeo
 */
export const VideoUpload: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="video"
      accept="video/mp4,.mp4,.webm"
      label="Arquivo do vídeo"
      helperText="Formatos aceitos: MP4, WebM"
      maxSize={5 * 1024 * 1024 * 1024}
      required
    />
  </div>
);

/**
 * Upload de áudio (podcast)
 */
export const AudioUpload: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="audio"
      accept="audio/*,.mp3,.wav,.m4a"
      label="Arquivo do podcast"
      helperText="MP3, WAV ou M4A. Máximo 100MB."
      maxSize={100 * 1024 * 1024}
    />
  </div>
);

/**
 * Upload de PDF
 */
export const PdfUpload: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="pdf"
      accept=".pdf,application/pdf"
      label="Documento"
      helperText="Apenas arquivos PDF"
    />
  </div>
);

/**
 * Upload de legenda
 */
export const SubtitleUpload: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="subtitle"
      accept=".vtt,.srt"
      label="Arquivo de legenda"
      helperText="VTT ou SRT"
    />
  </div>
);

/**
 * Com arquivo pré-carregado (URL)
 */
export const WithExistingFile: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="image"
      accept="image/*"
      label="Capa da aula"
      initialFileUrl="https://picsum.photos/400/300"
      showPreview={true}
    />
  </div>
);

/**
 * Sem preview de imagem
 */
export const ImageWithoutPreview: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="image"
      accept="image/*"
      label="Imagem"
      helperText="Preview desabilitado"
      showPreview={false}
    />
  </div>
);

/**
 * Estado desabilitado
 */
export const Disabled: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="image"
      accept="image/*"
      label="Upload desabilitado"
      helperText="Este campo não pode ser editado"
      disabled
    />
  </div>
);

/**
 * Com erro
 */
export const WithError: Story = () => {
  const [errorMessage] = useState(
    'Arquivo muito grande. Máximo permitido: 5MB'
  );

  return (
    <div className="p-4 max-w-md">
      <FileDropzone
        label="Imagem"
        accept="image/*"
        fileType="image"
        errorMessage={errorMessage}
      />
    </div>
  );
};

/**
 * Campo obrigatório
 */
export const Required: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzoneWithState
      fileType="video"
      accept="video/*"
      label="Vídeo da aula"
      helperText="Este campo é obrigatório"
      required
    />
  </div>
);

/**
 * Formulário completo de upload de materiais
 */
export const FullUploadForm: Story = () => (
  <div className="p-4 max-w-2xl">
    <h2 className="font-bold text-2xl text-text-900 mb-6">
      Upload de materiais da aula
    </h2>

    <div className="flex flex-col gap-6">
      <FileDropzoneWithState
        fileType="video"
        accept="video/mp4,.mp4,.webm"
        label="Vídeo da aula"
        helperText="MP4 ou WebM. Máximo 5GB."
        maxSize={5 * 1024 * 1024 * 1024}
        required
      />

      <FileDropzoneWithState
        fileType="audio"
        accept="audio/*,.mp3"
        label="Podcast"
        helperText="MP3. Máximo 100MB."
        maxSize={100 * 1024 * 1024}
      />

      <div className="grid grid-cols-2 gap-4">
        <FileDropzoneWithState
          fileType="image"
          accept="image/*"
          label="Quadro inicial"
          showPreview={true}
          maxSize={10 * 1024 * 1024}
        />

        <FileDropzoneWithState
          fileType="image"
          accept="image/*"
          label="Quadro final"
          showPreview={true}
          maxSize={10 * 1024 * 1024}
        />
      </div>

      <FileDropzoneWithState
        fileType="subtitle"
        accept=".vtt,.srt"
        label="Legenda"
        helperText="VTT ou SRT"
      />

      <FileDropzoneWithState
        fileType="pdf"
        accept=".pdf"
        label="Roteiro"
        helperText="Documento PDF"
      />

      <FileDropzoneWithState
        fileType="image"
        accept="image/*"
        label="Capa"
        helperText="Imagem de capa para a aula"
        showPreview={true}
        maxSize={5 * 1024 * 1024}
      />
    </div>
  </div>
);

/**
 * Textos customizados
 */
export const CustomTexts: Story = () => (
  <div className="p-4 max-w-md">
    <FileDropzone
      label="Logo da empresa"
      accept="image/png"
      fileType="image"
      actionText="Escolha um arquivo"
      placeholder="ou solte aqui (apenas PNG)"
      changeText="Trocar logo"
      helperText="Tamanho recomendado: 200x200px"
    />
  </div>
);

/**
 * Validação de tamanho
 */
export const SizeValidation: Story = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const maxSize = 100 * 1024; // 100KB

  return (
    <div className="p-4 max-w-md">
      <Text className="mb-4 text-text-700">
        Tente fazer upload de um arquivo maior que 100KB para ver a validação.
      </Text>

      <FileDropzone
        label="Arquivo (máx 100KB)"
        accept="image/*"
        fileType="image"
        maxSize={maxSize}
        selectedFile={selectedFile}
        errorMessage={errorMessage}
        onFileSelect={(file) => {
          setSelectedFile(file);
          setErrorMessage(undefined);
        }}
        onRemoveFile={() => {
          setSelectedFile(null);
          setErrorMessage(undefined);
        }}
        onSizeError={(file) => {
          setErrorMessage(
            `Arquivo "${file.name}" é muito grande (${(file.size / 1024).toFixed(1)}KB). Máximo: 100KB`
          );
        }}
      />
    </div>
  );
};

/**
 * Validação de tipo
 */
export const TypeValidation: Story = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="p-4 max-w-md">
      <Text className="mb-4 text-text-700">
        Tente fazer upload de um arquivo que não seja PNG para ver a validação.
      </Text>

      <FileDropzone
        label="Apenas PNG"
        accept="image/png,.png"
        fileType="image"
        selectedFile={selectedFile}
        errorMessage={errorMessage}
        onFileSelect={(file) => {
          setSelectedFile(file);
          setErrorMessage(undefined);
        }}
        onRemoveFile={() => {
          setSelectedFile(null);
          setErrorMessage(undefined);
        }}
        onTypeError={(file) => {
          setErrorMessage(
            `Tipo não permitido: ${file.type || 'desconhecido'}. Use apenas PNG.`
          );
        }}
      />
    </div>
  );
};
