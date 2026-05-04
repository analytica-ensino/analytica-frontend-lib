import { renderHook, act } from '@testing-library/react';
import { useA11yKeyboardShortcut } from './useA11yKeyboardShortcut';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../store/accessibilityStore';

const fireAltA = (target: EventTarget = window) => {
  const event = new KeyboardEvent('keydown', {
    key: 'a',
    altKey: true,
    bubbles: true,
    cancelable: true,
  });
  // Override target — KeyboardEvent constructor doesn't expose it
  Object.defineProperty(event, 'target', { value: target, writable: false });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
};

describe('useA11yKeyboardShortcut', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
  });

  it('toggles the panel when Alt+A is pressed and shortcut is enabled', () => {
    renderHook(() => useA11yKeyboardShortcut());

    fireAltA();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(true);

    fireAltA();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);
  });

  it('does nothing when keyboardShortcut is disabled', () => {
    useAccessibilityStore.setState({ keyboardShortcut: false });
    renderHook(() => useA11yKeyboardShortcut());

    fireAltA();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);
  });

  it('ignores Alt+A when focus is in an input field', () => {
    renderHook(() => useA11yKeyboardShortcut());

    const input = document.createElement('input');
    document.body.appendChild(input);

    fireAltA(input);
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);

    input.remove();
  });

  it('ignores Alt+A when focus is in a textarea', () => {
    renderHook(() => useA11yKeyboardShortcut());

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    fireAltA(textarea);
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);

    textarea.remove();
  });

  it('removes the listener when unmounted', () => {
    const { unmount } = renderHook(() => useA11yKeyboardShortcut());
    unmount();

    fireAltA();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);
  });
});
