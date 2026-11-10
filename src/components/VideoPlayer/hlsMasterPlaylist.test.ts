import { fetchMasterPlaylist, parseMasterPlaylist } from './hlsMasterPlaylist';

const BASE = 'https://cdn.example.com/hls/lesson/master.m3u8';

/** Same shape as the conversion's master: 480p first, muxed audio. */
const MASTER = [
  '#EXTM3U',
  '#EXT-X-VERSION:7',
  '#EXT-X-INDEPENDENT-SEGMENTS',
  '#EXT-X-STREAM-INF:BANDWIDTH=361268,AVERAGE-BANDWIDTH=215443,RESOLUTION=854x480,FRAME-RATE=29.970,CODECS="avc1.64001F,mp4a.40.2"',
  '480p/index.m3u8',
  '#EXT-X-STREAM-INF:BANDWIDTH=242463,RESOLUTION=640x360,CODECS="avc1.64001E,mp4a.40.2"',
  '360p/index.m3u8',
  '#EXT-X-STREAM-INF:BANDWIDTH=595017,RESOLUTION=1280x720,CODECS="avc1.64001F,mp4a.40.2"',
  '720p/index.m3u8',
  '#EXT-X-STREAM-INF:BANDWIDTH=1260097,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"',
  '1080p/index.m3u8',
].join('\n');

describe('parseMasterPlaylist', () => {
  it('lists the renditions tallest first, with absolute URLs', () => {
    expect(parseMasterPlaylist(MASTER, BASE)).toEqual([
      {
        height: 1080,
        bandwidth: 1260097,
        url: 'https://cdn.example.com/hls/lesson/1080p/index.m3u8',
      },
      {
        height: 720,
        bandwidth: 595017,
        url: 'https://cdn.example.com/hls/lesson/720p/index.m3u8',
      },
      {
        height: 480,
        bandwidth: 361268,
        url: 'https://cdn.example.com/hls/lesson/480p/index.m3u8',
      },
      {
        height: 360,
        bandwidth: 242463,
        url: 'https://cdn.example.com/hls/lesson/360p/index.m3u8',
      },
    ]);
  });

  it('keeps absolute variant URIs and accepts CRLF line endings', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:BANDWIDTH=100,RESOLUTION=640x360',
      'https://other.example.com/360.m3u8',
    ].join('\r\n');

    expect(parseMasterPlaylist(text, BASE)).toEqual([
      {
        height: 360,
        bandwidth: 100,
        url: 'https://other.example.com/360.m3u8',
      },
    ]);
  });

  it('keeps one rendition per height, the one with the higher bit rate', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:BANDWIDTH=200,RESOLUTION=640x360',
      'low.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=500,RESOLUTION=640x360',
      'high.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=300,RESOLUTION=640x360',
      'middle.m3u8',
    ].join('\n');

    expect(parseMasterPlaylist(text, BASE)).toEqual([
      {
        height: 360,
        bandwidth: 500,
        url: 'https://cdn.example.com/hls/lesson/high.m3u8',
      },
    ]);
  });

  it('ignores variants without a picture size and I-frame playlists', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=50,RESOLUTION=640x360,URI="iframe.m3u8"',
      '#EXT-X-STREAM-INF:BANDWIDTH=64000,CODECS="mp4a.40.2"',
      'audio-only.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=100,RESOLUTION=invalid',
      'broken.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=100,RESOLUTION=640x360',
      '',
      '# a comment between the tag and its URI',
      '360p.m3u8',
    ].join('\n');

    expect(parseMasterPlaylist(text, BASE)).toEqual([
      {
        height: 360,
        bandwidth: 100,
        url: 'https://cdn.example.com/hls/lesson/360p.m3u8',
      },
    ]);
  });

  it('treats a missing BANDWIDTH as 0 and skips URIs that do not resolve', () => {
    const text = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:RESOLUTION=1280x720,NAME',
      '720p.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=100,RESOLUTION=640x360',
      'http://[broken',
    ].join('\n');

    expect(parseMasterPlaylist(text, BASE)).toEqual([
      {
        height: 720,
        bandwidth: 0,
        url: 'https://cdn.example.com/hls/lesson/720p.m3u8',
      },
    ]);
  });

  it('returns nothing for a media playlist or an empty text', () => {
    const media = '#EXTM3U\n#EXTINF:6.0,\nseg_00000.m4s\n#EXT-X-ENDLIST';
    expect(parseMasterPlaylist(media, BASE)).toEqual([]);
    expect(parseMasterPlaylist('', BASE)).toEqual([]);
  });
});

describe('fetchMasterPlaylist', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockFetch = (response: Partial<Response>) => {
    const fetchMock = jest.fn().mockResolvedValue(response);
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  };

  it('resolves the variants against the final URL of the response', async () => {
    const signal = new AbortController().signal;
    const fetchMock = mockFetch({
      ok: true,
      url: 'https://redirected.example.com/hls/master.m3u8',
      text: () => Promise.resolve(MASTER),
    });

    const renditions = await fetchMasterPlaylist(BASE, signal);

    expect(fetchMock).toHaveBeenCalledWith(BASE, { signal });
    expect(renditions.map((rendition) => rendition.url)).toContain(
      'https://redirected.example.com/hls/360p/index.m3u8'
    );
  });

  it('falls back to the requested URL, relative to the page', async () => {
    mockFetch({ ok: true, url: '', text: () => Promise.resolve(MASTER) });

    const renditions = await fetchMasterPlaylist('videos/master.m3u8');

    expect(renditions.at(-1)?.url).toBe(
      new URL('videos/360p/index.m3u8', document.baseURI).href
    );
  });

  it('rejects when the server does not answer 2xx', async () => {
    mockFetch({ ok: false, status: 404 });

    await expect(fetchMasterPlaylist(BASE)).rejects.toThrow(
      'Master playlist returned status 404'
    );
  });
});
