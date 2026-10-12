import { ReactNode, useRef } from 'react';
import { cn } from '../../../utils/utils';
import EmptyState from '../../EmptyState/EmptyState';
import { Skeleton, SkeletonCircle } from '../../Skeleton/Skeleton';
import { useInfiniteScrollSentinel } from '../hooks/useInfiniteScrollSentinel';
import { TicketListItem, TicketListItemProps } from './TicketListItem';

/** Um ticket da lista: as props do item mais o `id` que identifica a seleção. */
export type TicketListItemData = Omit<TicketListItemProps, 'onClick'> & {
  id: string;
};

/** Quantos skeletons o rodapé mostra enquanto a próxima página carrega. */
const LOADING_MORE_SKELETONS = 2;

export type TicketListProps = {
  /** Tickets já carregados, na ordem em que devem aparecer. */
  tickets: TicketListItemData[];
  /** `id` do ticket aberto no painel. */
  selectedId?: string;
  /** Chamado com o `id` do ticket clicado. */
  onSelect?: (id: string) => void;
  /** Primeira carga: substitui a lista por skeletons. */
  loading?: boolean;
  /** Paginação em curso: skeletons no rodapé, sem esconder o que já carregou. */
  loadingMore?: boolean;
  /** Ainda há páginas a buscar. */
  hasMore?: boolean;
  /** Chamado quando a sentinela do fim da lista entra na viewport. */
  onLoadMore?: () => void;
  /** Quantos skeletons exibir na primeira carga. Default 5. */
  skeletonCount?: number;
  /** Substitui o estado vazio padrão. */
  emptyState?: ReactNode;
  /** Classes CSS adicionais. */
  className?: string;
};

/**
 * Esqueleto no formato da linha: círculo do avatar mais três faixas de texto.
 * Extraído do componente porque o JSX dele já decide entre três caminhos de
 * render, e aninhar o `Array.from` ali dentro vira issue de manutenibilidade.
 */
const TicketListSkeletons = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        data-testid="ticket-list-skeleton"
        className="flex items-start gap-3 p-4"
      >
        <SkeletonCircle width={40} height={40} />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Skeleton width="80%" />
        </div>
      </div>
    ))}
  </>
);

/**
 * Lista de tickets do SAC.
 *
 * Empilha `TicketListItem`, separa com divisores, marca o selecionado e pagina
 * por scroll infinito. A seleção é controlada: o app diz *qual* ticket está
 * aberto e a lista decide *como* isso aparece (o tone `info` do Figma),
 * sobrepondo o `tone` que o próprio ticket tenha pedido.
 *
 * O divisor vive aqui, e não no item, porque o item reaproveitado fora da lista
 * — no topo de uma conversa aberta, por exemplo — não deve carregar borda.
 *
 * @example
 * ```tsx
 * <TicketList
 *   tickets={tickets}
 *   selectedId={selectedId}
 *   onSelect={setSelectedId}
 *   loading={isLoading}
 *   loadingMore={isFetchingNextPage}
 *   hasMore={hasNextPage}
 *   onLoadMore={fetchNextPage}
 * />
 * ```
 */
export const TicketList = ({
  tickets,
  selectedId,
  onSelect,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  skeletonCount = 5,
  emptyState,
  className,
}: TicketListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScrollSentinel({
    ref: sentinelRef,
    enabled: hasMore && !loading && !loadingMore,
    onIntersect: onLoadMore,
  });

  if (loading) {
    return (
      <div className={cn('flex flex-col', className)}>
        <TicketListSkeletons count={skeletonCount} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className={cn('flex flex-col', className)}>
        {emptyState ?? (
          <EmptyState
            size="compact"
            title="Nenhum ticket encontrado"
            description="Não há atendimentos para exibir no momento."
          />
        )}
      </div>
    );
  }

  return (
    <div role="list" className={cn('flex flex-col', className)}>
      {tickets.map(({ id, tone, ...ticket }, index) => {
        const selected = id === selectedId;

        return (
          <div
            key={id}
            role="listitem"
            className={cn(
              index < tickets.length - 1 && 'border-b border-border-100'
            )}
          >
            <TicketListItem
              {...ticket}
              tone={selected ? 'info' : tone}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelect?.(id)}
            />
          </div>
        );
      })}

      {loadingMore && <TicketListSkeletons count={LOADING_MORE_SKELETONS} />}

      <div ref={sentinelRef} aria-hidden="true" className="h-px shrink-0" />
    </div>
  );
};

export default TicketList;
