import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReactMarkdownMock from './mockReactMarkdown';

describe('mockReactMarkdown (jest stub for react-markdown)', () => {
  it('renders plain paragraphs when there is no markdown syntax', () => {
    const { container } = render(
      <ReactMarkdownMock>{'primeiro\n\nsegundo'}</ReactMarkdownMock>
    );
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent('primeiro');
    expect(paragraphs[1]).toHaveTextContent('segundo');
  });

  it('renders an empty fragment when children is undefined', () => {
    const { container } = render(<ReactMarkdownMock />);
    expect(container).toBeEmptyDOMElement();
  });

  it('parses **bold** markers into <strong>', () => {
    const { container } = render(
      <ReactMarkdownMock>{'isto é **muito** bom'}</ReactMarkdownMock>
    );
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong).toHaveTextContent('muito');
  });

  it('parses *italic* markers into <em>', () => {
    const { container } = render(
      <ReactMarkdownMock>{'*foo* bar'}</ReactMarkdownMock>
    );
    const em = container.querySelector('em');
    expect(em).not.toBeNull();
    expect(em).toHaveTextContent('foo');
  });

  it('parses inline `code` markers into <code>', () => {
    const { container } = render(
      <ReactMarkdownMock>{'use `ref.current` sempre'}</ReactMarkdownMock>
    );
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code).toHaveTextContent('ref.current');
  });

  it('handles multiple inline markers in the same paragraph', () => {
    const { container } = render(
      <ReactMarkdownMock>
        {'use **bold** and *italic* and `code`'}
      </ReactMarkdownMock>
    );
    expect(container.querySelectorAll('strong')).toHaveLength(1);
    expect(container.querySelectorAll('em')).toHaveLength(1);
    expect(container.querySelectorAll('code')).toHaveLength(1);
  });

  it('groups consecutive bullets into a single <ul>', () => {
    const { container } = render(
      <ReactMarkdownMock>
        {'- primeiro\n- segundo\n- terceiro'}
      </ReactMarkdownMock>
    );
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(1);
    const items = lists[0].querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('primeiro');
    expect(items[2]).toHaveTextContent('terceiro');
  });

  it('accepts `*` as a bullet marker', () => {
    const { container } = render(
      <ReactMarkdownMock>{'* um\n* dois'}</ReactMarkdownMock>
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  it('recognizes indented bullets with tabs or extra spaces', () => {
    const { container } = render(
      <ReactMarkdownMock>{'\t-  tabbed\n    - spaced'}</ReactMarkdownMock>
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('tabbed');
    expect(items[1]).toHaveTextContent('spaced');
  });

  it('treats bullet-like lines without trailing content as plain text', () => {
    // "-" alone is not a valid bullet; it must render as a paragraph.
    const { container } = render(<ReactMarkdownMock>{'-'}</ReactMarkdownMock>);
    expect(container.querySelector('ul')).toBeNull();
    const paragraph = container.querySelector('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph?.textContent).toBe('-');
  });

  it('treats "- " with no body as plain text (no bullet)', () => {
    const { container } = render(<ReactMarkdownMock>{'- '}</ReactMarkdownMock>);
    expect(container.querySelector('ul')).toBeNull();
    // After `trimEnd()` in the component, the rendered paragraph text
    // ends up as "-" (the trailing space is stripped before parsing).
    const paragraph = container.querySelector('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph?.textContent).toBe('-');
  });

  it('flushes the list when a blank line breaks the sequence', () => {
    const { container } = render(
      <ReactMarkdownMock>{'- a\n- b\n\n- c\n- d'}</ReactMarkdownMock>
    );
    expect(container.querySelectorAll('ul')).toHaveLength(2);
  });

  it('flushes the list when a non-bullet paragraph interrupts it', () => {
    const { container } = render(
      <ReactMarkdownMock>
        {'- primeiro\nparágrafo\n- terceiro'}
      </ReactMarkdownMock>
    );
    expect(container.querySelectorAll('ul')).toHaveLength(2);
    expect(container.querySelector('p')).toHaveTextContent('parágrafo');
  });

  it('renders inline markers inside bullet items', () => {
    const { container } = render(
      <ReactMarkdownMock>{'- item **bold**'}</ReactMarkdownMock>
    );
    const li = container.querySelector('li');
    expect(li).not.toBeNull();
    expect(li?.querySelector('strong')).toHaveTextContent('bold');
  });

  it('ignores empty lines without emitting paragraphs', () => {
    const { container } = render(
      <ReactMarkdownMock>{'\n\nsó isso\n\n'}</ReactMarkdownMock>
    );
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('preserves text before and after an inline marker', () => {
    const { container } = render(
      <ReactMarkdownMock>{'antes **meio** depois'}</ReactMarkdownMock>
    );
    const p = container.querySelector('p');
    expect(p?.textContent).toBe('antes meio depois');
  });
});
