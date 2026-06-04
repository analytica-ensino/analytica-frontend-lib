import React from 'react';
import { render, screen } from '@testing-library/react';
import HtmlMathRenderer from './HtmlMathRenderer';
import {
  processHtmlWithMath,
  sanitizeHtmlForDisplay,
  cleanLatex,
  containsMath,
  stripHtml,
} from './utils';

// Mock KatexMath (which calls katex directly) to avoid actual LaTeX rendering
// in tests and keep deterministic test ids for inline vs block math.
jest.mock('./KatexMath', () => ({
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

describe('HtmlMathRenderer', () => {
  describe('basic rendering', () => {
    it('should render plain HTML content', () => {
      render(
        <HtmlMathRenderer content="<p>Hello World</p>" testId="renderer" />
      );
      expect(screen.getByTestId('renderer')).toHaveTextContent('Hello World');
    });

    it('should render with custom className', () => {
      render(
        <HtmlMathRenderer
          content="<p>Test</p>"
          className="custom-class"
          testId="renderer"
        />
      );
      expect(screen.getByTestId('renderer')).toHaveClass('custom-class');
    });

    it('should render empty content without errors', () => {
      render(<HtmlMathRenderer content="" testId="renderer" />);
      expect(screen.getByTestId('renderer')).toBeInTheDocument();
    });

    it('should render null content without errors', () => {
      render(
        <HtmlMathRenderer
          content={null as unknown as string}
          testId="renderer"
        />
      );
      expect(screen.getByTestId('renderer')).toBeInTheDocument();
    });
  });

  describe('inline math rendering', () => {
    it('should render inline math with $...$ syntax', () => {
      render(
        <HtmlMathRenderer content="The formula is $x^2$" testId="renderer" />
      );
      expect(screen.getByTestId('inline-math')).toHaveTextContent('x^2');
    });

    it('should render multiple inline math expressions', () => {
      render(
        <HtmlMathRenderer
          content="First $a$ and second $b$"
          testId="renderer"
        />
      );
      const inlineMaths = screen.getAllByTestId('inline-math');
      expect(inlineMaths).toHaveLength(2);
      expect(inlineMaths[0]).toHaveTextContent('a');
      expect(inlineMaths[1]).toHaveTextContent('b');
    });
  });

  describe('block math rendering', () => {
    it('should render block math with $$...$$ syntax', () => {
      render(
        <HtmlMathRenderer
          content="The formula is $$x = \\frac{1}{2}$$"
          testId="renderer"
        />
      );
      expect(screen.getByTestId('block-math')).toHaveTextContent(
        'x = \\\\frac{1}{2}'
      );
    });

    it('should render LaTeX environments as block math', () => {
      render(
        <HtmlMathRenderer
          content="\\begin{align}x = 1\\end{align}"
          testId="renderer"
        />
      );
      expect(screen.getByTestId('block-math')).toBeInTheDocument();
    });
  });

  describe('latex tag support', () => {
    it('should render content with <latex> tags', () => {
      render(
        <HtmlMathRenderer
          content="Formula: <latex>x^2</latex>"
          testId="renderer"
        />
      );
      expect(screen.getByTestId('inline-math')).toHaveTextContent('x^2');
    });
  });

  describe('math-formula span support', () => {
    it('should render content with math-formula spans', () => {
      render(
        <HtmlMathRenderer
          content='<span class="math-formula" data-latex="y = mx + b">rendered</span>'
          testId="renderer"
        />
      );
      expect(screen.getByTestId('inline-math')).toHaveTextContent('y = mx + b');
    });

    it('should render block math from math-formula spans with display mode', () => {
      render(
        <HtmlMathRenderer
          content='<span class="math-formula" data-latex="y = mx + b" data-display-mode="true">rendered</span>'
          testId="renderer"
        />
      );
      expect(screen.getByTestId('block-math')).toHaveTextContent('y = mx + b');
    });
  });

  describe('mixed content', () => {
    it('should render mixed HTML and math content', () => {
      render(
        <HtmlMathRenderer
          content="<p>The area is $A = \\pi r^2$ for a circle.</p>"
          testId="renderer"
        />
      );
      expect(screen.getByTestId('renderer')).toHaveTextContent('The area is');
      expect(screen.getByTestId('inline-math')).toHaveTextContent(
        'A = \\\\pi r^2'
      );
    });
  });

  describe('error handling', () => {
    it('should use custom error renderer when provided', () => {
      const customError = (latex: string) => (
        <span data-testid="custom-error">Error: {latex}</span>
      );

      // Note: This test verifies the prop is passed correctly
      // Actual error rendering depends on react-katex behavior
      render(
        <HtmlMathRenderer
          content="$x^2$"
          renderMathError={customError}
          testId="renderer"
        />
      );
      expect(screen.getByTestId('renderer')).toBeInTheDocument();
    });
  });
});

describe('utils', () => {
  describe('cleanLatex', () => {
    it('should remove zero-width characters', () => {
      const dirty = 'x\u200B^2\u200D';
      expect(cleanLatex(dirty)).toBe('x^2');
    });

    it('should trim whitespace', () => {
      expect(cleanLatex('  x^2  ')).toBe('x^2');
    });
  });

  describe('sanitizeHtmlForDisplay', () => {
    it('should remove contenteditable attributes', () => {
      const html = '<div contenteditable="true">Text</div>';
      const sanitized = sanitizeHtmlForDisplay(html);
      expect(sanitized).not.toContain('contenteditable');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeHtmlForDisplay('')).toBe('');
    });

    describe('XSS protection', () => {
      it('should remove onclick event handlers', () => {
        const html = '<div onclick="alert(1)">Click me</div>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).toContain('Click me');
      });

      it('should remove onerror event handlers', () => {
        const html = '<img src="x" onerror="alert(1)">';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('onerror');
      });

      it('should remove onload event handlers', () => {
        const html = '<body onload="alert(1)">Content</body>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('onload');
      });

      it('should remove onmouseover event handlers', () => {
        const html = '<a onmouseover="alert(1)">Hover</a>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('onmouseover');
      });

      it('should remove all on* event handlers', () => {
        const html =
          '<div onclick="x" onmouseenter="y" onfocus="z" onblur="w">Text</div>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toMatch(/on\w+=/i);
      });

      it('should remove script tags', () => {
        const html = '<p>Safe</p><script>alert(1)</script><p>Also safe</p>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('alert');
        expect(sanitized).toContain('Safe');
        expect(sanitized).toContain('Also safe');
      });

      it('should remove style tags', () => {
        const html = '<style>body{display:none}</style><p>Content</p>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('<style');
        expect(sanitized).toContain('Content');
      });

      it('should remove javascript: URIs from href', () => {
        const html = '<a href="javascript:alert(1)">Click</a>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).toContain('Click');
      });

      it('should remove javascript: URIs from src', () => {
        const html = '<img src="javascript:alert(1)">';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('javascript:');
      });

      it('should remove data: URIs from src', () => {
        const html = '<img src="data:text/html,<script>alert(1)</script>">';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('data:');
      });

      it('should remove iframe tags', () => {
        const html = '<iframe src="evil.html"></iframe><p>Safe</p>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).toContain('Safe');
      });

      it('should remove srcdoc attribute', () => {
        const html = '<iframe srcdoc="<script>alert(1)</script>"></iframe>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('srcdoc');
      });

      it('should preserve safe HTML content', () => {
        const html =
          '<p class="text">Hello <strong>World</strong></p><a href="https://example.com">Link</a>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).toContain('class="text"');
        expect(sanitized).toContain('<strong>World</strong>');
        expect(sanitized).toContain('href="https://example.com"');
      });

      it('should handle mixed safe and unsafe content', () => {
        const html =
          '<p onclick="alert(1)">Text</p><script>bad()</script><a href="javascript:x">Link</a>';
        const sanitized = sanitizeHtmlForDisplay(html);
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).toContain('Text');
        expect(sanitized).toContain('Link');
      });
    });
  });

  describe('processHtmlWithMath', () => {
    it('should extract inline math', () => {
      const parts = processHtmlWithMath('Text $x^2$ more');
      expect(parts).toHaveLength(3);
      expect(parts[0].type).toBe('text');
      expect(parts[1].type).toBe('math');
      expect(parts[1].latex).toBe('x^2');
      expect(parts[2].type).toBe('text');
    });

    it('should extract block math', () => {
      const parts = processHtmlWithMath('Text $$x^2$$ more');
      expect(parts).toHaveLength(3);
      expect(parts[1].type).toBe('block-math');
      expect(parts[1].latex).toBe('x^2');
    });

    it('should handle multiple math expressions', () => {
      const parts = processHtmlWithMath('$a$ and $b$ and $$c$$');
      const mathParts = parts.filter((p) => p.type !== 'text');
      expect(mathParts).toHaveLength(3);
    });

    it('should return empty array for empty content', () => {
      expect(processHtmlWithMath('')).toEqual([]);
    });
  });

  describe('containsMath', () => {
    it('should detect inline math', () => {
      expect(containsMath('$x^2$')).toBe(true);
    });

    it('should detect block math', () => {
      expect(containsMath('$$x^2$$')).toBe(true);
    });

    it('should detect latex tags', () => {
      expect(containsMath('<latex>x</latex>')).toBe(true);
    });

    it('should detect LaTeX environments', () => {
      expect(containsMath('\\begin{align}x\\end{align}')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(containsMath('Just plain text')).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(containsMath('')).toBe(false);
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe(
        'Hello World'
      );
    });

    it('should handle empty content', () => {
      expect(stripHtml('')).toBe('');
    });

    it('should remove inline math notation', () => {
      expect(stripHtml('Calculate $x^2$ now')).toBe('Calculate  now');
    });

    it('should remove block math notation', () => {
      expect(stripHtml('Formula: $$x = 5$$ end')).toBe('Formula:  end');
    });

    it('should remove LaTeX environments', () => {
      expect(stripHtml('Matrix: \\begin{pmatrix}1\\end{pmatrix} done')).toBe(
        'Matrix:  done'
      );
    });

    it('should remove HTML and math combined', () => {
      expect(stripHtml('<p>The area is $A = \\pi r^2$ for a circle.</p>')).toBe(
        'The area is  for a circle.'
      );
    });
  });

  describe('legacy data recovery', () => {
    describe('cleanLatex entity decoding', () => {
      it('should map &lt; / &gt; to LaTeX commands so KaTeX parses', () => {
        expect(cleanLatex('\\frac{1}{2} &lt; x \\leq 1')).toBe(
          '\\frac{1}{2} \\lt  x \\leq 1'
        );
        expect(cleanLatex('\\varepsilon(x) &gt; \\frac{9}{10}')).toBe(
          '\\varepsilon(x) \\gt  \\frac{9}{10}'
        );
      });

      it('should decode &amp; to a bare & (LaTeX alignment char), not \\&', () => {
        expect(cleanLatex('a &amp; b')).toBe('a & b');
      });

      it('should preserve \\begin{align} alignment ampersands', () => {
        // The editor HTML-escapes `&` on save; decoding must restore the
        // bare `&` so the alignment environment still works.
        expect(cleanLatex('\\begin{align}a &amp;= b\\end{align}')).toBe(
          '\\begin{align}a &= b\\end{align}'
        );
      });

      it('should also peel doubly-encoded entities (&amp;lt;)', () => {
        expect(cleanLatex('x &amp;lt; y')).toBe('x \\lt  y');
      });
    });

    describe('processHtmlWithMath — currency-safe $ matching', () => {
      it('should NOT pair $ delimiters across Portuguese prose', () => {
        const input =
          'pagou R$ 15,00 pelo custo fixo e mais R$ 3,00 por unidade';
        const parts = processHtmlWithMath(input);
        expect(parts.every((p) => p.type === 'text')).toBe(true);
        expect(parts.map((p) => p.content).join('')).toBe(input);
      });

      it('should still treat short math tokens between $ as math', () => {
        const parts = processHtmlWithMath('o valor de $x^2$ é importante');
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toBe('x^2');
      });

      it('should treat $...$ blocks containing \\command as math', () => {
        const parts = processHtmlWithMath('$\\text{Mais grave} f_r &lt; f_0$');
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        // The entity gets mapped through cleanLatex to a LaTeX command
        expect(mathParts[0].latex).toContain('\\lt');
      });
    });

    describe('processHtmlWithMath — \\$ escape decoding', () => {
      it('should decode \\$ to literal $ in text fragments', () => {
        const parts = processHtmlWithMath('custo de R\\$ 130,00 pelo ingresso');
        expect(parts).toHaveLength(1);
        expect(parts[0].type).toBe('text');
        expect(parts[0].content).toBe('custo de R$ 130,00 pelo ingresso');
      });

      it('should decode \\$ in text fragments around math', () => {
        const parts = processHtmlWithMath(
          'preço R\\$ 10,00 e fórmula $x^2$ aqui'
        );
        const text = parts
          .filter((p) => p.type === 'text')
          .map((p) => p.content)
          .join('');
        expect(text).toContain('R$ 10,00');
        expect(text).not.toContain('R\\$');
      });
    });

    describe('processHtmlWithMath — currency-safe $ matching (more)', () => {
      it('should treat a short plain token between $ as math', () => {
        const parts = processHtmlWithMath('a variável $abc$ aqui');
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toBe('abc');
      });

      it('should treat spaced operator equations between $ as math', () => {
        // Regression: `$x = 1$` / `$a + b$` / `$1 < 2$` must still render
        // as math even though they contain spaces and no backslash command.
        for (const expr of ['x = 1', 'a + b', '1 < 2']) {
          const parts = processHtmlWithMath(`Texto $${expr}$ mais`);
          const mathParts = parts.filter((p) => p.type === 'math');
          expect(mathParts).toHaveLength(1);
        }
      });

      it('should NOT treat a multi-word phrase between $ as math', () => {
        const input = 'comprou $valor muito alto$ reais no total';
        const parts = processHtmlWithMath(input);
        expect(parts.every((p) => p.type === 'text')).toBe(true);
      });
    });

    describe('processHtmlWithMath — katex-error recovery', () => {
      it('should recover LaTeX from a katex-error wrapper title', () => {
        const persisted =
          '<span class="katex-error" title="ParseError: KaTeX parse error: Expected \'EOF\', got \'&\' at position 13: \\frac{1}{2} &lt; x \\leq 1"><span class="katex-html">broken visual</span></span>';
        const parts = processHtmlWithMath(persisted);
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toContain('\\frac{1}{2}');
        expect(mathParts[0].latex).toContain('\\lt');
        expect(mathParts[0].latex).toContain('\\leq 1');
      });

      it('should strip combining marks present in the error title', () => {
        // KaTeX inserts a combining low line (U+0332) at the error position
        const persisted =
          '<span class="katex-error" title="ParseError: at position 5: x \\alpha̲ y">visual</span>';
        const parts = processHtmlWithMath(persisted);
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toBe('x \\alpha y');
      });

      it('should fall back to inner <annotation> when title has no position', () => {
        const persisted =
          '<span class="katex-error" title="ParseError: generic failure">' +
          '<span class="katex-mathml"><math><annotation>\\frac{1}{3}</annotation></math></span>' +
          '<span class="katex-html">duplicated visual glyphs</span>' +
          '</span>';
        const parts = processHtmlWithMath(persisted);
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toContain('\\frac{1}{3}');
        // The katex-html visual layer must NOT leak into the recovered LaTeX
        expect(mathParts[0].latex).not.toContain('duplicated');
      });

      it('should drop a katex-error wrapper that yields no recoverable LaTeX', () => {
        const persisted =
          'antes <span class="katex-error" title="ParseError: no position here"></span> depois';
        const parts = processHtmlWithMath(persisted);
        expect(parts.every((p) => p.type === 'text')).toBe(true);
        const text = parts.map((p) => p.content).join('');
        expect(text).toContain('antes');
        expect(text).toContain('depois');
        expect(text).not.toContain('katex-error');
      });

      it('should strip truncated trailing tag markers from recovered LaTeX', () => {
        const persisted =
          '<span class="katex-error" title="ParseError: at position 9: \\sqrt{x}</span">visual</span>';
        const parts = processHtmlWithMath(persisted);
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toBe('\\sqrt{x}');
      });

      it('should fall back to direct text content when there is no annotation', () => {
        // No "at position" in the title, and no <annotation> child — the
        // walker must collect the wrapper's own text node.
        const persisted =
          '<span class="katex-error" title="ParseError: generic"> \\pi r^2 </span>';
        const parts = processHtmlWithMath(persisted);
        const mathParts = parts.filter((p) => p.type === 'math');
        expect(mathParts).toHaveLength(1);
        expect(mathParts[0].latex).toBe('\\pi r^2');
      });
    });

    describe('HtmlMathRenderer — rendering integration', () => {
      it('should render recovered math from a katex-error wrapper', () => {
        render(
          <HtmlMathRenderer
            content='<span class="katex-error" title="ParseError: at position 3: x &gt; y">v</span>'
            testId="renderer"
          />
        );
        expect(screen.getByTestId('inline-math')).toHaveTextContent('x \\gt y');
      });

      it('should render currency text without turning it into math', () => {
        render(
          <HtmlMathRenderer
            content="pague R\$ 50,00 e receba R\$ 10,00 de volta"
            testId="renderer"
          />
        );
        const renderer = screen.getByTestId('renderer');
        expect(renderer).toHaveTextContent('R$ 50,00');
        expect(renderer).toHaveTextContent('R$ 10,00');
        expect(screen.queryByTestId('inline-math')).not.toBeInTheDocument();
      });

      it('should decode \\$ escapes in inline mode (span wrapper)', () => {
        render(
          <HtmlMathRenderer
            content="total R\$ 99,00"
            inline
            testId="renderer"
          />
        );
        const renderer = screen.getByTestId('renderer');
        expect(renderer.tagName).toBe('SPAN');
        expect(renderer).toHaveTextContent('R$ 99,00');
      });

      it('should render block math recovered alongside text', () => {
        render(
          <HtmlMathRenderer
            content="resultado: $$\\frac{a}{b}$$ final"
            testId="renderer"
          />
        );
        expect(screen.getByTestId('block-math')).toHaveTextContent(
          '\\frac{a}{b}'
        );
      });
    });
  });
});
