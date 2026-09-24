import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from 'react';

/** Distance (px) from the scroller edge where the auto-scroll starts. */
const AUTO_SCROLL_EDGE = 72;
/** Scroll step (px per frame) when the pointer sits right on the edge. */
const AUTO_SCROLL_MAX_SPEED = 16;

/**
 * Nearest ancestor that actually scrolls vertically. Used to auto-scroll the
 * list while the user drags a card towards one of its edges.
 */
const findScrollableAncestor = (
  element: HTMLElement | null
): HTMLElement | null => {
  let current: HTMLElement | null = element;

  while (current) {
    const { overflowY } = globalThis.getComputedStyle(current);
    const scrolls = overflowY === 'auto' || overflowY === 'scroll';
    if (scrolls && current.scrollHeight > current.clientHeight) return current;
    current = current.parentElement;
  }

  return null;
};

type DragGeometry = {
  /** Vertical middle of every item, relative to the list top at drag start. */
  midpoints: number[];
  /** List top in viewport coordinates at drag start, used as a fallback. */
  listTop: number;
  /** Scroll offset at drag start, so later scrolling can be compensated. */
  scrollTop: number;
  scroller: HTMLElement | null;
};

interface UseReorderDragAndDropParams {
  /** Ids in their current order. */
  itemIds: string[];
  /** Moves an item to its new final index. */
  onMove: (fromIndex: number, toIndex: number) => void;
}

/**
 * Drag & drop reordering with an explicit drop indicator.
 *
 * The item geometry is measured once at drag start, so rendering the drop
 * placeholder (which shifts the layout) never feeds back into the index
 * computation — that is what made the previous implementation drop cards in
 * unexpected positions.
 */
export const useReorderDragAndDrop = ({
  itemIds,
  onMove,
}: UseReorderDragAndDropParams) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const listRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const geometryRef = useRef<DragGeometry | null>(null);
  const autoScrollRef = useRef<{ frame: number | null; speed: number }>({
    frame: null,
    speed: 0,
  });
  /** Whether the pointer went down on something that must not start a drag. */
  const pointerOnNoDragRef = useRef(false);
  const dropIndexRef = useRef<number | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  const itemIdsRef = useRef(itemIds);
  itemIdsRef.current = itemIds;

  const stopAutoScroll = useCallback(() => {
    autoScrollRef.current.speed = 0;
    if (autoScrollRef.current.frame !== null) {
      globalThis.cancelAnimationFrame(autoScrollRef.current.frame);
      autoScrollRef.current.frame = null;
    }
  }, []);

  const runAutoScroll = useCallback(() => {
    if (autoScrollRef.current.frame !== null) return;

    const step = () => {
      const scroller = geometryRef.current?.scroller;
      const { speed } = autoScrollRef.current;

      if (!scroller || speed === 0) {
        autoScrollRef.current.frame = null;
        return;
      }

      scroller.scrollTop += speed;
      autoScrollRef.current.frame = globalThis.requestAnimationFrame(step);
    };

    autoScrollRef.current.frame = globalThis.requestAnimationFrame(step);
  }, []);

  const updateAutoScroll = useCallback(
    (clientY: number) => {
      const scroller = geometryRef.current?.scroller;
      if (!scroller) return;

      const rect = scroller.getBoundingClientRect();
      const toTop = clientY - rect.top;
      const toBottom = rect.bottom - clientY;

      let speed = 0;
      if (toTop < AUTO_SCROLL_EDGE) {
        const intensity = 1 - Math.max(toTop, 0) / AUTO_SCROLL_EDGE;
        speed = -AUTO_SCROLL_MAX_SPEED * intensity;
      } else if (toBottom < AUTO_SCROLL_EDGE) {
        const intensity = 1 - Math.max(toBottom, 0) / AUTO_SCROLL_EDGE;
        speed = AUTO_SCROLL_MAX_SPEED * intensity;
      }

      autoScrollRef.current.speed = speed;
      if (speed === 0) {
        stopAutoScroll();
        return;
      }

      runAutoScroll();
    },
    [runAutoScroll, stopAutoScroll]
  );

  const reset = useCallback(() => {
    stopAutoScroll();
    geometryRef.current = null;
    dropIndexRef.current = null;
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropIndex(null);
  }, [stopAutoScroll]);

  useEffect(() => reset, [reset]);

  /** Index the dragged card would be inserted at, in drag-start coordinates. */
  const computeDropIndex = useCallback((clientY: number) => {
    const geometry = geometryRef.current;
    if (!geometry || !Number.isFinite(clientY)) return null;

    // The live list top already accounts for every scroll that moved the list
    // — the page, the nearest scroller or any container above it.
    const list = listRef.current;
    const listTop = list?.getBoundingClientRect().top ?? geometry.listTop;
    // Unless the list is its own scroller: there the rect stays put while the
    // items move, so that scrolling still has to be compensated by hand.
    const scrollDelta =
      list && geometry.scroller === list
        ? list.scrollTop - geometry.scrollTop
        : 0;
    const y = clientY - listTop + scrollDelta;
    const index = geometry.midpoints.findIndex((midpoint) => y < midpoint);

    return index === -1 ? geometry.midpoints.length : index;
  }, []);

  const registerItem = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) {
        itemRefs.current.set(id, element);
      } else {
        itemRefs.current.delete(id);
      }
    },
    []
  );

  const handlePointerDown = useCallback((event: { target: EventTarget }) => {
    const target = event.target as HTMLElement | null;
    pointerOnNoDragRef.current = Boolean(
      target?.closest?.('[data-no-drag="true"]')
    );
  }, []);

  const handleDragStart = useCallback(
    (id: string) => (event: DragEvent<HTMLElement>) => {
      // Dragging from the remove button must not start a reorder
      if (pointerOnNoDragRef.current) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);

      const preview = event.currentTarget.querySelector(
        '[data-drag-preview="true"]'
      );
      event.dataTransfer.setDragImage(preview ?? event.currentTarget, 8, 8);

      const list = listRef.current;
      const listTop = list?.getBoundingClientRect().top ?? 0;
      const scroller = findScrollableAncestor(list);

      geometryRef.current = {
        listTop,
        scroller,
        scrollTop: scroller?.scrollTop ?? 0,
        midpoints: itemIdsRef.current.map((itemId) => {
          const element = itemRefs.current.get(itemId);
          if (!element) return Number.POSITIVE_INFINITY;
          const rect = element.getBoundingClientRect();
          return rect.top + rect.height / 2 - listTop;
        }),
      };

      draggingIdRef.current = id;
      setDraggingId(id);
    },
    []
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!draggingIdRef.current) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const next = computeDropIndex(event.clientY);
      if (next !== null && next !== dropIndexRef.current) {
        dropIndexRef.current = next;
        setDropIndex(next);
      }

      updateAutoScroll(event.clientY);
    },
    [computeDropIndex, updateAutoScroll]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();

      const fromId =
        draggingIdRef.current || event.dataTransfer.getData('text/plain');
      const insertionIndex =
        dropIndexRef.current ?? computeDropIndex(event.clientY);
      reset();

      if (!fromId || insertionIndex === null) return;

      const fromIndex = itemIdsRef.current.indexOf(fromId);
      if (fromIndex === -1) return;

      // The insertion index is measured before the item leaves its slot
      const toIndex =
        insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
      if (toIndex === fromIndex) return;

      onMove(fromIndex, toIndex);
    },
    [computeDropIndex, onMove, reset]
  );

  return {
    draggingId,
    dropIndex,
    listRef,
    registerItem,
    handlePointerDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd: reset,
  };
};
