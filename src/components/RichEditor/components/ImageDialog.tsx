import { useState, useRef, ChangeEvent } from 'react';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import ImageUpload from '../../ImageUpload/ImageUpload';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple';
import { MAX_IMAGE_SIZE, resolveInsertWidth } from './imageSize';

type InputMode = 'file' | 'url';

interface ImageDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onInsert: (src: string, alt: string, width?: number) => void;
  /**
   * Optional callback to upload an image file and get back its public URL.
   * If provided, the file upload tab is enabled; otherwise only URL input is
   * available. The library stays agnostic of how the consumer uploads.
   * @param file - The image file selected by the user
   * @returns Promise resolving to the public URL of the uploaded image
   */
  readonly onUploadImage?: (file: File) => Promise<string>;
}

export function ImageDialog({
  open,
  onClose,
  onInsert,
  onUploadImage,
}: ImageDialogProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    onUploadImage ? 'file' : 'url'
  );
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  /**
   * True while the image is being measured. The URL branch has no upload to
   * wait on, so without this the confirm button would stay enabled during the
   * measurement and a second click would insert the same image twice.
   */
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [error, setError] = useState('');
  /** Bumped on close so a resolving upload can tell it has been superseded. */
  const uploadTokenRef = useRef(0);

  const isBusy = isUploading || isMeasuring;

  const resetState = () => {
    setInputMode(onUploadImage ? 'file' : 'url');
    setFile(null);
    setUrl('');
    setAlt('');
    setIsUploading(false);
    setIsMeasuring(false);
    setError('');
  };

  const handleClose = () => {
    // Invalidates any upload still in flight. The Modal closes on Escape and on
    // its X button, so the user can dismiss the dialog mid-upload; without this
    // the promise would resolve afterwards and insert an image they cancelled.
    uploadTokenRef.current += 1;
    resetState();
    onClose();
  };

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setError('');
  };

  const handleSizeError = () => {
    setFile(null);
    setError('A imagem deve ter no máximo 5MB.');
  };

  const handleTypeError = () => {
    setFile(null);
    setError('Selecione um arquivo de imagem válido.');
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    setError('');
  };

  /** Inserts an image already available at `src`, measuring it first. */
  const insertMeasured = async (src: string) => {
    const token = uploadTokenRef.current;
    const width = await resolveInsertWidth(src);
    if (token !== uploadTokenRef.current) return;
    onInsert(src, alt.trim(), width);
    resetState();
  };

  const handleInsert = async () => {
    if (inputMode === 'url') {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return;

      // Marked busy before the first await so the confirm button is disabled
      // while measuring — otherwise a second click would insert the same image
      // twice, since the URL branch has no upload to keep it disabled.
      setIsMeasuring(true);
      try {
        await insertMeasured(trimmedUrl);
      } finally {
        setIsMeasuring(false);
      }
      return;
    }

    if (!file || !onUploadImage) return;

    setIsUploading(true);
    setError('');
    const token = uploadTokenRef.current;

    try {
      // Upload before inserting so the saved HTML never holds a blob: URL,
      // which would break as soon as the page unloads.
      const uploadedUrl = await onUploadImage(file);
      if (token !== uploadTokenRef.current) return;
      await insertMeasured(uploadedUrl);
    } catch (err) {
      if (token !== uploadTokenRef.current) return;
      setError(err instanceof Error ? err.message : 'Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const canInsert = inputMode === 'url' ? !!url.trim() : !!file;

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Inserir imagem"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            onClick={handleInsert}
            disabled={!canInsert || isBusy}
          >
            {isUploading ? 'Enviando...' : 'Inserir imagem'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {onUploadImage && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={inputMode === 'file' ? 'solid' : 'outline'}
              action="primary"
              size="small"
              onClick={() => switchMode('file')}
              className="flex items-center gap-1"
            >
              <UploadSimpleIcon size={14} />
              Enviar arquivo
            </Button>
            <Button
              type="button"
              variant={inputMode === 'url' ? 'solid' : 'outline'}
              action="primary"
              size="small"
              onClick={() => switchMode('url')}
              className="flex items-center gap-1"
            >
              <LinkIcon size={14} />
              Usar URL
            </Button>
          </div>
        )}

        {inputMode === 'file' && onUploadImage ? (
          <div>
            <ImageUpload
              selectedFile={file}
              onFileSelect={handleFileSelect}
              onRemoveFile={() => setFile(null)}
              // Defaults to "Inserir imagem", which would collide with the
              // dialog's confirm button — same name, different action.
              buttonText="Selecionar arquivo"
              maxSize={MAX_IMAGE_SIZE}
              onSizeError={handleSizeError}
              onTypeError={handleTypeError}
              disabled={isUploading}
            />
            <Text size="xs" className="text-text-400 mt-1">
              Formatos aceitos: PNG, JPG, GIF, WEBP (máx. 5MB)
            </Text>
          </div>
        ) : (
          <div>
            <Text weight="medium" className="text-xs text-text-600 mb-2 block">
              URL da imagem
            </Text>
            <Input
              type="text"
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              placeholder="https://exemplo.com/imagem.png"
            />
          </div>
        )}

        <div>
          <Text weight="medium" className="text-xs text-text-600 mb-2 block">
            Texto alternativo (opcional)
          </Text>
          <Input
            type="text"
            value={alt}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAlt(e.target.value)
            }
            placeholder="Descreva a imagem para leitores de tela"
            disabled={isUploading}
          />
        </div>

        {error && (
          <Text size="xs" className="text-error-600">
            {error}
          </Text>
        )}
      </div>
    </Modal>
  );
}
