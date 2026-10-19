import DOMPurify from 'dompurify';
import { isAllowedVideoEmbedSrc } from '../../utils/videoEmbed';

type Purifier = ReturnType<typeof DOMPurify>;

let purifier: Purifier | null = null;

/**
 * Dedicated DOMPurify instance, so the iframe and link hooks below never leak
 * into the global one that LatexRenderer and other components share.
 */
const getPurifier = (): Purifier => {
  if (purifier) return purifier;
  purifier = DOMPurify(globalThis.window);

  // Iframes are allowed in the config only so this hook can vet them: anything
  // that is not a YouTube/Vimeo player is removed, wrapper included.
  purifier.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return;
    const element = node as Element;
    if (!isAllowedVideoEmbedSrc(element.getAttribute('src'))) {
      element.remove();
    }
  });

  // External links open in a new tab without handing over `window.opener`.
  purifier.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') return;
    const href = node.getAttribute('href') ?? '';
    if (/^https?:\/\//i.test(href)) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return purifier;
};

/**
 * Sanitizes article HTML for display: the default DOMPurify allowlist plus
 * YouTube/Vimeo iframes and the `data-video-embed` wrapper.
 * @param html - Article body as saved by the RichEditor
 * @returns Safe HTML
 */
export const sanitizeArticleHtml = (html: string): string =>
  getPurifier().sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'target',
      'data-video-embed',
    ],
  });
