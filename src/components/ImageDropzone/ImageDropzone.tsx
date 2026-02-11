import type React from 'react';
import { useRef, useState, useCallback, useId } from 'react';
import { Upload, WarningCircle } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import IconRender from '../IconRender/IconRender';
import { cn } from '../../utils/utils';

export interface ImageDropzoneProps {
  /** Label text displayed above the dropzone */
  label?: string;
  /** Helper text displayed below the dropzone */
  helperText?: string;
  /** Error message displayed below the dropzone */
  errorMessage?: string;
  /** Current image URL (for existing images) */
  imageUrl?: string | null;
  /** File currently selected */
  selectedFile?: File | null;
  /** Callback when a file is selected */
  onFileSelect?: (file: File) => void;
  /** Callback when file is removed */
  onRemoveFile?: () => void;
  /** Text shown when no image is selected */
  placeholder?: string;
  /** Text shown when hovering over an existing image */
  changeText?: string;
  /** Accept specific file types (default: "image/*") */
  accept?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Custom class name */
  className?: string;
  /** Max file size in bytes */
  maxSize?: number;
  /** Callback when file size exceeds maxSize */
  onSizeError?: (file: File, maxSize: number) => void;
  /** Callback when invalid file type is selected */
  onTypeError?: (file: File) => void;
  /** Max height for image preview */
  previewMaxHeight?: string;
}

/**
 * ImageDropzone component for Analytica Ensino platforms
 *
 * A dropzone component for image upload with drag-and-drop support,
 * image preview, and dashed border styling.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ImageDropzone
 *   label="Capa"
 *   onFileSelect={(file) => setFile(file)}
 *   helperText="Formatos aceitos: JPG, PNG"
 * />
 *
 * // With existing image URL
 * <ImageDropzone
 *   label="Capa"
 *   imageUrl={existingImageUrl}
 *   onFileSelect={(file) => setFile(file)}
 * />
 *
 * // With selected file preview
 * <ImageDropzone
 *   label="Capa"
 *   selectedFile={file}
 *   onFileSelect={setFile}
 *   onRemoveFile={() => setFile(null)}
 * />
 * ```
 */
export default function ImageDropzone({
  label,
  helperText,
  errorMessage,
  imageUrl,
  selectedFile,
  onFileSelect,
  onRemoveFile,
  placeholder = 'Clique aqui para subir o arquivo ou arraste aqui',
  changeText = 'Clique para alterar a imagem',
  accept = 'image/*',
  disabled = false,
  required = false,
  className,
  maxSize,
  onSizeError,
  onTypeError,
  previewMaxHeight = 'max-h-48',
}: Readonly<ImageDropzoneProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const generatedId = useId();
  const inputId = `image-dropzone-${generatedId}`;

  const hasError = Boolean(errorMessage);

  // Generate preview URL from selected file
  const imagePreviewUrl =
    previewUrl || (selectedFile ? URL.createObjectURL(selectedFile) : null);
  const displayUrl = imagePreviewUrl || imageUrl;

  const validateFile = useCallback(
    (file: File): boolean => {
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
        return false;
      }

      // Validate file size
      if (maxSize && file.size > maxSize) {
        onSizeError?.(file, maxSize);
        return false;
      }

      return true;
    },
    [accept, maxSize, onSizeError, onTypeError]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    if (validateFile(file)) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect?.(file);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect?.(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setPreviewUrl(null);
      onRemoveFile?.();
    }
  };

  const getBorderClasses = () => {
    if (hasError) {
      return 'border-indicator-error hover:border-indicator-error';
    }
    if (isDragging) {
      return 'border-primary-500 bg-primary-50';
    }
    return 'border-border-200 hover:border-primary-500';
  };

  const dropzoneClasses = cn(
    'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
    getBorderClasses(),
    disabled && 'cursor-not-allowed opacity-50'
  );

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block font-bold text-text-900 mb-2 text-sm"
        >
          {label} {required && <span className="text-indicator-error">*</span>}
        </label>
      )}

      <div className="relative">
        {onRemoveFile && !disabled && displayUrl && (
          <Button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 z-10 transition-colors cursor-pointer bg-transparent hover:bg-transparent border-0"
            size="extra-small"
            aria-label="Remover imagem"
          >
            <span className="text-indicator-error">
              <IconRender iconName="X" size={14} />
            </span>
          </Button>
        )}
        <label
          className={dropzoneClasses}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          {displayUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={displayUrl}
                alt="Preview da imagem"
                className={cn(
                  'max-w-full rounded-lg object-cover',
                  previewMaxHeight
                )}
              />
              <Text size="xs" className="text-text-500">
                {changeText}
              </Text>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-primary-500 mb-2" />
              <Text size="sm" className="text-text-600 text-center">
                <span className="text-primary-500 font-medium">
                  Clique aqui
                </span>{' '}
                {placeholder.replace('Clique aqui ', '')}
              </Text>
            </>
          )}
        </label>
      </div>

      <div className="mt-1">
        {helperText && !errorMessage && (
          <Text size="xs" className="text-text-500">
            {helperText}
          </Text>
        )}
        {errorMessage && (
          <p className="flex gap-1 items-center text-xs text-indicator-error">
            <WarningCircle size={14} /> {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
