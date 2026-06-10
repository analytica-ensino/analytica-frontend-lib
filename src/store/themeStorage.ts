import type { StateStorage } from 'zustand/middleware';
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtils';
import { resolveRootHostname } from '../utils/domainUtils';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Resolves the cookie Domain attribute for the current location.
 * Returns undefined on localhost / IP literals so the cookie stays host-only.
 *
 * @returns The root domain for the cookie, or undefined
 */
const cookieDomain = (): string | undefined =>
  resolveRootHostname(globalThis.location.hostname) ?? undefined;

/**
 * Reads a value from localStorage without throwing
 * (storage can be disabled in privacy mode or sandboxed iframes)
 *
 * @param name - The storage key
 * @returns The stored value, or null when absent or unavailable
 */
const readLocalStorage = (name: string): string | null => {
  try {
    return globalThis.localStorage.getItem(name);
  } catch {
    return null;
  }
};

/**
 * Returns the value only when it contains valid JSON, null otherwise
 * (guards against corrupted persisted values)
 *
 * @param raw - The raw persisted value, or null when absent
 * @returns The same value when it is valid JSON, or null
 */
const validJsonOrNull = (raw: string | null): string | null => {
  if (raw === null) {
    return null;
  }
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return null;
  }
};

/**
 * Zustand StateStorage that persists theme state in a cookie scoped to the
 * root domain, so the login app (root domain) and the profile apps
 * (subdomains) all share the chosen theme. Reads fall back to localStorage
 * for users that persisted the theme before the cookie storage existed, and
 * writes go to both stores for backward compatibility with older library
 * versions that read only localStorage.
 */
export const themeCookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') {
      return null;
    }
    // A corrupted cookie must not block the localStorage fallback
    return (
      validJsonOrNull(getCookie(name)) ??
      validJsonOrNull(readLocalStorage(name))
    );
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') {
      return;
    }
    setCookie(name, value, {
      domain: cookieDomain(),
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
      sameSite: 'Lax',
      secure: globalThis.location.protocol === 'https:',
    });
    try {
      globalThis.localStorage.setItem(name, value);
    } catch {
      // localStorage unavailable; the cookie is the source of truth
    }
  },
  removeItem: (name: string): void => {
    if (typeof document === 'undefined') {
      return;
    }
    removeCookie(name, { domain: cookieDomain(), path: '/' });
    try {
      globalThis.localStorage.removeItem(name);
    } catch {
      // ignore: nothing to clean up when storage is unavailable
    }
  },
};
