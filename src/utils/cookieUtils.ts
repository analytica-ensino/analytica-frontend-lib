/**
 * Options for writing a cookie
 */
export interface CookieOptions {
  /**
   * Cookie Domain attribute; omitted when undefined (host-only cookie)
   */
  domain?: string;
  /**
   * Cookie Path attribute (default '/')
   */
  path?: string;
  /**
   * Max-Age in seconds
   */
  maxAge?: number;
  /**
   * SameSite attribute (default 'Lax')
   */
  sameSite?: 'Lax' | 'Strict' | 'None';
  /**
   * Adds the Secure attribute when true
   */
  secure?: boolean;
}

/**
 * Reads a cookie value by name
 *
 * @param name - The cookie name
 * @returns The decoded cookie value, or null when absent or malformed
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null; // malformed percent-encoding
  }
};

/**
 * Writes a cookie with the given options
 *
 * @param name - The cookie name
 * @param value - The cookie value (URL-encoded before writing)
 * @param options - Cookie attributes (domain, path, maxAge, sameSite, secure)
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  if (options.secure) {
    parts.push('Secure');
  }
  document.cookie = parts.join('; ');
};

/**
 * Removes a cookie by expiring it immediately
 *
 * @param name - The cookie name
 * @param options - Domain and path must match the cookie being removed
 */
export const removeCookie = (
  name: string,
  options: Pick<CookieOptions, 'domain' | 'path'> = {}
): void => {
  setCookie(name, '', { ...options, maxAge: 0 });
};
