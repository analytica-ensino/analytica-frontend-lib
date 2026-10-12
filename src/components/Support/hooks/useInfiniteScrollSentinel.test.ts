import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useInfiniteScrollSentinel } from './useInfiniteScrollSentinel';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const observe = jest.fn();
const disconnect = jest.fn();
let lastCallback: ObserverCallback;
let lastOptions: { threshold?: number } | undefined;

class MockIntersectionObserver {
  constructor(callback: ObserverCallback, options?: { threshold?: number }) {
    lastCallback = callback;
    lastOptions = options;
  }

  observe = observe;
  disconnect = disconnect;
  unobserve = jest.fn();
  takeRecords = jest.fn();
}

const makeRef = () => {
  const ref = createRef<HTMLDivElement>();
  (ref as { current: HTMLDivElement }).current = document.createElement('div');
  return ref;
};

beforeAll(() => {
  (
    globalThis as unknown as { IntersectionObserver: unknown }
  ).IntersectionObserver = MockIntersectionObserver;
});

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
});

describe('useInfiniteScrollSentinel', () => {
  it('observes the element and calls onIntersect when it becomes visible', () => {
    const onIntersect = jest.fn();
    const ref = makeRef();

    renderHook(() => useInfiniteScrollSentinel({ ref, onIntersect }));

    expect(observe).toHaveBeenCalledWith(ref.current);

    lastCallback([{ isIntersecting: true }]);

    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it('ignores entries that are not intersecting', () => {
    const onIntersect = jest.fn();

    renderHook(() =>
      useInfiniteScrollSentinel({ ref: makeRef(), onIntersect })
    );
    lastCallback([{ isIntersecting: false }]);

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('does not observe when disabled', () => {
    renderHook(() =>
      useInfiniteScrollSentinel({
        ref: makeRef(),
        enabled: false,
        onIntersect: jest.fn(),
      })
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it('does not observe without onIntersect', () => {
    renderHook(() => useInfiniteScrollSentinel({ ref: makeRef() }));

    expect(observe).not.toHaveBeenCalled();
  });

  it('does not observe when the ref is empty', () => {
    renderHook(() =>
      useInfiniteScrollSentinel({
        ref: createRef<HTMLDivElement>(),
        onIntersect: jest.fn(),
      })
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it('uses the default threshold and accepts an override', () => {
    renderHook(() =>
      useInfiniteScrollSentinel({ ref: makeRef(), onIntersect: jest.fn() })
    );
    expect(lastOptions).toEqual({ threshold: 0.1 });

    renderHook(() =>
      useInfiniteScrollSentinel({
        ref: makeRef(),
        onIntersect: jest.fn(),
        threshold: 0.5,
      })
    );
    expect(lastOptions).toEqual({ threshold: 0.5 });
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() =>
      useInfiniteScrollSentinel({ ref: makeRef(), onIntersect: jest.fn() })
    );

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not re-observe when only the callback identity changes', () => {
    const ref = makeRef();
    const { rerender } = renderHook<void, { onIntersect: () => void }>(
      ({ onIntersect }) => useInfiniteScrollSentinel({ ref, onIntersect }),
      { initialProps: { onIntersect: jest.fn() } }
    );

    expect(observe).toHaveBeenCalledTimes(1);

    rerender({ onIntersect: jest.fn() });

    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callback after a rerender', () => {
    const ref = makeRef();
    const second = jest.fn();
    const { rerender } = renderHook<void, { onIntersect: () => void }>(
      ({ onIntersect }) => useInfiniteScrollSentinel({ ref, onIntersect }),
      { initialProps: { onIntersect: jest.fn() } }
    );

    rerender({ onIntersect: second });
    lastCallback([{ isIntersecting: true }]);

    expect(second).toHaveBeenCalledTimes(1);
  });
});
