import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import Button from '../Button/Button';

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  'extra-small': 'w-screen max-w-[324px]',
  small: 'w-screen max-w-[378px]',
  medium: 'w-screen max-w-[459px]',
  large: 'w-screen max-w-[578px]',
  'extra-large': 'w-screen max-w-[912px]',
} as const;

interface AlertDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Title of the alert dialog */
  title: string;
  /** Whether the alert dialog is open (controlled mode) */
  isOpen: boolean;
  /** Function called when the alert dialog is opened or closed (controlled mode) */
  onChangeOpen: (open: boolean) => void;
  /** Whether clicking the backdrop should close the alert dialog */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape should close the alert dialog */
  closeOnEscape?: boolean;
  /** Additional CSS classes for the alert dialog content */
  className?: string;
  /** Function called when submit button is clicked */
  onSubmit?: (value?: unknown) => void;
  /** Value to pass to onSubmit function */
  submitValue?: unknown;
  /** Function called when cancel button is clicked */
  onCancel?: (value?: unknown) => void;
  /** Value to pass to onCancel function */
  cancelValue?: unknown;
  /** Description of the alert dialog */
  description: string;
  /** Label of the cancel button */
  cancelButtonLabel?: string;
  /** Label of the submit button */
  submitButtonLabel?: string;
  /** Size of the alert dialog */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
}

const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      description,
      cancelButtonLabel = 'Cancelar',
      submitButtonLabel = 'Deletar',
      title,
      isOpen,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      className = '',
      onSubmit,
      onChangeOpen,
      submitValue,
      onCancel,
      cancelValue,
      size = 'medium',
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (event: globalThis.KeyboardEvent) => {
        if (event.key === 'Escape') {
          onChangeOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnBackdropClick) {
        onChangeOpen(false);
      }
    };

    const handleBackdropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onChangeOpen(false);
      }
    };

    const handleSubmit = () => {
      onChangeOpen(false);
      onSubmit?.(submitValue);
    };

    const handleCancel = () => {
      onChangeOpen(false);
      onCancel?.(cancelValue);
    };

    const sizeClasses = SIZE_CLASSES[size];

    return (
      <>
        {/* Alert Dialog Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            onKeyDown={handleBackdropKeyDown}
            data-testid="alert-dialog-overlay"
          >
            {/* Alert Dialog Content */}
            <div
              ref={ref}
              className={`bg-background border border-border-100 rounded-lg shadow-lg p-6 m-3 ${sizeClasses} ${className}`}
              {...props}
            >
              <h2
                id="alert-dialog-title"
                className="pb-3 text-xl font-semibold"
              >
                {title}
              </h2>
              <p
                id="alert-dialog-description"
                className="text-text-700 text-sm"
              >
                {description}
              </p>

              <div className="flex flex-row items-center justify-end pt-4 gap-3">
                <Button variant="outline" size="small" onClick={handleCancel}>
                  {cancelButtonLabel}
                </Button>

                <Button
                  variant="solid"
                  size="small"
                  action="negative"
                  onClick={handleSubmit}
                >
                  {submitButtonLabel}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

AlertDialog.displayName = 'AlertDialog';

export { AlertDialog };
