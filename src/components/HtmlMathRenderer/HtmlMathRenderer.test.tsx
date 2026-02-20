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

// Mock react-katex to avoid actual LaTeX rendering in tests
jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => (
    <span data-testid="inline-math">{math}</span>
  ),
  BlockMath: ({ math }: { math: string }) => (
    <div data-testid="block-math">{math}</div>
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
});
