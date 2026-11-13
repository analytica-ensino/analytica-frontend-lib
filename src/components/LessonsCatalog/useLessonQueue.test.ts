import { act, renderHook } from '@testing-library/react';
import { useLessonQueue, resolveVideoEndAction } from './useLessonQueue';
import { useMediaPreferencesStore } from '../../store/mediaPreferencesStore';

interface PlaylistItem {
  id: string;
  title: string;
}

const ITEMS: PlaylistItem[] = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
];

const controls = () => ({ replay: jest.fn(), rewind: jest.fn() });

const setup = (activeId: string, overrides = {}) => {
  const openItem = jest.fn();
  const hook = renderHook(
    ({ id }) =>
      useLessonQueue({ items: ITEMS, activeId: id, openItem, ...overrides }),
    { initialProps: { id: activeId } }
  );
  return { ...hook, openItem };
};

describe('useLessonQueue', () => {
  beforeEach(() => {
    useMediaPreferencesStore.setState({
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',
    });
  });

  it('schedules the next item and opens it with autoplay', async () => {
    const { result, openItem } = setup('a');

    act(() => result.current.handleVideoEnded(controls()));
    expect(result.current.pendingItem).toEqual(ITEMS[1]);

    await act(() => result.current.completeCountdown());

    expect(openItem).toHaveBeenCalledWith(ITEMS[1]);
    expect(result.current.autoPlayId).toBe('b');
    expect(result.current.pendingItem).toBeNull();

    act(() => result.current.clearAutoPlay());
    expect(result.current.autoPlayId).toBeNull();
  });

  it('waits for the completion passed by the page before opening', async () => {
    const { result, openItem } = setup('a');
    let finish: () => void = () => undefined;
    const completion = new Promise<void>((resolve) => {
      finish = resolve;
    });

    act(() => result.current.handleVideoEnded(controls(), completion));
    let done = false;
    let opening: Promise<void> = Promise.resolve();
    act(() => {
      opening = result.current.completeCountdown().then(() => {
        done = true;
      });
    });
    await act(async () => Promise.resolve());
    expect(done).toBe(false);
    expect(openItem).not.toHaveBeenCalled();

    await act(async () => {
      finish();
      await opening;
    });
    expect(openItem).toHaveBeenCalledWith(ITEMS[1]);
  });

  it('drops the countdown when another item is opened meanwhile', () => {
    const { result, rerender } = setup('a');

    act(() => result.current.handleVideoEnded(controls()));
    rerender({ id: 'c' });

    expect(result.current.pendingItem).toBeNull();
  });

  it('does not open anything once the student moved on', async () => {
    const { result, rerender, openItem } = setup('a');
    act(() => result.current.handleVideoEnded(controls()));
    const complete = result.current.completeCountdown;

    rerender({ id: 'c' });
    await act(() => complete());

    expect(openItem).not.toHaveBeenCalled();
  });

  it('cancel keeps the current item', () => {
    const { result, openItem } = setup('a');

    act(() => result.current.handleVideoEnded(controls()));
    act(() => result.current.cancelCountdown());

    expect(result.current.pendingItem).toBeNull();
    expect(openItem).not.toHaveBeenCalled();
  });

  it('repeat list goes back to the first item in list order', () => {
    useMediaPreferencesStore.setState({ queueRepeatList: true });
    const { result } = setup('c');

    act(() => result.current.handleVideoEnded(controls()));

    expect(result.current.pendingItem).toEqual(ITEMS[0]);
  });

  it('back to start opens the first item without autoplay', async () => {
    useMediaPreferencesStore.setState({ videoEndBehavior: 'back-to-start' });
    const { result, openItem } = setup('b');

    await act(async () => result.current.handleVideoEnded(controls()));

    expect(openItem).toHaveBeenCalledWith(ITEMS[0]);
    expect(result.current.autoPlayId).toBeNull();
  });

  it('disabled only rewinds and still reports the end', () => {
    const onVideoEnd = jest.fn();
    const end = controls();
    const { result } = setup('a', { disabled: true, onVideoEnd });

    act(() => result.current.handleVideoEnded(end));

    expect(onVideoEnd).toHaveBeenCalledTimes(1);
    expect(end.rewind).toHaveBeenCalledTimes(1);
    expect(result.current.pendingItem).toBeNull();
  });

  it('does nothing without an active item', () => {
    const end = controls();
    const { result } = renderHook(() =>
      useLessonQueue({ items: ITEMS, activeId: undefined, openItem: jest.fn() })
    );

    act(() => result.current.handleVideoEnded(end));

    expect(end.rewind).not.toHaveBeenCalled();
    expect(result.current.pendingItem).toBeNull();
  });
});

describe('resolveVideoEndAction', () => {
  const base = {
    endBehavior: 'none' as const,
    isInQueue: true,
    isOnListStart: false,
    hasNext: true,
    repeatList: false,
  };

  it.each([
    [{ endBehavior: 'repeat-video' as const }, 'replay'],
    [{ endBehavior: 'back-to-start' as const }, 'open-list-start'],
    [{ endBehavior: 'back-to-start' as const, isOnListStart: true }, 'rewind'],
    [{ isInQueue: false }, 'rewind'],
    [{}, 'advance'],
    [{ hasNext: false, repeatList: true }, 'restart-queue'],
    [{ hasNext: false }, 'rewind'],
  ])('%j -> %s', (overrides, action) => {
    expect(resolveVideoEndAction({ ...base, ...overrides })).toBe(action);
  });
});
