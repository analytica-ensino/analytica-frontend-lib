import { parseHtmlInert } from './parseHtmlInert';

describe('parseHtmlInert', () => {
  it('should parse into a document other than the page', () => {
    const body = parseHtmlInert('<p>text</p>');

    expect(body.ownerDocument).not.toBe(document);
    expect(body.innerHTML).toBe('<p>text</p>');
  });

  it('should keep leading whitespace and elements that would go to the head', () => {
    const body = parseHtmlInert(' <meta name="a"><p>text</p>');

    expect(body.innerHTML).toBe(' <meta name="a"><p>text</p>');
  });

  it('should keep the text of malformed content', () => {
    expect(parseHtmlInert('$1<x \\le 3$ fim').textContent).toContain('$1');
  });
});
