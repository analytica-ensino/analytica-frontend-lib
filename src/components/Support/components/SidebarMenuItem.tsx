import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../../utils/utils';
import Badge from '../../Badge/Badge';

/** Nível do item na árvore do menu lateral. */
export type SidebarMenuItemVariant = 'main' | 'sub';

/**
 * Paleta do estado ativo.
 *
 * `theme` acompanha o tema do cliente (`primary-*`), então o realce fica verde
 * no analytica, azul no parana e vermelho no paraiba. `info` trava o azul do
 * Figma para as telas do SAC que precisam dele independentemente do tema.
 */
export type SidebarMenuItemActiveTone = 'theme' | 'info';

const ACTIVE_CLASSES: Record<SidebarMenuItemActiveTone, string> = {
  theme: 'bg-primary-50 text-primary-700',
  info: 'bg-info-background text-info-800',
};

const IDLE_CLASSES: Record<SidebarMenuItemVariant, string> = {
  main: 'text-text-950 hover:bg-background-50',
  sub: 'text-text-600 hover:bg-background-50',
};

/**
 * O sub recua até alinhar com o rótulo do main: `px-3` (12px) + ícone (20px) +
 * `gap-3` (12px) = 44px = `pl-11`.
 */
const VARIANT_CLASSES: Record<SidebarMenuItemVariant, string> = {
  main: 'text-sm font-medium',
  sub: 'pl-11 text-sm font-normal',
};

export type SidebarMenuItemProps = {
  /** Texto do item. */
  label: string;
  /** Ícone à esquerda. Renderizado apenas em `variant="main"`. */
  icon?: ReactNode;
  /** Contagem exibida à direita. `0` é exibido; omitir esconde. */
  count?: number;
  /** Marca o item como o destino atual da navegação. */
  active?: boolean;
  /** Nível do item: `main` (com ícone) ou `sub` (recuado). */
  variant?: SidebarMenuItemVariant;
  /** Paleta do estado ativo. Ignorada quando o item não está ativo. */
  activeTone?: SidebarMenuItemActiveTone;
  /** Classes CSS adicionais. */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BASE_CLASSES =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

/**
 * Item do menu lateral do SAC.
 *
 * Combina os dois eixos do Figma ("Componentes – Suporte" → Menu lateral /
 * Item): tipo (`main` | `sub`) e estado (`active`). O main leva ícone e mostra
 * a contagem numa pílula laranja; o sub é recuado, sem ícone, e mostra a
 * contagem como texto que herda a cor do item.
 *
 * Renderiza um `<button type="button">` com `onClick`, como o resto da lib — a
 * navegação fica a cargo do consumidor, sem acoplar a lib a um router.
 *
 * @example
 * ```tsx
 * <SidebarMenuItem
 *   icon={<SquaresFourIcon size={20} />}
 *   label="Dashboard"
 *   count={4}
 *   active={pathname === '/dashboard'}
 *   onClick={() => navigate('/dashboard')}
 * />
 * <SidebarMenuItem label="Meus chamados" variant="sub" count={4} />
 * ```
 */
export const SidebarMenuItem = forwardRef<
  HTMLButtonElement,
  SidebarMenuItemProps
>(
  (
    {
      label,
      icon,
      count,
      active = false,
      variant = 'main',
      activeTone = 'theme',
      className,
      ...props
    },
    ref
  ) => {
    const stateClasses = active ? ACTIVE_CLASSES[activeTone] : undefined;
    const showIcon = variant === 'main' && Boolean(icon);

    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? 'page' : undefined}
        className={cn(
          BASE_CLASSES,
          VARIANT_CLASSES[variant],
          stateClasses ?? IDLE_CLASSES[variant],
          className
        )}
        {...props}
      >
        {showIcon && (
          <span
            data-testid="sidebar-menu-item-icon"
            aria-hidden="true"
            className="flex items-center justify-center shrink-0 size-5"
          >
            {icon}
          </span>
        )}
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <SidebarMenuItemCount count={count} variant={variant} />
        )}
      </button>
    );
  }
);

SidebarMenuItem.displayName = 'SidebarMenuItem';

/**
 * A contagem do main é uma pílula laranja; a do sub é texto que herda a cor do
 * item — o `Badge` entra pelo layout/espaçamento e a tonalidade vem do Figma
 * (`warning-100`/`warning-700`, mais saturada que o `warning` padrão do Badge).
 */
const SidebarMenuItemCount = ({
  count,
  variant,
}: {
  count: number;
  variant: SidebarMenuItemVariant;
}) => {
  if (variant === 'sub') {
    return (
      <span
        data-testid="sidebar-menu-item-count"
        className="shrink-0 text-sm tabular-nums"
      >
        {count}
      </span>
    );
  }

  return (
    <Badge
      data-testid="sidebar-menu-item-count"
      action="warning"
      className="shrink-0 rounded-full bg-warning-100 text-warning-700 font-medium tabular-nums min-w-6"
    >
      {count}
    </Badge>
  );
};

export default SidebarMenuItem;
