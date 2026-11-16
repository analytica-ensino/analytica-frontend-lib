import { getCookie, removeCookie, setCookie } from './cookieUtils';
import { resolveRootHostname } from './domainUtils';

/**
 * How long the verifier waits for the opened app. Covers the 60s the hand-off
 * code lives, plus a slow page load.
 */
const HAND_OFF_VERIFIER_MAX_AGE_SECONDS = 120;

/**
 * Where the verifier lives: a cookie of the registrable domain, the one place
 * the login app and the app it opens (another subdomain) both read
 *
 * Homolog apps sit under the same registrable domain as production
 * (hml-aluno.example.com.br next to aluno.example.com.br), so homolog gets its
 * own cookie name instead of reading production's.
 *
 * @returns The cookie name, and its Domain (undefined on localhost, where a
 * host-only cookie is already shared by every port)
 */
const getHandOffCookie = (): { name: string; domain: string | undefined } => {
  const root = resolveRootHostname(globalThis.location.hostname);
  const isHml = root?.startsWith('hml.') ?? false;
  return {
    name: isHml ? 'analytica_handoff_hml' : 'analytica_handoff',
    domain: isHml ? root?.slice('hml.'.length) : (root ?? undefined),
  };
};

/**
 * Bytes as base64url, without padding
 */
const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCodePoint(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

/**
 * Start a login hand-off bound to this browser (login app side)
 *
 * Leaves a random verifier in a cookie the opened app can read, and returns
 * its SHA-256 for POST /auth/login. The backend then hands over the session
 * only to whoever sends the verifier back: a code someone sends in a link
 * (to make the victim work in the sender's account) fails in the victim's
 * browser, which holds another verifier or none.
 *
 * @returns The challenge (base64url SHA-256 of the verifier)
 *
 * @example
 * ```typescript
 * const codeChallenge = await createHandOffChallenge();
 * await api.post('/auth/login', { ...loginRequest, codeChallenge });
 * ```
 */
export const createHandOffChallenge = async (): Promise<string> => {
  const verifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const { name, domain } = getHandOffCookie();
  setCookie(name, verifier, {
    domain,
    maxAge: HAND_OFF_VERIFIER_MAX_AGE_SECONDS,
    sameSite: 'Lax',
    secure: globalThis.location.protocol === 'https:',
  });

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return toBase64Url(new Uint8Array(digest));
};

/**
 * Take the verifier the login app left for this hand-off (opened app side)
 *
 * Single use: the cookie is removed as it is read.
 *
 * @returns The verifier, or undefined when this browser did not log in
 */
export const takeHandOffVerifier = (): string | undefined => {
  const { name, domain } = getHandOffCookie();
  const verifier = getCookie(name);
  if (verifier) {
    removeCookie(name, { domain });
  }
  return verifier ?? undefined;
};
