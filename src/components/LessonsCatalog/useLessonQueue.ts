import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VideoEndControls } from '../VideoPlayer/VideoPlayer';
import {
  useMediaPreferencesStore,
  type VideoEndBehavior,
} from '../../store/mediaPreferencesStore';

/** Anything a lesson queue can hold: the subtopic's lessons, a playlist's. */
export interface LessonQueueItem {
  id: string;
}

export type VideoEndAction =
  | 'replay'
  | 'rewind'
  | 'advance'
  | 'restart-queue'
  | 'open-list-start';

/**
 * Single place that decides the end of the video, in AE-3308 priority order.
 *
 * @returns What the page does once the video ends
 */
export const resolveVideoEndAction = ({
  endBehavior,
  isInQueue,
  isOnListStart,
  hasNext,
  repeatList,
}: {
  endBehavior: VideoEndBehavior;
  isInQueue: boolean;
  /** The item that ended is already the first one of the list. */
  isOnListStart: boolean;
  hasNext: boolean;
  repeatList: boolean;
}): VideoEndAction => {
  if (endBehavior === 'repeat-video') return 'replay';
  // "Voltar ao início da lista" (Figma): go back to the list's first lesson,
  // stopped, waiting for play. On that lesson already, it just rewinds.
  if (endBehavior === 'back-to-start') {
    return isInQueue && !isOnListStart ? 'open-list-start' : 'rewind';
  }
  if (!isInQueue) return 'rewind';
  if (hasNext) return 'advance';
  return repeatList ? 'restart-queue' : 'rewind';
};

/**
 * Shuffles the ids with `firstId` first (Fisher-Yates on the rest).
 *
 * @returns The shuffled ids
 */
const buildShuffledIds = (
  items: LessonQueueItem[],
  firstId: string
): string[] => {
  const rest = items.map(({ id }) => id).filter((id) => id !== firstId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [firstId, ...rest];
};

/** Item scheduled by the countdown, and the item it was scheduled from. */
interface PendingQueueItem<T> {
  item: T;
  /** Only when restarting a shuffled cycle: its new order. */
  order?: string[];
  fromId: string;
}

export interface UseLessonQueueOptions<T extends LessonQueueItem> {
  /**
   * The playable items in the order the list shows them. Fewer than two means
   * there is no queue: the video just rewinds at its end.
   */
  items: T[];
  /** The item on the player. */
  activeId: string | undefined;
  /** Opens an item: the page's own selection, URL and scroll. */
  openItem: (item: T) => void;
  /**
   * Called on the real end of the video. Return the completion save in flight
   * so the queue waits for it before opening another item: the progress must
   * land on the item that ended.
   */
  onVideoEnd?: () => Promise<void> | void;
  /** No end-of-video features at all (a teacher's preview). */
  disabled?: boolean;
}

export interface UseLessonQueueReturn<T extends LessonQueueItem> {
  /**
   * Feed the player's `onEnded`. A page whose completion save lives elsewhere
   * (a child section) passes the save in flight as `completion`; otherwise
   * `onVideoEnd` provides it.
   */
  handleVideoEnded: (
    controls: VideoEndControls,
    completion?: Promise<void>
  ) => void;
  /** The item the countdown is about to open, or null with no countdown. */
  pendingItem: T | null;
  /** Opens the pending item now ("Assistir agora" or the countdown's end). */
  completeCountdown: () => Promise<void>;
  /** Drops the pending item; the current one stays, paused. */
  cancelCountdown: () => void;
  /** Id of the item opened by the queue: the one the player should autoplay. */
  autoPlayId: string | null;
  /** Call when the student opens an item by hand: it must not autoplay. */
  clearAutoPlay: () => void;
}

/**
 * The lesson queue (AE-3307) with the list controls (AE-3308), for any page
 * that plays a list of lessons: the subtopic on `LessonViewPage`, a playlist
 * on the student portal.
 *
 * The page keeps its own player and list; this hook only decides what happens
 * at the end of each video, using the controls saved in
 * `useMediaPreferencesStore`:
 * - "Repetir vídeo" replays it;
 * - "Voltar ao início da lista" opens the list's first item, stopped;
 * - otherwise a countdown (`pendingItem`) opens the next item, playing;
 * - at the end of the list, "Repetir lista" starts it over, else it rewinds.
 *
 * "Aleatório" puts the current item first and shuffles the rest; opening an
 * item by hand starts a new cycle from it, so nothing repeats before every
 * item has played.
 *
 * Render `NextLessonCountdown` over the player while `pendingItem` is set, and
 * `LessonQueueControls` beside the list.
 *
 * @returns Handlers for the player and the countdown, and the autoplay target
 */
export const useLessonQueue = <T extends LessonQueueItem>({
  items,
  activeId,
  openItem,
  onVideoEnd,
  disabled = false,
}: UseLessonQueueOptions<T>): UseLessonQueueReturn<T> => {
  const queueShuffle = useMediaPreferencesStore((s) => s.queueShuffle);
  const queueRepeatList = useMediaPreferencesStore((s) => s.queueRepeatList);
  const videoEndBehavior = useMediaPreferencesStore((s) => s.videoEndBehavior);

  const [pending, setPending] = useState<PendingQueueItem<T> | null>(null);
  const [autoPlayId, setAutoPlayId] = useState<string | null>(null);
  const [shuffledIds, setShuffledIds] = useState<string[] | null>(null);
  const shuffleOrderKeyRef = useRef<string | null>(null);
  // Item the shuffled queue expects next; any other one reshuffles.
  const expectedShuffledIdRef = useRef<string | null>(null);
  // Save started by `onVideoEnd`, awaited before opening another item.
  const completionRef = useRef<Promise<void> | void>(undefined);

  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const playable = useMemo(() => (disabled ? [] : items), [disabled, items]);
  // Callers often recreate the objects; only the ids define the queue.
  const itemsKey = playable.map(({ id }) => id).join(',');

  useEffect(() => {
    if (!queueShuffle || !activeId) {
      shuffleOrderKeyRef.current = null;
      setShuffledIds(null);
      return;
    }
    if (
      shuffleOrderKeyRef.current === itemsKey &&
      expectedShuffledIdRef.current === activeId
    ) {
      return;
    }
    shuffleOrderKeyRef.current = itemsKey;
    expectedShuffledIdRef.current = activeId;
    setShuffledIds(buildShuffledIds(playable, activeId));
    // `playable` is represented by `itemsKey`.
  }, [queueShuffle, itemsKey, activeId]);

  const queue = useMemo(() => {
    if (!shuffledIds) return playable;
    const byId = new Map(playable.map((item) => [item.id, item]));
    return shuffledIds.flatMap((id) => byId.get(id) ?? []);
  }, [shuffledIds, playable]);

  const currentIndex = queue.findIndex(({ id }) => id === activeId);
  const nextItem =
    currentIndex === -1 ? null : (queue[currentIndex + 1] ?? null);
  /** First item as the list shows it, whatever the shuffled order. */
  const listStart = playable[0];

  /** Opens the list's first item without playing it, after the save. */
  const openListStart = useCallback(
    async (fromId: string) => {
      if (!listStart) return;
      await completionRef.current;
      // The student may have picked another item while the save finished.
      if (activeIdRef.current !== fromId) return;
      openItem(listStart);
    },
    [listStart, openItem]
  );

  /** First item of the new cycle; when shuffled, never the one that ended. */
  const buildRestartedQueue = useCallback(
    (fromId: string): PendingQueueItem<T> | null => {
      if (!queueShuffle) {
        return queue[0] ? { item: queue[0], fromId } : null;
      }
      const others = queue.filter(({ id }) => id !== fromId);
      const item = others[Math.floor(Math.random() * others.length)];
      return item
        ? { item, order: buildShuffledIds(queue, item.id), fromId }
        : null;
    },
    [queueShuffle, queue]
  );

  const handleVideoEnded = useCallback(
    ({ replay, rewind }: VideoEndControls, completion?: Promise<void>) => {
      completionRef.current = completion ?? onVideoEnd?.();
      if (!activeId) return;

      const action = resolveVideoEndAction({
        endBehavior: disabled ? 'none' : videoEndBehavior,
        isInQueue: queue.length > 1,
        isOnListStart: listStart?.id === activeId,
        hasNext: Boolean(nextItem),
        repeatList: queueRepeatList,
      });

      if (action === 'replay') replay();
      if (action === 'rewind') rewind();
      if (action === 'open-list-start') void openListStart(activeId);
      if (action === 'advance' && nextItem) {
        setPending({ item: nextItem, fromId: activeId });
      }
      if (action === 'restart-queue') setPending(buildRestartedQueue(activeId));
    },
    [
      onVideoEnd,
      activeId,
      disabled,
      videoEndBehavior,
      queue.length,
      listStart,
      nextItem,
      queueRepeatList,
      openListStart,
      buildRestartedQueue,
    ]
  );

  const completeCountdown = useCallback(async () => {
    if (!pending) return;

    // Close the countdown before waiting: it can no longer be canceled here.
    setPending(null);
    await completionRef.current;

    // The student may have picked another item while the save finished.
    if (activeIdRef.current !== pending.fromId) return;

    const { item, order } = pending;
    expectedShuffledIdRef.current = item.id;
    if (order) setShuffledIds(order);
    openItem(item);
    setAutoPlayId(item.id);
  }, [pending, openItem]);

  const cancelCountdown = useCallback(() => setPending(null), []);
  const clearAutoPlay = useCallback(() => setAutoPlayId(null), []);

  // Another item opened while counting down: the countdown no longer applies.
  useEffect(() => {
    setPending((current) =>
      current && current.fromId !== activeId ? null : current
    );
  }, [activeId]);

  return {
    handleVideoEnded,
    pendingItem: pending?.item ?? null,
    completeCountdown,
    cancelCountdown,
    autoPlayId,
    clearAutoPlay,
  };
};
