import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { MathNode } from './MathNode';
import {
  MIN_IMAGE_HEIGHT,
  MIN_IMAGE_WIDTH,
  parseImageWidth,
} from './imageSize';

/**
 * Image node with drag-to-resize handles.
 *
 * The stock extension already declares `width`/`height` attributes, but their
 * default parser keeps the raw HTML value. That breaks the resizable node view,
 * which appends `px` to whatever is stored — a legacy `width="400px"` would
 * become `400pxpx`. Parsing to a number up front keeps every source consistent.
 *
 * `height` is deliberately never persisted: the editor stylesheet and
 * HtmlMathRenderer both force `height: auto`, so a stored height exists only to
 * be overridden. Worse, when `max-width` clips a too-wide image while an inline
 * height survives, the node view measures the clipped box and commits a
 * distorted aspect ratio on the next drag.
 */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => parseImageWidth(element),
        renderHTML: (attributes: Record<string, unknown>) =>
          typeof attributes.width === 'number'
            ? { width: attributes.width }
            : {},
      },
      height: {
        default: null,
        parseHTML: () => null,
        rendered: false,
      },
    };
  },

  addNodeView() {
    const parentNodeView = this.parent?.();
    if (!parentNodeView) return null;

    return (props) => {
      const nodeView = parentNodeView(props);
      const container = nodeView.dom;
      if (!(container instanceof HTMLElement)) return nodeView;

      // The upstream node view hides the container until `load` fires. An
      // expired storage URL therefore leaves an invisible, unselectable node —
      // worse than the browser's broken-image icon. Reveal it on failure.
      const image = container.querySelector('img');
      image?.addEventListener('error', () => {
        container.style.visibility = '';
        container.style.pointerEvents = '';
      });
      return nodeView;
    };
  },
});

/**
 * Extension list backing the RichEditor.
 *
 * Tiptap validates incoming HTML against the schema these extensions build and
 * silently discards any node it cannot match. Anything the editor must be able
 * to *load* has to be registered here, not only what it can create — omitting
 * Image is what made `<img>` tags disappear from existing content.
 */
export function createRichEditorExtensions(placeholder: string) {
  return [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder }),
    ResizableImage.configure({
      inline: false,
      allowBase64: false,
      resize: {
        enabled: true,
        // Corner handles only: edge handles span the whole side and read as a
        // border rather than a grip.
        directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        minWidth: MIN_IMAGE_WIDTH,
        minHeight: MIN_IMAGE_HEIGHT,
        alwaysPreserveAspectRatio: true,
      },
    }),
    MathNode,
  ];
}
