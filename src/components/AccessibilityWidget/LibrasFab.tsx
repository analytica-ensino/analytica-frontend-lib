import { HandWavingIcon } from '@phosphor-icons/react';
import Button from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';
import {
  FAB_POSITION_CLASSES,
  FAB_TOOLTIP_POSITION,
  FAB_VERTICAL_ALIGN_CLASSES,
  type FabPosition,
  type FabVerticalAlign,
} from './fabPositioning';

type AccessibilityFabPosition = FabPosition;
type AccessibilityFabVerticalAlign = FabVerticalAlign;

export interface LibrasFabProps {
  /** Click handler — alterna o painel do VLibras (abrir/fechar) */
  onClick: () => void;
  /** Lado da viewport onde o botão fica colado */
  position?: AccessibilityFabPosition;
  /** Alinhamento vertical (default: `below-center`) */
  verticalAlign?: AccessibilityFabVerticalAlign;
  /** Classes extras */
  className?: string;
}

/**
 * Segundo botão flutuante (FAB), posicionado abaixo do `AccessibilityFab`.
 * Aciona o widget oficial do VLibras (gov.br) que faz tradução automática
 * de português para Libras via avatar 3D.
 *
 * O botão tem visual constante — não mantemos um indicador de estado
 * "ativo" porque o painel do VLibras já reflete visualmente se está
 * aberto ou fechado. Cada clique alterna o painel.
 *
 * Mesma identidade visual do FAB principal (azul escuro, quadrado com
 * canto interno arredondado, colado na lateral).
 */
export default function LibrasFab({
  onClick,
  position = 'right',
  verticalAlign = 'below-center',
  className,
}: Readonly<LibrasFabProps>) {
  const label = 'Tradução em Libras';

  return (
    <Tooltip
      content={label}
      position={FAB_TOOLTIP_POSITION[position]}
      className={cn(
        'fixed z-40',
        FAB_VERTICAL_ALIGN_CLASSES[verticalAlign],
        FAB_POSITION_CLASSES[position]
      )}
    >
      <Button
        variant="raw"
        onClick={onClick}
        aria-label={label}
        data-testid="libras-fab"
        className={cn(
          'a11y-widget-shield',
          FAB_POSITION_CLASSES[position],
          'flex h-10 w-10 cursor-pointer items-center justify-center',
          'bg-info-900 text-white shadow-lg',
          'transition-all duration-200 hover:scale-110 hover:bg-info-800',
          'focus:outline-none focus:ring-4 focus:ring-info-300',
          className
        )}
      >
        <HandWavingIcon size={25} weight="fill" aria-hidden="true" />
      </Button>
    </Tooltip>
  );
}
