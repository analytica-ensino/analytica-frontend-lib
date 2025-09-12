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
 * Extract YouTube video ID from URL
 *
 * @param url - The YouTube URL
 * @returns The video ID if found, null otherwise
 */
export const getYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host.includes('youtu.be')) {
      return u.pathname.split('/')[1] || null;
    }
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const parts = u.pathname.split('/');
      if (parts[1] === 'embed' && parts[2]) return parts[2];
      if (parts[1] === 'shorts' && parts[2]) return parts[2];
      if (parts[1] === 'live' && parts[2]) return parts[2];
      const v = u.searchParams.get('v');
      if (v) return v;
    }
  } catch {
    // ignore
  }
  return null;
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
