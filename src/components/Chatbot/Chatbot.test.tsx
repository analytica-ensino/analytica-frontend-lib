import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Chatbot from './Chatbot';
import type { ChatbotApiClient } from '../../types/chatbot';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function buildClient(): ChatbotApiClient {
  const client: ChatbotApiClient = {
    sendMessage: jest.fn(async () => ({
      conversationId: 'c-1',
      userMessage: {
        id: 'u-1',
        conversationId: 'c-1',
        role: 'user' as const,
        content: 'hello',
        createdAt: new Date(),
      },
      assistantMessage: {
        id: 'a-1',
        conversationId: 'c-1',
        role: 'assistant' as const,
        content: 'world',
        createdAt: new Date(),
      },
    })),
    listConversations: jest.fn(async () => ({ conversations: [], total: 0 })),
    getMessages: jest.fn(async () => ({ messages: [], total: 0 })),
    deleteConversation: jest.fn(async () => undefined),
  };
  return client;
}

describe('Chatbot', () => {
  it('renders only the FAB when closed', () => {
    const client = buildClient();
    render(<Chatbot apiClient={client} user={{ id: 'u', name: 'Ana' }} />);
    expect(
      screen.getByRole('button', { name: /abrir assistente/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the panel when FAB is clicked', async () => {
    const client = buildClient();
    render(<Chatbot apiClient={client} user={{ id: 'u', name: 'Ana' }} />);

    await userEvent.click(
      screen.getByRole('button', { name: /abrir assistente/i })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(client.listConversations).toHaveBeenCalled());
  });

  it('shows a personalized empty hint using the first name', async () => {
    const client = buildClient();
    render(
      <Chatbot apiClient={client} user={{ id: 'u', name: 'Ana Paula' }} />
    );
    await userEvent.click(
      screen.getByRole('button', { name: /abrir assistente/i })
    );
    expect(screen.getByText(/olá, ana/i)).toBeInTheDocument();
  });

  it('sends a message and renders user + assistant bubbles', async () => {
    const client = buildClient();
    render(<Chatbot apiClient={client} user={{ id: 'u', name: 'Ana' }} />);

    await userEvent.click(
      screen.getByRole('button', { name: /abrir assistente/i })
    );
    const textarea = screen.getByRole('textbox', {
      name: /mensagem para o assistente/i,
    });
    await userEvent.type(textarea, 'como resolver?{Enter}');

    await waitFor(() => expect(client.sendMessage).toHaveBeenCalledTimes(1));
    // Wrap bubble assertions in waitFor — the message pipeline resolves
    // across multiple microtasks and state updates in useChatbot, so
    // reading the DOM immediately could race with React batching.
    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('world')).toBeInTheDocument());
  });

  it('forwards currentContext to sendMessage', async () => {
    const client = buildClient();
    const ctx = { activityId: 'a-1', questionId: 'q-1' };
    render(
      <Chatbot
        apiClient={client}
        user={{ id: 'u', name: 'Ana' }}
        currentContext={ctx}
      />
    );
    await userEvent.click(
      screen.getByRole('button', { name: /abrir assistente/i })
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /mensagem para o assistente/i }),
      'oi{Enter}'
    );
    await waitFor(() =>
      expect(client.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ currentContext: ctx })
      )
    );
  });
});
