import { Node, mergeAttributes } from '@tiptap/core';
import { isAllowedVideoEmbedSrc } from '../../../utils/videoEmbed';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** Inserts a video player; `src` must already be a player URL */
      setVideoEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

/**
 * Block node holding a YouTube/Vimeo player.
 *
 * Saved as `<div data-video-embed><iframe src="…"></iframe></div>` so the
 * wrapper can keep the 16:9 box in both the editor and ArticleContent. Only
 * players from `VIDEO_EMBED_HOSTS` are parsed back: any other iframe in
 * loaded or pasted HTML is dropped by the schema.
 */
export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    const read = (element: HTMLElement) => {
      const iframe =
        element.tagName === 'IFRAME'
          ? element
          : element.querySelector('iframe');
      const src = iframe?.getAttribute('src') ?? null;
      return isAllowedVideoEmbedSrc(src) ? { src } : false;
    };
    return [
      { tag: 'div[data-video-embed]', getAttrs: read },
      { tag: 'iframe', getAttrs: read },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-video-embed': '', class: 'video-embed' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          frameborder: '0',
          allowfullscreen: 'true',
          allow:
            'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          title: 'Vídeo',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        ({ src }) =>
        ({ commands }) =>
          isAllowedVideoEmbedSrc(src) &&
          commands.insertContent({ type: this.name, attrs: { src } }),
    };
  },
});
