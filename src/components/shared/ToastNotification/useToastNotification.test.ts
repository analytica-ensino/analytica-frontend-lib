import { renderHook, act } from '@testing-library/react';
import { useToastNotification } from './useToastNotification';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useToastNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with closed toast', () => {
    const { result } = renderHook(() => useToastNotification());

    expect(result.current.toastState.isOpen).toBe(false);
    expect(result.current.toastState.title).toBe('');
    expect(result.current.toastState.action).toBe('success');
  });

  it('should show success toast', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.toastState.isOpen).toBe(true);
    expect(result.current.toastState.title).toBe('Success message');
    expect(result.current.toastState.action).toBe('success');
  });

  it('should show error toast', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showError('Error message');
    });

    expect(result.current.toastState.isOpen).toBe(true);
    expect(result.current.toastState.title).toBe('Error message');
    expect(result.current.toastState.action).toBe('warning');
  });

  it('should show info toast', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showInfo('Info message');
    });

    expect(result.current.toastState.isOpen).toBe(true);
    expect(result.current.toastState.title).toBe('Info message');
    expect(result.current.toastState.action).toBe('info');
  });

  it('should show toast with description', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Title', 'Description text');
    });

    expect(result.current.toastState.title).toBe('Title');
    expect(result.current.toastState.description).toBe('Description text');
  });

  it('should auto-dismiss toast after default duration (3000ms)', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toastState.isOpen).toBe(false);
  });

  it('should auto-dismiss toast after custom duration', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Success message', undefined, 5000);
    });

    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toastState.isOpen).toBe(false);
  });

  it('should manually hide toast', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      result.current.hideToast();
    });

    expect(result.current.toastState.isOpen).toBe(false);
  });

  it('should not auto-dismiss when duration is 0', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('Success message', undefined, 0);
    });

    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.toastState.isOpen).toBe(true);
  });

  it('should replace previous toast when showing new one', () => {
    const { result } = renderHook(() => useToastNotification());

    act(() => {
      result.current.showSuccess('First message');
    });

    expect(result.current.toastState.title).toBe('First message');
    expect(result.current.toastState.action).toBe('success');

    act(() => {
      result.current.showError('Second message');
    });

    expect(result.current.toastState.title).toBe('Second message');
    expect(result.current.toastState.action).toBe('warning');
  });

  it('should handle multiple show/hide cycles', () => {
    const { result } = renderHook(() => useToastNotification());

    // First cycle
    act(() => {
      result.current.showSuccess('Message 1');
    });
    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      result.current.hideToast();
    });
    expect(result.current.toastState.isOpen).toBe(false);

    // Second cycle
    act(() => {
      result.current.showError('Message 2');
    });
    expect(result.current.toastState.isOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toastState.isOpen).toBe(false);
  });
});
