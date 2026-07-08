import {
  resolveRootHostname,
  extractSubdomainSlug,
  buildLoginUrlWithReturnTo,
  markExplicitLogout,
} from './domainUtils';
import { mockWindowLocation } from '../test-utils/mockLocation';

describe('resolveRootHostname', () => {
  it.each([
    ['localhost', null],
    ['127.0.0.1', null],
    ['127.0.0.2', null],
    ['::1', null],
    ['2001:db8::1', null],
  ])('should return null for %s (host-only cookie)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['analyticaensino.com.br', 'analyticaensino.com.br'],
    ['aluno.analyticaensino.com.br', 'analyticaensino.com.br'],
    ['professor.analyticaensino.com.br', 'analyticaensino.com.br'],
    ['hml.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
    ['aluno.hml.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
    ['hml-aluno.analyticaensino.com.br', 'hml.analyticaensino.com.br'],
  ])('should resolve %s to %s (.com.br rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['example.com', 'example.com'],
    ['sub.example.com', 'example.com'],
    ['deep.sub.example.com', 'example.com'],
    ['app.hml.example.com', 'hml.example.com'],
    ['hml-aluno.example.com', 'hml.example.com'],
    ['intranet', 'intranet'],
  ])('should resolve %s to %s (generic rules)', (hostname, expected) => {
    expect(resolveRootHostname(hostname)).toBe(expected);
  });

  it.each([
    ['aluno.html.example.com', 'example.com'],
    ['html.analyticaensino.com.br', 'analyticaensino.com.br'],
  ])(
    'should not treat %s as hml environment (label-based detection)',
    (hostname, expected) => {
      expect(resolveRootHostname(hostname)).toBe(expected);
    }
  );
});

describe('extractSubdomainSlug', () => {
  it.each([
    ['aluno.analyticaensino.com.br', 'aluno'],
    ['professor.analyticaensino.com.br', 'professor'],
    ['backoffice.analyticaensino.com.br', 'backoffice'],
    ['sub.example.com', 'sub'],
  ])('should extract the profile slug from %s', (hostname, expected) => {
    expect(extractSubdomainSlug(hostname)).toBe(expected);
  });

  it.each([
    ['hml-aluno.hml.analyticaensino.com.br', 'aluno'],
    ['hml-backoffice.hml.analyticaensino.com.br', 'backoffice'],
    ['hml-aluno.analyticaensino.com.br', 'aluno'],
  ])('should strip the hml- prefix from %s', (hostname, expected) => {
    expect(extractSubdomainSlug(hostname)).toBe(expected);
  });

  it.each([
    ['analyticaensino.com.br', null], // root, no leading profile label
    ['example.com', null],
    ['localhost', null],
    ['127.0.0.1', null],
  ])(
    'should return null for %s (no profile subdomain)',
    (hostname, expected) => {
      expect(extractSubdomainSlug(hostname)).toBe(expected);
    }
  );
});

describe('buildLoginUrlWithReturnTo', () => {
  const ROOT = 'https://analyticaensino.com.br';

  let restoreLocation: (() => void) | undefined;

  // Point window.location at a fixture URL for the duration of one test.
  const setLocation = (href: string) => {
    const url = new URL(href);
    const { restore } = mockWindowLocation({
      href,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search,
      protocol: url.protocol,
      port: url.port,
    });
    restoreLocation = restore;
  };

  afterEach(() => {
    restoreLocation?.();
    restoreLocation = undefined;
    sessionStorage.clear();
  });

  it('appends the current URL as an encoded returnTo when there is a deep path', () => {
    setLocation(
      'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
    );

    const result = buildLoginUrlWithReturnTo(ROOT);

    expect(result).toBe(
      `${ROOT}?returnTo=${encodeURIComponent(
        'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
      )}`
    );
  });

  it('keeps a query-only returnTo (path is "/" but search is present)', () => {
    setLocation('https://aluno.analyticaensino.com.br/?aula=lesson-2');

    const result = buildLoginUrlWithReturnTo(ROOT);

    expect(result).toBe(
      `${ROOT}?returnTo=${encodeURIComponent(
        'https://aluno.analyticaensino.com.br/?aula=lesson-2'
      )}`
    );
  });

  it('returns the bare root domain when already at "/" with no query', () => {
    setLocation('https://backoffice.analyticaensino.com.br/');

    expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);
  });

  it('skips the flow on localhost, returning the bare root domain', () => {
    setLocation('http://localhost:3004/instituicoes/123');

    expect(buildLoginUrlWithReturnTo('http://localhost:3004')).toBe(
      'http://localhost:3004'
    );
  });

  it('skips the flow on IP literals, returning the bare root domain', () => {
    setLocation('http://127.0.0.1:3004/instituicoes/123');

    expect(buildLoginUrlWithReturnTo('http://127.0.0.1:3004')).toBe(
      'http://127.0.0.1:3004'
    );
  });

  it('does not append returnTo right after an explicit logout', () => {
    setLocation(
      'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
    );

    markExplicitLogout();

    // Even on a deep path, an explicit logout returns the bare root domain.
    expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);
  });

  it('suppresses returnTo for EVERY redirect within the logout window (race-safe)', () => {
    setLocation(
      'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
    );

    markExplicitLogout();

    // A single logout fans out multiple redirects (ProtectedRoute + a 401 from
    // an in-flight request). All must stay clean — a one-shot flag would let the
    // second re-append returnTo.
    expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);
    expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);
    expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);
  });

  it('appends returnTo again after the logout window expires', () => {
    setLocation(
      'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
    );

    const nowSpy = jest.spyOn(Date, 'now');
    try {
      nowSpy.mockReturnValue(1_000_000);
      markExplicitLogout();
      // Within the window: clean.
      expect(buildLoginUrlWithReturnTo(ROOT)).toBe(ROOT);

      // Past the 5s window: a genuine session expiry preserves the deep link.
      nowSpy.mockReturnValue(1_000_000 + 6000);
      expect(buildLoginUrlWithReturnTo(ROOT)).toBe(
        `${ROOT}?returnTo=${encodeURIComponent(
          'https://backoffice.analyticaensino.com.br/instituicoes/123?tab=users'
        )}`
      );
    } finally {
      nowSpy.mockRestore();
    }
  });
});
