import { InputRule, Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { useMemo } from 'react';
import {
  BLOCK_INPUT_RULE,
  INLINE_INPUT_RULE,
  MATH_DISPLAY_ATTR,
  MATH_SPAN_TYPE,
  isCurrencyAmount,
  looksLikeMath,
} from '../../../utils/latexMath';
import { normalizeLineBreaksInHtml } from '../../../utils/htmlLineBreaks';
import { escapeHtmlText, processLatexInHtml } from './utils';

interface MathNodeViewProps {
  readonly node: NodeViewProps['node'];
  readonly editor: NodeViewProps['editor'];
  readonly getPos: NodeViewProps['getPos'];
}

/**
 * Classes applied to a display formula. They mirror the wrapper
 * `HtmlMathRenderer` uses for block math so the line break the author sees in
 * the editor lands in exactly the same place for the student.
 */
const DISPLAY_CLASS = 'block w-full text-center my-2.5';
const INLINE_CLASS = 'inline-math';

function MathNodeView({ node, editor, getPos }: MathNodeViewProps) {
  // `node.attrs.latex` is not guaranteed to be a string: pasted/imported HTML
  // without a `data-latex` attribute makes parseHTML return `undefined`, which
  // bypasses the attribute's `default: ''`. Normalising here keeps both the
  // KaTeX render and the cursor math below working on a real string.
  const latex = typeof node.attrs.latex === 'string' ? node.attrs.latex : '';
  const display = node.attrs.display === true;

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
      });
    } catch {
      return `<span class="text-error-600">${latex}</span>`;
    }
  }, [latex, display]);

  // When clicked, convert back to editable text
  const handleClick = () => {
    const pos = getPos();
    // `typeof NaN === 'number'`, so an explicit finite check is required here —
    // a NaN position would flow into setTextSelection and make ProseMirror throw
    // "Position NaN out of range" (FRONTEND-BACKOFFICE-WEB-P).
    if (typeof pos !== 'number' || !Number.isFinite(pos)) return;

    const delimiter = display ? '$$' : '$';

    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .insertContent(`${delimiter}${latex}${delimiter}`)
      .run();

    // Move cursor to the end of the inserted text (before the closing
    // delimiter). Clamp to the document bounds: the position is derived from
    // `pos`, which predates the edits above, so it can land past the end of the
    // resulting document — another way ProseMirror would throw "out of range".
    const docSize = editor.state.doc.content.size;
    const newPos = Math.min(
      Math.max(pos + latex.length + delimiter.length, 0),
      docSize
    );
    editor.commands.setTextSelection(newPos);
  };

  return (
    <NodeViewWrapper
      as="span"
      className={`${display ? DISPLAY_CLASS : INLINE_CLASS} cursor-pointer hover:bg-primary-50 rounded px-0.5 transition-colors`}
      onClick={handleClick}
      title="Clique para editar"
    >
      <span
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        className={display ? 'block' : 'inline'}
      />
    </NodeViewWrapper>
  );
}

/**
 * Reads the two characters that precede `from` in the document, so the currency
 * guard can tell `R$1,00` from a formula that merely starts with a digit.
 */
const textBeforeRange = (
  doc: { textBetween: (from: number, to: number, sep?: string) => string },
  from: number
): string => doc.textBetween(Math.max(0, from - 2), Math.max(0, from), '');

export const MathNode = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    // Both attributes are serialized explicitly by `renderHTML` below. Without
    // `renderHTML: () => ({})` TipTap ALSO emits them under their bare names
    // (`latex="..."`, `display="false"`), which leaks non-canonical attributes
    // into every saved question.
    return {
      latex: {
        default: '',
        renderHTML: () => ({}),
      },
      display: {
        default: false,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${MATH_SPAN_TYPE}"]`,
        getAttrs: (dom) => {
          // Fall back to '' instead of forwarding `undefined`: returning the
          // attribute explicitly overrides the `default: ''` declared above, so
          // HTML pasted without `data-latex` would otherwise produce a node
          // whose `latex` attr is undefined.
          return {
            latex: dom.dataset.latex ?? '',
            display: dom.dataset.displayMode === 'true',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    // The display flag is only emitted when set: keeping the serialized markup
    // minimal means inline formulas produce byte-identical HTML to before.
    const displayAttributes = node.attrs.display
      ? { [MATH_DISPLAY_ATTR]: 'true' }
      : {};

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': MATH_SPAN_TYPE,
        ...displayAttributes,
        'data-latex': node.attrs.latex,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  /**
   * Converts `$formula$` / `$$formula$$` the moment the closing delimiter is
   * typed. Previously the only trigger was the Space shortcut below, which is
   * why authors had to type a space after the last `$` and why a formula that
   * ended a sentence stayed raw text forever.
   */
  addInputRules() {
    const { type } = this;

    const buildRule = (find: RegExp, display: boolean) =>
      new InputRule({
        find,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          if (!latex?.trim()) return;

          // Inline math is the ambiguous case: `R$1,00 e de R$0,50` closes a
          // perfectly valid `$...$` pair across two prices.
          if (!display) {
            const before = textBeforeRange(state.doc, range.from);
            if (isCurrencyAmount(before, latex) || !looksLikeMath(latex)) {
              return;
            }
          }

          state.tr.replaceRangeWith(
            range.from,
            range.to,
            type.create({ latex, display })
          );
        },
      });

    // `$$` first: the inline rule must never claim the inner `$formula$` of a
    // display block.
    return [
      buildRule(BLOCK_INPUT_RULE, true),
      buildRule(INLINE_INPUT_RULE, false),
    ];
  },

  /**
   * Pasted content never runs through input rules, so a formula copied from a
   * document or from the KaTeX playground used to land as raw text. Both
   * clipboard flavours are converted here.
   */
  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey('mathInlinePaste'),
        props: {
          transformPastedHTML: (html) => processLatexInHtml(html),
          handlePaste: (_view, event) => {
            const clipboard = event.clipboardData;
            // HTML payloads are already covered by transformPastedHTML above.
            if (!clipboard || clipboard.getData('text/html')) return false;

            const text = clipboard.getData('text/plain');
            if (!text || !(text.includes('$') || text.includes('\\begin{'))) {
              return false;
            }

            const html = processLatexInHtml(
              normalizeLineBreaksInHtml(escapeHtmlText(text), { inline: true })
            );
            if (!html.includes(`data-type="${MATH_SPAN_TYPE}"`)) return false;

            editor.commands.insertContent(html);
            return true;
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Kept for authors used to the old flow (and for `$...$` typed before a
      // paste re-flowed the text): space after a closing delimiter converts.
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

        // `$$...$$` is tested first so a display block is not split in half.
        const blockMatch = BLOCK_INPUT_RULE.exec(textBefore);
        const inlineMatch = blockMatch
          ? null
          : INLINE_INPUT_RULE.exec(textBefore);
        const match = blockMatch ?? inlineMatch;
        if (!match?.[1]?.trim()) return false;

        const latex = match[1];
        const display = blockMatch !== null;
        const matchStart = $from.pos - match[0].length;

        if (!display) {
          const before = textBeforeRange(state.doc, matchStart);
          if (isCurrencyAmount(before, latex) || !looksLikeMath(latex)) {
            return false;
          }
        }

        // Replace the delimited text with a math node, then add a space
        editor
          .chain()
          .deleteRange({ from: matchStart, to: $from.pos })
          .insertContent([
            { type: 'mathInline', attrs: { latex, display } },
            { type: 'text', text: ' ' },
          ])
          .run();

        return true;
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
          const delimiter = nodeBefore.attrs.display ? '$$' : '$';

          // Convert back to text without the closing delimiter, so the user can
          // continue editing
          editor
            .chain()
            .deleteRange({ from: pos, to: $from.pos })
            .insertContent(`${delimiter}${latex}`)
            .run();

          return true;
        }

        return false;
      },
    };
  },
});
