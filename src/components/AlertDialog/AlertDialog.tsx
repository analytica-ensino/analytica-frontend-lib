import { forwardRef, HTMLAttributes, useEffect, useId, useRef } from 'react';
import Button from '../Button/Button';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
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

interface AlertDialogProps extends HTMLAttributes<HTMLDialogElement> {
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

const AlertDialog = forwardRef<HTMLDialogElement, AlertDialogProps>(
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    /** Quem recebe o foco na abertura — ver `useModalFocus` abaixo. */
    const titleRef = useRef<HTMLHeadingElement>(null);

    /**
     * Ids por instância. Fixos, dois diálogos abertos ao mesmo tempo — ou um
     * diálogo convivendo com qualquer outro elemento da página que use o mesmo
     * id — fariam o `aria-labelledby` apontar para o nó errado, e o leitor de
     * tela anunciaria o título do outro.
     */
    const titleId = useId();
    const descriptionId = useId();

    /**
     * Leva o foco pro TÍTULO ao abrir, prende o Tab dentro do diálogo e devolve
     * o foco a quem o abriu ao fechar. Sem isto o foco ficava no botão que está
     * ATRÁS do backdrop: o leitor de tela seguia lendo a página de trás, sem
     * nunca anunciar que um diálogo abriu, e o Tab passeava pelo conteúdo
     * bloqueado.
     *
     * O foco no título (e não no diálogo) é o que faz o VoiceOver começar a
     * leitura pelo nome do diálogo e seguir dali pra descrição e as ações, em
     * vez de pousar antes do primeiro nó e ler fora de ordem.
     *
     * É o mesmo hook que o `Modal` usa — o `AlertDialog` é que tinha ficado de
     * fora quando o foco foi resolvido lá.
     */
    useModalFocus(isOpen, dialogRef, titleRef);

    /**
     * O nó é preciso aqui (para o foco) e também no `ref` do consumidor, que
     * segue sendo encaminhado como antes.
     */
    const setDialogRef = (node: HTMLDialogElement | null) => {
      dialogRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as { current: HTMLDialogElement | null }).current = node;
      }
    };

    // Same Escape handling as `Modal`: a single document listener that leaves
    // alone an Escape already handled (`preventDefault`) by a popup inside.
    useEscapeToClose(isOpen && closeOnEscape, () => onChangeOpen(false));

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

    const handleBackdropClick = () => {
      onChangeOpen(false);
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
            data-testid="alert-dialog-overlay"
          >
            {/* Click-outside-to-close is a native button behind the dialog
                instead of a click handler on this <div>: it is interactive by
                nature (mouse, touch and keyboard) and stays out of the Tab
                cycle, since Escape (`useEscapeToClose`) already covers the
                keyboard. */}
            {closeOnBackdropClick && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Fechar diálogo"
                className="absolute inset-0 w-full h-full cursor-default"
                onClick={handleBackdropClick}
                data-testid="alert-dialog-backdrop"
              />
            )}
            {/* Alert Dialog Content */}
            <dialog
              ref={setDialogRef}
              // `<dialog>` em vez de `role="dialog"`: o papel vem do elemento,
              // que é o que garante o tratamento correto em qualquer
              // navegador/leitor. Mesmo padrão do `Modal`.
              //
              // `open` (e não `showModal()`) porque o backdrop é nosso; em
              // troca, o navegador não gerencia foco — quem faz isso é o
              // `useModalFocus` acima. O `tabIndex={-1}` daqui é o destino de
              // reserva do foco inicial, para quando o título ainda não montou;
              // no caminho normal ele vai pro <h2> abaixo.
              open
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              className={cn(
                // `relative` anula o `position: absolute` que o navegador aplica
                // a `<dialog>` (sem isso ele escapa da centralização do
                // backdrop) e o põe acima do botão de fechar do backdrop. As
                // demais regras do UA (padding, borda, fundo) já são
                // sobrescritas pelas classes abaixo.
                'relative bg-background border border-border-100 rounded-lg shadow-lg p-6 m-3',
                sizeClasses,
                className
              )}
              {...props}
            >
              <h2
                id={titleId}
                ref={titleRef}
                // Alvo do foco inicial (`useModalFocus`), e não um controle:
                // recebe foco por código, fica fora do ciclo de Tab (o seletor
                // do hook descarta `tabindex="-1"`) e não mostra anel.
                tabIndex={-1}
                className="pb-3 text-xl font-semibold text-text-950 focus:outline-none"
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
            </dialog>
          </div>
        )}
      </>
    );
  }
);

AlertDialog.displayName = 'AlertDialog';

export { AlertDialog };
