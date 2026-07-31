import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import HtmlMathRenderer from '../HtmlMathRenderer/HtmlMathRenderer';
import { createRichEditorExtensions } from './components/extensions';
import { processLatexInHtml } from './components/utils';

/**
 * Cross-boundary regression suite.
 *
 * The editor writes `<span data-type="math-inline">` while the display pipeline
 * only knew `math-formula` spans and raw `$...$`, so formulas silently vanished
 * (or flipped from inline to centered block) in "Ver como estudante" and on the
 * student surfaces. No test used to feed `editor.getHTML()` into
 * `HtmlMathRenderer`, which is exactly why the mismatch went unnoticed.
 */

// KatexMath is mocked so the assertions read the LaTeX that reached the
// renderer instead of KaTeX's generated markup.
jest.mock('../HtmlMathRenderer/KatexMath', () => ({
  KatexMath: ({
    math,
    displayMode,
  }: {
    math: string;
    displayMode?: boolean;
  }) =>
    displayMode ? (
      <div data-testid="block-math">{math}</div>
    ) : (
      <span data-testid="inline-math">{math}</span>
    ),
}));

beforeAll(() => {
  // jsdom does not implement elementFromPoint, which TipTap's Placeholder
  // viewport tracking calls while the editor view mounts.
  Document.prototype.elementFromPoint = () => null;
});

/** Runs stored content through the editor and returns what it would persist. */
const roundTrip = (stored: string): string => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: createRichEditorExtensions('Digite aqui...'),
    content: processLatexInHtml(stored),
  });
  const html = editor.getHTML();
  editor.destroy();
  return html;
};

const renderAsStudent = (html: string) =>
  render(<HtmlMathRenderer content={html} testId="student" />);

describe('digitação real: input rules do ProseMirror', () => {
  /**
   * Types `text` one character at a time through `handleTextInput` — the exact
   * ProseMirror hook a real keystroke goes through, so the input rules run
   * against real document positions.
   *
   * `editor.commands.insertContent(..., { applyInputRules: true })` is NOT used
   * here: it defers the rules to a macrotask with a position captured before
   * the edit, which throws once a rule shrinks the document.
   */
  const type = (text: string): string => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: createRichEditorExtensions('Digite aqui...'),
      content: '<p></p>',
    });

    for (const char of text) {
      const { from, to } = editor.state.selection;
      const fallback = () => editor.state.tr.insertText(char, from, to);
      const handled = editor.view.someProp('handleTextInput', (handler) =>
        handler(editor.view, from, to, char, fallback)
      );
      if (!handled) {
        editor.view.dispatch(fallback());
      }
    }

    const html = editor.getHTML();
    editor.destroy();
    return html;
  };

  it('converte $x^2$ sem exigir espaço após o cifrão final', () => {
    const html = type('valor $x^2$');

    expect(html).toContain('data-type="math-inline"');
    expect(html).toContain('data-latex="x^2"');
    expect(html).not.toContain('$');
  });

  it('converte $$...$$ em fórmula de bloco', () => {
    const html = type('total $$a+b$$');

    expect(html).toContain('data-display-mode="true"');
    expect(html).toContain('data-latex="a+b"');
    expect(html).not.toContain('$');
  });

  it('mantém R$1,00 e de R$0,50 como texto', () => {
    const html = type('moedas de R$1,00 e de R$0,50');

    expect(html).not.toContain('math-inline');
    expect(html).toContain('R$1,00 e de R$0,50');
  });
});

describe('LaTeX round-trip: editor → HTML salvo → visão do estudante', () => {
  it('preserva fórmula inline no enunciado do chamado', () => {
    const html = roundTrip(
      'Para cada número real $x \\neq 0$, definimos a matriz ' +
        '$A(x) = \\begin{pmatrix} -x-1 & \\frac{1}{x} \\\\ -x & \\frac{1}{x}+1 \\end{pmatrix}$. ' +
        'Assinale o que for correto.'
    );

    expect(html).toContain('data-type="math-inline"');
    renderAsStudent(html);

    const inline = screen.getAllByTestId('inline-math');
    expect(inline).toHaveLength(2);
    expect(inline[0]).toHaveTextContent('x \\neq 0');
    // A matriz continua inline: nada de quebra de linha inesperada.
    expect(inline[1]).toHaveTextContent('\\begin{pmatrix}');
    expect(screen.queryByTestId('block-math')).not.toBeInTheDocument();
    expect(screen.getByTestId('student')).toHaveTextContent(
      'Assinale o que for correto.'
    );
  });

  it('mantém $$...$$ como bloco dos dois lados', () => {
    const html = roundTrip(
      'Somando: $$A(x) + A(-x) = \\begin{pmatrix} -2 & 0 \\\\ 0 & 2 \\end{pmatrix} \\neq \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$$'
    );

    expect(html).toContain('data-display-mode="true"');
    // O par interno nunca pode ser reivindicado como fórmula inline.
    expect(html).not.toContain('$');

    renderAsStudent(html);
    expect(screen.getByTestId('block-math')).toHaveTextContent('\\neq');
    expect(screen.queryByTestId('inline-math')).not.toBeInTheDocument();
  });

  it('não converte valores monetários em nenhuma das pontas', () => {
    const statement =
      'Guardava moedas de R$1,00 e de R$0,50. Havia 530 moedas e um total de R$370,00.';
    const html = roundTrip(statement);

    expect(html).not.toContain('data-type="math-inline"');

    renderAsStudent(html);
    const student = screen.getByTestId('student');
    expect(student).toHaveTextContent('R$1,00');
    expect(student).toHaveTextContent('R$0,50');
    expect(student).toHaveTextContent('R$370,00');
    expect(screen.queryByTestId('inline-math')).not.toBeInTheDocument();
  });

  it('sobrevive a um segundo ciclo de edição sem corromper a fórmula', () => {
    // O `\begin{pmatrix}` dentro de `data-latex` não pode ser reprocessado.
    const first = roundTrip('$\\begin{pmatrix} a & b \\end{pmatrix}$');
    const second = roundTrip(first);

    expect(second).toBe(first);

    renderAsStudent(second);
    expect(screen.getByTestId('inline-math')).toHaveTextContent(
      '\\begin{pmatrix} a & b \\end{pmatrix}'
    );
  });

  it('converte ambiente LaTeX solto em bloco, igual ao renderizador', () => {
    const html = roundTrip('A = \\begin{pmatrix} 1 & 2 \\end{pmatrix}');

    expect(html).toContain('data-display-mode="true"');

    renderAsStudent(html);
    expect(screen.getByTestId('block-math')).toHaveTextContent(
      '\\begin{pmatrix} 1 & 2 \\end{pmatrix}'
    );
  });
});
