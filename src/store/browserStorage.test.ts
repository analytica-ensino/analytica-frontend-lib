import type { StateStorage } from 'zustand/middleware';

/**
 * The storage is picked when a store module loads, so every case loads the
 * modules fresh with the localStorage it wants to simulate.
 */
const realLocalStorage = globalThis.localStorage;

const setLocalStorage = (value: unknown) => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => value,
  });
};

const loadBrowserStorage = (): (() => StateStorage) => {
  let getBrowserStorage!: () => StateStorage;
  jest.isolateModules(() => {
    ({ getBrowserStorage } = jest.requireActual('./browserStorage'));
  });
  return getBrowserStorage;
};

describe('getBrowserStorage', () => {
  afterEach(() => {
    setLocalStorage(realLocalStorage);
    realLocalStorage.clear();
  });

  it('returns localStorage when it accepts writes, leaving no probe behind', () => {
    const getBrowserStorage = loadBrowserStorage();

    expect(getBrowserStorage()).toBe(realLocalStorage);
    expect(realLocalStorage.length).toBe(0);
  });

  it.each([
    { label: 'null (WebView without DOM storage)', storage: null },
    { label: 'undefined', storage: undefined },
  ])('falls back to memory when localStorage is $label', ({ storage }) => {
    setLocalStorage(storage);
    const getBrowserStorage = loadBrowserStorage();

    const fallback = getBrowserStorage();

    expect(fallback).not.toBe(realLocalStorage);
    fallback.setItem('app-storage', '{"state":{}}');
    expect(fallback.getItem('app-storage')).toBe('{"state":{}}');
    fallback.removeItem('app-storage');
    expect(fallback.getItem('app-storage')).toBeNull();
  });

  it('falls back to memory when reading localStorage throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('denied', 'SecurityError');
      },
    });
    const getBrowserStorage = loadBrowserStorage();

    expect(getBrowserStorage().getItem('anything')).toBeNull();
  });

  it('falls back to memory when localStorage refuses writes', () => {
    setLocalStorage({
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
      removeItem: () => undefined,
    });
    const getBrowserStorage = loadBrowserStorage();

    const fallback = getBrowserStorage();
    fallback.setItem('k', 'v');

    expect(fallback.getItem('k')).toBe('v');
  });

  it('shares one fallback between stores', () => {
    setLocalStorage(null);
    const getBrowserStorage = loadBrowserStorage();

    getBrowserStorage().setItem('shared', '1');

    expect(getBrowserStorage().getItem('shared')).toBe('1');
  });
});

interface ProbeStore {
  setState: (partial: Record<string, unknown>) => void;
  getState: () => Record<string, unknown>;
}

describe('persisted stores without localStorage', () => {
  afterEach(() => {
    setLocalStorage(realLocalStorage);
    realLocalStorage.clear();
  });

  // FRONTEND-LOGIN-WEB-3P: the login screen called initialize on mount and
  // the persist write threw "null is not an object (evaluating 'n.setItem')".
  it('lets the login initialize the app store', () => {
    setLocalStorage(null);
    let useAppStore!: typeof import('./appStore').useAppStore;
    jest.isolateModules(() => {
      ({ useAppStore } = jest.requireActual('./appStore'));
    });

    expect(() =>
      useAppStore.getState().initialize('019c2f70-5c9d-7997-b1bf-dc4e9c26b062')
    ).not.toThrow();
    expect(useAppStore.getState().institutionId).toBe(
      '019c2f70-5c9d-7997-b1bf-dc4e9c26b062'
    );
  });

  // FRONTEND-LOGIN-WEB-3N: stopping the reader on unmount set the TTS status.
  it('lets the accessibility store change the reader status', () => {
    setLocalStorage(null);
    let useAccessibilityStore!: typeof import('./accessibilityStore').useAccessibilityStore;
    jest.isolateModules(() => {
      ({ useAccessibilityStore } = jest.requireActual('./accessibilityStore'));
    });

    expect(() =>
      useAccessibilityStore.getState().setTTSStatus('idle')
    ).not.toThrow();
    expect(useAccessibilityStore.getState().ttsStatus).toBe('idle');
  });

  it.each([
    ['authStore', 'useAuthStore'],
    ['comparatorStore', 'useComparatorStore'],
    ['lessonsStore', 'useLessonsStore'],
    ['mediaPreferencesStore', 'useMediaPreferencesStore'],
    ['modulesStore', 'useModulesStore'],
  ])('lets %s write its state', (moduleName, hookName) => {
    setLocalStorage(null);
    let store!: ProbeStore;
    jest.isolateModules(() => {
      store = jest.requireActual(`./${moduleName}`)[hookName];
    });

    expect(() => store.setState({ __probe: 1 })).not.toThrow();
    expect(store.getState().__probe).toBe(1);
  });

  // userStore is a factory: each app builds it with its own API client.
  it('lets a user store write its state', () => {
    setLocalStorage(null);
    let store!: ProbeStore;
    jest.isolateModules(() => {
      const { createUserStore } = jest.requireActual('./userStore');
      store = createUserStore({ apiClient: { get: jest.fn() } });
    });

    expect(() => store.setState({ __probe: 1 })).not.toThrow();
    expect(store.getState().__probe).toBe(1);
  });
});
