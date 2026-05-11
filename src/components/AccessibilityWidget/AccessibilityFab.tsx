import Button from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';
import accessibilityIcon from '../../assets/img/accessibility.png';
import {
  FAB_POSITION_CLASSES,
  FAB_TOOLTIP_POSITION,
  FAB_VERTICAL_ALIGN_CLASSES,
  type FabPosition,
  type FabVerticalAlign,
} from './fabPositioning';

/** Re-exports mantidos para compatibilidade com a API pública do widget. */
export type AccessibilityFabPosition = FabPosition;
export type AccessibilityFabVerticalAlign = FabVerticalAlign;

export interface AccessibilityFabProps {
  /** Click handler — alterna o painel */
  onClick: () => void;
  /** Indica se o painel está aberto (controla aria-expanded) */
  isOpen?: boolean;
  /** Lado da viewport onde o botão fica colado */
  position?: AccessibilityFabPosition;
  /** Alinhamento vertical (default: `center`) */
  verticalAlign?: AccessibilityFabVerticalAlign;
  /** Classes extras */
  className?: string;
}

/**
 * Botão flutuante (FAB) que abre o painel de acessibilidade.
 * Inspirado no padrão HandTalk: quadrado azul escuro colado na
 * lateral da viewport (direita por padrão), com o ícone universal
 * de acessibilidade. Verticalmente centralizado.
 */
export default function AccessibilityFab({
  onClick,
  isOpen = false,
  position = 'right',
  verticalAlign = 'center',
  className,
}: Readonly<AccessibilityFabProps>) {
  const label = isOpen
    ? 'Fechar opções de acessibilidade'
    : 'Opções de acessibilidade';

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
        aria-expanded={isOpen}
        data-testid="accessibility-fab"
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
        <img
          src={accessibilityIcon}
          alt=""
          aria-hidden="true"
          className="h-7 w-7"
        />
      </Button>
    </Tooltip>
  );
}
