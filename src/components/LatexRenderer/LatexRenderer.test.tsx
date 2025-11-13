import { render, screen } from '@testing-library/react';
import LatexRenderer from './LatexRenderer';

describe('LatexRenderer Component', () => {
  describe('Basic rendering', () => {
    it('renders plain text content correctly', () => {
      render(<LatexRenderer content="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders HTML content correctly', () => {
      render(<LatexRenderer content="<p>Hello World</p>" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders empty content without errors', () => {
      const { container } = render(<LatexRenderer content="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <LatexRenderer content="Test" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies default classes', () => {
      const { container } = render(<LatexRenderer content="Test" />);
      expect(container.firstChild).toHaveClass('whitespace-pre-wrap');
      expect(container.firstChild).toHaveClass('leading-relaxed');
    });

    it('applies custom styles', () => {
      const { container } = render(
        <LatexRenderer content="Test" style={{ color: 'red' }} />
      );
      expect(container.firstChild).toHaveStyle({ color: 'red' });
    });
  });

  describe('Inline math rendering', () => {
    it('renders inline math with single dollar signs', () => {
      const content = 'The formula is $E = mc^2$ for energy.';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders multiple inline math expressions', () => {
      const content = 'First $a + b$ and second $x - y$ formulas.';
      const { container } = render(<LatexRenderer content={content} />);
      const katexElements = container.querySelectorAll('.katex');
      expect(katexElements.length).toBeGreaterThanOrEqual(2);
    });

    it('renders inline math with latex tags', () => {
      const content = 'The formula is <latex>E = mc^2</latex> for energy.';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders inline math with escaped latex tags', () => {
      const content =
        'The formula is &lt;latex&gt;E = mc^2&lt;/latex&gt; for energy.';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('does not render escaped dollar signs', () => {
      const content = 'The price is \\$100';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.textContent).toContain('$100');
    });
  });

  describe('Block math rendering', () => {
    it('renders block math with double dollar signs', () => {
      const content = 'The equation is: $$E = mc^2$$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex-display')).toBeInTheDocument();
    });

    it('renders block math with LaTeX environment', () => {
      const content = '\\begin{equation}E = mc^2\\end{equation}';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders matrix with pmatrix environment', () => {
      const content = '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('applies centering class to block math', () => {
      const content = 'Equation: $$E = mc^2$$';
      const { container } = render(<LatexRenderer content={content} />);
      const blockMathDiv = container.querySelector('.text-center');
      expect(blockMathDiv).toBeInTheDocument();
    });
  });

  describe('Editor format rendering', () => {
    it('renders math-formula span with data-latex attribute', () => {
      const content =
        '<span class="math-formula" data-latex="E = mc^2">E = mc^2</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders math-formula span with display mode', () => {
      const content =
        '<span class="math-formula" data-latex="E = mc^2" data-display-mode="true">E = mc^2</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders legacy math-expression span', () => {
      const content =
        '<span class="math-expression" data-math="E = mc^2">E = mc^2</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('decodes HTML entities in data-latex attribute', () => {
      // Test with &lt; entity which should decode to < for LaTeX comparison
      const content =
        '<span class="math-formula" data-latex="a &lt; b">test</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
      // The decoded LaTeX should be "a < b"
    });

    it('decodes HTML entities in data-math attribute', () => {
      const content =
        '<span class="math-expression" data-math="x &lt; y">test</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('decodes ampersand entities in LaTeX', () => {
      // Test matrix with &amp; which should decode to &
      const content =
        '<span class="math-formula" data-latex="\\begin{matrix} a &amp; b \\\\ c &amp; d \\end{matrix}">test</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });
  });

  describe('Mixed content rendering', () => {
    it('renders text mixed with inline and block math', () => {
      const content =
        'Inline $a + b$ and block: $$\\sum_{i=1}^{n} x_i$$ formulas.';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
      expect(container.querySelector('.katex-display')).toBeInTheDocument();
    });

    it('renders HTML mixed with LaTeX', () => {
      const content =
        '<p>First paragraph with $x^2$</p><p>Second with $$y^2$$</p>';
      const { container } = render(<LatexRenderer content={content} />);
      const katexElements = container.querySelectorAll('.katex');
      expect(katexElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error handling', () => {
    it('renders with default error handler for invalid LaTeX', () => {
      const content = '$\\invalidcommand$';
      const { container } = render(<LatexRenderer content={content} />);
      // Should still render something (KaTeX handles errors gracefully)
      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses custom error handler when provided for inline math', () => {
      const content = '$\\invalidcommand$';
      const onError = (latex: string) => <span>Custom error: {latex}</span>;
      render(<LatexRenderer content={content} onError={onError} />);
      // KaTeX might still render, but our custom handler should be available
      expect(screen.getByText(/Custom error/i)).toBeInTheDocument();
    });

    it('uses custom error handler when provided for block math', () => {
      const content = '$$\\invalidcommand$$';
      const onError = (latex: string) => (
        <span>Custom block error: {latex}</span>
      );
      render(<LatexRenderer content={content} onError={onError} />);
      // KaTeX might still render, but our custom handler should be available
      expect(screen.getByText(/Custom block error/i)).toBeInTheDocument();
    });
  });

  describe('Special characters handling', () => {
    it('cleans invisible characters from LaTeX', () => {
      // Using zero-width space character
      const content = '$E\u200B = mc^2$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('handles complex mathematical expressions', () => {
      const content = '$\\frac{a}{b} + \\sqrt{x} + \\int_0^1 f(x)dx$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('handles Greek letters', () => {
      const content = '$\\alpha + \\beta + \\gamma$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('handles superscripts and subscripts', () => {
      const content = '$x^2 + y_1$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty LaTeX expression', () => {
      const content = '$$$$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles single dollar sign (not math)', () => {
      const content = 'The price is $ 100';
      const { container } = render(<LatexRenderer content={content} />);
      // Should not render as math if there's no closing $
      expect(container.textContent).toContain('100');
    });

    it('handles nested HTML tags', () => {
      const content = '<div><p>Formula: $a + b$</p></div>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    it('preserves whitespace correctly', () => {
      const content = 'First line\nSecond line';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.firstChild).toHaveClass('whitespace-pre-wrap');
    });

    it('handles invalid math-id gracefully', () => {
      // This tests the case where a data-math-id doesn't correspond to any mathPart
      const content = '<span data-math-id="999">Invalid</span>';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.firstChild).toBeInTheDocument();
      // Should render the span as-is since the math-id is invalid
      expect(container.textContent).toContain('Invalid');
    });
  });

  describe('Multiple formats in same content', () => {
    it('handles all format types together', () => {
      const content = `
        <p>Inline dollar: $a + b$</p>
        <p>Inline latex tag: <latex>x^2</latex></p>
        <p>Block dollar: $$\\sum_{i=1}^{n} i$$</p>
        <p>Environment: \\begin{equation}E = mc^2\\end{equation}</p>
      `;
      const { container } = render(<LatexRenderer content={content} />);
      const katexElements = container.querySelectorAll('.katex');
      expect(katexElements.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const content = 'Formula: $E = mc^2$';
      const { container } = render(<LatexRenderer content={content} />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('maintains readability with leading-relaxed class', () => {
      const { container } = render(<LatexRenderer content="Test" />);
      expect(container.firstChild).toHaveClass('leading-relaxed');
    });
  });
});
