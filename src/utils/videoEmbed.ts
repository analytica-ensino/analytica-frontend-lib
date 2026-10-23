/**
 * Video embeds accepted by the rich editor and rendered by ArticleContent.
 *
 * Only these hosts may end up as an `<iframe>`: the editor converts a pasted
 * YouTube/Vimeo link to its player URL, and ArticleContent drops any iframe
 * whose `src` is not one of them. Kept free of tiptap so the renderer can use
 * it in apps that do not ship the editor.
 */

export const VIDEO_EMBED_HOSTS = [
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'player.vimeo.com',
] as const;

const YOUTUBE_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;

const youtubeId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, kind, value] = url.pathname.split('/');
    if (kind === 'watch') id = url.searchParams.get('v');
    else if (kind === 'embed' || kind === 'shorts' || kind === 'live') {
      id = value ?? null;
    } else if (url.pathname === '/watch') id = url.searchParams.get('v');
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
};

const vimeoId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;
  const id = url.pathname
    .split('/')
    .filter(Boolean)
    .find((part) => VIMEO_ID.test(part));
  return id ?? null;
};

/**
 * Converts a YouTube or Vimeo link (watch, share, shorts or embed URL) to
 * its player URL.
 * @param input - Link pasted by the author
 * @returns The embeddable player URL, or `null` when it is not a supported video
 */
export const toVideoEmbedUrl = (input: string): string | null => {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const youtube = youtubeId(url);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube}`;

  const vimeo = vimeoId(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;

  return null;
};

/**
 * Whether an iframe `src` points to one of the allowed video players.
 * @param src - The iframe source
 */
export const isAllowedVideoEmbedSrc = (src: string | null): boolean => {
  if (!src) return false;
  try {
    const url = new URL(src);
    return (
      url.protocol === 'https:' &&
      (VIDEO_EMBED_HOSTS as readonly string[]).includes(url.hostname)
    );
  } catch {
    return false;
  }
};

/**
 * Turns the YouTube/Vimeo links of an article into embedded players, in the
 * same `data-video-embed` wrapper the RichEditor writes, so the reader shows
 * the video instead of a link. A link that is alone in its paragraph is
 * replaced by the player; a link inside text keeps its place and the player
 * goes right after the paragraph.
 * @param html - Article HTML
 * @returns The HTML with the players (unchanged when there is no video link)
 */
export const embedVideoLinks = (html: string): string => {
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let changed = false;

  doc.querySelectorAll('a[href]').forEach((link) => {
    const src = toVideoEmbedUrl(link.getAttribute('href') ?? '');
    if (!src) return;

    const wrapper = doc.createElement('div');
    wrapper.setAttribute('data-video-embed', '');
    wrapper.className = 'video-embed';
    const iframe = doc.createElement('iframe');
    iframe.setAttribute('src', src);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );
    iframe.setAttribute('title', link.textContent?.trim() || 'Vídeo');
    wrapper.appendChild(iframe);

    const block = link.closest('p, li');
    if (block && block.textContent?.trim() === link.textContent?.trim()) {
      block.replaceWith(wrapper);
    } else if (block) {
      block.after(wrapper);
    } else {
      link.replaceWith(wrapper);
    }
    changed = true;
  });

  return changed ? doc.body.innerHTML : html;
};
