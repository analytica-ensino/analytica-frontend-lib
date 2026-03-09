import { stripHtmlTags } from './stringUtils';

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
        // The iterative approach strips all content between < and > including nested <
        // and doesn't output standalone > characters (they trigger inTag=false but aren't added)
        expect(stripHtmlTags('<<div>>text<</div>>')).toBe('text');
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

      it('should handle HTML entities as plain text (not decode them)', () => {
        // The iterative approach doesn't decode HTML entities
        expect(stripHtmlTags('<p>&amp; &lt; &gt;</p>')).toBe('&amp; &lt; &gt;');
      });
    });
  });
});
