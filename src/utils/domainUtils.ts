/**
 * Resolves the root hostname shared by all application subdomains.
 * Mirrors the subdomain rules used by `getRootDomain` (Auth), without
 * protocol or port. Useful for the cookie `Domain` attribute so that a
 * cookie set on a subdomain is visible on the root domain and vice versa.
 *
 * @param hostname - The hostname to resolve (e.g. window.location.hostname)
 * @returns The root hostname, or null for localhost / IP literals
 *          (callers should omit the cookie Domain attribute in that case)
 *
 * @example
 * ```typescript
 * resolveRootHostname('aluno.analyticaensino.com.br'); // 'analyticaensino.com.br'
 * resolveRootHostname('aluno.hml.analyticaensino.com.br'); // 'hml.analyticaensino.com.br'
 * resolveRootHostname('sub.example.com'); // 'example.com'
 * resolveRootHostname('localhost'); // null
 * resolveRootHostname('127.0.0.1'); // null
 * ```
 */
export const resolveRootHostname = (hostname: string): string | null => {
  if (hostname === 'localhost') {
    return null;
  }

  // IP literals: no subdomain logic applies
  const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
  const isIPv6 = hostname.includes(':'); // simple check is sufficient here
  if (isIPv4 || isIPv6) {
    return null;
  }

  const parts = hostname.split('.');
  // Label-based detection: matches 'hml' and 'hml-*' labels (e.g. hml-aluno)
  // without false positives on substrings like 'html'
  const isHml = parts.some(
    (label) => label === 'hml' || label.startsWith('hml-')
  );

  // Handle Brazilian .com.br domains and similar patterns.
  // Use index access rather than Array.prototype.at(): `.at()` is unsupported
  // on older mobile browsers (e.g. Chrome < 92 on Android 7) and threw
  // "TypeError: r.at is not a function" here during theme init on app mount,
  // breaking the page for those users (FRONTEND-LOGIN-WEB-20).
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === 'com' &&
    parts[parts.length - 1] === 'br'
  ) {
    if (parts.length === 3) {
      // Already at root level for .com.br (e.g., analyticaensino.com.br)
      return hostname;
    }
    // For domains like aluno.analyticaensino.com.br, return analyticaensino.com.br
    const base = parts.slice(-3).join('.');
    // If in hml environment, resolve to hml.base (e.g., hml.analyticaensino.com.br)
    return isHml && !base.startsWith('hml.') ? `hml.${base}` : base;
  }

  // Only treat as subdomain if there are 3+ parts (e.g., subdomain.example.com)
  if (parts.length > 2) {
    const base = parts.slice(-2).join('.');
    return isHml && !base.startsWith('hml.') ? `hml.${base}` : base;
  }

  // For 2-part domains (example.com) or single domains, return as-is
  return hostname;
};

/**
 * Extracts the profile "slug" from a hostname's leading subdomain label,
 * stripping the homolog prefix so it matches the bare profile name the backend
 * returns (e.g. "aluno"). Used to compare the profile a shared link belongs to
 * against the profile the user actually logged in as.
 *
 * @param hostname - The hostname to read (e.g. window.location.hostname)
 * @returns The profile slug, or null for localhost / IP literals / hosts with
 *          no subdomain (a root-level host carries no profile identity)
 *
 * @example
 * ```typescript
 * extractSubdomainSlug('aluno.analyticaensino.com.br'); // 'aluno'
 * extractSubdomainSlug('hml-aluno.hml.analyticaensino.com.br'); // 'aluno'
 * extractSubdomainSlug('analyticaensino.com.br'); // null (no subdomain)
 * extractSubdomainSlug('localhost'); // null
 * ```
 */
export const extractSubdomainSlug = (hostname: string): string | null => {
  // localhost / IP literals have no profile subdomain
  if (resolveRootHostname(hostname) === null) {
    return null;
  }

  // If stripping the subdomain yields the hostname unchanged, there is no
  // leading profile label (already at root, e.g. analyticaensino.com.br).
  if (resolveRootHostname(hostname) === hostname) {
    return null;
  }

  const firstLabel = hostname.split('.')[0];
  // Homolog uses a "hml-<profile>" leading label; strip it to the bare profile.
  return firstLabel.startsWith('hml-')
    ? firstLabel.slice('hml-'.length)
    : firstLabel;
};

/**
 * Builds the login URL (root domain) with the current deep link preserved as a
 * `returnTo` query param, so that after the user logs in they can be sent back
 * to the page they originally tried to open.
 *
 * Deliberately a no-op in two cases, returning the bare `rootDomain`:
 * - **localhost / IP literals**: the deep-link-return flow is skipped entirely
 *   in local development (no subdomain to validate against).
 * - **no meaningful path**: the user was at the root already, so there is
 *   nothing worth remembering.
 *
 * The stored value is the full current URL (origin + path + query). The login
 * app later validates that its host's profile matches the logged-in profile
 * before honoring it, and only ever reuses the path — never the host — so a
 * crafted `returnTo` cannot redirect to a foreign origin.
 *
 * Also a no-op right after an explicit logout (see `markExplicitLogout`): a
 * user who chose to sign out should never be bounced back to the page they were
 * on, and clearing the session synchronously can make ProtectedRoute redirect
 * through here before the app's own clean logout navigation completes.
 *
 * @param rootDomain - The login/root domain to redirect to (from getRootDomain)
 * @returns `rootDomain` with `?returnTo=<encoded current URL>` appended, or the
 *          bare `rootDomain` when the flow should be skipped
 */
export const buildLoginUrlWithReturnTo = (rootDomain: string): string => {
  if (typeof window === 'undefined') {
    return rootDomain;
  }

  // An explicit logout must not preserve a deep link.
  if (isExplicitLogoutActive()) {
    return rootDomain;
  }

  const { hostname, pathname, search } = window.location;

  // Skip the whole deep-link flow on localhost / IP literals.
  if (resolveRootHostname(hostname) === null) {
    return rootDomain;
  }

  // Nothing worth remembering when already at the root with no query.
  if (pathname === '/' && !search) {
    return rootDomain;
  }

  const returnTo = encodeURIComponent(window.location.href);
  return `${rootDomain}?returnTo=${returnTo}`;
};

const EXPLICIT_LOGOUT_KEY = '@auth:explicit-logout';
// How long after markExplicitLogout() a redirect is still treated as part of
// the logout. Long enough to cover the redirects a single logout fans out
// (ProtectedRoute re-render + any in-flight request that 401s as the tokens are
// cleared), short enough that a genuine session expiry later is unaffected.
const EXPLICIT_LOGOUT_WINDOW_MS = 5000;

/**
 * Marks that the user is intentionally logging out, so redirects to login
 * during the logout do NOT preserve a `returnTo` deep link. Call this right
 * before clearing the session in an explicit "Sair" handler.
 *
 * Stored as a timestamp (not a one-shot flag) because a single logout can
 * trigger MORE THAN ONE redirect through buildLoginUrlWithReturnTo — e.g. the
 * ProtectedRoute re-render after signOut() AND the 401 interceptor firing on an
 * in-flight request whose token was just cleared. A one-shot flag would be
 * eaten by the first redirect, letting the second re-append returnTo. A
 * time-boxed marker covers every redirect in the logout window and then expires
 * on its own, so it never suppresses a later, genuine session-expiry redirect.
 */
export const markExplicitLogout = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(EXPLICIT_LOGOUT_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable: worst case the URL carries a harmless
    // returnTo that the login flow validates and can still ignore.
  }
};

/**
 * Returns true when an explicit logout was marked within the recent window.
 * Does not clear the marker (it expires by time), so several redirects fanned
 * out by the same logout all see it.
 */
const isExplicitLogoutActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(EXPLICIT_LOGOUT_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const active = Date.now() - ts < EXPLICIT_LOGOUT_WINDOW_MS;
    // Once expired, remove it so it can't linger and suppress a future 401.
    if (!active) sessionStorage.removeItem(EXPLICIT_LOGOUT_KEY);
    return active;
  } catch {
    return false;
  }
};
