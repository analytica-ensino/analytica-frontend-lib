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
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

/**
 * Extract YouTube video ID from URL
 *
 * @param url - The YouTube URL
 * @returns The video ID if found, null otherwise
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = regex.exec(url);
  return match ? match[1] : null;
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
