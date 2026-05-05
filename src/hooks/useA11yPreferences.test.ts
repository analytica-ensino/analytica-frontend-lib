import { renderHook, act } from '@testing-library/react';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  ColorBlindMode,
} from '../store/accessibilityStore';
import { useA11yPreferences, __testing } from './useA11yPreferences';

const { buildClassMap, syncDom, ALL_A11Y_CLASSES } = __testing;

describe('useA11yPreferences', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
    document.documentElement.className = '';
  });

  it('does not add any a11y class when preferences are default', () => {
    renderHook(() => useA11yPreferences());

    ALL_A11Y_CLASSES.forEach((cls) => {
      expect(document.documentElement.classList.contains(cls)).toBe(false);
    });
  });

  it('applies the high-contrast class when contrastMode = high', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      useAccessibilityStore.getState().setContrastMode('high');
    });

    expect(
      document.documentElement.classList.contains('a11y-contrast-high')
    ).toBe(true);
  });

  it.each([
    [ColorBlindMode.Protanopia, 'a11y-cb-protanopia'],
    [ColorBlindMode.Deuteranopia, 'a11y-cb-deuteranopia'],
    [ColorBlindMode.Tritanopia, 'a11y-cb-tritanopia'],
  ] as const)(
    'applies the correct colorblind class for %s',
    (mode, expectedClass) => {
      renderHook(() => useA11yPreferences());

      act(() => {
        useAccessibilityStore.getState().setColorBlindMode(mode);
      });

      expect(document.documentElement.classList.contains(expectedClass)).toBe(
        true
      );
    }
  );

  it('removes colorblind class when mode returns to none', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      useAccessibilityStore
        .getState()
        .setColorBlindMode(ColorBlindMode.Protanopia);
    });
    expect(
      document.documentElement.classList.contains('a11y-cb-protanopia')
    ).toBe(true);

    act(() => {
      useAccessibilityStore.getState().setColorBlindMode(ColorBlindMode.None);
    });
    expect(
      document.documentElement.classList.contains('a11y-cb-protanopia')
    ).toBe(false);
  });

  it('replaces previous contrast class when mode changes', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      useAccessibilityStore.getState().setContrastMode('high');
    });
    act(() => {
      useAccessibilityStore.getState().setContrastMode('inverted');
    });

    expect(
      document.documentElement.classList.contains('a11y-contrast-high')
    ).toBe(false);
    expect(
      document.documentElement.classList.contains('a11y-contrast-inverted')
    ).toBe(true);
  });

  it('applies discrete level classes for fontSize, letterSpacing and lineSpacing', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      const s = useAccessibilityStore.getState();
      s.setFontSize(2);
      s.setLetterSpacing(1);
      s.setLineSpacing(3);
    });

    const classes = document.documentElement.classList;
    expect(classes.contains('a11y-font-2')).toBe(true);
    expect(classes.contains('a11y-letter-spacing-1')).toBe(true);
    expect(classes.contains('a11y-line-spacing-3')).toBe(true);
  });

  it('removes level class when value returns to 0', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      useAccessibilityStore.getState().setFontSize(2);
    });
    expect(document.documentElement.classList.contains('a11y-font-2')).toBe(
      true
    );

    act(() => {
      useAccessibilityStore.getState().setFontSize(0);
    });
    expect(document.documentElement.classList.contains('a11y-font-2')).toBe(
      false
    );
  });

  it('toggles boolean classes', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      const s = useAccessibilityStore.getState();
      s.setHighlightLinks(true);
      s.setPauseAnimations(true);
      s.setBigCursor(true);
      s.setDyslexiaFont(true);
    });

    expect(
      document.documentElement.classList.contains('a11y-highlight-links')
    ).toBe(true);
    expect(
      document.documentElement.classList.contains('a11y-no-animations')
    ).toBe(true);
    expect(document.documentElement.classList.contains('a11y-big-cursor')).toBe(
      true
    );
    expect(
      document.documentElement.classList.contains('a11y-dyslexia-font')
    ).toBe(true);

    act(() => {
      useAccessibilityStore.getState().setHighlightLinks(false);
      useAccessibilityStore.getState().setDyslexiaFont(false);
    });
    expect(
      document.documentElement.classList.contains('a11y-highlight-links')
    ).toBe(false);
    expect(
      document.documentElement.classList.contains('a11y-dyslexia-font')
    ).toBe(false);
  });

  it('clears all a11y classes after resetPreferences', () => {
    renderHook(() => useA11yPreferences());

    act(() => {
      const s = useAccessibilityStore.getState();
      s.setContrastMode('high');
      s.setFontSize(3);
      s.setHighlightLinks(true);
      s.setBigCursor(true);
    });

    act(() => {
      useAccessibilityStore.getState().resetPreferences();
    });

    ALL_A11Y_CLASSES.forEach((cls) => {
      expect(document.documentElement.classList.contains(cls)).toBe(false);
    });
  });

  describe('buildClassMap helper', () => {
    it('returns undefined for normal/zero values', () => {
      const map = buildClassMap(DEFAULT_ACCESSIBILITY_PREFERENCES);
      expect(map.contrastMode).toBeUndefined();
      expect(map.saturationMode).toBeUndefined();
      expect(map.fontSize).toBeUndefined();
      expect(map.highlightLinks).toBeUndefined();
    });

    it('returns the expected class for each non-default value', () => {
      const map = buildClassMap({
        ...DEFAULT_ACCESSIBILITY_PREFERENCES,
        contrastMode: 'high',
        saturationMode: 'low',
        fontSize: 2,
        highlightLinks: true,
        pauseAnimations: true,
        bigCursor: true,
      });
      expect(map.contrastMode).toBe('a11y-contrast-high');
      expect(map.saturationMode).toBe('a11y-saturation-low');
      expect(map.fontSize).toBe('a11y-font-2');
      expect(map.highlightLinks).toBe('a11y-highlight-links');
      expect(map.pauseAnimations).toBe('a11y-no-animations');
      expect(map.bigCursor).toBe('a11y-big-cursor');
    });
  });

  describe('syncDom helper', () => {
    it('is a no-op when document is undefined', () => {
      const original = globalThis.document;
      // @ts-expect-error — exercising the SSR guard
      delete globalThis.document;
      expect(() => syncDom(DEFAULT_ACCESSIBILITY_PREFERENCES)).not.toThrow();
      globalThis.document = original;
    });
  });
});
