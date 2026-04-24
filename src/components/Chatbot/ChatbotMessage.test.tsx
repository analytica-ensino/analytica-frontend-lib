import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotMessage from './ChatbotMessage';
import type { ChatbotMessage as ChatbotMessageType } from '../../types/chatbot';

function makeMessage(
  overrides: Partial<ChatbotMessageType> = {}
): ChatbotMessageType {
  return {
    id: 'm-1',
    conversationId: 'c-1',
    role: 'assistant',
    content: 'Olá!',
    createdAt: new Date('2026-04-17T08:30:00Z'),
    ...overrides,
  };
}

describe('ChatbotMessage', () => {
  it('renders assistant markdown content with a robot avatar', () => {
    render(
      <ChatbotMessage
        message={makeMessage({
          role: 'assistant',
          content: 'Vamos **estudar**!',
        })}
      />
    );
    expect(screen.getByText(/estudar/i).tagName).toBe('STRONG');
  });

  it('renders user content as plain text with right alignment wrapper', () => {
    const { container } = render(
      <ChatbotMessage
        message={makeMessage({ role: 'user', content: 'minha pergunta' })}
      />
    );
    expect(screen.getByText('minha pergunta')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('renders a timestamp in pt-BR hour:minute format', () => {
    const date = new Date('2026-04-17T12:34:00');
    render(<ChatbotMessage message={makeMessage({ createdAt: date })} />);
    const expected = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('accepts a string timestamp and does not crash for invalid input', () => {
    render(
      <ChatbotMessage message={makeMessage({ createdAt: 'not-a-date' })} />
    );
    // invalid timestamp just renders empty — no throw, no breakage
    expect(screen.getByText('Olá!')).toBeInTheDocument();
  });
});
