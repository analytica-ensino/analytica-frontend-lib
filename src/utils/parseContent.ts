import { stripHtmlTags } from './stringUtils';

export interface ParsedContentPart {
  type: 'text' | 'placeholder';
  value: string;
}

/**
 * Parse content and extract text parts and placeholder IDs
 * Extracts {uuid} placeholders from text content, stripping HTML tags first
 *
 * @param content - String that may contain HTML and {uuid} placeholders
 * @returns Array of parsed parts with type ('text' or 'placeholder') and value
 *
 * @example
 * parseContent('Hello {uuid-1} world {uuid-2}')
 * // Returns: [
 * //   { type: 'text', value: 'Hello ' },
 * //   { type: 'placeholder', value: 'uuid-1' },
 * //   { type: 'text', value: ' world ' },
 * //   { type: 'placeholder', value: 'uuid-2' }
 * // ]
 */
export function parseContent(content: string): ParsedContentPart[] {
  const parts: ParsedContentPart[] = [];
  const regex = /\{([a-zA-Z0-9-]+)\}/g;
  let lastIndex = 0;
  let match;

  // Strip HTML tags for cleaner parsing
  const cleanContent = stripHtmlTags(content);

  while ((match = regex.exec(cleanContent)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: cleanContent.slice(lastIndex, match.index),
      });
    }

    // Add the placeholder
    parts.push({
      type: 'placeholder',
      value: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleanContent.length) {
    parts.push({
      type: 'text',
      value: cleanContent.slice(lastIndex),
    });
  }

  return parts;
}
