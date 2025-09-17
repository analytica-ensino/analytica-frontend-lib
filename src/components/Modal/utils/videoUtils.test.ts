import {
  isYouTubeUrl,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
} from './videoUtils';

describe('videoUtils', () => {
  describe('isYouTubeUrl', () => {
    it('deve retornar true para URLs válidas do YouTube', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'http://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube-nocookie.com/embed/dQw4w9WgXcQ',
        'youtube.com/watch?v=dQw4w9WgXcQ',
        'youtu.be/dQw4w9WgXcQ',
      ];

      validUrls.forEach((url) => {
        expect(isYouTubeUrl(url)).toBe(true);
      });
    });

    it('deve retornar false para URLs que não são do YouTube', () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://example.com/video',
        'https://facebook.com/video',
        'invalid-url',
        '',
        'https://notyoutube.com/watch?v=123',
      ];

      invalidUrls.forEach((url) => {
        expect(isYouTubeUrl(url)).toBe(false);
      });
    });

    it('deve rejeitar URLs com youtube.com como substring maliciosa', () => {
      const maliciousUrls = [
        'https://evil.com/redirect?url=youtube.com/watch?v=malicious',
        'https://phishing-youtube.com/fake-video',
        'https://not-youtube.com/but-has-youtube.com-in-path',
        'malicious-site.com/redirect?youtube.com',
        'https://example.com/youtube.com/fake',
      ];

      maliciousUrls.forEach((url) => {
        expect(isYouTubeUrl(url)).toBe(false);
      });
    });
  });

  describe('getYouTubeVideoId', () => {
    it('deve extrair ID de URLs do YouTube watch', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        { url: 'https://youtube.com/watch?v=abc123', expected: 'abc123' },
        {
          url: 'http://www.youtube.com/watch?v=xyz789&t=100',
          expected: 'xyz789',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('deve extrair ID de URLs do YouTube embed', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://youtube-nocookie.com/embed/abc123',
          expected: 'abc123',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('deve extrair ID de URLs do YouTube shorts', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        { url: 'https://youtube.com/shorts/abc123', expected: 'abc123' },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('deve extrair ID de URLs do YouTube live', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/live/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        { url: 'https://youtube.com/live/abc123', expected: 'abc123' },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('deve extrair ID de URLs do youtu.be', () => {
      const testCases = [
        { url: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { url: 'http://youtu.be/abc123', expected: 'abc123' },
      ];

      testCases.forEach(({ url, expected }) => {
        expect(getYouTubeVideoId(url)).toBe(expected);
      });
    });

    it('deve retornar null para URLs inválidas ou malformadas', () => {
      const invalidUrls = [
        'https://youtube.com/watch',
        'https://youtube.com/embed/',
        'https://youtu.be/',
        'invalid-url',
        '',
        'https://vimeo.com/123456',
        'https://youtube.com/watch?v=',
        // Lookalike/impersonating hosts
        'https://evil-youtu.be/dQw4w9WgXcQ',
        'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
        'https://notyoutube.com/watch?v=dQw4w9WgXcQ',
        'https://evil.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      ];

      invalidUrls.forEach((url) => {
        expect(getYouTubeVideoId(url)).toBe(null);
      });
    });

    it('deve tratar URLs sem protocolo', () => {
      // URLs sem protocolo devem retornar null porque o URL constructor não consegue lidar com elas
      expect(getYouTubeVideoId('youtube.com/watch?v=dQw4w9WgXcQ')).toBe(null);
      expect(getYouTubeVideoId('youtu.be/dQw4w9WgXcQ')).toBe(null);
    });
  });

  describe('getYouTubeEmbedUrl', () => {
    it('deve gerar URL de embed correta', () => {
      const videoId = 'dQw4w9WgXcQ';
      const expectedUrl =
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1';

      expect(getYouTubeEmbedUrl(videoId)).toBe(expectedUrl);
    });

    it('deve gerar URL de embed para diferentes IDs', () => {
      const testCases = [
        {
          videoId: 'abc123',
          expected:
            'https://www.youtube-nocookie.com/embed/abc123?autoplay=0&rel=0&modestbranding=1',
        },
        {
          videoId: 'xyz789',
          expected:
            'https://www.youtube-nocookie.com/embed/xyz789?autoplay=0&rel=0&modestbranding=1',
        },
      ];

      testCases.forEach(({ videoId, expected }) => {
        expect(getYouTubeEmbedUrl(videoId)).toBe(expected);
      });
    });

    it('deve aceitar string vazia', () => {
      const expectedUrl =
        'https://www.youtube-nocookie.com/embed/?autoplay=0&rel=0&modestbranding=1';
      expect(getYouTubeEmbedUrl('')).toBe(expectedUrl);
    });
  });
});
