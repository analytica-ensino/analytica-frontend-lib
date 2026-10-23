import {
  embedVideoLinks,
  isAllowedVideoEmbedSrc,
  toVideoEmbedUrl,
} from './videoEmbed';

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

describe('embedVideoLinks', () => {
  const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const YT_EMBED = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';

  const parse = (html: string) => {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container;
  };

  it('replaces a video link alone in its paragraph with the player', () => {
    const out = parse(
      embedVideoLinks(`<p>Antes</p><p><a href="${YT}">Assista</a></p>`)
    );
    const wrapper = out.querySelector('div[data-video-embed]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toBe('video-embed');
    const iframe = wrapper?.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe(YT_EMBED);
    expect(iframe?.getAttribute('title')).toBe('Assista');
    expect(iframe?.getAttribute('allowfullscreen')).toBe('true');
    expect(out.querySelector('a')).toBeNull();
    expect(out.children).toHaveLength(2);
  });

  it('replaces a video link alone in a list item', () => {
    const out = parse(
      embedVideoLinks(
        '<ul><li><a href="https://vimeo.com/76979871"></a></li></ul>'
      )
    );
    const iframe = out.querySelector('ul > div[data-video-embed] > iframe');
    expect(iframe?.getAttribute('src')).toBe(
      'https://player.vimeo.com/video/76979871'
    );
    expect(iframe?.getAttribute('title')).toBe('Vídeo');
    expect(out.querySelector('li')).toBeNull();
  });

  it('keeps a link inside text and puts the player after the paragraph', () => {
    const out = parse(
      embedVideoLinks(`<p>Veja <a href="${YT}">o vídeo</a> aqui</p><p>Fim</p>`)
    );
    const [first, second, third] = Array.from(out.children);
    expect(first.tagName).toBe('P');
    expect(first.querySelector('a')?.getAttribute('href')).toBe(YT);
    expect(second.hasAttribute('data-video-embed')).toBe(true);
    expect(third.textContent).toBe('Fim');
  });

  it('replaces a video link that has no paragraph around it', () => {
    const out = parse(embedVideoLinks(`<div><a href="${YT}">vídeo</a></div>`));
    expect(out.querySelector('a')).toBeNull();
    expect(
      out
        .querySelector('div > div[data-video-embed] iframe')
        ?.getAttribute('src')
    ).toBe(YT_EMBED);
  });

  it('returns the same string when there is no video link', () => {
    const html = '<p><a href="https://example.com">site</a></p>';
    expect(embedVideoLinks(html)).toBe(html);
  });

  it('returns the html unchanged without DOMParser', () => {
    const original = globalThis.DOMParser;
    // @ts-expect-error simulating an environment without DOMParser
    delete globalThis.DOMParser;
    try {
      const html = `<p><a href="${YT}">x</a></p>`;
      expect(embedVideoLinks(html)).toBe(html);
    } finally {
      globalThis.DOMParser = original;
    }
  });
});
