import React, { useRef } from 'react';
import { Paperclip, FileText, X } from 'phosphor-react';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Represents an attached file with unique identifier
 */
export interface AttachedFile {
  /** The file object */
  file: File;
  /** Unique identifier for the file */
  id: string;
}

/**
 * Props for the FileAttachment component
 */
export interface FileAttachmentProps {
  /** List of attached files */
  files: AttachedFile[];
  /** Callback when files are added */
  onFilesAdd: (files: File[]) => void;
  /** Callback when a file is removed */
  onFileRemove: (id: string) => void;
  /** Whether the files are read-only (no removal allowed) */
  readOnly?: boolean;
  /** Text for the attach button */
  buttonLabel?: string;
  /** Whether to accept multiple files */
  multiple?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Whether to hide the attach button */
  hideButton?: boolean;
}

/**
 * Formats file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Generates a unique ID for file tracking
 * @returns Unique string identifier
 */
const generateFileId = (): string => {
  return crypto.randomUUID();
};

/**
 * Reusable file attachment component
 *
 * Allows users to attach multiple files with preview and removal functionality.
 * No file size or type restrictions are applied on the client side.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * const [files, setFiles] = useState<AttachedFile[]>([]);
 *
 * <FileAttachment
 *   files={files}
 *   onFilesAdd={(newFiles) => {
 *     const attachedFiles = newFiles.map(file => ({
 *       file,
 *       id: generateFileId()
 *     }));
 *     setFiles(prev => [...prev, ...attachedFiles]);
 *   }}
 *   onFileRemove={(id) => setFiles(prev => prev.filter(f => f.id !== id))}
 *   multiple
 * />
 * ```
 */
const FileAttachment = ({
  files,
  onFilesAdd,
  onFileRemove,
  readOnly = false,
  buttonLabel = 'Anexar',
  multiple = true,
  className,
  hideButton = false,
}: FileAttachmentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file input change
   * @param event - Input change event
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const filesArray: File[] = Array.from(selectedFiles);
      onFilesAdd(filesArray);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Trigger file input click
   */
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple={multiple}
        aria-label="Selecionar arquivos"
      />

      {/* Attach button */}
      {!readOnly && !hideButton && (
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={handleAttachClick}
          className="self-start flex items-center gap-2"
        >
          <Paperclip size={16} />
          {buttonLabel}
        </Button>
      )}

      {/* Attached files list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((attachedFile) => (
            <div
              key={attachedFile.id}
              className="flex items-center gap-2 bg-background-50 px-3 py-2 rounded-lg border border-border-100"
            >
              <FileText size={16} className="text-text-500 shrink-0" />
              <Text className="text-sm text-text-700 truncate max-w-[200px]">
                {attachedFile.file.name}
              </Text>
              <Text className="text-xs text-text-400 shrink-0">
                {formatFileSize(attachedFile.file.size)}
              </Text>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onFileRemove(attachedFile.id)}
                  className="text-text-400 hover:text-error-500 transition-colors shrink-0"
                  aria-label={`Remover ${attachedFile.file.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { generateFileId, formatFileSize };
export default FileAttachment;
