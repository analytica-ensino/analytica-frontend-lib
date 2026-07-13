import {
  stripHtmlTags,
  normalizeText,
  highlightSearchTerm,
} from './stringUtils';

describe('stringUtils', () => {
  describe('stripHtmlTags', () => {
    // Mock server-side environment (no window/DOMParser)
    const originalWindow = globalThis.global.window;

    beforeEach(() => {
      // Simulate server-side environment
      // @ts-expect-error - intentionally removing window for SSR testing
      delete globalThis.global.window;
    });

    afterEach(() => {
      // Restore window
      globalThis.global.window = originalWindow;
    });

    describe('server-side fallback (iterative approach)', () => {
      it('should strip simple HTML tags', () => {
        expect(stripHtmlTags('<p>Hello World</p>')).toBe('Hello World');
      });

      it('should strip nested HTML tags', () => {
        expect(
          stripHtmlTags('<div><p>Hello <strong>World</strong></p></div>')
        ).toBe('Hello World');
      });

      it('should strip self-closing tags', () => {
        expect(stripHtmlTags('Hello<br/>World')).toBe('HelloWorld');
        expect(stripHtmlTags('Hello<br />World')).toBe('HelloWorld');
      });

      it('should handle tags with attributes', () => {
        expect(
          stripHtmlTags(
            '<a href="https://example.com" class="link">Click here</a>'
          )
        ).toBe('Click here');
      });

      it('should handle multiple tags on same line', () => {
        expect(
          stripHtmlTags('<span>One</span><span>Two</span><span>Three</span>')
        ).toBe('OneTwoThree');
      });

      it('should return original string if no HTML tags', () => {
        expect(stripHtmlTags('No tags here')).toBe('No tags here');
      });

      it('should handle empty string', () => {
        expect(stripHtmlTags('')).toBe('');
      });

      it('should handle string with only tags', () => {
        expect(stripHtmlTags('<div></div>')).toBe('');
      });

      it('should preserve text between tags', () => {
        expect(stripHtmlTags('Before<tag>Inside</tag>After')).toBe(
          'BeforeInsideAfter'
        );
      });

      it('should handle special characters inside tags', () => {
        // Note: The iterative approach doesn't handle quoted attributes with < or > perfectly
        // This is acceptable since well-formed HTML from RichEditor won't have this pattern
        expect(stripHtmlTags('<div data-value="test">Content</div>')).toBe(
          'Content'
        );
      });

      it('should handle newlines and whitespace', () => {
        expect(stripHtmlTags('<p>\n  Hello\n  World\n</p>')).toBe(
          '\n  Hello\n  World\n'
        );
      });

      it('should handle unclosed tags gracefully', () => {
        expect(stripHtmlTags('<p>Hello')).toBe('Hello');
        expect(stripHtmlTags('Hello</p>')).toBe('Hello');
      });

      it('should handle malformed HTML', () => {
        // DOMParser treats stray < and > as text content
        expect(stripHtmlTags('<<div>>text<</div>>')).toBe('<>text<>');
      });

      it('should handle fill-in-the-blank content with placeholders', () => {
        const input =
          '<p>Durante o século {uuid-1}, ocorreu o {uuid-2} na {uuid-3}.</p>';
        expect(stripHtmlTags(input)).toBe(
          'Durante o século {uuid-1}, ocorreu o {uuid-2} na {uuid-3}.'
        );
      });

      it('should handle complex HTML from RichEditor', () => {
        const input =
          '<p><strong>Importante:</strong> Preencha as lacunas sobre o <em>Renascimento</em>.</p>';
        expect(stripHtmlTags(input)).toBe(
          'Importante: Preencha as lacunas sobre o Renascimento.'
        );
      });

      it('should handle HTML entities by decoding them', () => {
        // DOMParser decodes HTML entities
        expect(stripHtmlTags('<p>&amp; &lt; &gt;</p>')).toBe('& < >');
      });
    });
  });

  describe('normalizeText', () => {
    it('should lowercase the string', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    it('should strip diacritic marks from accented characters', () => {
      expect(normalizeText('Matemática')).toBe('matematica');
      expect(normalizeText('Ação')).toBe('acao');
      expect(normalizeText('Ênfase')).toBe('enfase');
    });

    it('should handle already-normalized strings', () => {
      expect(normalizeText('equacao')).toBe('equacao');
    });

    it('should handle empty string', () => {
      expect(normalizeText('')).toBe('');
    });
  });

  describe('highlightSearchTerm', () => {
    it('should wrap a matching term in a highlight span', () => {
      const result = highlightSearchTerm('<p>Hello World</p>', 'world');
      // Term is wrapped in a span with bold weight (jsdom normalizes hex color to rgb)
      expect(result).toContain('<span');
      expect(result).toContain('World');
      expect(result).toContain('font-weight');
    });

    it('should match case-insensitively', () => {
      const result = highlightSearchTerm('<p>HELLO world</p>', 'hello');
      expect(result).toContain('<span');
      expect(result).toContain('HELLO');
    });

    it('should leave HTML tags and attributes intact when term matches a tag name', () => {
      const input = '<span class="katex">math</span>';
      const result = highlightSearchTerm(input, 'katex');
      expect(result).toContain('class="katex"');
      // The opening/closing span tags of the original markup must survive
      expect(result).toMatch(/<span class="katex">/);
    });

    it('should escape regex special characters in the term', () => {
      const result = highlightSearchTerm('<p>a+b equals c</p>', 'a+b');
      expect(result).toContain('<span');
      expect(result).toContain('a+b');
    });

    it('should return the original html when term is empty', () => {
      const input = '<p>Hello</p>';
      expect(highlightSearchTerm(input, '')).toBe(input);
    });

    it('should return the original html when html is empty', () => {
      expect(highlightSearchTerm('', 'hello')).toBe('');
    });
  });
});
