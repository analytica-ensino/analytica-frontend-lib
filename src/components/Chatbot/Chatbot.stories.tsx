import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import Chatbot from './Chatbot';
import ChatbotFab from './ChatbotFab';
import ChatbotMessage from './ChatbotMessage';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';
import ChatbotInput from './ChatbotInput';
import type {
  ChatbotApiClient,
  ChatbotConversation,
  ChatbotMessage as ChatbotMessageType,
} from '../../types/chatbot';

/**
 * Build an in-memory client so Ladle stories can exercise the full flow
 * without depending on a real backend.
 */
function buildFakeClient(): ChatbotApiClient {
  const conversations: ChatbotConversation[] = [
    {
      id: 'c-1',
      title: 'Dúvidas de matemática',
      lastMessageAt: new Date(),
      createdAt: new Date(Date.now() - 3600_000),
    },
    {
      id: 'c-2',
      title: 'Redação ENEM',
      lastMessageAt: new Date(Date.now() - 86_400_000),
      createdAt: new Date(Date.now() - 2 * 86_400_000),
    },
  ];

  const messagesByConv: Record<string, ChatbotMessageType[]> = {
    'c-1': [
      {
        id: 'm-1',
        conversationId: 'c-1',
        role: 'user',
        content: 'Como eu estudo frações?',
        createdAt: new Date(),
      },
      {
        id: 'm-2',
        conversationId: 'c-1',
        role: 'assistant',
        content:
          'Ótima pergunta! Vamos começar pelo básico:\n\n- **Frações** representam partes de um todo.\n- O número **de cima** é o numerador.\n- O número **de baixo** é o denominador.\n\nQue tal tentar explicar com suas palavras o que é $\\frac{1}{2}$?',
        createdAt: new Date(),
      },
    ],
    'c-2': [],
  };

  let nextId = 100;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return {
    async sendMessage(payload) {
      await wait(700);
      const convId = payload.conversationId ?? `c-${++nextId}`;
      const userMessage: ChatbotMessageType = {
        id: `u-${nextId++}`,
        conversationId: convId,
        role: 'user',
        content: payload.message,
        createdAt: new Date(),
      };
      const assistantMessage: ChatbotMessageType = {
        id: `a-${nextId++}`,
        conversationId: convId,
        role: 'assistant',
        content: `Legal! Vamos pensar juntos. Você já tentou dividir **${payload.message}** em passos menores?`,
        createdAt: new Date(),
      };
      messagesByConv[convId] = [
        ...(messagesByConv[convId] ?? []),
        userMessage,
        assistantMessage,
      ];
      return { conversationId: convId, userMessage, assistantMessage };
    },
    async listConversations() {
      await wait(200);
      return { conversations, total: conversations.length };
    },
    async getMessages(conversationId) {
      await wait(200);
      const messages = messagesByConv[conversationId] ?? [];
      return { messages, total: messages.length };
    },
    async deleteConversation(conversationId) {
      await wait(150);
      delete messagesByConv[conversationId];
    },
  };
}

/**
 * Default interactive showcase — floating FAB that opens the full panel.
 */
export const Default: Story = () => {
  const client = useMemo(buildFakeClient, []);
  return (
    <div className="relative h-screen bg-background-50">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-text-900">
          Chatbot — demo interativo
        </h2>
        <p className="mt-2 text-text-600">
          Clique no botão no canto inferior direito para abrir o assistente.
        </p>
      </div>
      <Chatbot
        apiClient={client}
        user={{ id: 'student-1', name: 'Ana Silva' }}
      />
    </div>
  );
};

/**
 * Standalone FAB variants.
 */
export const FabVariants: Story = () => (
  <div className="flex gap-12 p-12">
    <div className="relative h-24 w-24">
      <ChatbotFab onClick={() => undefined} className="!static" />
    </div>
    <div className="relative h-24 w-24">
      <ChatbotFab
        onClick={() => undefined}
        unreadCount={3}
        className="!static"
      />
    </div>
    <div className="relative h-24 w-24">
      <ChatbotFab
        onClick={() => undefined}
        unreadCount={42}
        className="!static"
      />
    </div>
  </div>
);

/**
 * Message bubbles — user vs assistant, including markdown and LaTeX.
 */
export const MessageBubbles: Story = () => (
  <div className="max-w-md space-y-3 p-6 bg-background-50">
    <ChatbotMessage
      message={{
        id: '1',
        conversationId: 'c',
        role: 'user',
        content: 'Como eu resolvo isso?',
        createdAt: new Date(),
      }}
    />
    <ChatbotMessage
      message={{
        id: '2',
        conversationId: 'c',
        role: 'assistant',
        content:
          'Ótima pergunta! Vamos por partes:\n\n1. Entenda o **enunciado**.\n2. Identifique os dados.\n3. Escolha a fórmula.',
        createdAt: new Date(),
      }}
    />
    <ChatbotMessage
      message={{
        id: '3',
        conversationId: 'c',
        role: 'assistant',
        content: 'Use a fórmula: $E = mc^2$.',
        createdAt: new Date(),
      }}
    />
  </div>
);

/**
 * Typing indicator in isolation.
 */
export const TypingIndicatorOnly: Story = () => (
  <div className="p-12">
    <ChatbotTypingIndicator />
  </div>
);

/**
 * Input area — auto-resizing textarea.
 */
export const InputOnly: Story = () => (
  <div className="max-w-md border border-background-200 rounded-xl overflow-hidden">
    <ChatbotInput onSend={(t) => window.alert(`Enviado: ${t}`)} />
  </div>
);
