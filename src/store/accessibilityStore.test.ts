import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  ColorBlindMode,
  getColorBlindClass,
  getColorBlindFilterId,
} from './accessibilityStore';

describe('accessibilityStore', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
  });

  it('starts with default preferences', () => {
    const state = useAccessibilityStore.getState();
    expect(state.contrastMode).toBe('normal');
    expect(state.saturationMode).toBe('normal');
    expect(state.fontSize).toBe(0);
    expect(state.letterSpacing).toBe(0);
    expect(state.lineSpacing).toBe(0);
    expect(state.highlightLinks).toBe(false);
    expect(state.pauseAnimations).toBe(false);
    expect(state.bigCursor).toBe(false);
    expect(state.dyslexiaFont).toBe(false);
    expect(state.readingAid).toBe('none');
    expect(state.keyboardShortcut).toBe(true);
    expect(state.colorBlindMode).toBe(ColorBlindMode.None);
    expect(state.isPanelOpen).toBe(false);
  });

  it('updates Phase 2 preferences', () => {
    const {
      setDyslexiaFont,
      setReadingAid,
      setKeyboardShortcut,
      setColorBlindMode,
    } = useAccessibilityStore.getState();
    setDyslexiaFont(true);
    setReadingAid('ruler');
    setKeyboardShortcut(false);
    setColorBlindMode(ColorBlindMode.Deuteranopia);

    const state = useAccessibilityStore.getState();
    expect(state.dyslexiaFont).toBe(true);
    expect(state.readingAid).toBe('ruler');
    expect(state.keyboardShortcut).toBe(false);
    expect(state.colorBlindMode).toBe(ColorBlindMode.Deuteranopia);
  });

  describe('color blind helpers', () => {
    it('getColorBlindClass returns null for None and prefixed class otherwise', () => {
      expect(getColorBlindClass(ColorBlindMode.None)).toBeNull();
      expect(getColorBlindClass(ColorBlindMode.Protanopia)).toBe(
        'a11y-cb-protanopia'
      );
      expect(getColorBlindClass(ColorBlindMode.Deuteranopia)).toBe(
        'a11y-cb-deuteranopia'
      );
      expect(getColorBlindClass(ColorBlindMode.Tritanopia)).toBe(
        'a11y-cb-tritanopia'
      );
    });

    it('getColorBlindFilterId mirrors the class name (kept in sync)', () => {
      expect(getColorBlindFilterId(ColorBlindMode.Protanopia)).toBe(
        'a11y-cb-protanopia'
      );
      expect(getColorBlindFilterId(ColorBlindMode.Deuteranopia)).toBe(
        'a11y-cb-deuteranopia'
      );
      expect(getColorBlindFilterId(ColorBlindMode.Tritanopia)).toBe(
        'a11y-cb-tritanopia'
      );
    });
  });

  it('updates contrast mode', () => {
    useAccessibilityStore.getState().setContrastMode('high');
    expect(useAccessibilityStore.getState().contrastMode).toBe('high');
  });

  it('updates saturation mode', () => {
    useAccessibilityStore.getState().setSaturationMode('grayscale');
    expect(useAccessibilityStore.getState().saturationMode).toBe('grayscale');
  });

  it('updates discrete level preferences', () => {
    const { setFontSize, setLetterSpacing, setLineSpacing } =
      useAccessibilityStore.getState();
    setFontSize(2);
    setLetterSpacing(3);
    setLineSpacing(1);

    const state = useAccessibilityStore.getState();
    expect(state.fontSize).toBe(2);
    expect(state.letterSpacing).toBe(3);
    expect(state.lineSpacing).toBe(1);
  });

  it('toggles boolean preferences', () => {
    const { setHighlightLinks, setPauseAnimations, setBigCursor } =
      useAccessibilityStore.getState();
    setHighlightLinks(true);
    setPauseAnimations(true);
    setBigCursor(true);

    const state = useAccessibilityStore.getState();
    expect(state.highlightLinks).toBe(true);
    expect(state.pauseAnimations).toBe(true);
    expect(state.bigCursor).toBe(true);
  });

  it('opens, closes and toggles the panel', () => {
    const { openPanel, closePanel, togglePanel } =
      useAccessibilityStore.getState();

    openPanel();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(true);

    closePanel();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);

    togglePanel();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(true);
    togglePanel();
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);
  });

  it('resets preferences to defaults', () => {
    const store = useAccessibilityStore.getState();
    store.setContrastMode('inverted');
    store.setFontSize(3);
    store.setHighlightLinks(true);
    store.setBigCursor(true);

    store.resetPreferences();

    const state = useAccessibilityStore.getState();
    expect(state.contrastMode).toBe('normal');
    expect(state.fontSize).toBe(0);
    expect(state.highlightLinks).toBe(false);
    expect(state.bigCursor).toBe(false);
  });
});
