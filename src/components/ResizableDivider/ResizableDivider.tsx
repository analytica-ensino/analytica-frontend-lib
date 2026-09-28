import { cn } from '../../utils/utils';
import type { ResizableDividerHandlers } from '../../hooks/useResizableColumns';

/**
 * ResizableDivider component props interface
 */
export type ResizableDividerProps = ResizableDividerHandlers & {
  /** Rótulo do divisor para leitores de tela */
  label: string;
  /** Additional CSS classes to apply */
  className?: string;
};

/**
 * Divisor vertical arrastável entre duas colunas.
 *
 * Substitui o `Divider` estático nas telas de criação. Segue o padrão de
 * *window splitter* do WAI-ARIA: `role="separator"` focável, com
 * `aria-valuenow`/`min`/`max` refletindo a largura da coluna que ele controla,
 * ajustável pelas setas — o mesmo compromisso de acessibilidade que o
 * `DragHandleButton` já assume para o que é arrastável na lib.
 *
 * Toda a interação vem de `useResizableColumns`, que é quem conhece os limites
 * das duas colunas ao mesmo tempo; aqui só existe a aparência.
 *
 * O `NOSONAR` na raiz é por causa da regra "elementos não interativos não devem
 * receber listeners": na ARIA, `separator` só é estrutural enquanto **não** é
 * focável — com `tabindex` e `aria-valuenow` ele vira o widget window splitter,
 * e aí os listeners são exigidos pelo próprio padrão. A regra não modela essa
 * distinção. Não existe tag nativa para um splitter, e trocar por `slider`
 * calaria o aviso à custa de anunciar o papel errado no leitor de tela.
 *
 * @param value - Largura atual da coluna controlada
 * @param min - Largura mínima (também a padrão)
 * @param max - Largura máxima que cabe na tela
 * @param disabled - `true` quando não há espaço para redimensionar
 * @param isDragging - `true` enquanto o usuário arrasta este divisor
 * @param label - Rótulo para leitores de tela
 * @param className - Additional CSS classes
 * @returns O divisor arrastável
 *
 * @example
 * ```tsx
 * const { previewDividerProps } = useResizableColumns('activity');
 * <ResizableDivider label="Redimensionar prévia" {...previewDividerProps} />
 * ```
 */
const ResizableDivider = ({
  value,
  min,
  max,
  disabled,
  isDragging,
  label,
  className = '',
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onDoubleClick,
}: ResizableDividerProps) => (
  <div // NOSONAR — ARIA window splitter pattern, no native tag fits (see JSDoc)
    role="separator"
    aria-orientation="vertical"
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : 0}
    data-testid="resizable-divider"
    data-dragging={isDragging || undefined}
    data-disabled={disabled || undefined}
    className={cn(
      // w-px + flex-shrink-0 mantêm exatamente a mesma geometria do Divider
      // estático: o realce visual é absolute e não empurra as colunas.
      'group relative z-10 w-px flex-shrink-0 self-stretch outline-none',
      className
    )}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onLostPointerCapture={onPointerUp}
    onKeyDown={onKeyDown}
    onDoubleClick={onDoubleClick}
  >
    {/*
      Área de toque de ~17px sobre um trilho de 1px: sem isso o alvo fica
      pequeno demais para o mouse e inviável no touch. Os 8px que invadem cada
      vizinho caem dentro do padding `p-4` deles, então não cobrem conteúdo
      clicável. `touch-none` impede que o arraste vire scroll da página.
    */}
    <span
      aria-hidden="true"
      className={cn(
        'absolute inset-y-0 -left-2 -right-2 touch-none',
        !disabled && 'cursor-col-resize'
      )}
    />
    {/* Trilho: 1px em repouso, engrossa e escurece no hover/foco/arraste. */}
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 rounded-full bg-border-200 transition-[width,background-color] duration-150',
        !disabled &&
          'group-hover:w-1 group-hover:bg-border-400 group-focus-visible:w-1 group-focus-visible:bg-border-500',
        isDragging && 'w-1 bg-border-500'
      )}
    />
  </div>
);

export default ResizableDivider;
