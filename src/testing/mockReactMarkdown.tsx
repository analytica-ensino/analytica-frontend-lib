import type { ReactNode } from 'react';

/**
 * Test double for `react-markdown`. The real package ships ESM only and
 * cannot be executed by `ts-jest` without a heavy transformIgnorePatterns
 * rewrite. This mock parses a minimal subset (bold, italics, code, bullet
 * lists) that our tests rely on and renders deterministic DOM.
 */

type ReactMarkdownProps = { children?: string };

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let match: RegExpExecArray | null = regex.exec(text);
  let keyCounter = 0;
  while (match !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={`s${keyCounter++}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`e${keyCounter++}`}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      nodes.push(<code key={`c${keyCounter++}`}>{match[3]}</code>);
    }
    cursor = regex.lastIndex;
    match = regex.exec(text);
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

export default function ReactMarkdownMock({
  children = '',
}: Readonly<ReactMarkdownProps>) {
  const lines = children.split('\n');
  const blocks: ReactNode[] = [];
  let currentList: string[] = [];
  let blockIdx = 0;
  let listItemIdx = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`ul-${blockIdx++}`}>
          {currentList.map((item) => (
            <li key={`li-${listItemIdx++}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      currentList.push(bullet[1]);
    } else {
      flushList();
      if (line.trim() === '') continue;
      blocks.push(<p key={`p-${blockIdx++}`}>{renderInline(line)}</p>);
    }
  }
  flushList();

  return <>{blocks}</>;
}
