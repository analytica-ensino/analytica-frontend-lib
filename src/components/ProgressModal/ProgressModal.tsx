import { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import ProgressBar from '../ProgressBar/ProgressBar';
import Text from '../Text/Text';

export interface ProgressModalProps {
  /** Controla se o modal está aberto */
  isOpen: boolean;
  /** Callback ao fechar */
  onClose: () => void;
  /**
   * Mensagem principal exibida abaixo da imagem. Também é usada como
   * accessible name do dialog (renderizada visualmente escondida no `<h2>`
   * do Modal pra leitores de tela).
   */
  message: ReactNode;
  /** URL ou import de imagem ilustrativa (opcional) */
  image?: string;
  /** Alt text da imagem — se não informado usa a `message` quando for string */
  imageAlt?: string;
  /**
   * Accessible name quando `message` é ReactNode. Se omitido, cai em
   * "Carregando". Ignorado quando `message` é string.
   */
  accessibleName?: string;
  /**
   * Valor 0-100. Se omitido, mostra indicador indeterminado (pulse sem %).
   * Use quando o backend não reportar progresso real.
   */
  progress?: number;
  /** Tamanho do Modal. Default: 'sm' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal de progresso com imagem ilustrativa + mensagem + ProgressBar.
 *
 * Pensado para operações assíncronas longas (upload, OCR, correção por IA, etc).
 * Quando `progress` é omitido, a barra é renderizada em modo indeterminado
 * (`animate-pulse` sem percentual visível).
 *
 * Layout: X no topo direito, imagem centralizada, mensagem abaixo da imagem,
 * progress bar ao final. A mensagem também é injetada como título invisível
 * (`sr-only`) no `<h2>` do Modal pra acessibilidade.
 *
 * @example
 * ```tsx
 * <ProgressModal
 *   isOpen={isLoading}
 *   onClose={() => setIsLoading(false)}
 *   image={myImage}
 *   message="Analisando sua redação..."
 *   // progress opcional — sem valor, usa indicador indeterminado
 * />
 * ```
 */
const ProgressModal = ({
  isOpen,
  onClose,
  message,
  image,
  imageAlt,
  accessibleName,
  progress,
  size = 'sm',
}: ProgressModalProps) => {
  const isIndeterminate = progress === undefined;
  const resolvedAccessibleName =
    typeof message === 'string' ? message : (accessibleName ?? 'Carregando');
  const resolvedAlt = imageAlt ?? resolvedAccessibleName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="sr-only">{resolvedAccessibleName}</span>}
      size={size}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {image && (
          <img
            src={image}
            alt={resolvedAlt}
            className="w-60 h-60 object-contain"
          />
        )}

        <Text size="md" className="text-text-950 text-center">
          {message}
        </Text>

        <div className={isIndeterminate ? 'w-full animate-pulse' : 'w-full'}>
          <ProgressBar
            value={progress ?? 60}
            size="medium"
            variant="blue"
            showPercentage={!isIndeterminate}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProgressModal;
