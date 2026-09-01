import {
  ButtonHTMLAttributes,
  DragEvent,
  KeyboardEvent,
  ReactNode,
  forwardRef,
} from 'react';
import { DotsSixVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsSixVertical';
import { cn } from '../../utils/utils';

/** -1 sobe uma posição, 1 desce uma posição */
export type DragMoveDirection = -1 | 1;

export interface DragHandleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /**
   * Nome acessível da alça, dizendo o que ela move.
   * Ex: `"Reordenar Biologia"`. Obrigatório: sem ele a alça é um botão mudo.
   */
  'aria-label': string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  /** Substitui o ícone padrão (⠿) */
  icon?: ReactNode;
  /**
   * Identificador do item arrastado. Quando informado, vai para o
   * `dataTransfer` como `text/plain` — que é o que o alvo do drop lê.
   */
  dragData?: string;
  /**
   * Move o item pelo teclado (↑ e ↓). Arrastar com o mouse é inacessível por
   * si só; sem isso a reordenação fica indisponível para quem não arrasta.
   */
  onMove?: (direction: DragMoveDirection) => void;
}

const SIZE_CLASSES = {
  sm: ['w-6', 'h-6'],
  md: ['w-10', 'h-10'],
} as const;

const ICON_SIZE = { sm: 16, md: 20 } as const;

/**
 * Alça de arrastar para listas reordenáveis.
 *
 * Entrega só o controle: o `<button>` com `draggable`, o ícone, o cursor de
 * arraste e as setas do teclado. **Quem usa decide o que a ordem significa** —
 * a alça não sabe o que é "irmão", nem persiste nada. O alvo do drop também
 * fica com o consumidor, que costuma ser a linha inteira (área de acerto maior
 * do que a própria alça).
 *
 * @example
 * ```tsx
 * <li
 *   onDragOver={(e) => e.preventDefault()}
 *   onDrop={(e) => reordenar(e.dataTransfer.getData('text/plain'), item.id)}
 * >
 *   <DragHandleButton
 *     size="sm"
 *     aria-label={`Reordenar ${item.nome}`}
 *     dragData={item.id}
 *     onMove={(direcao) => mover(item.id, direcao)}
 *   />
 *   {item.nome}
 * </li>
 * ```
 */
const DragHandleButton = forwardRef<HTMLButtonElement, DragHandleButtonProps>(
  (
    {
      size = 'md',
      icon,
      dragData,
      onMove,
      className = '',
      onDragStart,
      onKeyDown,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-lg',
      'bg-transparent',
      'text-text-400',
      'cursor-grab',
      'active:cursor-grabbing',
      'hover:text-text-600',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-0',
      'focus-visible:ring-indicator-info',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
      if (dragData !== undefined) {
        event.dataTransfer.setData('text/plain', dragData);
      }
      onDragStart?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (onMove && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        // Sem o preventDefault a página rola junto com o item
        event.preventDefault();
        onMove(event.key === 'ArrowUp' ? -1 : 1);
      }
      onKeyDown?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        draggable={!disabled}
        disabled={disabled}
        className={cn(
          [...baseClasses, ...SIZE_CLASSES[size]].join(' '),
          className
        )}
        onDragStart={handleDragStart}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {icon ?? <DotsSixVerticalIcon size={ICON_SIZE[size]} weight="bold" />}
      </button>
    );
  }
);

DragHandleButton.displayName = 'DragHandleButton';

export default DragHandleButton;
