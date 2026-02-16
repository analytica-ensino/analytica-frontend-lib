import type React from 'react';
import { useRef, useState, useCallback, useId, useEffect } from 'react';
import {
  Upload,
  WarningCircle,
  CheckCircle,
  FileVideo,
  FileAudio,
  FilePdf,
  ClosedCaptioning,
  X,
} from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'subtitle';

export interface FileDropzoneProps {
  /** Label text displayed above the dropzone */
  label?: string;
  /** Helper text displayed below the dropzone */
  helperText?: string;
  /** Error message displayed below the dropzone */
  errorMessage?: string;
  /** Current file URL (for existing files) */
  fileUrl?: string | null;
  /** File currently selected */
  selectedFile?: File | null;
  /** Callback when a file is selected */
  onFileSelect?: (file: File) => void;
  /** Callback when file is removed */
  onRemoveFile?: () => void;
  /** Accept specific file types (required) */
  accept: string;
  /** Type of file for display purposes */
  fileType: FileType;
  /** Action text shown as link (default: "Clique aqui") */
  actionText?: string;
  /** Description text shown after action text */
  placeholder?: string;
  /** Text shown when hovering over an existing file */
  changeText?: string;
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
  /** Show image preview (only for image type) */
  showPreview?: boolean;
  /** Max height for image preview */
  previewMaxHeight?: string;
}

const FILE_TYPE_CONFIG: Record<
  FileType,
  {
    icon: React.ElementType;
    defaultPlaceholder: string;
  }
> = {
  image: {
    icon: Upload,
    defaultPlaceholder: 'para subir a imagem ou arraste aqui',
  },
  video: {
    icon: FileVideo,
    defaultPlaceholder: 'para subir o vídeo ou arraste aqui',
  },
  audio: {
    icon: FileAudio,
    defaultPlaceholder: 'para subir o áudio ou arraste aqui',
  },
  pdf: {
    icon: FilePdf,
    defaultPlaceholder: 'para subir o PDF ou arraste aqui',
  },
  subtitle: {
    icon: ClosedCaptioning,
    defaultPlaceholder: 'para subir a legenda ou arraste aqui',
  },
};

/**
 * FileDropzone component for Analytica Ensino platforms
 *
 * A generic dropzone component for file upload with drag-and-drop support,
 * file preview, and dashed border styling. Supports multiple file types.
 *
 * @example
 * ```tsx
 * // Video upload
 * <FileDropzone
 *   label="Arquivo do vídeo"
 *   accept="video/mp4,.mp4"
 *   fileType="video"
 *   onFileSelect={(file) => setVideoFile(file)}
 * />
 *
 * // Audio upload
 * <FileDropzone
 *   label="Arquivo do podcast"
 *   accept="audio/*,.mp3,.wav"
 *   fileType="audio"
 *   onFileSelect={(file) => setAudioFile(file)}
 * />
 *
 * // Image upload with preview
 * <FileDropzone
 *   label="Quadro inicial"
 *   accept="image/*"
 *   fileType="image"
 *   showPreview={true}
 *   onFileSelect={(file) => setImageFile(file)}
 * />
 * ```
 */
export default function FileDropzone({
  label,
  helperText,
  errorMessage,
  fileUrl,
  selectedFile,
  onFileSelect,
  onRemoveFile,
  accept,
  fileType,
  actionText = 'Clique aqui',
  placeholder,
  changeText,
  disabled = false,
  required = false,
  className,
  maxSize,
  onSizeError,
  onTypeError,
  showPreview = true,
  previewMaxHeight = 'max-h-48',
}: Readonly<FileDropzoneProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const generatedId = useId();
  const inputId = `file-dropzone-${generatedId}`;

  const hasError = Boolean(errorMessage);
  const config = FILE_TYPE_CONFIG[fileType];
  const IconComponent = config.icon;
  const defaultPlaceholder = placeholder || config.defaultPlaceholder;
  const defaultChangeText =
    changeText ||
    (fileType === 'image'
      ? 'Clique para alterar a imagem'
      : 'Clique para trocar o arquivo');

  // Manage object URL for selectedFile with proper cleanup (only for images)
  useEffect(() => {
    if (!selectedFile || fileType !== 'image') {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile, fileType]);

  const displayUrl = fileType === 'image' ? previewUrl || fileUrl : null;
  const hasFile = Boolean(selectedFile || fileUrl);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Validate file type
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (!file.type) {
          return false;
        }
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(mainType + '/');
        }
        return file.type === type;
      });

      if (!isValidType) {
        onTypeError?.(file);
        return false;
      }

      // Validate file size
      if (maxSize != null && file.size > maxSize) {
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
      onFileSelect?.(file);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (!disabled && dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      onFileSelect?.(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onRemoveFile?.();
    }
  };

  const getBorderClasses = () => {
    if (hasError) {
      return disabled
        ? 'border-indicator-error'
        : 'border-indicator-error hover:border-indicator-error';
    }
    if (isDragging) {
      return 'border-primary-500 bg-primary-50';
    }
    return disabled
      ? 'border-border-200'
      : 'border-border-200 hover:border-primary-500';
  };

  const dropzoneClasses = cn(
    'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
    getBorderClasses(),
    disabled && 'cursor-not-allowed opacity-50'
  );

  const getAriaDescribedBy = (): string | undefined => {
    if (errorMessage) return `${inputId}-error`;
    if (helperText) return `${inputId}-helper`;
    return undefined;
  };

  const renderFilePreview = () => {
    // For images with showPreview enabled
    if (fileType === 'image' && showPreview && displayUrl) {
      return (
        <div className="flex flex-col items-center gap-2">
          <img
            src={displayUrl}
            alt="Preview do arquivo"
            className={cn(
              'max-w-full rounded-lg object-cover',
              previewMaxHeight
            )}
          />
          <Text size="xs" className="text-text-500">
            {defaultChangeText}
          </Text>
        </div>
      );
    }

    // For non-image files or images without preview - show file info with check
    if (hasFile) {
      const fileName =
        selectedFile?.name || (fileUrl ? 'Arquivo carregado' : '');
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success-100">
            <CheckCircle size={28} className="text-success-600" weight="fill" />
          </div>
          <div className="flex items-center gap-2">
            <IconComponent size={20} className="text-text-600" />
            <Text size="sm" className="text-text-700 max-w-[200px] truncate">
              {fileName}
            </Text>
            {onRemoveFile && !disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-full hover:bg-error-100 transition-colors"
                aria-label="Remover arquivo"
              >
                <X size={14} className="text-indicator-error" />
              </button>
            )}
          </div>
          <Text size="xs" className="text-text-500">
            {defaultChangeText}
          </Text>
        </div>
      );
    }

    // Empty state
    return (
      <>
        <IconComponent size={24} className="text-primary-500 mb-2" />
        <Text size="sm" className="text-text-600 text-center">
          <span className="text-primary-500 font-medium">{actionText}</span>{' '}
          {defaultPlaceholder}
        </Text>
      </>
    );
  };

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
          aria-invalid={hasError}
          aria-describedby={getAriaDescribedBy()}
        />

        {renderFilePreview()}
      </label>

      <div className="mt-1">
        {helperText && !errorMessage && (
          <Text id={`${inputId}-helper`} size="xs" className="text-text-500">
            {helperText}
          </Text>
        )}
        {errorMessage && (
          <Text id={`${inputId}-error`} size="xs" color="text-indicator-error">
            <WarningCircle size={14} /> {errorMessage}
          </Text>
        )}
      </div>
    </div>
  );
}
