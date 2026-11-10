/**
 * One video rendition listed in an HLS master playlist.
 */
export interface HlsRendition {
  /** Picture height in pixels, from `RESOLUTION`; it names the quality (720p). */
  height: number;
  /** Peak bit rate in bits per second, from `BANDWIDTH` (0 when missing). */
  bandwidth: number;
  /** Absolute URL of the rendition's media playlist. */
  url: string;
}

const STREAM_INF = '#EXT-X-STREAM-INF:';

/**
 * Splits an attribute list (`A=1,B="x,y",C=2`) into a map. Commas inside
 * quoted values (as in `CODECS="avc1.64001F,mp4a.40.2"`) do not split.
 */
const parseAttributes = (list: string): Record<string, string> => {
  const attributes: Record<string, string> = {};
  let index = 0;

  while (index < list.length) {
    const equals = list.indexOf('=', index);
    if (equals === -1) break;

    const key = list.slice(index, equals).trim();
    const quoted = list[equals + 1] === '"';
    const valueStart = quoted ? equals + 2 : equals + 1;
    const valueEnd = list.indexOf(quoted ? '"' : ',', valueStart);
    const end = valueEnd === -1 ? list.length : valueEnd;
    attributes[key] = list.slice(valueStart, end);

    const nextComma = list.indexOf(',', end);
    index = nextComma === -1 ? list.length : nextComma + 1;
  }

  return attributes;
};

/** Height in pixels from a `RESOLUTION` value (`1280x720`); NaN when invalid. */
const parseHeight = (resolution = ''): number => {
  const [width, height] = resolution.split('x');
  return width && height ? Number(height) : Number.NaN;
};

/** Resolves `uri` against the playlist URL; null when it is not a valid URL. */
const resolveUrl = (uri: string, baseUrl: string): string | null => {
  try {
    return new URL(uri, baseUrl).href;
  } catch {
    return null;
  }
};

/**
 * Reads the video renditions of an HLS master playlist.
 *
 * Only `#EXT-X-STREAM-INF` entries with a `RESOLUTION` count: audio-only
 * variants and I-frame playlists are not picture qualities. When two variants
 * share a height, the one with the higher bit rate stays, so each label shows
 * up once in the quality menu.
 *
 * @param text - Master playlist contents
 * @param baseUrl - Absolute URL the playlist was loaded from; relative variant
 * URIs resolve against it
 * @returns Renditions sorted from the tallest to the shortest picture
 */
export const parseMasterPlaylist = (
  text: string,
  baseUrl: string
): HlsRendition[] => {
  const byHeight = new Map<number, HlsRendition>();
  // Attributes of the last #EXT-X-STREAM-INF, waiting for its URI line.
  let pending: Record<string, string> | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith(STREAM_INF)) {
      pending = parseAttributes(line.slice(STREAM_INF.length));
      continue;
    }
    if (!pending || line === '' || line.startsWith('#')) continue;

    const height = parseHeight(pending.RESOLUTION);
    const bandwidth = Number(pending.BANDWIDTH) || 0;
    const url = resolveUrl(line, baseUrl);
    pending = null;
    if (!height || !url) continue;

    const current = byHeight.get(height);
    if (!current || bandwidth > current.bandwidth) {
      byHeight.set(height, { height, bandwidth, url });
    }
  }

  return [...byHeight.values()].sort((a, b) => b.height - a.height);
};

/**
 * Downloads and parses a master playlist.
 *
 * @param url - Master playlist URL
 * @param signal - Aborts the request when the player moves on
 * @returns Renditions sorted from the tallest to the shortest picture
 * @throws When the request fails or the server does not answer 2xx
 */
export const fetchMasterPlaylist = async (
  url: string,
  signal?: AbortSignal
): Promise<HlsRendition[]> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Master playlist returned status ${response.status}`);
  }
  // `response.url` is the final address after redirects, which is what the
  // relative variant URIs are relative to.
  const baseUrl = response.url || new URL(url, document.baseURI).href;
  return parseMasterPlaylist(await response.text(), baseUrl);
};
