import { createHash, webcrypto } from 'node:crypto';
import { createHandOffChallenge, takeHandOffVerifier } from './handOffVerifier';
import * as cookieUtils from './cookieUtils';
import { mockWindowLocation } from '../test-utils/mockLocation';

describe('handOffVerifier', () => {
  let restoreLocation: (() => void) | undefined;

  // Point window.location at a host for the duration of one test
  const setLocation = (hostname: string, protocol = 'https:') => {
    restoreLocation = mockWindowLocation({ hostname, protocol }).restore;
  };

  beforeEach(() => {
    // jest.setup replaces crypto with a copy that lost subtle/getRandomValues
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
  });

  afterEach(() => {
    restoreLocation?.();
    restoreLocation = undefined;
    jest.restoreAllMocks();
  });

  describe('createHandOffChallenge', () => {
    it('returns the SHA-256 of the verifier it leaves in the cookie', async () => {
      setLocation('localhost', 'http:');
      const setCookie = jest.spyOn(cookieUtils, 'setCookie');

      const challenge = await createHandOffChallenge();

      const [name, verifier] = setCookie.mock.calls[0];
      expect(name).toBe('analytica_handoff');
      expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(challenge).toBe(
        createHash('sha256').update(verifier).digest('base64url')
      );
    });

    it('writes a fresh verifier each time', async () => {
      setLocation('localhost', 'http:');
      const setCookie = jest.spyOn(cookieUtils, 'setCookie');

      await createHandOffChallenge();
      await createHandOffChallenge();

      expect(setCookie.mock.calls[0][1]).not.toBe(setCookie.mock.calls[1][1]);
    });

    it('shares the cookie with every subdomain of the registrable domain', async () => {
      setLocation('enempr.com.br');
      const setCookie = jest.spyOn(cookieUtils, 'setCookie');

      await createHandOffChallenge();

      expect(setCookie).toHaveBeenCalledWith(
        'analytica_handoff',
        setCookie.mock.calls[0][1],
        { domain: 'enempr.com.br', maxAge: 120, sameSite: 'Lax', secure: true }
      );
    });

    it('keeps homolog apart from production under the same domain', async () => {
      setLocation('hml.enempr.com.br');
      const setCookie = jest.spyOn(cookieUtils, 'setCookie');

      await createHandOffChallenge();

      // hml-aluno.enempr.com.br must read it: not under hml.enempr.com.br
      expect(setCookie).toHaveBeenCalledWith(
        'analytica_handoff_hml',
        setCookie.mock.calls[0][1],
        { domain: 'enempr.com.br', maxAge: 120, sameSite: 'Lax', secure: true }
      );
    });

    it('leaves Domain out on localhost', async () => {
      setLocation('localhost', 'http:');
      const setCookie = jest.spyOn(cookieUtils, 'setCookie');

      await createHandOffChallenge();

      expect(setCookie.mock.calls[0][2]).toEqual({
        domain: undefined,
        maxAge: 120,
        sameSite: 'Lax',
        secure: false,
      });
    });
  });

  describe('takeHandOffVerifier', () => {
    it('returns the verifier and removes the cookie', () => {
      setLocation('hml-aluno.enempr.com.br');
      jest.spyOn(cookieUtils, 'getCookie').mockReturnValue('the-verifier');
      const removeCookie = jest
        .spyOn(cookieUtils, 'removeCookie')
        .mockImplementation(() => undefined);

      expect(takeHandOffVerifier()).toBe('the-verifier');
      expect(cookieUtils.getCookie).toHaveBeenCalledWith(
        'analytica_handoff_hml'
      );
      expect(removeCookie).toHaveBeenCalledWith('analytica_handoff_hml', {
        domain: 'enempr.com.br',
      });
    });

    it('reads the production cookie on a production app', () => {
      setLocation('aluno.enempr.com.br');
      jest.spyOn(cookieUtils, 'getCookie').mockReturnValue(null);

      expect(takeHandOffVerifier()).toBeUndefined();
      expect(cookieUtils.getCookie).toHaveBeenCalledWith('analytica_handoff');
    });

    it('round-trips on localhost', async () => {
      setLocation('localhost', 'http:');

      await createHandOffChallenge();
      const verifier = takeHandOffVerifier();

      expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(takeHandOffVerifier()).toBeUndefined();
    });
  });
});
