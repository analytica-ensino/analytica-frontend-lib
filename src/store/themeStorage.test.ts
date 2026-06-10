import { themeCookieStorage } from './themeStorage';

const STORE_KEY = 'theme-store';
const DARK_ENVELOPE = '{"state":{"themeMode":"dark"},"version":0}';
const LIGHT_ENVELOPE = '{"state":{"themeMode":"light"},"version":0}';

/**
 * Clears the theme cookie and localStorage entry between tests
 */
const clearPersistedTheme = () => {
  document.cookie = `${STORE_KEY}=; Max-Age=0; Path=/`;
  globalThis.localStorage.removeItem(STORE_KEY);
};

describe('themeCookieStorage', () => {
  beforeEach(() => {
    clearPersistedTheme();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getItem', () => {
    it('should return null when neither cookie nor localStorage exist', () => {
      expect(themeCookieStorage.getItem(STORE_KEY)).toBeNull();
    });

    it('should read from the cookie when present', () => {
      document.cookie = `${STORE_KEY}=${encodeURIComponent(DARK_ENVELOPE)}; Path=/`;

      expect(themeCookieStorage.getItem(STORE_KEY)).toBe(DARK_ENVELOPE);
    });

    it('should prefer the cookie over a diverging localStorage value', () => {
      document.cookie = `${STORE_KEY}=${encodeURIComponent(DARK_ENVELOPE)}; Path=/`;
      globalThis.localStorage.setItem(STORE_KEY, LIGHT_ENVELOPE);

      expect(themeCookieStorage.getItem(STORE_KEY)).toBe(DARK_ENVELOPE);
    });

    it('should fall back to localStorage when the cookie is absent (legacy users)', () => {
      globalThis.localStorage.setItem(STORE_KEY, DARK_ENVELOPE);

      expect(themeCookieStorage.getItem(STORE_KEY)).toBe(DARK_ENVELOPE);
    });

    it('should return null for a corrupted (non-JSON) value', () => {
      document.cookie = `${STORE_KEY}=garbage; Path=/`;

      expect(themeCookieStorage.getItem(STORE_KEY)).toBeNull();
    });

    it('should not throw when localStorage access fails', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(themeCookieStorage.getItem(STORE_KEY)).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should write to both the cookie and localStorage', () => {
      themeCookieStorage.setItem(STORE_KEY, DARK_ENVELOPE);

      expect(document.cookie).toContain(
        `${STORE_KEY}=${encodeURIComponent(DARK_ENVELOPE)}`
      );
      expect(globalThis.localStorage.getItem(STORE_KEY)).toBe(DARK_ENVELOPE);
    });

    it('should not throw when localStorage write fails (cookie remains source of truth)', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(() =>
        themeCookieStorage.setItem(STORE_KEY, DARK_ENVELOPE)
      ).not.toThrow();
      expect(document.cookie).toContain(
        `${STORE_KEY}=${encodeURIComponent(DARK_ENVELOPE)}`
      );
    });
  });

  describe('removeItem', () => {
    it('should remove both the cookie and the localStorage entry', () => {
      themeCookieStorage.setItem(STORE_KEY, DARK_ENVELOPE);

      themeCookieStorage.removeItem(STORE_KEY);

      expect(document.cookie).not.toContain(`${STORE_KEY}=`);
      expect(globalThis.localStorage.getItem(STORE_KEY)).toBeNull();
    });

    it('should not throw when localStorage removal fails', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });

      expect(() => themeCookieStorage.removeItem(STORE_KEY)).not.toThrow();
    });
  });
});
