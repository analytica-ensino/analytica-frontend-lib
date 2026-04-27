import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotMessageList from './ChatbotMessageList';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

// jsdom doesn't implement scrollIntoView; stub the prototype so useEffect
// doesn't throw, but restore the original descriptor at the end of the
// suite so we don't leak across other test files that share this worker.
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'scrollIntoView'
);
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

afterAll(() => {
  if (originalScrollIntoView) {
    Object.defineProperty(
      Element.prototype,
      'scrollIntoView',
      originalScrollIntoView
    );
  } else {
    delete (Element.prototype as unknown as Record<string, unknown>)
      .scrollIntoView;
  }
});

function buildMessage(
  id: string,
  overrides: Partial<ChatbotMessageType> = {}
): ChatbotMessageType {
  return {
    id,
    conversationId: 'c-1',
    role: 'user',
    content: `message ${id}`,
    createdAt: new Date('2026-04-17T10:00:00Z'),
    ...overrides,
  };
}

describe('ChatbotMessageList', () => {
  it('renders the empty hint when there are no messages', () => {
    render(
      <ChatbotMessageList messages={[]} emptyHint="Estado vazio customizado" />
    );
    expect(screen.getByText(/estado vazio customizado/i)).toBeInTheDocument();
  });

  it('hides the empty hint while loading', () => {
    render(<ChatbotMessageList messages={[]} isLoading />);
    expect(screen.queryByText(/comece a conversa/i)).not.toBeInTheDocument();
  });

  it('renders one bubble per message', () => {
    render(
      <ChatbotMessageList
        messages={[
          buildMessage('a'),
          buildMessage('b', { role: 'assistant', content: 'resposta' }),
        ]}
      />
    );
    expect(screen.getByText('message a')).toBeInTheDocument();
    expect(screen.getByText('resposta')).toBeInTheDocument();
  });

  it('shows the typing indicator when isSending is true', () => {
    render(<ChatbotMessageList messages={[]} isSending />);
    expect(
      screen.getByRole('status', { name: /assistente digitando/i })
    ).toBeInTheDocument();
  });

  it('does not auto-scroll on streaming growth when the user has scrolled up', () => {
    // Same message count across renders → `lengthGrew === false`.
    // Stub the container's scroll geometry so `distanceFromBottom` is
    // bigger than the sticky threshold (80px). Result: the rAF should
    // never fire, so `scrollIntoView` is never called.
    const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame');
    const scrollIntoViewMock = Element.prototype.scrollIntoView as jest.Mock;
    scrollIntoViewMock.mockClear();

    // Patch the container's scroll geometry via the prototype since the
    // ref isn't directly accessible. Restore at the end so other tests
    // don't see these values.
    const proto = Object.getPrototypeOf(document.createElement('div'));
    const desc = {
      scrollHeight: { value: 1000, configurable: true },
      scrollTop: { value: 0, configurable: true },
      clientHeight: { value: 500, configurable: true },
    };
    Object.defineProperties(proto, desc);

    try {
      // The component-level streaming bubble is the same message id —
      // `messages.length` does not change but the content grows.
      const initial = buildMessage('a', { content: 'oi' });
      const { rerender } = render(<ChatbotMessageList messages={[initial]} />);
      // Second render simulates a paced word append: same message id,
      // longer content (so `lastContentLen` triggers the effect).
      rerender(
        <ChatbotMessageList
          messages={[buildMessage('a', { content: 'oi pessoal' })]}
        />
      );
      // distanceFromBottom = 1000 - 0 - 500 = 500 > 80 → return early.
      expect(rafSpy).not.toHaveBeenCalled();
    } finally {
      // Roll back the prototype patches so other tests don't see them.
      delete (proto as Record<string, unknown>).scrollHeight;
      delete (proto as Record<string, unknown>).scrollTop;
      delete (proto as Record<string, unknown>).clientHeight;
      rafSpy.mockRestore();
    }
  });

  it('schedules a single scrollIntoView per render via rAF and cancels stale ones', () => {
    // Two consecutive renders before the rAF fires → the first rAF must
    // be cancelled and only the latest callback runs once. Exercises
    // both the cancel branch (line 84) and the rAF callback body
    // (lines 87-88).
    const cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');
    const scrollIntoViewMock = Element.prototype.scrollIntoView as jest.Mock;
    scrollIntoViewMock.mockClear();

    let pendingCallbacks: Array<(time: number) => void> = [];
    const rafSpy = jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        pendingCallbacks.push(cb);
        return pendingCallbacks.length; // monotonically increasing handle
      });

    try {
      // First render — `didMountRef` is false, the effect bails out
      // before scheduling any rAF.
      const { rerender } = render(
        <ChatbotMessageList messages={[buildMessage('a')]} />
      );
      // Second render: now mounted, schedules the first rAF (no cancel
      // yet because `rafRef.current` was null).
      rerender(
        <ChatbotMessageList messages={[buildMessage('a'), buildMessage('b')]} />
      );
      // Third render before the rAF fires → the cleanup branch on
      // line 84 cancels the pending rAF and a fresh one is scheduled.
      rerender(
        <ChatbotMessageList
          messages={[buildMessage('a'), buildMessage('b'), buildMessage('c')]}
        />
      );
      expect(cancelSpy).toHaveBeenCalled();

      // Flush the latest rAF callback — `scrollIntoView` should fire.
      const latest = pendingCallbacks.at(-1);
      latest?.(performance.now());
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'end',
      });
    } finally {
      pendingCallbacks = [];
      rafSpy.mockRestore();
      cancelSpy.mockRestore();
    }
  });
});
