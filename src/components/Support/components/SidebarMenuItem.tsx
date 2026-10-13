import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../../utils/utils';
import Badge from '../../Badge/Badge';
import Button from '../../Button/Button';
import Text from '../../Text/Text';

/** Nível do item na árvore do menu lateral. */
export type SidebarMenuItemVariant = 'main' | 'sub';

/**
 * Paleta do estado ativo.
 *
 * - `theme` (padrão): segue `primary-*`, ou seja, se adapta à whitelabel /
 *   instituição — verde no analytica, azul no parana, vermelho no paraiba.
 * - `info`: segue a rampa `info-*` do tema. Atenção: nem todo tema usa azul
 *   aqui (no analytica a rampa `info` é roxa).
 * - `blue`: o azul literal do Figma do SAC, idêntico em qualquer tema. Use
 *   quando a tela precisa bater com o Figma e não com a marca do cliente.
 */
export type SidebarMenuItemActiveTone = 'theme' | 'info' | 'blue';

const ACTIVE_CLASSES: Record<SidebarMenuItemActiveTone, string> = {
  theme: 'bg-primary-50 text-primary-700',
  info: 'bg-info-background text-info-800',
  blue: 'bg-[#EBF2FE] text-[#1A56DB]',
};

/**
 * Tonalidade da contagem do item `main`. O `sub` ignora: ali a contagem é
 * texto puro que herda a cor do item, como no Figma.
 */
export type SidebarMenuItemCountTone = 'warning' | 'theme' | 'muted';

const COUNT_CLASSES: Record<SidebarMenuItemCountTone, string> = {
  warning: 'bg-warning-100 text-warning-700',
  theme: 'bg-primary-100 text-primary-800',
  muted: 'bg-background-muted text-background-800',
};

const IDLE_CLASSES: Record<SidebarMenuItemVariant, string> = {
  main: 'text-text-950 hover:bg-background-50',
  sub: 'text-text-600 hover:bg-background-50',
};

/**
 * Peso do rótulo, no vocabulário do `Text`. Fica no rótulo e não no botão
 * porque o `Text` escreve o próprio `font-*`: um peso herdado do botão seria
 * sobrescrito pelo default (`normal`) do componente.
 */
const LABEL_WEIGHT: Record<SidebarMenuItemVariant, 'medium' | 'normal'> = {
  main: 'medium',
  sub: 'normal',
};

/** Escala do item. `md` é o tamanho do Figma. */
export type SidebarMenuItemSize = 'sm' | 'md';

/**
 * Espaçamento, tipografia e ícone andam juntos porque o recuo do sub é
 * derivado deles: o sub precisa alinhar com o *rótulo* do main, ou seja
 * `padding` + ícone + `gap`. Separar isso em props soltas deixaria o consumidor
 * desalinhar os dois níveis sem perceber.
 *
 * - `md`: px-3 (12) + ícone 20 + gap-3 (12) = 44px = `pl-11`
 * - `sm`: px-2  (8) + ícone 16 + gap-2  (8) = 32px = `pl-8`
 *
 * O `[&>svg]:size-*` força o ícone do consumidor a caber na caixa: as props
 * `width`/`height` que o Phosphor escreve no `<svg>` são atributos de
 * apresentação, então qualquer regra CSS ganha delas. Assim um
 * `<Icon size={20} />` passado num item `sm` encolhe em vez de vazar.
 *
 * `label` é o mesmo tamanho do `item`, escrito no vocabulário do `Text`. A
 * classe continua no botão porque a contagem do `sub` é texto puro e herda dali.
 */
const SIZE_CLASSES: Record<
  SidebarMenuItemSize,
  {
    item: string;
    subIndent: string;
    icon: string;
    label: 'xs' | 'sm';
    badge: 'small' | 'medium';
  }
> = {
  sm: {
    item: 'gap-2 px-2 py-1.5 text-xs',
    subIndent: 'pl-8',
    icon: 'size-4 [&>svg]:size-4',
    label: 'xs',
    badge: 'small',
  },
  md: {
    item: 'gap-3 px-3 py-2.5 text-sm',
    subIndent: 'pl-11',
    icon: 'size-5 [&>svg]:size-5',
    label: 'sm',
    badge: 'medium',
  },
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
  /** Escala do item. `md` (padrão) é o tamanho do Figma; `sm` é compacto. */
  size?: SidebarMenuItemSize;
  /** Paleta do estado ativo. Ignorada quando o item não está ativo. */
  activeTone?: SidebarMenuItemActiveTone;
  /** Tonalidade da pílula de contagem do `main`. Ignorada pelo `sub`. */
  countTone?: SidebarMenuItemCountTone;
  /** Classes CSS adicionais. */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BASE_CLASSES =
  'w-full flex items-center rounded-lg text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

/**
 * Item do menu lateral do SAC.
 *
 * Combina os dois eixos do Figma ("Componentes – Suporte" → Menu lateral /
 * Item): tipo (`main` | `sub`) e estado (`active`). O main leva ícone e mostra
 * a contagem numa pílula laranja; o sub é recuado, sem ícone, e mostra a
 * contagem como texto que herda a cor do item.
 *
 * Renderiza o `Button` da lib na variante `raw` (`type="button"`, sem estilo
 * próprio) com `onClick` — a navegação fica a cargo do consumidor, sem acoplar a
 * lib a um router.
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
      size = 'md',
      activeTone = 'theme',
      countTone = 'warning',
      className,
      ...props
    },
    ref
  ) => {
    const scale = SIZE_CLASSES[size];
    const stateClasses = active ? ACTIVE_CLASSES[activeTone] : undefined;
    const showIcon = variant === 'main' && Boolean(icon);

    return (
      <Button
        ref={ref}
        variant="raw"
        aria-current={active ? 'page' : undefined}
        className={cn(
          BASE_CLASSES,
          scale.item,
          variant === 'sub' && scale.subIndent,
          stateClasses ?? IDLE_CLASSES[variant],
          className
        )}
        {...props}
      >
        {showIcon && (
          <span
            data-testid="sidebar-menu-item-icon"
            aria-hidden="true"
            className={cn(
              'flex items-center justify-center shrink-0',
              scale.icon
            )}
          >
            {icon}
          </span>
        )}
        <Text
          as="span"
          size={scale.label}
          weight={LABEL_WEIGHT[variant]}
          color="text-inherit"
          className="flex-1 truncate"
        >
          {label}
        </Text>
        {count !== undefined && (
          <SidebarMenuItemCount
            count={count}
            variant={variant}
            badgeSize={scale.badge}
            tone={countTone}
          />
        )}
      </Button>
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
  badgeSize,
  tone,
}: {
  count: number;
  variant: SidebarMenuItemVariant;
  badgeSize: 'small' | 'medium';
  tone: SidebarMenuItemCountTone;
}) => {
  // Sem classe de tipografia: o número herda tamanho e cor do próprio item.
  if (variant === 'sub') {
    return (
      <span
        data-testid="sidebar-menu-item-count"
        className="shrink-0 tabular-nums"
      >
        {count}
      </span>
    );
  }

  return (
    <Badge
      data-testid="sidebar-menu-item-count"
      action="warning"
      size={badgeSize}
      className={cn(
        'shrink-0 rounded-full font-medium tabular-nums min-w-6',
        COUNT_CLASSES[tone]
      )}
    >
      {count}
    </Badge>
  );
};

export default SidebarMenuItem;
