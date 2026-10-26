import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../../utils/utils';
import { Avatar } from '../../Avatar/Avatar';
import Badge from '../../Badge/Badge';
import Button from '../../Button/Button';
import Text from '../../Text/Text';
import { formatTicketTime } from '../utils/formatTicketTime';

/**
 * Fundo da linha. É um eixo puramente visual: a lib não amarra significado a
 * cada cor, quem consome decide o que `danger` quer dizer (SLA, prioridade,
 * ticket reaberto). O hover sobrepõe qualquer tone.
 *
 * As cores vêm dos tokens do tema (`primary-50` é o azul claro do Figma no
 * light e um azul escuro no dark), para a linha seguir o modo escuro. Só a
 * barra e o avatar ficam no azul literal do Figma. Escritas por extenso porque
 * o Tailwind varre o código-fonte e não resolve classe interpolada.
 */
export type TicketListItemTone = 'default' | 'info' | 'danger';

const TONE_CLASSES: Record<TicketListItemTone, string> = {
  default: 'bg-transparent',
  info: 'bg-primary-50',
  danger: 'bg-error-background',
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

/** Tamanhos aceitos pelo `Text`, para os campos tipográficos da escala. */
type TicketListItemTextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg';

/**
 * Espaçamento, avatar, tipografia e ícone andam juntos numa tabela só porque a
 * linha só lê bem quando escalam na mesma proporção: um avatar de 48 ao lado de
 * um nome `text-sm` desalinha a coluna de texto. Separar isso em props soltas
 * deixaria o consumidor quebrar o alinhamento sem perceber.
 *
 * `name`, `time`, `meta` e `message` são tamanhos do `Text`, não classes: quem
 * renderiza esses textos é o componente da lib, que escreve o próprio `text-*`.
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
    name: TicketListItemTextSize;
    time: TicketListItemTextSize;
    meta: TicketListItemTextSize;
    message: TicketListItemTextSize;
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
    name: 'sm',
    time: '2xs',
    meta: 'xs',
    message: 'xs',
    badge: 'small',
    icon: '[&>svg]:size-3.5',
    bar: 'w-0.5',
    dot: 'size-1.5',
  },
  md: {
    item: 'gap-3 p-4',
    rows: 'gap-1',
    avatar: 40,
    name: 'md',
    time: 'xs',
    meta: 'sm',
    message: 'sm',
    badge: 'small',
    icon: '[&>svg]:size-4',
    bar: 'w-1',
    dot: 'size-2',
  },
  lg: {
    item: 'gap-4 p-5',
    rows: 'gap-1.5',
    avatar: 48,
    name: 'lg',
    time: 'sm',
    meta: 'md',
    message: 'md',
    badge: 'medium',
    icon: '[&>svg]:size-5',
    bar: 'w-1.5',
    dot: 'size-2.5',
  },
};

const BASE_CLASSES =
  'group relative flex w-full items-start text-left cursor-pointer transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export type TicketListItemProps = {
  /** Nome de quem abriu o ticket. */
  name: string;
  /** Momento da última mensagem. A lib formata o texto relativo. */
  lastMessageAt: Date | string;
  /** Acende o ponto azul antes do tempo e anuncia "Não lido". */
  unread?: boolean;
  /**
   * Quantas mensagens ainda não foram lidas. Acima de zero, troca o ponto por
   * uma pílula com o número (`99+` a partir de 100) e já marca a linha como não
   * lida, sem precisar de `unread`.
   */
  unreadCount?: number;
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

/** Acima disso a pílula de não lidas mostra `99+`. */
const MAX_UNREAD_SHOWN = 99;

/** Rótulo lido por leitor de tela na pílula de não lidas. */
const formatUnreadLabel = (count: number): string =>
  count === 1 ? '1 mensagem não lida' : `${count} mensagens não lidas`;

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
 * Renderiza o `Button` da lib na variante `raw` (`type="button"`, sem estilo
 * próprio) com `onClick` — a navegação fica a cargo do consumidor, sem acoplar a
 * lib a um router.
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
      unreadCount = 0,
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
      <Button
        ref={ref}
        variant="raw"
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
            <Text
              as="span"
              size={scale.name}
              weight="bold"
              className="min-w-0 flex-1 truncate"
            >
              {name}
            </Text>
            {unreadCount > 0 && (
              <Text
                as="span"
                size="xs"
                weight="bold"
                color="text-white"
                data-testid="ticket-list-item-unread-count"
                aria-label={formatUnreadLabel(unreadCount)}
                className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#1C61B2] flex items-center justify-center"
              >
                {unreadCount > MAX_UNREAD_SHOWN
                  ? `${MAX_UNREAD_SHOWN}+`
                  : unreadCount}
              </Text>
            )}
            {unread && unreadCount <= 0 && (
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
            <Text
              as="span"
              size={scale.time}
              color="text-text-600"
              className="shrink-0"
            >
              {formatTicketTime(lastMessageAt)}
            </Text>
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
                <Text
                  as="span"
                  size={scale.meta}
                  color="text-text-600"
                  className="min-w-0 truncate"
                >
                  {organization}
                </Text>
              )}
            </span>
          )}

          {message && (
            <Text
              as="span"
              size={scale.message}
              color="text-text-700"
              className="truncate"
            >
              {message}
            </Text>
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
                <Text
                  as="span"
                  size={scale.meta}
                  color="text-text-600"
                  className="shrink-0 tabular-nums"
                >
                  {ticketCode}
                </Text>
              )}
            </span>
          )}
        </span>
      </Button>
    );
  }
);

TicketListItem.displayName = 'TicketListItem';

export default TicketListItem;
