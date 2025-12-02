import type { Story } from '@ladle/react';
import { useState } from 'react';
import Support from './Support';
import { TicketModal } from './components/TicketModal';
import {
  SupportApiClient,
  SupportStatus,
  SupportCategory,
  SupportTicket,
  SupportTicketAPI,
} from '../../types/support';

// Mock API client para as stories
const createMockApiClient = (
  tickets: SupportTicketAPI[] = [],
  answers: unknown[] = []
): SupportApiClient => ({
  get: async <T,>(url: string): Promise<{ data: T }> => {
    if (url.includes('/support/answer/')) {
      return { data: { data: answers } } as { data: T };
    }
    return {
      data: {
        data: {
          support: tickets,
          pagination: {
            page: 1,
            limit: 100,
            total: tickets.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      },
    } as { data: T };
  },
  post: async <T,>(): Promise<{ data: T }> => {
    return {
      data: {
        message: 'Success',
        data: {
          id: `ticket-${Date.now()}`,
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@example.com',
          subject: 'Novo ticket',
          description: 'Descrição do ticket',
          status: 'ABERTO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    } as { data: T };
  },
  patch: async <T,>(): Promise<{ data: T }> => {
    return { data: { message: 'Success' } } as { data: T };
  },
});

// Dados de exemplo
const sampleTickets: SupportTicketAPI[] = [
  {
    id: 'ticket-001',
    ownerId: 'user-123',
    type: 'tecnico',
    email: 'aluno@escola.com',
    subject: 'Erro ao carregar vídeo-aula',
    description:
      'O vídeo da aula de matemática não está carregando. Já tentei em diferentes navegadores mas o problema persiste.',
    status: 'ABERTO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ticket-002',
    ownerId: 'user-123',
    type: 'acesso',
    email: 'aluno@escola.com',
    subject: 'Não consigo fazer login',
    description:
      'Após trocar minha senha, não estou conseguindo acessar minha conta. A mensagem de erro diz que a senha está incorreta.',
    status: 'PENDENTE',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ticket-003',
    ownerId: 'user-123',
    type: 'outros',
    email: 'aluno@escola.com',
    subject: 'Dúvida sobre certificado',
    description:
      'Gostaria de saber como posso obter o certificado do curso que finalizei.',
    status: 'FECHADO',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const sampleAnswers = [
  {
    id: 'answer-001',
    userId: 'support-user',
    supportId: 'ticket-002',
    answer:
      'Olá! Verificamos seu caso e resetamos sua senha. Por favor, tente acessar novamente usando o email cadastrado. Caso o problema persista, entre em contato conosco.',
    read: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

/**
 * Showcase principal: Componente Support completo
 */
export const AllSupport: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Support</h2>
      <p className="text-text-700">
        Componente completo de suporte com criação de tickets e histórico.
      </p>

      <div className="border rounded-lg p-4 bg-surface-50">
        <Support
          apiClient={createMockApiClient(sampleTickets, sampleAnswers)}
          userId="user-123"
          title="Suporte"
        />
      </div>
    </div>
  );
};

/**
 * Support vazio - sem tickets
 */
export const EmptySupport: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Support - Estado Vazio
      </h2>
      <p className="text-text-700">
        Quando o usuário não possui nenhum ticket de suporte.
      </p>

      <div className="border rounded-lg p-4 bg-surface-50">
        <Support
          apiClient={createMockApiClient([])}
          userId="user-123"
          title="Suporte"
        />
      </div>
    </div>
  );
};

/**
 * Support com muitos tickets (paginação)
 */
export const SupportWithPagination: Story = () => {
  const manyTickets: SupportTicketAPI[] = Array.from(
    { length: 25 },
    (_, i) => ({
      id: `ticket-${i + 1}`,
      ownerId: 'user-123',
      type: ['tecnico', 'acesso', 'outros'][i % 3],
      email: 'aluno@escola.com',
      subject: `Ticket de suporte #${i + 1}`,
      description: `Descrição do ticket de suporte número ${i + 1}`,
      status: ['ABERTO', 'PENDENTE', 'FECHADO'][i % 3],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    })
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Support - Com Paginação
      </h2>
      <p className="text-text-700">
        Quando há mais de 10 tickets, a paginação é exibida.
      </p>

      <div className="border rounded-lg p-4 bg-surface-50">
        <Support
          apiClient={createMockApiClient(manyTickets)}
          userId="user-123"
          title="Suporte"
        />
      </div>
    </div>
  );
};

/**
 * Support com título customizado
 */
export const SupportCustomTitle: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Support - Título Customizado
      </h2>
      <p className="text-text-700">O título pode ser customizado via prop.</p>

      <div className="border rounded-lg p-4 bg-surface-50">
        <Support
          apiClient={createMockApiClient(sampleTickets)}
          userId="user-123"
          title="Central de Ajuda"
        />
      </div>
    </div>
  );
};

/**
 * TicketModal - Ticket Aberto
 */
export const TicketModalAberto: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  const ticket: SupportTicket = {
    id: 'ticket-001',
    title: 'Erro ao carregar vídeo-aula',
    status: SupportStatus.ABERTO,
    createdAt: new Date().toISOString(),
    category: SupportCategory.TECNICO,
    description:
      'O vídeo da aula de matemática não está carregando. Já tentei em diferentes navegadores mas o problema persiste.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">TicketModal - Aberto</h2>
      <p className="text-text-700">Modal de ticket com status "Aberto".</p>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-500 text-white rounded"
      >
        Abrir Modal
      </button>

      <TicketModal
        ticket={ticket}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onTicketClose={(id) => console.log('Encerrar ticket:', id)}
        apiClient={createMockApiClient()}
        userId="user-123"
      />
    </div>
  );
};

/**
 * TicketModal - Ticket Respondido
 */
export const TicketModalRespondido: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  const ticket: SupportTicket = {
    id: 'ticket-002',
    title: 'Não consigo fazer login',
    status: SupportStatus.RESPONDIDO,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: SupportCategory.ACESSO,
    description:
      'Após trocar minha senha, não estou conseguindo acessar minha conta.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        TicketModal - Respondido
      </h2>
      <p className="text-text-700">
        Modal de ticket com status "Respondido" e resposta do suporte.
      </p>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-500 text-white rounded"
      >
        Abrir Modal
      </button>

      <TicketModal
        ticket={ticket}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onTicketClose={(id) => console.log('Encerrar ticket:', id)}
        apiClient={createMockApiClient([], sampleAnswers)}
        userId="user-123"
      />
    </div>
  );
};

/**
 * TicketModal - Ticket Encerrado
 */
export const TicketModalEncerrado: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  const ticket: SupportTicket = {
    id: 'ticket-003',
    title: 'Dúvida sobre certificado',
    status: SupportStatus.ENCERRADO,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    category: SupportCategory.OUTROS,
    description: 'Gostaria de saber como posso obter o certificado do curso.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        TicketModal - Encerrado
      </h2>
      <p className="text-text-700">
        Modal de ticket com status "Encerrado" (sem botão de encerrar).
      </p>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-500 text-white rounded"
      >
        Abrir Modal
      </button>

      <TicketModal
        ticket={ticket}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        apiClient={createMockApiClient()}
        userId="user-123"
      />
    </div>
  );
};

/**
 * Todas as categorias de ticket
 */
export const TicketCategories: Story = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const tickets: SupportTicket[] = [
    {
      id: 'ticket-tecnico',
      title: 'Problema Técnico',
      status: SupportStatus.ABERTO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.TECNICO,
      description: 'Bug no sistema.',
    },
    {
      id: 'ticket-acesso',
      title: 'Problema de Acesso',
      status: SupportStatus.ABERTO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.ACESSO,
      description: 'Não consigo entrar.',
    },
    {
      id: 'ticket-outros',
      title: 'Outras Dúvidas',
      status: SupportStatus.ABERTO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.OUTROS,
      description: 'Dúvida geral.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Categorias de Ticket</h2>
      <p className="text-text-700">
        Os tickets podem ser categorizados como Técnico, Acesso ou Outros.
      </p>

      <div className="flex gap-4">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setOpenModal(ticket.id)}
            className="px-4 py-2 bg-primary-500 text-white rounded"
          >
            {ticket.title}
          </button>
        ))}
      </div>

      {tickets.map((ticket) => (
        <TicketModal
          key={ticket.id}
          ticket={ticket}
          isOpen={openModal === ticket.id}
          onClose={() => setOpenModal(null)}
          apiClient={createMockApiClient()}
          userId="user-123"
        />
      ))}
    </div>
  );
};

/**
 * Todos os status de ticket
 */
export const TicketStatuses: Story = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const tickets: SupportTicket[] = [
    {
      id: 'ticket-aberto',
      title: 'Ticket Aberto',
      status: SupportStatus.ABERTO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.TECNICO,
      description: 'Este ticket está aberto.',
    },
    {
      id: 'ticket-respondido',
      title: 'Ticket Respondido',
      status: SupportStatus.RESPONDIDO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.ACESSO,
      description: 'Este ticket foi respondido.',
    },
    {
      id: 'ticket-encerrado',
      title: 'Ticket Encerrado',
      status: SupportStatus.ENCERRADO,
      createdAt: new Date().toISOString(),
      category: SupportCategory.OUTROS,
      description: 'Este ticket está encerrado.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Status de Ticket</h2>
      <p className="text-text-700">
        Os tickets podem ter status: Aberto (verde), Respondido (amarelo) ou
        Encerrado (azul).
      </p>

      <div className="flex gap-4">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setOpenModal(ticket.id)}
            className="px-4 py-2 bg-primary-500 text-white rounded"
          >
            {ticket.title}
          </button>
        ))}
      </div>

      {tickets.map((ticket) => (
        <TicketModal
          key={ticket.id}
          ticket={ticket}
          isOpen={openModal === ticket.id}
          onClose={() => setOpenModal(null)}
          apiClient={createMockApiClient()}
          userId="user-123"
        />
      ))}
    </div>
  );
};
