import {
  Node,
  mergeAttributes,
  ResizableNodeView,
  type NodeViewRendererProps,
} from '@tiptap/core';
import { isAllowedVideoEmbedSrc } from '../../../utils/videoEmbed';
import { parseImageWidth } from './imageSize';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** Inserts a video player; `src` must already be a player URL */
      setVideoEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

/** Smallest width a resize handle may produce, in pixels (still a usable player) */
export const MIN_VIDEO_WIDTH = 200;

/** Attributes of the player iframe, in the editor and in the saved HTML */
const IFRAME_ATTRIBUTES = {
  frameborder: '0',
  allowfullscreen: 'true',
  allow:
    'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  title: 'Vídeo',
};

/** The iframe of a saved embed: the element itself or the one in its wrapper */
const findIframe = (element: HTMLElement): HTMLElement | null =>
  element.tagName === 'IFRAME' ? element : element.querySelector('iframe');

/**
 * Block node holding a YouTube/Vimeo player.
 *
 * Saved as `<div data-video-embed><iframe src="…" width="…"></iframe></div>`.
 * Only players from `VIDEO_EMBED_HOSTS` are parsed back: any other iframe in
 * loaded or pasted HTML is dropped by the schema.
 *
 * Resizable like the images: corner handles change the width and the 16:9
 * box follows. Only the width is stored, on the iframe `width` attribute —
 * it is the one place both sanitizers keep (the backend drops `style` on the
 * wrapper), and ArticleContent sizes the player from it. No width means the
 * player fills the line, as before.
 */
export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const iframe = findIframe(element);
          return iframe ? parseImageWidth(iframe) : null;
        },
        renderHTML: (attributes: Record<string, unknown>) =>
          typeof attributes.width === 'number'
            ? { width: attributes.width }
            : {},
      },
    };
  },

  parseHTML() {
    const read = (element: HTMLElement) => {
      const src = findIframe(element)?.getAttribute('src') ?? null;
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
      ['iframe', mergeAttributes(HTMLAttributes, IFRAME_ATTRIBUTES)],
    ];
  },

  addNodeView() {
    if (typeof document === 'undefined') return null;

    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'video-embed';
      wrapper.setAttribute('data-video-embed', '');
      const iframe = document.createElement('iframe');
      Object.entries(IFRAME_ATTRIBUTES).forEach(([key, value]) =>
        iframe.setAttribute(key, value)
      );
      wrapper.appendChild(iframe);

      /** Shows the stored source and width */
      const apply = (current: NodeViewRendererProps['node']) => {
        if (iframe.getAttribute('src') !== current.attrs.src) {
          iframe.setAttribute('src', current.attrs.src ?? '');
        }
        wrapper.style.width =
          typeof current.attrs.width === 'number'
            ? `${current.attrs.width}px`
            : '';
      };
      apply(node);

      return new ResizableNodeView({
        element: wrapper,
        editor,
        node,
        getPos,
        // The height follows from the 16:9 box, so only the width is set
        onResize: (width) => {
          wrapper.style.width = `${width}px`;
        },
        onCommit: (width) => {
          const pos = getPos();
          if (pos === undefined) return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, { width: Math.round(width) })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          apply(updatedNode);
          return true;
        },
        options: {
          // Same corner handles as the images
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          min: { width: MIN_VIDEO_WIDTH },
          preserveAspectRatio: true,
        },
      });
    };
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
