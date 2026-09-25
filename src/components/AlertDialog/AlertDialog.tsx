import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useId,
  useRef,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import Button from '../Button/Button';
import { useModalFocus } from '../../hooks/useModalFocus';
import { cn } from '../../utils/utils';

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
  /** Action type for the submit button (controls color/style). Defaults to 'negative' (destructive) */
  submitAction?: 'primary' | 'secondary' | 'positive' | 'negative';
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
      submitAction = 'negative',
      ...props
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    /**
     * Ids por instância. Fixos, dois diálogos abertos ao mesmo tempo — ou um
     * diálogo convivendo com qualquer outro elemento da página que use o mesmo
     * id — fariam o `aria-labelledby` apontar para o nó errado, e o leitor de
     * tela anunciaria o título do outro.
     */
    const titleId = useId();
    const descriptionId = useId();

    /**
     * Leva o foco pro diálogo ao abrir, prende o Tab lá dentro e devolve o foco
     * a quem o abriu ao fechar. Sem isto o foco ficava no botão que está ATRÁS
     * do backdrop: o leitor de tela seguia lendo a página de trás, sem nunca
     * anunciar que um diálogo abriu, e o Tab passeava pelo conteúdo bloqueado.
     *
     * É o mesmo hook que o `Modal` usa — o `AlertDialog` é que tinha ficado de
     * fora quando o foco foi resolvido lá.
     */
    useModalFocus(isOpen, dialogRef);

    /**
     * O nó é preciso aqui (para o foco) e também no `ref` do consumidor, que
     * segue sendo encaminhado como antes.
     */
    const setDialogRef = (node: HTMLDivElement | null) => {
      dialogRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as { current: HTMLDivElement | null }).current = node;
      }
    };

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
              ref={setDialogRef}
              // `tabIndex={-1}` é requisito do `useModalFocus`: o foco inicial
              // vai pro próprio diálogo, e não pro primeiro botão — assim o
              // leitor anuncia título e descrição antes das ações, em vez de
              // abrir já falando "Cancelar".
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              className={cn(
                'bg-background border border-border-100 rounded-lg shadow-lg p-6 m-3',
                sizeClasses,
                className
              )}
              {...props}
            >
              <h2
                id={titleId}
                className="pb-3 text-xl font-semibold text-text-950"
              >
                {title}
              </h2>
              <p id={descriptionId} className="text-text-700 text-sm">
                {description}
              </p>

              <div className="flex flex-row items-center justify-end pt-4 gap-3">
                <Button variant="outline" size="small" onClick={handleCancel}>
                  {cancelButtonLabel}
                </Button>

                <Button
                  variant="solid"
                  size="small"
                  action={submitAction}
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
