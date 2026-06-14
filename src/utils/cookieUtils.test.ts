import { getCookie, setCookie, removeCookie } from './cookieUtils';

/**
 * Removes every cookie visible to the jsdom document
 */
const clearAllCookies = () => {
  document.cookie.split('; ').forEach((entry) => {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
  });
};

describe('cookieUtils', () => {
  beforeEach(() => {
    clearAllCookies();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCookie / setCookie round-trip', () => {
    it('should write and read a simple value', () => {
      setCookie('my-cookie', 'value');

      expect(getCookie('my-cookie')).toBe('value');
    });

    it('should encode and decode values with special characters', () => {
      const json = '{"state":{"themeMode":"dark"},"version":0}';

      setCookie('theme-store', json);

      expect(getCookie('theme-store')).toBe(json);
    });

    it('should encode and decode values with separators (; and =)', () => {
      const value = 'a=b; c=d';

      setCookie('tricky', value);

      expect(getCookie('tricky')).toBe(value);
    });

    it('should return null for an absent cookie', () => {
      expect(getCookie('missing')).toBeNull();
    });

    it('should not match a cookie whose name is a prefix of another', () => {
      setCookie('theme-store-extra', 'other');

      expect(getCookie('theme-store')).toBeNull();
    });

    it('should return null when the stored value has malformed encoding', () => {
      document.cookie = 'broken=%E0%A4%A';

      expect(getCookie('broken')).toBeNull();
    });
  });

  describe('removeCookie', () => {
    it('should remove an existing cookie', () => {
      setCookie('to-remove', 'value');
      expect(getCookie('to-remove')).toBe('value');

      removeCookie('to-remove');

      expect(getCookie('to-remove')).toBeNull();
    });
  });

  describe('cookie attributes (written string)', () => {
    let cookieSetter: jest.SpyInstance;

    beforeEach(() => {
      cookieSetter = jest
        .spyOn(Document.prototype, 'cookie', 'set')
        .mockImplementation(() => undefined);
    });

    it('should write all provided attributes', () => {
      setCookie('theme-store', 'x', {
        domain: 'analyticaensino.com.br',
        path: '/',
        maxAge: 31536000,
        sameSite: 'Lax',
        secure: true,
      });

      expect(cookieSetter).toHaveBeenCalledWith(
        'theme-store=x; Path=/; Max-Age=31536000; Domain=analyticaensino.com.br; SameSite=Lax; Secure'
      );
    });

    it('should default to Path=/ and SameSite=Lax and omit Domain/Max-Age/Secure', () => {
      setCookie('theme-store', 'x');

      expect(cookieSetter).toHaveBeenCalledWith(
        'theme-store=x; Path=/; SameSite=Lax'
      );
    });

    it('should accept a custom path and sameSite', () => {
      setCookie('theme-store', 'x', { path: '/app', sameSite: 'Strict' });

      expect(cookieSetter).toHaveBeenCalledWith(
        'theme-store=x; Path=/app; SameSite=Strict'
      );
    });

    it('should expire the cookie with Max-Age=0 on removeCookie', () => {
      removeCookie('theme-store', { domain: 'analyticaensino.com.br' });

      expect(cookieSetter).toHaveBeenCalledWith(
        'theme-store=; Path=/; Max-Age=0; Domain=analyticaensino.com.br; SameSite=Lax'
      );
    });
  });
});
