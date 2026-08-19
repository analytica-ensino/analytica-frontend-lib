import {
  ReactNode,
  MouseEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import {
  MicIconReadingFluency,
  MicOffIconReadingFluency,
  PlayIconReadingFluency,
  PauseIconReadingFluency,
} from '../ReadingFluencyIcons';
import { cn } from '../../utils/utils';
import Button, { ButtonReadingFluency } from '../Button/Button';
import { CloseButtonReadingFluency } from '../CloseButtonReadingFluency/CloseButtonReadingFluency';
import readingFluencyBird from '../../assets/img/readingFluencyBird.png';
import { readingFluencyFallback } from '../../assets/fallbacks/readingFluencyFallback';
import { useMicrophonePermission } from '../../hooks/useMicrophonePermission';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
} from './utils/videoUtils';
import Text from '../Text/Text';

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

  useEscapeToClose(isOpen && closeOnEscape, onClose);
  useBodyScrollLock(isOpen);

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
            <Text
              id={titleId}
              size="lg"
              className="font-semibold text-text-950 text-center"
            >
              {title}
            </Text>

            {/* Descrição */}
            {description && (
              <Text
                size="sm"
                className="text-text-400 text-center max-w-md leading-[21px]"
              >
                {description}
              </Text>
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
// MicPermissionModalReadingFluency — modal Reading Fluency de permissão de microfone
// ======================================================================

type MicPermissionModalReadingFluencyProps = {
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
  /**
   * Fonte da imagem do passarinho. Default: o PNG Reading Fluency empacotado na lib.
   * Passe uma URL pelo cliente caso o asset da lib não seja resolvido no bundle.
   */
  imageSrc?: string;
};

/**
 * Modal Reading Fluency que pede permissão de uso do microfone.
 *
 * Header verde (`secondary-500`) com o passarinho + ícone de microfone e o botão
 * de fechar (`ButtonReadingFluency variant="icon"`); corpo branco com título, texto e as
 * ações (`ButtonReadingFluency` solid "Habilitar permissões" + link "Configurar depois");
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
const MicPermissionModalReadingFluency = ({
  isOpen,
  onClose,
  onEnable,
  onConfigureLater,
  onLearnMore,
  closeOnEscape = true,
  title = 'Por que pedimos acesso ao microfone',
  description,
  imageSrc = readingFluencyBird,
}: MicPermissionModalReadingFluencyProps) => {
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

  useEscapeToClose(open && closeOnEscape, handleClose);
  useBodyScrollLock(open);

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
            <CloseButtonReadingFluency onClick={handleClose} />
          </span>

          <img
            src={imageSrc}
            alt="Reading Fluency"
            className="h-14 w-auto select-none"
            draggable={false}
          />

          <span className="flex size-14 items-center justify-center rounded-full bg-background">
            <MicIconReadingFluency size={28} />
          </span>
        </div>

        {/* Corpo (padding 24) */}
        <div className="flex flex-col items-center gap-4 bg-background p-6 text-center">
          <Text size="lg" id={titleId} className="font-bold text-secondary-900">
            {title}
          </Text>

          <div className="flex flex-col gap-3 text-[14px] font-medium text-text-600">
            {description ?? (
              <>
                <Text size="sm">
                  Usamos o microfone para gravar a leitura da criança e avaliar
                  sua fluência leitora ao longo do tempo.
                </Text>
                <Text size="sm">
                  As gravações ficam armazenadas com segurança e são usadas
                  apenas para esse fim.
                </Text>
              </>
            )}
          </div>

          <ButtonReadingFluency
            variant="solid"
            size="medium"
            className="mt-2"
            onClick={handleEnable}
          >
            Habilitar permissões
          </ButtonReadingFluency>

          <ButtonReadingFluency
            variant="link"
            size="medium"
            onClick={handleConfigureLater}
          >
            Configurar depois
          </ButtonReadingFluency>

          {/* Barra "Saiba mais": botão arredondado, inset pelo padding do corpo */}
          <Button
            type="button"
            onClick={onLearnMore}
            variant="raw"
            className="w-full cursor-pointer rounded-xl bg-secondary-100 px-4 py-4 text-center"
          >
            <span className="text-[14px] font-medium text-secondary-700 underline">
              Saiba mais sobre como cuidamos dos dados
            </span>
          </Button>
        </div>
      </dialog>
    </div>
  );
};
MicPermissionModalReadingFluency.displayName =
  'MicPermissionModalReadingFluency';

export { MicPermissionModalReadingFluency };
export type { MicPermissionModalReadingFluencyProps };

// ======================================================================
// MicOffModalReadingFluency — modal Reading Fluency de "microfone parece desligado"
// ======================================================================

type MicOffModalReadingFluencyProps = {
  /** Se o modal está aberto. */
  isOpen: boolean;
  /** Fecha o modal (X e Esc). */
  onClose: () => void;
  /** Ação do botão "Tentar ler de novo". */
  onRetry?: () => void;
  /** Ação do link "Pedir ajuda a um adulto". */
  onAskAdult?: () => void;
  /** Fecha ao pressionar Esc (default: true). */
  closeOnEscape?: boolean;
  /** Título (default: "Parece que o microfone está desligado"). */
  title?: string;
};

/**
 * Modal Reading Fluency exibido quando o microfone parece desligado/mudo durante a
 * leitura. Header verde com o ícone de microfone cortado + botão de fechar;
 * corpo branco com o título (uppercase) e as ações "Tentar ler de novo"
 * (`ButtonReadingFluency` solid) e "Pedir ajuda a um adulto" (`ButtonReadingFluency` link).
 *
 * É um modal controlado (o app decide quando abrir — ex.: ao detectar que não
 * há áudio durante a gravação).
 *
 * Observação: os tokens de cor/spacing são uma leitura da arte — ajustar na story.
 */
const MicOffModalReadingFluency = ({
  isOpen,
  onClose,
  onRetry,
  onAskAdult,
  closeOnEscape = true,
  title = 'Parece que o microfone está desligado',
}: MicOffModalReadingFluencyProps) => {
  const titleId = useId();

  useEscapeToClose(isOpen && closeOnEscape, onClose);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <dialog
        open
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-quicksand static m-0 w-full max-w-[420px] overflow-hidden rounded-3xl border-none p-0 shadow-hard-shadow-2"
      >
        {/* Header verde */}
        <div className="relative flex items-center justify-center bg-secondary-500 px-6 pt-10 pb-10">
          <span className="absolute right-4 top-4">
            <CloseButtonReadingFluency onClick={onClose} />
          </span>

          <span className="flex size-20 items-center justify-center rounded-full bg-background shadow-hard-shadow-2">
            <MicOffIconReadingFluency size={40} />
          </span>
        </div>

        {/* Corpo (padding 24) */}
        <div className="flex flex-col items-center gap-4 bg-background p-6 text-center">
          <Text
            id={titleId}
            size="lg"
            className="font-bold uppercase text-secondary-900"
          >
            {title}
          </Text>

          <ButtonReadingFluency
            variant="solid"
            size="medium"
            className="mt-2"
            onClick={onRetry}
          >
            Tentar ler de novo
          </ButtonReadingFluency>

          <ButtonReadingFluency
            variant="link"
            size="medium"
            onClick={onAskAdult}
          >
            Pedir ajuda a um adulto
          </ButtonReadingFluency>
        </div>
      </dialog>
    </div>
  );
};
MicOffModalReadingFluency.displayName = 'MicOffModalReadingFluency';

export { MicOffModalReadingFluency };
export type { MicOffModalReadingFluencyProps };

// ======================================================================
// AudioPlaybackModalReadingFluency — modal Reading Fluency para ouvir a gravação
// ======================================================================

type AudioPlaybackModalReadingFluencyProps = {
  /** Se o modal está aberto. */
  isOpen: boolean;
  /** Fecha o modal (X e Esc). */
  onClose: () => void;
  /**
   * A gravação a tocar: uma **URL** (string, ex.: blob URL) **ou** um
   * **arquivo/blob** (`File`/`Blob` — ex.: o blob do `AudioRecorderReadingFluency`).
   * Quando é `File`/`Blob`, vira um object URL same-origin internamente
   * (criado/revogado pelo componente).
   */
  src?: string | File | Blob;
  /** Ação do botão "Pronto!". */
  onConfirm?: () => void;
  /** Ação do link "Quero ler de novo". */
  onRetry?: () => void;
  /** Fecha ao pressionar Esc (default: true). */
  closeOnEscape?: boolean;
};

// Alturas (px) das barras da waveform — decorativa (não reflete o áudio real).
const PAPOLE_WAVEFORM_BARS = [
  12, 20, 32, 16, 40, 24, 52, 28, 44, 60, 44, 28, 52, 24, 40, 16, 32, 20, 12,
];

const formatPlaybackTime = (seconds: number): string => {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Modal Reading Fluency para o aluno ouvir a própria gravação. Header verde com uma
 * waveform decorativa e um player simples (play/pause + barra de progresso +
 * tempo) + botão de fechar; corpo branco com "Pronto!" (`ButtonReadingFluency` solid) e
 * "Quero ler de novo" (`ButtonReadingFluency` link).
 *
 * A gravação entra por `src`, que aceita **URL** (string) **ou** **File/Blob**
 * (ex.: o blob do `AudioRecorderReadingFluency`, convertido em object URL internamente).
 *
 * Controlado: o app decide quando abrir (ex.: após finalizar a gravação).
 *
 * Observação: waveform é decorativa (não analisa o áudio) e os tokens de
 * cor/spacing são uma leitura da arte — ajustar na story.
 */
const AudioPlaybackModalReadingFluency = ({
  isOpen,
  onClose,
  src,
  onConfirm,
  onRetry,
  closeOnEscape = true,
}: AudioPlaybackModalReadingFluencyProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

  // String → usa direto; File/Blob → usa o object URL criado no efeito abaixo.
  const resolvedSrc = typeof src === 'string' ? src : objectUrl;

  useEscapeToClose(isOpen && closeOnEscape, onClose);
  useBodyScrollLock(isOpen);

  // `src` File/Blob → object URL same-origin (criado/revogado aqui).
  useEffect(() => {
    if (!src || typeof src === 'string') {
      setObjectUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(src);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [src]);

  useEffect(() => {
    // Reseta o player ao fechar (o <audio> desmonta com o modal).
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Só marca como tocando depois que o play() resolve. Se rejeitar
      // (AbortError ao pausar antes de iniciar, fonte inválida, etc.) mantém
      // false pra UI nunca indicar reprodução ativa numa falha.
      audio
        .play()
        ?.then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (event: MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
    setCurrentTime(audio.currentTime);
  };

  if (!isOpen) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <dialog
        open
        aria-label="Ouvir gravação"
        aria-modal="true"
        className="font-quicksand static m-0 w-full max-w-[420px] overflow-hidden rounded-3xl border-none p-0 shadow-hard-shadow-2"
      >
        {/* Header verde: waveform + player */}
        <div className="relative flex flex-col gap-5 bg-secondary-500 px-6 pt-8 pb-6">
          <span className="absolute right-4 top-4">
            <CloseButtonReadingFluency onClick={onClose} />
          </span>

          {/* Waveform (decorativa) */}
          <div
            className="flex h-16 items-center justify-center gap-1"
            aria-hidden="true"
          >
            {PAPOLE_WAVEFORM_BARS.map((height, index) => (
              <span
                key={index}
                style={{ height }}
                className="w-1 rounded-full bg-error-400"
              />
            ))}
          </div>

          {/* Player */}
          <div className="flex items-center gap-3">
            <audio
              ref={audioRef}
              src={resolvedSrc}
              preload="metadata"
              onTimeUpdate={() =>
                setCurrentTime(audioRef.current?.currentTime ?? 0)
              }
              onLoadedMetadata={() =>
                setDuration(audioRef.current?.duration ?? 0)
              }
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
            >
              <track kind="captions" />
            </audio>

            <Button
              type="button"
              onClick={togglePlay}
              disabled={!resolvedSrc}
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              variant="raw"
              className="flex flex-shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying ? (
                <PauseIconReadingFluency size={36} />
              ) : (
                <PlayIconReadingFluency size={36} />
              )}
            </Button>

            <Button
              type="button"
              onClick={handleSeek}
              aria-label="Barra de progresso"
              variant="raw"
              className="h-2 flex-1 overflow-hidden rounded-full bg-background"
            >
              <span
                className="block h-full rounded-full bg-primary-500 transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </Button>

            <span className="flex-shrink-0 text-sm font-medium text-primary">
              {formatPlaybackTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Corpo (padding 24) */}
        <div className="flex flex-col items-center gap-4 bg-background p-6 text-center">
          <ButtonReadingFluency
            variant="solid"
            size="medium"
            className="w-full"
            onClick={onConfirm}
          >
            Pronto!
          </ButtonReadingFluency>

          <ButtonReadingFluency variant="link" size="medium" onClick={onRetry}>
            Quero ler de novo
          </ButtonReadingFluency>
        </div>
      </dialog>
    </div>
  );
};
AudioPlaybackModalReadingFluency.displayName =
  'AudioPlaybackModalReadingFluency';

export { AudioPlaybackModalReadingFluency };
export type { AudioPlaybackModalReadingFluencyProps };

// ======================================================================
// SuccessModalReadingFluency — modal Reading Fluency de feedback positivo
// ======================================================================

type SuccessModalReadingFluencyProps = {
  /** Se o modal está aberto. */
  isOpen: boolean;
  /** Fecha o modal (X e Esc). */
  onClose: () => void;
  /** Título (ex.: "Incrível!"). */
  title?: string;
  /** Frase de reforço (ex.: "Você leu muito bem!"). */
  description?: string;
  /** Fecha ao pressionar Esc (default: true). */
  closeOnEscape?: boolean;
  /**
   * Fonte da imagem de comemoração. Default: a imagem de fallback genérica
   * empacotada na lib. Passe uma URL pelo cliente (ex.: a imagem configurada pela
   * instituição via `useReadingFluencyAsset`) para sobrescrever.
   */
  imageSrc?: string;
};

/**
 * Modal Reading Fluency de comemoração/feedback positivo: card branco com o passarinho,
 * um título grande e uma frase de reforço, e o botão de fechar. Sem header verde
 * e sem ações — o aluno fecha no X (ou Esc). Título/descrição são configuráveis
 * pra reaproveitar em outros feedbacks.
 */
const SuccessModalReadingFluency = ({
  isOpen,
  onClose,
  title = 'Incrível!',
  description = 'Você leu muito bem!',
  closeOnEscape = true,
  imageSrc = readingFluencyFallback,
}: SuccessModalReadingFluencyProps) => {
  const titleId = useId();

  useEscapeToClose(isOpen && closeOnEscape, onClose);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <dialog
        open
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-quicksand static m-0 w-full max-w-[380px] overflow-hidden rounded-3xl border-none bg-background p-0 shadow-hard-shadow-2"
      >
        <div className="relative flex flex-col items-center gap-4 p-8 text-center">
          <span className="absolute right-4 top-4">
            <CloseButtonReadingFluency onClick={onClose} />
          </span>

          <img
            src={imageSrc}
            alt="Reading Fluency"
            className="h-[172px] w-[252px] select-none object-contain"
            draggable={false}
          />

          <div className="flex flex-col items-center gap-1">
            <Text
              id={titleId}
              size="3xl"
              className="font-bold uppercase text-secondary-900"
            >
              {title}
            </Text>
            <Text
              size="sm"
              className="font-semibold uppercase tracking-wide text-text-500"
            >
              {description}
            </Text>
          </div>
        </div>
      </dialog>
    </div>
  );
};
SuccessModalReadingFluency.displayName = 'SuccessModalReadingFluency';

export { SuccessModalReadingFluency };
export type { SuccessModalReadingFluencyProps };
