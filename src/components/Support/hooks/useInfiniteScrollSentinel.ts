import { RefObject, useEffect, useRef } from 'react';

export type UseInfiniteScrollSentinelOptions = {
  /** Elemento sentinela, normalmente um `<div>` de 1px após o último item. */
  ref: RefObject<HTMLElement | null>;
  /** Observa enquanto `true`. Desligue durante carregamento e no fim da lista. */
  enabled?: boolean;
  /** Chamado quando a sentinela entra na viewport. */
  onIntersect?: () => void;
  /** Fração visível que dispara. Default `0.1`, como no `useLessonBank`. */
  threshold?: number;
};

/**
 * Dispara `onIntersect` quando a sentinela entra na viewport — o scroll
 * infinito, sem conhecer lista nem paginação.
 *
 * O callback é guardado numa ref de propósito. Consumidores costumam passar uma
 * arrow nova a cada render; se ela entrasse nas dependências do efeito, o
 * observer seria destruído e recriado a cada render e voltaria a disparar
 * imediatamente enquanto a sentinela estivesse visível — um laço de
 * `onLoadMore`. Assim o observer só é recriado quando o alvo, o `enabled` ou o
 * `threshold` mudam, e ainda chama sempre a versão mais recente do callback.
 *
 * @example
 * ```tsx
 * const sentinelRef = useRef<HTMLDivElement>(null);
 * useInfiniteScrollSentinel({
 *   ref: sentinelRef,
 *   enabled: hasMore && !loading,
 *   onIntersect: onLoadMore,
 * });
 * ```
 */
export const useInfiniteScrollSentinel = ({
  ref,
  enabled = true,
  onIntersect,
  threshold = 0.1,
}: UseInfiniteScrollSentinelOptions): void => {
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  const hasCallback = Boolean(onIntersect);

  useEffect(() => {
    const target = ref.current;

    if (!target || !enabled || !hasCallback) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callbackRef.current?.();
        }
      },
      { threshold }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [ref, enabled, hasCallback, threshold]);
};
