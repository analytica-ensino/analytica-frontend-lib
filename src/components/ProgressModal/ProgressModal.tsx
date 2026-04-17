import { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import ProgressBar from '../ProgressBar/ProgressBar';

export interface ProgressModalProps {
  /** Controla se o modal está aberto */
  isOpen: boolean;
  /** Callback ao fechar */
  onClose: () => void;
  /**
   * Mensagem principal (vira o título do Modal / `<h2>` pra acessibilidade).
   * Quando ReactNode, use phrasing content (`<span>`, `<button>`, ícones).
   */
  message: ReactNode;
  /** URL ou import de imagem ilustrativa (opcional) */
  image?: string;
  /** Alt text da imagem — se não informado usa a `message` quando for string */
  imageAlt?: string;
  /**
   * Valor 0-100. Se omitido, mostra indicador indeterminado (pulse sem %).
   * Use quando o backend não reportar progresso real.
   */
  progress?: number;
  /** Tamanho do Modal. Default: 'sm' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal de progresso com imagem ilustrativa + título + ProgressBar.
 *
 * Pensado para operações assíncronas longas (upload, OCR, correção por IA, etc).
 * Quando `progress` é omitido, a barra é renderizada em modo indeterminado
 * (`animate-pulse` sem percentual visível).
 *
 * A `message` é usada como título do Modal (`<h2>`) pra garantir
 * acessibilidade — screen readers anunciam o dialog com esse texto.
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
  progress,
  size = 'sm',
}: ProgressModalProps) => {
  const isIndeterminate = progress === undefined;
  const resolvedAlt =
    imageAlt ?? (typeof message === 'string' ? message : 'Carregando');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={message} size={size}>
      <div className="flex flex-col items-center gap-6 py-2">
        {image && (
          <img
            src={image}
            alt={resolvedAlt}
            className="w-60 h-60 object-contain"
          />
        )}

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
