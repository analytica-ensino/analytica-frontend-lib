import type { StateStorage } from 'zustand/middleware';

/** Key written and removed once to prove the storage accepts writes */
const PROBE_KEY = '__analytica_storage_probe__';

/**
 * In-memory stand-in for localStorage: the state lives while the page does.
 *
 * @returns A fresh StateStorage backed by a Map
 */
const createMemoryStorage = (): StateStorage => {
  const items = new Map<string, string>();
  return {
    getItem: (name) => items.get(name) ?? null,
    setItem: (name, value) => {
      items.set(name, value);
    },
    removeItem: (name) => {
      items.delete(name);
    },
  };
};

/** One fallback for every store, so stores that share a key see each other */
let memoryFallback: StateStorage | undefined;

/**
 * Returns localStorage when the browser gives a usable one, or an in-memory
 * stand-in otherwise, for zustand's `createJSONStorage`.
 *
 * `createJSONStorage(() => localStorage)` only guards a getter that throws. An
 * Android WebView without DOM storage, and some Safari setups, hand back
 * `null` instead, and the first write crashed the whole page with
 * "null is not an object (evaluating 'n.setItem')" — the login screen on
 * `initialize` (FRONTEND-LOGIN-WEB-3P) and the accessibility store on
 * `setTTSStatus` (FRONTEND-LOGIN-WEB-3N). Storage that exists but refuses
 * writes (quota, old private mode) is caught by a probe write.
 *
 * Without storage nothing survives a reload, which is no worse than the crash
 * and keeps the page usable.
 *
 * @returns localStorage, or the shared in-memory fallback
 *
 * @example
 * ```typescript
 * persist(creator, {
 *   name: 'app-storage',
 *   storage: createJSONStorage(getBrowserStorage),
 * });
 * ```
 */
export const getBrowserStorage = (): StateStorage => {
  try {
    const storage = globalThis.localStorage;
    if (storage) {
      storage.setItem(PROBE_KEY, PROBE_KEY);
      storage.removeItem(PROBE_KEY);
      return storage;
    }
  } catch {
    // Disabled or full: fall through to memory
  }
  memoryFallback ??= createMemoryStorage();
  return memoryFallback;
};
