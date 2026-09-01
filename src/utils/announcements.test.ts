import {
  getSeenAnnouncementIds,
  markAnnouncementSeen,
  pruneSeenAnnouncementIds,
  splitTextWithLinks,
  SEEN_ANNOUNCEMENTS_STORAGE_PREFIX,
} from './announcements';

const USER_ID = 'user-1';
const STORAGE_KEY = `${SEEN_ANNOUNCEMENTS_STORAGE_PREFIX}:${USER_ID}`;

describe('announcements utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('getSeenAnnouncementIds', () => {
    it('returns an empty list when nothing was stored', () => {
      expect(getSeenAnnouncementIds(USER_ID)).toEqual([]);
    });

    it('reads the ids stored for that user', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['ann-1', 'ann-2']));

      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1', 'ann-2']);
    });

    it('is scoped per user', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['ann-1']));

      expect(getSeenAnnouncementIds('outro-user')).toEqual([]);
    });

    it('degrades to an empty list on corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{nao-e-json');

      expect(getSeenAnnouncementIds(USER_ID)).toEqual([]);
    });

    it('degrades to an empty list when the stored value is not an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ann1: true }));

      expect(getSeenAnnouncementIds(USER_ID)).toEqual([]);
    });

    it('drops non-string entries', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['ann-1', 42, null]));

      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1']);
    });

    it('returns an empty list when storage throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(getSeenAnnouncementIds(USER_ID)).toEqual([]);
    });

    it('returns an empty list without a user id', () => {
      expect(getSeenAnnouncementIds('')).toEqual([]);
    });
  });

  describe('markAnnouncementSeen', () => {
    it('appends the id', () => {
      markAnnouncementSeen(USER_ID, 'ann-1');
      markAnnouncementSeen(USER_ID, 'ann-2');

      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1', 'ann-2']);
    });

    it('does not duplicate an id already stored', () => {
      markAnnouncementSeen(USER_ID, 'ann-1');
      markAnnouncementSeen(USER_ID, 'ann-1');

      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-1']);
    });

    it('ignores a missing user or announcement id', () => {
      markAnnouncementSeen('', 'ann-1');
      markAnnouncementSeen(USER_ID, '');

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('never throws when storage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => markAnnouncementSeen(USER_ID, 'ann-1')).not.toThrow();
    });
  });

  describe('pruneSeenAnnouncementIds', () => {
    it('forgets ids the server no longer returns', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(['ann-1', 'ann-2', 'ann-3'])
      );

      pruneSeenAnnouncementIds(USER_ID, ['ann-2']);

      expect(getSeenAnnouncementIds(USER_ID)).toEqual(['ann-2']);
    });

    it('does not write when nothing changed', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['ann-1']));
      const setItem = jest.spyOn(Storage.prototype, 'setItem');

      pruneSeenAnnouncementIds(USER_ID, ['ann-1', 'ann-2']);

      expect(setItem).not.toHaveBeenCalled();
    });

    it('ignores a missing user id', () => {
      expect(() => pruneSeenAnnouncementIds('', ['ann-1'])).not.toThrow();
    });
  });

  describe('splitTextWithLinks', () => {
    it('returns an empty list for empty text', () => {
      expect(splitTextWithLinks('')).toEqual([]);
    });

    it('returns a single plain segment when there is no URL', () => {
      expect(splitTextWithLinks('Sem link aqui')).toEqual([
        { text: 'Sem link aqui', isLink: false },
      ]);
    });

    it('splits text around a URL', () => {
      expect(
        splitTextWithLinks('Veja https://analyticaensino.com.br hoje')
      ).toEqual([
        { text: 'Veja ', isLink: false },
        { text: 'https://analyticaensino.com.br', isLink: true },
        { text: ' hoje', isLink: false },
      ]);
    });

    it('excludes trailing punctuation from the link', () => {
      expect(splitTextWithLinks('Acesse https://x.com.br.')).toEqual([
        { text: 'Acesse ', isLink: false },
        { text: 'https://x.com.br', isLink: true },
        { text: '.', isLink: false },
      ]);
    });

    it('handles several links in one message', () => {
      const parts = splitTextWithLinks('a https://x.com b http://y.com c');

      expect(
        parts.filter((part) => part.isLink).map((part) => part.text)
      ).toEqual(['https://x.com', 'http://y.com']);
    });

    it('is stable across repeated calls (global regex state)', () => {
      const text = 'Veja https://x.com agora';

      expect(splitTextWithLinks(text)).toEqual(splitTextWithLinks(text));
    });

    it('does not linkify a javascript: URL', () => {
      expect(splitTextWithLinks('clique javascript:alert(1)')).toEqual([
        { text: 'clique javascript:alert(1)', isLink: false },
      ]);
    });
  });
});
