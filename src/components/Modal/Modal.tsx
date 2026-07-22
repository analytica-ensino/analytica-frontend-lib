import { ReactNode, useCallback, useEffect, useId, useState } from 'react';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { MicrophoneIcon } from '@phosphor-icons/react/dist/csr/Microphone';
import { cn } from '../../utils/utils';
import Button, { ButtonPapole } from '../Button/Button';
import papoleBird from '../../assets/img/papole.png';
import { useMicrophonePermission } from '../../hooks/useMicrophonePermission';
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
  contentClassName?: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /**
   * Modal title. Aceita string OU ReactNode pra permitir elementos inline
   * (ex: botão de voltar + label). Como é renderizado dentro de <h2>,
   * quando ReactNode use APENAS phrasing content (`<span>`, `<button>`,
   * ícones) — nunca `<div>` ou `<p>`.
   */
  title: ReactNode;
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
  /** Alt text for activity image (leave empty for decorative images) */
  imageAlt?: string;
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
  imageAlt,
  actionLink,
  actionLabel,
  contentClassName = '',
}: ModalProps) => {
  const titleId = useId();

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

  // Handle body scroll lock and scrollbar shift fix
  useEffect(() => {
    if (!isOpen) return;

    // Calculate scrollbar width before hiding overflow
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Apply scroll lock
    document.body.style.overflow = 'hidden';

    // Fix scrollbar shift: add padding to compensate for lost scrollbar
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Create overlay to cover the padding area with backdrop color
      const overlay = document.createElement('div');
      overlay.id = 'modal-scrollbar-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: ${scrollbarWidth}px;
        height: 100vh;
        background-color: rgb(0 0 0 / 0.6);
        z-index: 40;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
    }

    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      // Remove overlay
      const overlay = document.getElementById('modal-scrollbar-overlay');
      if (overlay) {
        overlay.remove();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = SIZE_CLASSES[size];
  const baseClasses =
    'bg-secondary-50 rounded-3xl shadow-hard-shadow-2 border border-border-100 w-full mx-4 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden';
  // Reset dialog default styles to prevent positioning issues
  const dialogResetClasses = 'p-0 m-0 border-none outline-none static';
  const modalClasses = cn(
    baseClasses,
    sizeClasses,
    dialogResetClasses,
    className
  );

  // Normalize URLs missing protocol
  const normalizeUrl = (href: string) =>
    /^https?:\/\//i.test(href) ? href : `https://${href}`;

  // Handle action link click
  const handleActionClick = () => {
    if (actionLink) {
      window.open(normalizeUrl(actionLink), '_blank', 'noopener,noreferrer');
    }
  };

  // Activity variant rendering
  if (variant === 'activity') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs border-none p-0 m-0 w-full cursor-default">
        <dialog
          className={modalClasses}
          aria-labelledby={titleId}
          aria-modal="true"
          open
        >
          {/* Header simples com XIcon */}
          <div className="flex justify-end p-6 pb-0">
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-text-500 hover:text-text-700 hover:bg-background-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indicator-info focus:ring-offset-2"
                aria-label="Fechar modal"
              >
                <XIcon size={18} />
              </button>
            )}
          </div>

          {/* Conteúdo centralizado */}
          <div className="flex flex-col items-center px-6 pb-6 gap-5 flex-1 min-h-0 overflow-y-auto">
            {/* Imagem ilustrativa */}
            {image && (
              <div className="flex justify-center">
                <img
                  src={image}
                  alt={imageAlt ?? ''}
                  className="w-[122px] h-[122px] object-contain"
                />
              </div>
            )}

            {/* Título */}
            <h2
              id={titleId}
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
                  const normalized = normalizeUrl(actionLink);
                  const isYT = isYouTubeUrl(normalized);
                  if (!isYT) return null;
                  const id = getYouTubeVideoId(normalized);
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
                {!isYouTubeUrl(normalizeUrl(actionLink)) && (
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
        aria-labelledby={titleId}
        aria-modal="true"
        open
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <h2 id={titleId} className="text-lg font-semibold text-text-950">
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-text-500 hover:text-text-700 hover:bg-background-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indicator-info focus:ring-offset-2"
              aria-label="Fechar modal"
            >
              <XIcon size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        {children && (
          <div
            className={cn(
              'px-6 pb-6 flex-1 min-h-0 overflow-y-auto',
              contentClassName
            )}
          >
            <div
              className={cn(
                'text-text-500 font-normal text-sm leading-6',
                contentClassName?.includes('flex') &&
                  'flex flex-col flex-1 min-h-0'
              )}
            >
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

// ======================================================================
// MicPermissionModalPapole — modal Papolê de permissão de microfone
// ======================================================================

type MicPermissionModalPapoleProps = {
  /**
   * Controla a abertura (modo controlado). **Se omitido**, o modal entra em modo
   * gerenciado: usa `useMicrophonePermission` e se abre sozinho quando o
   * microfone ainda não foi concedido.
   */
  isOpen?: boolean;
  /** Fecha o modal (X e Esc). No modo gerenciado, apenas dispensa na sessão. */
  onClose?: () => void;
  /**
   * Chamado após o botão "Habilitar permissões" (o prompt do navegador já é
   * disparado internamente). Recebe se a permissão foi concedida.
   */
  onEnable?: (granted: boolean) => void;
  /** Ação do link "Configurar depois". */
  onConfigureLater?: () => void;
  /** Ação da barra "Saiba mais sobre como cuidamos dos dados". */
  onLearnMore?: () => void;
  /** Fecha ao pressionar Esc (default: true). */
  closeOnEscape?: boolean;
  /** Título (default: "Por que pedimos acesso ao microfone"). */
  title?: string;
  /** Texto explicativo (default: o texto da arte). */
  description?: ReactNode;
};

/**
 * Modal Papolê que pede permissão de uso do microfone.
 *
 * Header verde (`secondary-500`) com o passarinho + ícone de microfone e o botão
 * de fechar (`ButtonPapole variant="icon"`); corpo branco com título, texto e as
 * ações (`ButtonPapole` solid "Habilitar permissões" + link "Configurar depois");
 * barra inferior verde-clara com o link "Saiba mais...".
 *
 * Modo **gerenciado** (sem `isOpen`): usa `useMicrophonePermission` — abre
 * sozinho quando o microfone não foi concedido, "Habilitar permissões" dispara o
 * prompt do navegador e "Configurar depois" apenas dispensa na sessão (como não
 * persiste, ao recarregar a página volta a pedir). Passando `isOpen`, vira
 * controlado (o `onEnable` ainda dispara o prompt do navegador).
 *
 * Observação: os tokens de cor/spacing são uma leitura da arte — ajustar na story.
 */
const MicPermissionModalPapole = ({
  isOpen,
  onClose,
  onEnable,
  onConfigureLater,
  onLearnMore,
  closeOnEscape = true,
  title = 'Por que pedimos acesso ao microfone',
  description,
}: MicPermissionModalPapoleProps) => {
  const titleId = useId();
  const { shouldAsk, requestPermission } = useMicrophonePermission();
  const [dismissed, setDismissed] = useState(false);

  const isControlled = isOpen !== undefined;
  // Gerenciado: abre quando falta permissão e não foi dispensado nesta sessão.
  const open = isControlled ? isOpen : shouldAsk && !dismissed;

  const handleClose = useCallback(() => {
    if (isControlled) onClose?.();
    else setDismissed(true);
  }, [isControlled, onClose]);

  const handleEnable = async () => {
    // Dispara o prompt nativo do navegador. No modo gerenciado, se conceder, o
    // `shouldAsk` vira false e o modal fecha sozinho.
    const granted = await requestPermission();
    onEnable?.(granted);
  };

  const handleConfigureLater = () => {
    if (!isControlled) setDismissed(true);
    onConfigureLater?.();
  };

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, handleClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <dialog
        open
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-quicksand static m-0 w-full max-w-[420px] overflow-hidden rounded-3xl border-none p-0 shadow-hard-shadow-2"
      >
        {/* Header verde */}
        <div className="relative flex items-center justify-center gap-3 bg-secondary-500 px-6 pt-8 pb-10">
          <span className="absolute right-4 top-4">
            <ButtonPapole
              variant="icon"
              aria-label="Fechar"
              onClick={handleClose}
            >
              <XIcon weight="bold" />
            </ButtonPapole>
          </span>

          <img
            src={papoleBird}
            alt="Papolê"
            className="h-14 w-auto select-none"
            draggable={false}
          />

          <span className="flex size-14 items-center justify-center rounded-full bg-background">
            <MicrophoneIcon
              size={28}
              weight="fill"
              className="text-secondary-500"
            />
          </span>
        </div>

        {/* Corpo (padding 24) */}
        <div className="flex flex-col items-center gap-4 bg-background p-6 text-center">
          <h2 id={titleId} className="text-[18px] font-bold text-secondary-900">
            {title}
          </h2>

          <div className="flex flex-col gap-3 text-[14px] font-medium text-text-600">
            {description ?? (
              <>
                <p>
                  Usamos o microfone para gravar a leitura da criança e avaliar
                  sua fluência leitora ao longo do tempo.
                </p>
                <p>
                  As gravações ficam armazenadas com segurança e são usadas
                  apenas para esse fim.
                </p>
              </>
            )}
          </div>

          <ButtonPapole
            variant="solid"
            size="medium"
            className="mt-2"
            onClick={handleEnable}
          >
            Habilitar permissões
          </ButtonPapole>

          <ButtonPapole
            variant="link"
            size="medium"
            onClick={handleConfigureLater}
          >
            Configurar depois
          </ButtonPapole>

          {/* Barra "Saiba mais": botão arredondado, inset pelo padding do corpo */}
          <button
            type="button"
            onClick={onLearnMore}
            className="w-full cursor-pointer rounded-xl bg-secondary-100 px-4 py-4 text-center"
          >
            <span className="text-[14px] font-medium text-secondary-700 underline">
              Saiba mais sobre como cuidamos dos dados
            </span>
          </button>
        </div>
      </dialog>
    </div>
  );
};
MicPermissionModalPapole.displayName = 'MicPermissionModalPapole';

export { MicPermissionModalPapole };
export type { MicPermissionModalPapoleProps };
