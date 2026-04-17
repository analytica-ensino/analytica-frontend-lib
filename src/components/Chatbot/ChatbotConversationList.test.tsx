import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChatbotConversationList from './ChatbotConversationList';
import type { ChatbotConversation } from '../../types/chatbot';

const CONVERSATIONS: ChatbotConversation[] = [
  {
    id: 'c-1',
    title: 'Como resolver frações',
    lastMessageAt: new Date('2026-04-17T08:00:00Z'),
    createdAt: new Date('2026-04-16T10:00:00Z'),
  },
  {
    id: 'c-2',
    title: null,
    lastMessageAt: new Date('2026-04-15T12:00:00Z'),
    createdAt: new Date('2026-04-14T10:00:00Z'),
  },
];

function renderList(
  overrides: Partial<ComponentProps<typeof ChatbotConversationList>> = {}
) {
  const props = {
    conversations: CONVERSATIONS,
    activeConversationId: null,
    onSelect: jest.fn(),
    onDelete: jest.fn(),
    onStartNew: jest.fn(),
    ...overrides,
  };
  render(<ChatbotConversationList {...props} />);
  return props;
}

describe('ChatbotConversationList', () => {
  it('renders each conversation with title (falling back when null)', () => {
    renderList();
    expect(screen.getByText('Como resolver frações')).toBeInTheDocument();
    expect(screen.getByText('Conversa sem título')).toBeInTheDocument();
  });

  it('shows the empty state when there are no conversations', () => {
    renderList({ conversations: [] });
    expect(screen.getByText(/sem conversas ainda/i)).toBeInTheDocument();
  });

  it('shows skeletons while loading', () => {
    const { container } = render(
      <ChatbotConversationList
        conversations={[]}
        activeConversationId={null}
        isLoading
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onStartNew={jest.fn()}
      />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('calls onSelect with the conversation id when a row is clicked', async () => {
    const props = renderList();
    await userEvent.click(screen.getByText('Como resolver frações'));
    expect(props.onSelect).toHaveBeenCalledWith('c-1');
  });

  it('calls onDelete when trash icon is clicked', async () => {
    const props = renderList();
    await userEvent.click(
      screen.getByRole('button', {
        name: /excluir conversa como resolver frações/i,
      })
    );
    expect(props.onDelete).toHaveBeenCalledWith('c-1');
  });

  it('calls onStartNew when the new-conversation button is clicked', async () => {
    const props = renderList();
    await userEvent.click(
      screen.getByRole('button', { name: /nova conversa/i })
    );
    expect(props.onStartNew).toHaveBeenCalledTimes(1);
  });
});
