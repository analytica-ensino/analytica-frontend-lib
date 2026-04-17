import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotMessageList from './ChatbotMessageList';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

// jsdom doesn't implement scrollIntoView; stub it so useEffect doesn't throw
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
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
});
