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

  describe('live region (AE-2667)', () => {
    it('announces politely without exposing a log role', () => {
      const { container } = render(
        <ChatbotMessageList messages={[buildMessage('a')]} />
      );

      // `role="log"` fazia o VoiceOver anunciar "log" no fim da leitura da
      // área de conversa; o anúncio das mensagens novas continua pelo
      // `aria-live`, que não acrescenta papel nenhum à leitura.
      expect(screen.queryByRole('log')).not.toBeInTheDocument();

      const liveRegion = container.firstElementChild;
      expect(liveRegion).not.toHaveAttribute('role');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-relevant', 'additions');
    });

    it('keeps new messages inside the live region', () => {
      const { container, rerender } = render(
        <ChatbotMessageList messages={[buildMessage('a')]} />
      );
      rerender(
        <ChatbotMessageList
          messages={[
            buildMessage('a'),
            buildMessage('b', { role: 'assistant', content: 'resposta nova' }),
          ]}
        />
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toContainElement(screen.getByText('resposta nova'));
    });
  });
});
