/**
 * Video utilities for Modal component
 *
 * Utilities to handle YouTube video embedding and URL detection
 */

/**
 * Check if a given URL is a YouTube URL
 *
 * @param url - The URL to check
 * @returns true if the URL is from YouTube, false otherwise
 */
export const isYouTubeUrl = (url: string): boolean => {
  const youtubeRegex =
    /^(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/i;
  return youtubeRegex.test(url);
};

/**
 * Validate if hostname is a legitimate YouTube host
 *
 * @param host - The hostname to validate
 * @returns The type of YouTube host or null if invalid
 */
const isValidYouTubeHost = (
  host: string
): 'youtu.be' | 'youtube' | 'nocookie' | null => {
  if (host === 'youtu.be') return 'youtu.be';

  const isValidYouTubeCom =
    host === 'youtube.com' ||
    (host.endsWith('.youtube.com') &&
      /^(www|m|music)\.youtube\.com$/.test(host));

  if (isValidYouTubeCom) return 'youtube';

  const isValidNoCookie =
    host === 'youtube-nocookie.com' ||
    (host.endsWith('.youtube-nocookie.com') &&
      /^(www|m|music)\.youtube-nocookie\.com$/.test(host));

  if (isValidNoCookie) return 'nocookie';

  return null;
};

/**
 * Extract video ID from youtu.be path
 *
 * @param pathname - The URL pathname
 * @returns The video ID or null
 */
const extractYoutuBeId = (pathname: string): string | null => {
  const firstSeg = pathname.split('/').filter(Boolean)[0];
  return firstSeg || null;
};

/**
 * Extract video ID from YouTube or nocookie domains
 *
 * @param pathname - The URL pathname
 * @param searchParams - The URL search parameters
 * @returns The video ID or null
 */
const extractYouTubeId = (
  pathname: string,
  searchParams: URLSearchParams
): string | null => {
  const parts = pathname.split('/').filter(Boolean);
  const [first, second] = parts;

  if (first === 'embed' && second) return second;
  if (first === 'shorts' && second) return second;
  if (first === 'live' && second) return second;

  const v = searchParams.get('v');
  if (v) return v;

  return null;
};

/**
 * Extract YouTube video ID from URL
 *
 * @param url - The YouTube URL
 * @returns The video ID if found, null otherwise
 */
export const getYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const hostType = isValidYouTubeHost(u.hostname.toLowerCase());

    if (!hostType) return null;

    if (hostType === 'youtu.be') {
      return extractYoutuBeId(u.pathname);
    }

    return extractYouTubeId(u.pathname, u.searchParams);
  } catch {
    return null;
  }
};

/**
 * Generate YouTube embed URL for iframe
 *
 * @param videoId - The YouTube video ID
 * @returns The embed URL for the video
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
};
