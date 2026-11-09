import { useMediaPreferencesStore } from './mediaPreferencesStore';

const STORAGE_KEY = '@media-preferences:analytica:v1';

const rehydrateWith = async (state: Record<string, unknown>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }));
  await useMediaPreferencesStore.persist.rehydrate();
  return useMediaPreferencesStore.getState();
};

describe('mediaPreferencesStore: controles de lista', () => {
  beforeEach(() => {
    localStorage.clear();
    useMediaPreferencesStore.setState({
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',
    });
  });

  it('salva as escolhas no aparelho', () => {
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

  it.each(['repeat-video', 'back-to-start'])('restaura %s', async (value) => {
    const state = await rehydrateWith({
      queueShuffle: true,
      queueRepeatList: true,
      videoEndBehavior: value,
    });

    expect(state.queueShuffle).toBe(true);
    expect(state.queueRepeatList).toBe(true);
    expect(state.videoEndBehavior).toBe(value);
  });

  it('descarta valores inválidos do storage', async () => {
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
