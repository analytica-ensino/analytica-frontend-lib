import { render, screen } from '@testing-library/react';
import MarkdownMathRenderer, {
  protectCurrencyInlineMath,
  reflowDisplayMath,
} from './MarkdownMathRenderer';
import HtmlMathRenderer from '../HtmlMathRenderer/HtmlMathRenderer';
import { isLikelyMarkdown } from '../HtmlMathRenderer/utils';

// react-markdown / remark / rehype ship ESM and are stubbed via jest
// moduleNameMapper. react-katex is mocked here for the HTML-path branches that
// HtmlMathRenderer may exercise.
jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => (
    <span data-testid="inline-math">{math}</span>
  ),
  BlockMath: ({ math }: { math: string }) => (
    <div data-testid="block-math">{math}</div>
  ),
}));

describe('isLikelyMarkdown', () => {
  it('returns false for empty content', () => {
    expect(isLikelyMarkdown('')).toBe(false);
  });

  it('treats content with HTML tags as NOT markdown (HTML path)', () => {
    expect(isLikelyMarkdown('<p>Olá <b>mundo</b></p>')).toBe(false);
    expect(
      isLikelyMarkdown('<span class="math-formula" data-latex="x^2">x^2</span>')
    ).toBe(false);
    expect(isLikelyMarkdown('Texto com <br/> quebra')).toBe(false);
    expect(isLikelyMarkdown('Use <latex>x^2</latex> aqui')).toBe(false);
    expect(isLikelyMarkdown('<sub>2</sub>O')).toBe(false);
  });

  it('detects markdown headings, bold, lists and paragraph breaks', () => {
    expect(isLikelyMarkdown('#### Conclusão\n\ntexto')).toBe(true);
    expect(isLikelyMarkdown('A afirmativa é **Verdadeira**.')).toBe(true);
    expect(isLikelyMarkdown('texto __forte__ aqui')).toBe(true);
    expect(isLikelyMarkdown('* item um\n* item dois')).toBe(true);
    expect(isLikelyMarkdown('- item\n- outro')).toBe(true);
    expect(isLikelyMarkdown('1. primeiro\n2. segundo')).toBe(true);
    expect(isLikelyMarkdown('Parágrafo um.\n\nParágrafo dois.')).toBe(true);
  });

  it('does not flag plain prose or single-line math as markdown', () => {
    expect(isLikelyMarkdown('Uma frase simples sem marcação.')).toBe(false);
    expect(isLikelyMarkdown('A fórmula é $\\frac{1}{2} u$ apenas.')).toBe(
      false
    );
    // multiplication asterisks must not be treated as bold
    expect(isLikelyMarkdown('Calcule 3 * 4 * 5 com cuidado.')).toBe(false);
  });
});

describe('protectCurrencyInlineMath', () => {
  it('escapes currency $ spans so they are not parsed as math', () => {
    const out = protectCurrencyInlineMath(
      'O preço é R$ 15,00 reais e o livro custa R$ 42,00 no total.'
    );
    expect(out).toBe(
      'O preço é R\\$ 15,00 reais e o livro custa R\\$ 42,00 no total.'
    );
  });

  it('keeps real inline math untouched', () => {
    const input = 'A fórmula $x^2 + 1$ é importante.';
    expect(protectCurrencyInlineMath(input)).toBe(input);
  });

  it('does not touch display math ($$...$$)', () => {
    const input = 'Equação: $$a = b$$ pronta.';
    expect(protectCurrencyInlineMath(input)).toBe(input);
  });
});

describe('reflowDisplayMath', () => {
  it('reflows single-line $$...$$ into block (display) form', () => {
    expect(reflowDisplayMath('Veja $$a = b$$ agora')).toBe(
      'Veja \n\n$$\na = b\n$$\n\n agora'
    );
  });

  it('leaves inline single-$ math untouched', () => {
    const input = 'inline $x^2$ aqui';
    expect(reflowDisplayMath(input)).toBe(input);
  });
});

describe('MarkdownMathRenderer (component)', () => {
  it('renders markdown bold via react-markdown', () => {
    render(<MarkdownMathRenderer content="A afirmativa é **Verdadeira**." />);
    expect(screen.getByText('Verdadeira')).toBeInTheDocument();
    expect(screen.getByText('Verdadeira').tagName).toBe('STRONG');
  });

  it('renders bullet lists', () => {
    const { container } = render(
      <MarkdownMathRenderer content={'* item um\n* item dois'} />
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('applies testId, className and style', () => {
    const { container } = render(
      <MarkdownMathRenderer
        content="**oi**"
        testId="md"
        className="custom-class"
        style={{ color: 'red' }}
      />
    );
    const root = screen.getByTestId('md');
    expect(root).toBeInTheDocument();
    expect(root.className).toContain('custom-class');
    expect(container.querySelector('[data-testid="md"]')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    });
  });

  it('returns gracefully for empty content', () => {
    const { container } = render(<MarkdownMathRenderer content="" />);
    expect(container).toBeInTheDocument();
  });
});

describe('HtmlMathRenderer delegation', () => {
  it('delegates markdown content to the markdown renderer', () => {
    render(
      <HtmlMathRenderer content={'#### Título\n\nA resposta é **certa**.'} />
    );
    expect(screen.getByText('certa').tagName).toBe('STRONG');
  });

  it('keeps HTML content on the HTML path (bold stays via tags)', () => {
    const { container } = render(
      <HtmlMathRenderer content="<p>Olá <b>mundo</b></p>" />
    );
    expect(container.querySelector('b')?.textContent).toBe('mundo');
  });

  it('does NOT route inline usage to markdown (phrasing-content safe)', () => {
    const { container } = render(
      <HtmlMathRenderer content="valor **destaque**" inline />
    );
    // On the inline HTML path the markdown tokens stay literal (no <strong>).
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toContain('**destaque**');
  });
});
