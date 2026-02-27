/**
 * RichEditor - A rich text editor with LaTeX support
 *
 * This component requires tiptap dependencies to be installed:
 * yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-link @tiptap/extension-placeholder @tiptap/core
 *
 * Import from:
 * import { RichEditor } from 'analytica-frontend-lib/RichEditor';
 */

export { RichEditor } from './RichEditor';
export { FormulaDialog } from './FormulaDialog';
export { MathNode } from './MathNode';
export { processLatexInHtml, unprocessLatexInHtml } from './utils';
