import {
  DEFAULT_MEDIA_VOLUME,
  UNMUTE_FALLBACK_VOLUME,
  useMediaPreferencesStore,
} from './mediaPreferencesStore';

const STORAGE_KEY = '@media-preferences:analytica:v1';

const resetStore = () => {
  localStorage.clear();
  useMediaPreferencesStore.setState({
    volume: DEFAULT_MEDIA_VOLUME,
    isMuted: false,
  });
  localStorage.clear();
};

describe('mediaPreferencesStore', () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it('should start at full volume and unmuted', () => {
    const { volume, isMuted } = useMediaPreferencesStore.getState();

    expect(volume).toBe(1);
    expect(isMuted).toBe(false);
  });

  it('should expose a non-zero fallback volume for unmuting', () => {
    expect(UNMUTE_FALLBACK_VOLUME).toBeGreaterThan(0);
    expect(UNMUTE_FALLBACK_VOLUME).toBeLessThanOrEqual(1);
  });

  it('should store the chosen volume', () => {
    useMediaPreferencesStore.getState().setVolume(0.35);

    expect(useMediaPreferencesStore.getState().volume).toBeCloseTo(0.35);
  });

  it.each([
    [2, 1],
    [-1, 0],
  ])('should clamp %p to %p', (input, expected) => {
    useMediaPreferencesStore.getState().setVolume(input);

    expect(useMediaPreferencesStore.getState().volume).toBe(expected);
  });

  it('should fall back to the default volume for non-finite values', () => {
    useMediaPreferencesStore.getState().setVolume(0.2);
    useMediaPreferencesStore.getState().setVolume(Number.NaN);

    expect(useMediaPreferencesStore.getState().volume).toBe(
      DEFAULT_MEDIA_VOLUME
    );
  });

  it('should store the muted state', () => {
    useMediaPreferencesStore.getState().setIsMuted(true);

    expect(useMediaPreferencesStore.getState().isMuted).toBe(true);
  });

  it('should persist volume and mute in localStorage', () => {
    useMediaPreferencesStore.getState().setVolume(0.6);
    useMediaPreferencesStore.getState().setIsMuted(true);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).state).toEqual({
      volume: 0.6,
      isMuted: true,
    });
  });

  it('should rehydrate a previously saved preference', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { volume: 0.15, isMuted: true }, version: 0 })
    );

    await useMediaPreferencesStore.persist.rehydrate();

    expect(useMediaPreferencesStore.getState().volume).toBeCloseTo(0.15);
    expect(useMediaPreferencesStore.getState().isMuted).toBe(true);
  });

  it('should sanitize a corrupted persisted preference', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { volume: 'loud', isMuted: 'yes' }, version: 0 })
    );

    await useMediaPreferencesStore.persist.rehydrate();

    expect(useMediaPreferencesStore.getState().volume).toBe(
      DEFAULT_MEDIA_VOLUME
    );
    expect(useMediaPreferencesStore.getState().isMuted).toBe(false);
  });

  it('should keep the default volume when the persisted value is absent', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { isMuted: true }, version: 0 })
    );

    await useMediaPreferencesStore.persist.rehydrate();

    expect(useMediaPreferencesStore.getState().volume).toBe(
      DEFAULT_MEDIA_VOLUME
    );
    expect(useMediaPreferencesStore.getState().isMuted).toBe(true);
  });
});
