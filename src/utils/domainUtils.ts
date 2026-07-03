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
