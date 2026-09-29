import {
  SIDE_PANEL_DEFAULT_WIDTH,
  clampPanelWidth,
  useLayoutPreferencesStore,
} from './layoutPreferencesStore';

const STORAGE_KEY = '@layout-preferences:analytica:v1';

const resetStore = () => {
  localStorage.clear();
  useLayoutPreferencesStore.setState({
    widths: {
      activity: {
        filters: SIDE_PANEL_DEFAULT_WIDTH,
        preview: SIDE_PANEL_DEFAULT_WIDTH,
      },
      lesson: {
        filters: SIDE_PANEL_DEFAULT_WIDTH,
        preview: SIDE_PANEL_DEFAULT_WIDTH,
      },
    },
  });
  localStorage.clear();
};

describe('layoutPreferencesStore', () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  describe('clampPanelWidth', () => {
    it('should keep a valid width', () => {
      expect(clampPanelWidth(640)).toBe(640);
    });

    it('should round fractional widths', () => {
      expect(clampPanelWidth(512.6)).toBe(513);
    });

    it.each([
      ['abaixo do mínimo', 120],
      ['negativo', -80],
      ['zero', 0],
    ])('should raise a width %s to the default', (_label, value) => {
      expect(clampPanelWidth(value)).toBe(SIDE_PANEL_DEFAULT_WIDTH);
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['uma string não numérica', 'abc'],
      ['um objeto', {}],
    ])('should fall back to the default for %s', (_label, value) => {
      expect(clampPanelWidth(value)).toBe(SIDE_PANEL_DEFAULT_WIDTH);
    });

    it('should accept a numeric string', () => {
      expect(clampPanelWidth('520')).toBe(520);
    });
  });

  it('should start both screens at the default width', () => {
    const { widths } = useLayoutPreferencesStore.getState();

    expect(widths.activity).toEqual({
      filters: SIDE_PANEL_DEFAULT_WIDTH,
      preview: SIDE_PANEL_DEFAULT_WIDTH,
    });
    expect(widths.lesson).toEqual({
      filters: SIDE_PANEL_DEFAULT_WIDTH,
      preview: SIDE_PANEL_DEFAULT_WIDTH,
    });
  });

  it('should store the chosen width', () => {
    useLayoutPreferencesStore
      .getState()
      .setPanelWidth('activity', 'preview', 620);

    expect(useLayoutPreferencesStore.getState().widths.activity.preview).toBe(
      620
    );
  });

  it('should refuse a width below the default', () => {
    useLayoutPreferencesStore
      .getState()
      .setPanelWidth('activity', 'preview', 250);

    expect(useLayoutPreferencesStore.getState().widths.activity.preview).toBe(
      SIDE_PANEL_DEFAULT_WIDTH
    );
  });

  it('should keep the two screens independent', () => {
    useLayoutPreferencesStore
      .getState()
      .setPanelWidth('activity', 'preview', 700);

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.activity.preview).toBe(700);
    expect(widths.lesson.preview).toBe(SIDE_PANEL_DEFAULT_WIDTH);
  });

  it('should keep the two panels of a screen independent', () => {
    useLayoutPreferencesStore
      .getState()
      .setPanelWidth('lesson', 'filters', 560);

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.lesson.filters).toBe(560);
    expect(widths.lesson.preview).toBe(SIDE_PANEL_DEFAULT_WIDTH);
  });

  it('should reset a panel back to the default', () => {
    const store = useLayoutPreferencesStore.getState();
    store.setPanelWidth('activity', 'filters', 720);
    store.resetPanelWidth('activity', 'filters');

    expect(useLayoutPreferencesStore.getState().widths.activity.filters).toBe(
      SIDE_PANEL_DEFAULT_WIDTH
    );
  });

  it('should reset only the requested panel', () => {
    const store = useLayoutPreferencesStore.getState();
    store.setPanelWidth('activity', 'filters', 720);
    store.setPanelWidth('activity', 'preview', 680);
    store.resetPanelWidth('activity', 'filters');

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.activity.filters).toBe(SIDE_PANEL_DEFAULT_WIDTH);
    expect(widths.activity.preview).toBe(680);
  });

  it('should persist the widths in localStorage', () => {
    useLayoutPreferencesStore
      .getState()
      .setPanelWidth('lesson', 'preview', 540);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.state.widths.lesson.preview).toBe(540);
  });

  it('should rehydrate previously saved widths', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          widths: {
            activity: { filters: 480, preview: 640 },
            lesson: { filters: 520, preview: 500 },
          },
        },
        version: 0,
      })
    );

    await useLayoutPreferencesStore.persist.rehydrate();

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.activity).toEqual({ filters: 480, preview: 640 });
    expect(widths.lesson).toEqual({ filters: 520, preview: 500 });
  });

  it('should sanitize corrupted persisted widths', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          widths: {
            activity: { filters: 'abc', preview: -5 },
            lesson: { filters: null },
          },
        },
        version: 0,
      })
    );

    await useLayoutPreferencesStore.persist.rehydrate();

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.activity).toEqual({
      filters: SIDE_PANEL_DEFAULT_WIDTH,
      preview: SIDE_PANEL_DEFAULT_WIDTH,
    });
    expect(widths.lesson).toEqual({
      filters: SIDE_PANEL_DEFAULT_WIDTH,
      preview: SIDE_PANEL_DEFAULT_WIDTH,
    });
  });

  it('should fall back to the defaults when the persisted widths are absent', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: {}, version: 0 })
    );

    await useLayoutPreferencesStore.persist.rehydrate();

    const { widths } = useLayoutPreferencesStore.getState();
    expect(widths.activity.filters).toBe(SIDE_PANEL_DEFAULT_WIDTH);
    expect(widths.lesson.preview).toBe(SIDE_PANEL_DEFAULT_WIDTH);
  });
});
