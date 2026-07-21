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
    Image.configure({ inline: false, allowBase64: false }),
    MathNode,
  ];
}
