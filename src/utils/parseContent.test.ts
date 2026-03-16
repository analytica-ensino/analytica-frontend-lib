import { parseContent, ParsedContentPart } from './parseContent';

describe('parseContent', () => {
  describe('Basic Parsing', () => {
    it('parses content with single placeholder', () => {
      const result = parseContent('Hello {uuid-1} world');
      expect(result).toEqual([
        { type: 'text', value: 'Hello ' },
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: ' world' },
      ]);
    });

    it('parses content with multiple placeholders', () => {
      const result = parseContent('A {uuid-1} is a {uuid-2}');
      expect(result).toEqual([
        { type: 'text', value: 'A ' },
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: ' is a ' },
        { type: 'placeholder', value: 'uuid-2' },
      ]);
    });

    it('parses content with no placeholders', () => {
      const result = parseContent('Just plain text');
      expect(result).toEqual([
        { type: 'text', value: 'Just plain text' },
      ]);
    });

    it('parses content with only placeholder', () => {
      const result = parseContent('{uuid-1}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('handles empty string', () => {
      const result = parseContent('');
      expect(result).toEqual([]);
    });
  });

  describe('Placeholder Positions', () => {
    it('handles placeholder at start', () => {
      const result = parseContent('{uuid-1} is first');
      expect(result).toEqual([
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: ' is first' },
      ]);
    });

    it('handles placeholder at end', () => {
      const result = parseContent('Last is {uuid-1}');
      expect(result).toEqual([
        { type: 'text', value: 'Last is ' },
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('handles consecutive placeholders', () => {
      const result = parseContent('{uuid-1}{uuid-2}{uuid-3}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'placeholder', value: 'uuid-2' },
        { type: 'placeholder', value: 'uuid-3' },
      ]);
    });

    it('handles placeholders separated by single character', () => {
      const result = parseContent('{uuid-1} {uuid-2}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: ' ' },
        { type: 'placeholder', value: 'uuid-2' },
      ]);
    });
  });

  describe('Placeholder ID Formats', () => {
    it('parses UUID format', () => {
      const result = parseContent('{abc-123-def-456}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'abc-123-def-456' },
      ]);
    });

    it('parses alphanumeric IDs', () => {
      const result = parseContent('{option1}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'option1' },
      ]);
    });

    it('parses IDs with hyphens', () => {
      const result = parseContent('{my-placeholder-id}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'my-placeholder-id' },
      ]);
    });

    it('parses uppercase IDs', () => {
      const result = parseContent('{UUID-ABC-123}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'UUID-ABC-123' },
      ]);
    });

    it('parses mixed case IDs', () => {
      const result = parseContent('{MyPlaceHolder123}');
      expect(result).toEqual([
        { type: 'placeholder', value: 'MyPlaceHolder123' },
      ]);
    });
  });

  describe('HTML Stripping', () => {
    it('strips simple HTML tags', () => {
      const result = parseContent('<p>Hello {uuid-1}</p>');
      expect(result).toEqual([
        { type: 'text', value: 'Hello ' },
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('strips nested HTML tags', () => {
      const result = parseContent('<div><p><strong>Bold {uuid-1}</strong></p></div>');
      expect(result).toEqual([
        { type: 'text', value: 'Bold ' },
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('strips HTML tags with attributes', () => {
      const result = parseContent('<span class="highlight">{uuid-1}</span>');
      expect(result).toEqual([
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('decodes HTML entities', () => {
      const result = parseContent('Hello &amp; {uuid-1}');
      expect(result).toEqual([
        { type: 'text', value: 'Hello & ' },
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });

    it('strips self-closing HTML tags', () => {
      const result = parseContent('Before<br/>After {uuid-1}');
      expect(result).toEqual([
        { type: 'text', value: 'BeforeAfter ' },
        { type: 'placeholder', value: 'uuid-1' },
      ]);
    });
  });

  describe('Special Characters', () => {
    it('handles curly braces in text (incomplete placeholders)', () => {
      const result = parseContent('Not a placeholder { or }');
      expect(result).toEqual([
        { type: 'text', value: 'Not a placeholder { or }' },
      ]);
    });

    it('handles escaped-like braces', () => {
      const result = parseContent('Text with \\{uuid-1\\}');
      // The regex won't match because of the backslash
      expect(result.some(p => p.type === 'placeholder')).toBe(false);
    });

    it('handles special regex characters in text', () => {
      const result = parseContent('Special chars .+*?^${}()|[]\\  and {uuid-1}');
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({ type: 'placeholder', value: 'uuid-1' });
    });

    it('handles unicode characters', () => {
      const result = parseContent('Você é {uuid-1} fantástico');
      expect(result).toEqual([
        { type: 'text', value: 'Você é ' },
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: ' fantástico' },
      ]);
    });

    it('handles newlines and tabs', () => {
      const result = parseContent('Line 1\n{uuid-1}\tLine 2');
      expect(result).toEqual([
        { type: 'text', value: 'Line 1\n' },
        { type: 'placeholder', value: 'uuid-1' },
        { type: 'text', value: '\tLine 2' },
      ]);
    });
  });

  describe('Invalid Placeholders', () => {
    it('ignores placeholders with spaces', () => {
      const result = parseContent('{uuid 1}');
      expect(result).toEqual([
        { type: 'text', value: '{uuid 1}' },
      ]);
    });

    it('ignores placeholders with special characters', () => {
      const result = parseContent('{uuid@1}');
      expect(result).toEqual([
        { type: 'text', value: '{uuid@1}' },
      ]);
    });

    it('ignores empty placeholders', () => {
      const result = parseContent('{}');
      expect(result).toEqual([
        { type: 'text', value: '{}' },
      ]);
    });

    it('ignores nested braces', () => {
      const result = parseContent('{{uuid-1}}');
      // The inner {uuid-1} should be parsed, outer braces are text
      expect(result).toHaveLength(3);
      expect(result[1]).toEqual({ type: 'placeholder', value: 'uuid-1' });
    });
  });

  describe('Real-world Scenarios', () => {
    it('parses a complete fill-in-blanks sentence', () => {
      const result = parseContent('A {uuid-1} é um {uuid-2}. O {uuid-3} é uma {uuid-4}.');
      expect(result).toHaveLength(9); // 5 text parts + 4 placeholders
      expect(result.filter(p => p.type === 'placeholder')).toHaveLength(4);
      expect(result.filter(p => p.type === 'text')).toHaveLength(5);
    });

    it('parses HTML formatted question', () => {
      const result = parseContent(
        '<p>Complete a frase: A <strong>{uuid-1}</strong> é um <em>{uuid-2}</em>.</p>'
      );
      expect(result.filter(p => p.type === 'placeholder')).toHaveLength(2);
      expect(result.filter(p => p.type === 'text')).toHaveLength(3);
    });

    it('parses long educational content', () => {
      const content = `
        O {uuid-1} foi um período importante na história da humanidade.
        Durante esse período, surgiram grandes {uuid-2} como Leonardo da Vinci.
        As principais características incluíam o {uuid-3} e a {uuid-4}.
      `;
      const result = parseContent(content);
      expect(result.filter(p => p.type === 'placeholder')).toHaveLength(4);
    });
  });

  describe('Return Type', () => {
    it('returns an array', () => {
      const result = parseContent('test');
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns correct type structure', () => {
      const result = parseContent('Hello {uuid-1} world');
      result.forEach(part => {
        expect(part).toHaveProperty('type');
        expect(part).toHaveProperty('value');
        expect(['text', 'placeholder']).toContain(part.type);
        expect(typeof part.value).toBe('string');
      });
    });

    it('preserves order of parts', () => {
      const result = parseContent('1{a}2{b}3{c}4');
      expect(result.map(p => p.value)).toEqual(['1', 'a', '2', 'b', '3', 'c', '4']);
    });
  });
});
