import type React from 'react';
import { useRef, useState } from 'react';
import { Image, Paperclip, X } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { cn } from '../../utils/utils';

export interface ImageUploadProps {
  /** File currently selected */
  selectedFile?: File | null;
  /** Upload progress (0-100). If not provided, progress bar won't show */
  uploadProgress?: number;
  /** Show progress bar even if uploadProgress is 100 */
  showProgress?: boolean;
  /** Callback when a file is selected */
  onFileSelect?: (file: File) => void;
  /** Callback when file is removed */
  onRemoveFile?: () => void;
  /** Custom button text when no file is selected */
  buttonText?: string;
  /** Custom button icon when no file is selected */
  buttonIcon?: React.ReactNode;
  /** Accept specific file types (default: "image/*") */
  accept?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Max file size in bytes */
  maxSize?: number;
  /** Callback when file size exceeds maxSize */
  onSizeError?: (file: File, maxSize: number) => void;
  /** Callback when invalid file type is selected */
  onTypeError?: (file: File) => void;
  /** Variant of the upload button */
  variant?: 'default' | 'compact';
}

export default function ImageUpload({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  buttonText = 'Inserir imagem',
  buttonIcon,
  accept = 'image/*',
  disabled = false,
  className,
  maxSize,
  onSizeError,
  onTypeError,
  variant = 'default',
}: Readonly<ImageUploadProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null);

  // Use controlled or uncontrolled mode
  const currentFile = selectedFile ?? internalFile;
  const hasFile = currentFile !== null;

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(mainType + '/');
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      onTypeError?.(file);
      return;
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      onSizeError?.(file, maxSize);
      return;
    }

    // Update state
    if (selectedFile === undefined) {
      setInternalFile(file);
    }
    onFileSelect?.(file);

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleRemoveFile = () => {
    if (!disabled) {
      if (selectedFile === undefined) {
        setInternalFile(null);
      }
      onRemoveFile?.();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {hasFile ? (
          <div className="inline-flex items-center gap-2 bg-muted rounded-md px-3 py-1.5">
            <Paperclip className="h-4 w-4 text-text-800" />
            <Text size="sm" weight="medium" className="text-text-800">
              {currentFile.name}
            </Text>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remover imagem"
              title="Remover imagem"
            >
              <X className="h-3 w-3 text-primary-950" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="link"
            size="extra-small"
            onClick={handleButtonClick}
            disabled={disabled}
          >
            {buttonIcon || <Image className="h-4 w-4" />}
            <span className="ml-2">{buttonText}</span>
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {hasFile ? (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-muted rounded-md px-3 py-2">
            <Paperclip className="h-4 w-4 text-text-800" />
            <Text size="sm" weight="medium" className="text-text-800">
              {currentFile.name}
            </Text>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4 text-primary-950 cursor-pointer" />
            </button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="link"
          onClick={handleButtonClick}
          disabled={disabled}
        >
          {buttonIcon || <Image className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
