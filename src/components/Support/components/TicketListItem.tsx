import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../../utils/utils';
import { Avatar } from '../../Avatar/Avatar';
import Badge from '../../Badge/Badge';
import { formatTicketTime } from '../utils/formatTicketTime';

/**
 * Fundo da linha. É um eixo puramente visual: a lib não amarra significado a
 * cada cor, quem consome decide o que `danger` quer dizer (SLA, prioridade,
 * ticket reaberto). O hover sobrepõe qualquer tone.
 *
 * As cores são os literais do Figma do SAC, idênticas em qualquer tema — mesmo
 * critério do `activeTone="blue"` do `SidebarMenuItem`. Escritas por extenso
 * porque o Tailwind varre o código-fonte e não resolve classe interpolada.
 */
export type TicketListItemTone = 'default' | 'info' | 'danger';

const TONE_CLASSES: Record<TicketListItemTone, string> = {
  default: 'bg-transparent',
  info: 'bg-[#EEF5FC]',
  danger: 'bg-[#FFF7F7]',
};

/** Tonalidade das badges. Mapeia para as rampas do tema, como o `Badge`. */
export type TicketListItemBadgeTone =
  | 'muted'
  | 'warning'
  | 'info'
  | 'success'
  | 'error';

const BADGE_TONE_CLASSES: Record<TicketListItemBadgeTone, string> = {
  muted: 'bg-transparent text-text-700 border border-border-300',
  warning: 'bg-warning-100 text-warning-700',
  info: 'bg-info text-info-800',
  success: 'bg-success text-success-800',
  error: 'bg-error-background text-error-700',
};

const BADGE_CLASSES = 'shrink-0 rounded-md font-medium uppercase';

/** Escala do item. `md` é o tamanho do Figma. */
export type TicketListItemSize = 'sm' | 'md' | 'lg';

/**
 * Espaçamento, avatar, tipografia e ícone andam juntos numa tabela só porque a
 * linha só lê bem quando escalam na mesma proporção: um avatar de 48 ao lado de
 * um nome `text-sm` desalinha a coluna de texto. Separar isso em props soltas
 * deixaria o consumidor quebrar o alinhamento sem perceber.
 *
 * O `[&>svg]:size-*` força o ícone de canal do consumidor a caber na caixa: as
 * props `width`/`height` que o Phosphor escreve no `<svg>` são atributos de
 * apresentação, então qualquer regra CSS ganha delas.
 */
const SIZE_CLASSES: Record<
  TicketListItemSize,
  {
    item: string;
    rows: string;
    avatar: number;
    name: string;
    time: string;
    meta: string;
    message: string;
    badge: 'small' | 'medium';
    icon: string;
    bar: string;
    dot: string;
  }
> = {
  sm: {
    item: 'gap-2 p-3',
    rows: 'gap-0.5',
    avatar: 32,
    name: 'text-sm',
    time: 'text-2xs',
    meta: 'text-xs',
    message: 'text-xs',
    badge: 'small',
    icon: '[&>svg]:size-3.5',
    bar: 'w-0.5',
    dot: 'size-1.5',
  },
  md: {
    item: 'gap-3 p-4',
    rows: 'gap-1',
    avatar: 40,
    name: 'text-base',
    time: 'text-xs',
    meta: 'text-sm',
    message: 'text-sm',
    badge: 'small',
    icon: '[&>svg]:size-4',
    bar: 'w-1',
    dot: 'size-2',
  },
  lg: {
    item: 'gap-4 p-5',
    rows: 'gap-1.5',
    avatar: 48,
    name: 'text-lg',
    time: 'text-sm',
    meta: 'text-base',
    message: 'text-base',
    badge: 'medium',
    icon: '[&>svg]:size-5',
    bar: 'w-1.5',
    dot: 'size-2.5',
  },
};

const BASE_CLASSES =
  'group relative flex w-full items-start text-left cursor-pointer transition-colors hover:bg-[#EEF5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export type TicketListItemProps = {
  /** Nome de quem abriu o ticket. */
  name: string;
  /** Momento da última mensagem. A lib formata o texto relativo. */
  lastMessageAt: Date | string;
  /** Acende o ponto azul antes do tempo e anuncia "Não lido". */
  unread?: boolean;
  /** Foto. Sem foto, o avatar mostra as iniciais de `name`. */
  avatarSrc?: string;
  /** Badge do perfil. Texto livre: o vocabulário do SAC ainda não está fechado. */
  profileLabel?: string;
  /** Tonalidade da badge de perfil. Default `muted` (contornada). */
  profileTone?: TicketListItemBadgeTone;
  /** Instituição de origem. */
  organization?: string;
  /** Prévia da última mensagem, truncada em uma linha. */
  message?: string;
  /** Badge do atendimento. Texto livre. */
  attendanceLabel?: string;
  /** Tonalidade da badge de atendimento. Default `warning`, o pêssego do Figma. */
  attendanceTone?: TicketListItemBadgeTone;
  /** Ícone do canal de origem. */
  channelIcon?: ReactNode;
  /** Código do ticket, como vier do app (ex.: `#4826`). */
  ticketCode?: string;
  /** Fundo da linha. */
  tone?: TicketListItemTone;
  /** Escala do item. `md` (padrão) é o tamanho do Figma. */
  size?: TicketListItemSize;
  /** Classes CSS adicionais. */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Linha da lista de tickets do SAC.
 *
 * Reproduz o frame "Lista de tickets – item" do Figma ("Componentes –
 * Suporte"): avatar, nome, tempo da última mensagem, badge de perfil,
 * instituição, prévia da conversa, badge de atendimento, canal e código.
 *
 * Só `name` e `lastMessageAt` são obrigatórios; cada bloco desaparece quando a
 * prop não vem, então uma lista sem instituição ou sem canal continua alinhada.
 *
 * Renderiza um `<button type="button">` com `onClick`, como o resto da lib — a
 * navegação fica a cargo do consumidor, sem acoplar a lib a um router.
 *
 * @example
 * ```tsx
 * <TicketListItem
 *   name="Ana Clara Mendes"
 *   lastMessageAt={ticket.updatedAt}
 *   profileLabel="ESTUDANTE"
 *   organization="CE Santos Dumont"
 *   message="IA: Entendi. Vou transferir você para um atendente."
 *   attendanceLabel="HUMANO"
 *   channelIcon={<DeviceMobileIcon size={16} />}
 *   ticketCode="#4826"
 *   tone={ticket.id === selectedId ? 'info' : 'default'}
 *   onClick={() => select(ticket.id)}
 * />
 * ```
 */
export const TicketListItem = forwardRef<
  HTMLButtonElement,
  TicketListItemProps
>(
  (
    {
      name,
      lastMessageAt,
      unread = false,
      avatarSrc,
      profileLabel,
      profileTone = 'muted',
      organization,
      message,
      attendanceLabel,
      attendanceTone = 'warning',
      channelIcon,
      ticketCode,
      tone = 'default',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const scale = SIZE_CLASSES[size];

    return (
      <button
        ref={ref}
        type="button"
        className={cn(BASE_CLASSES, scale.item, TONE_CLASSES[tone], className)}
        {...props}
      >
        <span
          data-testid="ticket-list-item-bar"
          aria-hidden="true"
          className={cn(
            'absolute inset-y-0 left-0 bg-[#1C61B2] transition-opacity',
            scale.bar,
            tone === 'info'
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          )}
        />

        <Avatar
          src={avatarSrc}
          name={name}
          fallback="initials"
          size={scale.avatar}
          className="bg-[#1C61B2] text-white"
        />

        <span className={cn('flex min-w-0 flex-1 flex-col', scale.rows)}>
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 truncate font-bold text-text-950',
                scale.name
              )}
            >
              {name}
            </span>
            {unread && (
              <>
                <span
                  data-testid="ticket-list-item-unread"
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 rounded-full bg-[#1C61B2]',
                    scale.dot
                  )}
                />
                <span className="sr-only">Não lido</span>
              </>
            )}
            <span className={cn('shrink-0 text-text-600', scale.time)}>
              {formatTicketTime(lastMessageAt)}
            </span>
          </span>

          {(profileLabel || organization) && (
            <span className="flex min-w-0 items-center gap-2">
              {profileLabel && (
                <Badge
                  data-testid="ticket-list-item-profile"
                  size={scale.badge}
                  className={cn(BADGE_CLASSES, BADGE_TONE_CLASSES[profileTone])}
                >
                  {profileLabel}
                </Badge>
              )}
              {organization && (
                <span
                  className={cn('min-w-0 truncate text-text-600', scale.meta)}
                >
                  {organization}
                </span>
              )}
            </span>
          )}

          {message && (
            <span className={cn('truncate text-text-700', scale.message)}>
              {message}
            </span>
          )}

          {(attendanceLabel || channelIcon || ticketCode) && (
            <span className="flex items-center gap-2">
              {attendanceLabel && (
                <Badge
                  data-testid="ticket-list-item-attendance"
                  size={scale.badge}
                  className={cn(
                    BADGE_CLASSES,
                    BADGE_TONE_CLASSES[attendanceTone]
                  )}
                >
                  {attendanceLabel}
                </Badge>
              )}
              {channelIcon && (
                <span
                  data-testid="ticket-list-item-channel"
                  aria-hidden="true"
                  className={cn(
                    'flex shrink-0 items-center text-text-600',
                    scale.icon
                  )}
                >
                  {channelIcon}
                </span>
              )}
              {ticketCode && (
                <span
                  className={cn(
                    'shrink-0 text-text-600 tabular-nums',
                    scale.meta
                  )}
                >
                  {ticketCode}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    );
  }
);

TicketListItem.displayName = 'TicketListItem';

export default TicketListItem;
