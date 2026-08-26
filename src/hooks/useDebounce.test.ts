import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('holds the previous value until the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('emits only the last value of a burst', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: '' } }
    );

    // One keystroke per tick, all inside the quiet period.
    for (const value of ['E', 'EJ', 'EJA']) {
      rerender({ value });
      act(() => {
        jest.advanceTimersByTime(100);
      });
    }
    expect(result.current).toBe('');

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('EJA');
  });

  it('does not emit a value after unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    unmount();

    // The cleanup cleared the pending timer: firing it must not warn about a
    // state update on an unmounted component, nor advance the value.
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('a');
  });
});
