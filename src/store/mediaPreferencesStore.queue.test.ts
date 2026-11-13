import { useMediaPreferencesStore } from './mediaPreferencesStore';

const STORAGE_KEY = '@media-preferences:analytica:v1';

const rehydrateWith = async (state: Record<string, unknown>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }));
  await useMediaPreferencesStore.persist.rehydrate();
  return useMediaPreferencesStore.getState();
};

describe('mediaPreferencesStore: list controls', () => {
  beforeEach(() => {
    localStorage.clear();
    useMediaPreferencesStore.setState({
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',
    });
  });

  it('saves the choices on the device', () => {
    const store = useMediaPreferencesStore.getState();
    store.setQueueShuffle(true);
    store.setQueueRepeatList(true);
    store.setVideoEndBehavior('back-to-start');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) as string).state;
    expect(saved).toMatchObject({
      queueShuffle: true,
      queueRepeatList: true,
      videoEndBehavior: 'back-to-start',
    });
  });

  it.each(['repeat-video', 'back-to-start'])('restores %s', async (value) => {
    const state = await rehydrateWith({
      queueShuffle: true,
      queueRepeatList: true,
      videoEndBehavior: value,
    });

    expect(state.queueShuffle).toBe(true);
    expect(state.queueRepeatList).toBe(true);
    expect(state.videoEndBehavior).toBe(value);
  });

  it('saves and restores cinema mode', async () => {
    useMediaPreferencesStore.getState().setCinemaMode(true);
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY) as string).state.cinemaMode
    ).toBe(true);

    const state = await rehydrateWith({ cinemaMode: true });
    expect(state.cinemaMode).toBe(true);
  });

  it('discards invalid values from storage', async () => {
    const state = await rehydrateWith({
      queueShuffle: 'sim',
      queueRepeatList: 1,
      videoEndBehavior: 'outro',
    });

    expect(state.queueShuffle).toBe(false);
    expect(state.queueRepeatList).toBe(false);
    expect(state.videoEndBehavior).toBe('none');
  });
});
