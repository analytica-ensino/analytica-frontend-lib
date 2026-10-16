import { isAllowedVideoEmbedSrc, toVideoEmbedUrl } from './videoEmbed';

describe('toVideoEmbedUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('converts the YouTube link %s', (input, id) => {
    expect(toVideoEmbedUrl(input)).toBe(
      `https://www.youtube-nocookie.com/embed/${id}`
    );
  });

  it.each([
    'https://vimeo.com/76979871',
    'https://www.vimeo.com/channels/staffpicks/76979871',
    'https://player.vimeo.com/video/76979871',
  ])('converts the Vimeo link %s', (input) => {
    expect(toVideoEmbedUrl(input)).toBe(
      'https://player.vimeo.com/video/76979871'
    );
  });

  it.each([
    'not a url',
    'ftp://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/abc',
    'https://youtu.be/',
    'https://vimeo.com/about',
  ])('rejects %s', (input) => {
    expect(toVideoEmbedUrl(input)).toBeNull();
  });
});

describe('isAllowedVideoEmbedSrc', () => {
  it('accepts https player URLs of the allowed hosts', () => {
    expect(
      isAllowedVideoEmbedSrc('https://www.youtube-nocookie.com/embed/x')
    ).toBe(true);
    expect(isAllowedVideoEmbedSrc('https://player.vimeo.com/video/1')).toBe(
      true
    );
  });

  it('rejects other hosts, plain http, empty and invalid values', () => {
    expect(isAllowedVideoEmbedSrc('https://evil.com/embed/x')).toBe(false);
    expect(isAllowedVideoEmbedSrc('http://www.youtube.com/embed/x')).toBe(
      false
    );
    expect(isAllowedVideoEmbedSrc(null)).toBe(false);
    expect(isAllowedVideoEmbedSrc('::')).toBe(false);
  });
});
