import { ReactNode, useEffect } from 'react';
import { X } from 'phosphor-react';
import { cn } from '../../utils/utils';
import Button from '../Button/Button';
import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
} from './utils/videoUtils';

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  xs: 'max-w-[360px]',
  sm: 'max-w-[420px]',
  md: 'max-w-[510px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[970px]',
} as const;

/**
 * Modal component props interface
 */
type ModalProps = {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal description/content */
  children?: ReactNode;
  /** Size of the modal */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes for the modal content */
  className?: string;
  /** Whether pressing Escape should close the modal */
  closeOnEscape?: boolean;
  /** Footer content (typically buttons) */
  footer?: ReactNode;
  /** Hide the close button */
  hideCloseButton?: boolean;
  /** Modal variant */
  variant?: 'default' | 'activity';
  /** Description for activity variant */
  description?: string;
  /** Image URL for activity variant */
  image?: string;
  /** Action link for activity variant */
  actionLink?: string;
  /** Action button label for activity variant */
  actionLabel?: string;
};

/**
 * Modal component for Analytica Ensino platforms
 *
 * A flexible modal component with multiple size variants and customizable behavior.
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback function called when the modal should be closed
 * @param title - The title displayed at the top of the modal
 * @param children - The main content of the modal
 * @param size - The size variant (xs, sm, md, lg, xl)
 * @param className - Additional CSS classes for the modal content
 * @param closeOnBackdropClick - Whether clicking the backdrop closes the modal (default: true)
 * @param closeOnEscape - Whether pressing Escape closes the modal (default: true)
 * @param footer - Footer content, typically action buttons
 * @param hideCloseButton - Whether to hide the X close button (default: false)
 * @returns A modal overlay with content
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Invite your team"
 *   size="md"
 *   footer={
 *     <div className="flex gap-3">
 *       <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
 *       <Button variant="solid" onClick={handleExplore}>Explore</Button>
 *     </div>
 *   }
 * >
 *   Elevate user interactions with our versatile modals.
 * </Modal>
 * ```
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnEscape = true,
  footer,
  hideCloseButton = false,
  variant = 'default',
  description,
  image,
  actionLink,
  actionLabel,
}: ModalProps) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = SIZE_CLASSES[size];
  const baseClasses =
    'bg-secondary-50 rounded-3xl shadow-hard-shadow-2 border border-border-100 w-full mx-4';
  // Reset dialog default styles to prevent positioning issues
  const dialogResetClasses =
    'p-0 m-0 border-none outline-none max-h-none static';
  const modalClasses = cn(
    baseClasses,
    sizeClasses,
    dialogResetClasses,
    className
  );

  // Handle action link click
  const handleActionClick = () => {
    if (actionLink) {
      window.open(actionLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Activity variant rendering
  if (variant === 'activity') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs border-none p-0 m-0 w-full cursor-default">
        <dialog
          className={modalClasses}
          aria-labelledby="modal-title"
          aria-modal="true"
          open
        >
          {/* Header simples com X */}
          <div className="flex justify-end p-6 pb-0">
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-text-500 hover:text-text-700 hover:bg-background-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indicator-info focus:ring-offset-2"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Conteúdo centralizado */}
          <div className="flex flex-col items-center px-6 pb-6 gap-5">
            {/* Imagem ilustrativa */}
            {image && (
              <div className="flex justify-center">
                <img
                  src={image}
                  alt=""
                  className="w-[122px] h-[122px] object-contain"
                />
              </div>
            )}

            {/* Título */}
            <h2
              id="modal-title"
              className="text-lg font-semibold text-text-950 text-center"
            >
              {title}
            </h2>

            {/* Descrição */}
            {description && (
              <p className="text-sm font-normal text-text-400 text-center max-w-md leading-[21px]">
                {description}
              </p>
            )}

            {/* Ação: Botão ou Vídeo Embedado */}
            {actionLink && (
              <div className="w-full">
                {(() => {
                  if (!isYouTubeUrl(actionLink)) return null;
                  const id = getYouTubeVideoId(actionLink);
                  if (!id) {
                    return (
                      <Button
                        variant="solid"
                        action="primary"
                        size="large"
                        className="w-full"
                        onClick={handleActionClick}
                      >
                        {actionLabel || 'Iniciar Atividade'}
                      </Button>
                    );
                  }
                  return (
                    <iframe
                      src={getYouTubeEmbedUrl(id)}
                      className="w-full aspect-video rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="Vídeo YouTube"
                    />
                  );
                })()}
                {!isYouTubeUrl(actionLink) && (
                  <Button
                    variant="solid"
                    action="primary"
                    size="large"
                    className="w-full"
                    onClick={handleActionClick}
                  >
                    {actionLabel || 'Iniciar Atividade'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </dialog>
      </div>
    );
  }

  // Default variant rendering
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs border-none p-0 m-0 w-full cursor-default">
      <dialog
        className={modalClasses}
        aria-labelledby="modal-title"
        aria-modal="true"
        open
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <h2 id="modal-title" className="text-lg font-semibold text-text-950">
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-text-500 hover:text-text-700 hover:bg-background-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indicator-info focus:ring-offset-2"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        {children && (
          <div className="px-6 pb-6">
            <div className="text-text-500 font-normal text-sm leading-6">
              {children}
            </div>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 pb-6">{footer}</div>
        )}
      </dialog>
    </div>
  );
};

export default Modal;
