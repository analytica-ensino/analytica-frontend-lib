import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TicketModal } from './TicketModal';
import {
  SupportStatus,
  SupportCategory,
  SupportTicket,
  SupportApiClient,
} from '../../../types/support';

describe('TicketModal', () => {
  const mockTicket: SupportTicket = {
    id: 'ticket-123',
    title: 'Problema de acesso',
    status: SupportStatus.ABERTO,
    createdAt: '2024-01-01T10:00:00Z',
    category: SupportCategory.ACESSO,
    description: 'Não consigo acessar minha conta',
  };

  const mockApiClient: SupportApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  };

  const defaultProps = {
    ticket: mockTicket,
    isOpen: true,
    onClose: jest.fn(),
    onTicketClose: jest.fn(),
    apiClient: mockApiClient,
    userId: 'user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o modal quando isOpen é true', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByText(`Pedido: ${mockTicket.title}`)).toBeInTheDocument();
  });

  it('não deve renderizar quando isOpen é false', () => {
    render(<TicketModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText(`Pedido: ${mockTicket.title}`)
    ).not.toBeInTheDocument();
  });

  it('deve exibir os detalhes do ticket', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText(mockTicket.id)).toBeInTheDocument();
    expect(screen.getByText('Aberto em')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Aberto')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Acesso')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
    expect(screen.getByText(mockTicket.description!)).toBeInTheDocument();
  });

  it('deve exibir botão "Encerrar Pedido" quando ticket não está encerrado', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByText('Encerrar Pedido')).toBeInTheDocument();
  });

  it('não deve exibir botão "Encerrar Pedido" quando ticket está encerrado', () => {
    const encerradoTicket = { ...mockTicket, status: SupportStatus.ENCERRADO };
    render(<TicketModal {...defaultProps} ticket={encerradoTicket} />);

    expect(screen.queryByText('Encerrar Pedido')).not.toBeInTheDocument();
  });

  it('deve abrir modal de confirmação ao clicar em "Encerrar Pedido"', () => {
    render(<TicketModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Encerrar Pedido'));

    expect(screen.getByText('Encerrar pedido?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ao encerrar este pedido, ele será fechado e não poderá mais ser atualizado.'
      )
    ).toBeInTheDocument();
  });

  it('deve fechar modal de confirmação ao clicar em "Cancelar"', () => {
    render(<TicketModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Encerrar Pedido'));
    fireEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByText('Encerrar pedido?')).not.toBeInTheDocument();
  });

  it('deve chamar onTicketClose e onClose ao confirmar encerramento', () => {
    render(<TicketModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Encerrar Pedido'));

    // Encontrar o botão "Encerrar" dentro do modal de confirmação
    const buttons = screen.getAllByText('Encerrar');
    const confirmButton = buttons.find((btn) =>
      btn.closest('[data-testid="close-ticket-modal"]')
    );
    if (confirmButton) {
      fireEvent.click(confirmButton);
    } else {
      // Fallback: clicar no último botão "Encerrar"
      fireEvent.click(buttons[buttons.length - 1]);
    }

    expect(defaultProps.onTicketClose).toHaveBeenCalledWith(mockTicket.id);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve chamar onClose quando o modal é fechado', () => {
    render(<TicketModal {...defaultProps} />);

    // Pressionar ESC para fechar
    fireEvent.keyDown(document, { key: 'Escape' });

    // O modal deve ter o handler de ESC
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  describe('Tickets respondidos', () => {
    const respondidoTicket: SupportTicket = {
      ...mockTicket,
      status: SupportStatus.RESPONDIDO,
    };

    it('deve buscar respostas quando ticket está respondido', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          `/support/answer/${respondidoTicket.id}`
        );
      });
    });

    it('deve exibir skeleton enquanto carrega respostas', () => {
      (mockApiClient.get as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      expect(
        screen.getByText('Resposta de Suporte Técnico')
      ).toBeInTheDocument();
    });

    it('deve tratar erro ao buscar respostas', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao buscar respostas:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('deve exibir resposta do suporte quando carregada', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Esta é a resposta do suporte técnico.',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(
          screen.getByText('Esta é a resposta do suporte técnico.')
        ).toBeInTheDocument();
      });
    });

    it('deve exibir resposta enviada pelo usuário', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
            {
              id: 'answer-2',
              userId: 'user-123',
              supportId: respondidoTicket.id,
              answer: 'Minha resposta ao suporte',
              read: false,
              createdAt: '2024-01-03T10:00:00Z',
              updatedAt: '2024-01-03T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(screen.getByText('Resposta enviada')).toBeInTheDocument();
        expect(
          screen.getByText('Minha resposta ao suporte')
        ).toBeInTheDocument();
      });
    });

    it('deve exibir seção Responder quando há resposta do suporte', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(screen.getByText('Responder')).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });
    });

    it('deve exibir botão Enviar apenas quando há texto na resposta', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });

      // Botão não deve existir inicialmente
      expect(
        screen.queryByRole('button', { name: 'Enviar' })
      ).not.toBeInTheDocument();

      // Digitar algo
      fireEvent.change(
        screen.getByPlaceholderText('Detalhe o problema aqui.'),
        {
          target: { value: 'Minha resposta' },
        }
      );

      // Agora o botão deve aparecer
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Enviar' })
        ).toBeInTheDocument();
      });
    });

    it('deve enviar resposta ao clicar em Enviar', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);
      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: { message: 'Success' },
      });

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });

      // Digitar resposta
      fireEvent.change(
        screen.getByPlaceholderText('Detalhe o problema aqui.'),
        {
          target: { value: 'Minha nova resposta' },
        }
      );

      // Clicar em enviar
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Enviar' })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/support/answer', {
          userId: 'user-123',
          supportId: respondidoTicket.id,
          answer: 'Minha nova resposta',
        });
      });
    });

    it('deve tratar erro ao enviar resposta', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);
      (mockApiClient.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText('Detalhe o problema aqui.'),
        {
          target: { value: 'Minha resposta' },
        }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Enviar' })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao enviar resposta:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('não deve enviar resposta sem texto', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });

      // O botão não deve aparecer sem texto
      expect(
        screen.queryByRole('button', { name: 'Enviar' })
      ).not.toBeInTheDocument();
    });

    it('não deve enviar resposta sem userId', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(
        <TicketModal
          {...defaultProps}
          ticket={respondidoTicket}
          userId={undefined}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Detalhe o problema aqui.')
        ).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText('Detalhe o problema aqui.'),
        {
          target: { value: 'Minha resposta' },
        }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Enviar' })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

      // Não deve chamar post sem userId
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('deve ordenar respostas por data mais recente', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-old',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta antiga',
              read: false,
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z',
            },
            {
              id: 'answer-new',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta mais recente',
              read: false,
              createdAt: '2024-01-05T10:00:00Z',
              updatedAt: '2024-01-05T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        // Deve exibir a resposta mais recente (a ordenação mostra apenas 1)
        expect(screen.getByText('Resposta mais recente')).toBeInTheDocument();
      });
    });

    it('deve ordenar respostas do usuário por data mais recente', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-support',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z',
            },
            {
              id: 'answer-user-old',
              userId: 'user-123',
              supportId: respondidoTicket.id,
              answer: 'Resposta antiga do usuário',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
            {
              id: 'answer-user-new',
              userId: 'user-123',
              supportId: respondidoTicket.id,
              answer: 'Resposta mais recente do usuário',
              read: false,
              createdAt: '2024-01-05T10:00:00Z',
              updatedAt: '2024-01-05T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);

      await waitFor(() => {
        // Deve exibir a resposta mais recente do usuário
        expect(
          screen.getByText('Resposta mais recente do usuário')
        ).toBeInTheDocument();
      });
    });

    it('deve limpar respostas ao fechar modal', async () => {
      const mockAnswers = {
        data: {
          data: [
            {
              id: 'answer-1',
              userId: 'support-user',
              supportId: respondidoTicket.id,
              answer: 'Resposta do suporte',
              read: false,
              createdAt: '2024-01-02T10:00:00Z',
              updatedAt: '2024-01-02T10:00:00Z',
            },
          ],
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue(mockAnswers);

      const { rerender } = render(
        <TicketModal {...defaultProps} ticket={respondidoTicket} />
      );

      await waitFor(() => {
        expect(screen.getByText('Resposta do suporte')).toBeInTheDocument();
      });

      // Fechar modal
      rerender(
        <TicketModal
          {...defaultProps}
          ticket={respondidoTicket}
          isOpen={false}
        />
      );

      // Resposta não deve mais estar visível
      expect(screen.queryByText('Resposta do suporte')).not.toBeInTheDocument();
    });
  });

  describe('Badge de status', () => {
    it('deve exibir badge correto para status ABERTO', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('Aberto')).toBeInTheDocument();
    });

    it('deve exibir badge correto para status RESPONDIDO', () => {
      const respondidoTicket = {
        ...mockTicket,
        status: SupportStatus.RESPONDIDO,
      };
      render(<TicketModal {...defaultProps} ticket={respondidoTicket} />);
      expect(screen.getByText('Respondido')).toBeInTheDocument();
    });

    it('deve exibir badge correto para status ENCERRADO', () => {
      const encerradoTicket = {
        ...mockTicket,
        status: SupportStatus.ENCERRADO,
      };
      render(<TicketModal {...defaultProps} ticket={encerradoTicket} />);
      expect(screen.getByText('Encerrado')).toBeInTheDocument();
    });
  });

  describe('Badge de categoria', () => {
    it('deve exibir badge correto para categoria ACESSO', () => {
      render(<TicketModal {...defaultProps} />);
      expect(screen.getByText('Acesso')).toBeInTheDocument();
    });

    it('deve exibir badge correto para categoria TECNICO', () => {
      const tecnicoTicket = {
        ...mockTicket,
        category: SupportCategory.TECNICO,
      };
      render(<TicketModal {...defaultProps} ticket={tecnicoTicket} />);
      expect(screen.getByText('Técnico')).toBeInTheDocument();
    });

    it('deve exibir badge correto para categoria OUTROS', () => {
      const outrosTicket = { ...mockTicket, category: SupportCategory.OUTROS };
      render(<TicketModal {...defaultProps} ticket={outrosTicket} />);
      expect(screen.getByText('Outros')).toBeInTheDocument();
    });
  });
});
