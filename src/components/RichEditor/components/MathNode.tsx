import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { useMemo } from 'react';

interface MathNodeViewProps {
  readonly node: NodeViewProps['node'];
  readonly editor: NodeViewProps['editor'];
  readonly getPos: NodeViewProps['getPos'];
}

function MathNodeView({ node, editor, getPos }: MathNodeViewProps) {
  // `node.attrs.latex` is not guaranteed to be a string: pasted/imported HTML
  // without a `data-latex` attribute makes parseHTML return `undefined`, which
  // bypasses the attribute's `default: ''`. Normalising here keeps both the
  // KaTeX render and the cursor math below working on a real string.
  const latex = typeof node.attrs.latex === 'string' ? node.attrs.latex : '';

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<span class="text-error-600">${latex}</span>`;
    }
  }, [latex]);

  // When clicked, convert back to editable text
  const handleClick = () => {
    const pos = getPos();
    // `typeof NaN === 'number'`, so an explicit finite check is required here —
    // a NaN position would flow into setTextSelection and make ProseMirror throw
    // "Position NaN out of range" (FRONTEND-BACKOFFICE-WEB-P).
    if (typeof pos !== 'number' || !Number.isFinite(pos)) return;

    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .insertContent(`$${latex}$`)
      .run();

    // Move cursor to the end of the inserted text (before the last $).
    // Clamp to the document bounds: the position is derived from `pos`, which
    // predates the edits above, so it can land past the end of the resulting
    // document — another way ProseMirror would throw "out of range".
    const docSize = editor.state.doc.content.size;
    const newPos = Math.min(Math.max(pos + latex.length + 1, 0), docSize);
    editor.commands.setTextSelection(newPos);
  };

  return (
    <NodeViewWrapper
      as="span"
      className="inline-math cursor-pointer hover:bg-primary-50 rounded px-0.5 transition-colors"
      onClick={handleClick}
      title="Clique para editar"
    >
      <span
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        className="inline"
      />
    </NodeViewWrapper>
  );
}

export const MathNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
        getAttrs: (dom) => {
          // Fall back to '' instead of forwarding `undefined`: returning the
          // attribute explicitly overrides the `default: ''` declared above, so
          // HTML pasted without `data-latex` would otherwise produce a node
          // whose `latex` attr is undefined.
          return { latex: dom.dataset.latex ?? '' };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'math-inline',
        'data-latex': node.attrs.latex,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  // Disable default input rules
  addInputRules() {
    return [];
  },

  addKeyboardShortcuts() {
    return {
      // When space is pressed after closing $, convert to math node
      Space: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Get text before cursor
        const textBefore = $from.parent.textBetween(
          Math.max(0, $from.parentOffset - 200),
          $from.parentOffset,
          '\n'
        );

        // Check if there's a complete $...$ pattern right before the cursor
        const regex = /\$([^$]+)\$$/;
        const match = regex.exec(textBefore);
        if (match?.[1]?.trim()) {
          const latex = match[1];
          const matchStart = $from.pos - match[0].length;

          // Replace $latex$ with math node, then add a space
          editor
            .chain()
            .deleteRange({ from: matchStart, to: $from.pos })
            .insertContent([
              { type: 'mathInline', attrs: { latex } },
              { type: 'text', text: ' ' },
            ])
            .run();

          return true;
        }

        return false;
      },

      // When backspace is pressed on a math node, convert it back to text for editing
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        // Check if we're right after a math node
        const nodeBefore = $from.nodeBefore;
        if (nodeBefore?.type.name === 'mathInline') {
          const pos = $from.pos - nodeBefore.nodeSize;
          const latex = nodeBefore.attrs.latex;

          // Convert back to text without the last $, so user can continue editing
          editor
            .chain()
            .deleteRange({ from: pos, to: $from.pos })
            .insertContent(`$${latex}`)
            .run();

          return true;
        }

        return false;
      },
    };
  },
});
