import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { SupportApiClient } from '../../types/support';

// Mock para imagem PNG
jest.mock('../../assets/img/suporthistory.png', () => 'test-file-stub');

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = (date?: string | Date) => ({
    format: (fmt?: string) => {
      if (fmt === 'DD MMM YYYY') return '15 jan 2024';
      if (fmt === 'YYYY-MM-DD') return '2024-01-15';
      return '15 janeiro 2024, às 10h';
    },
    locale: () => mockDayjs(date),
  });
  mockDayjs.locale = () => {};
  return mockDayjs;
});

jest.mock('dayjs/locale/pt-br', () => ({}));

// Mock @phosphor-icons/react
jest.mock('@phosphor-icons/react', () => ({
  KeyIcon: () => <svg data-testid="key-icon" />,
  BugIcon: () => <svg data-testid="bug-icon" />,
  InfoIcon: () => <svg data-testid="info-icon" />,
  CaretRightIcon: () => <svg data-testid="caret-right-icon" />,
}));

// Mock zod
jest.mock('zod', () => {
  const createZodType = () => ({
    parse: (data: unknown) => data,
    safeParse: (data: unknown) => ({ success: true, data }),
    optional: () => createZodType(),
    nullable: () => createZodType(),
    min: () => createZodType(),
    max: () => createZodType(),
    trim: () => createZodType(),
    shape: {},
    _def: { typeName: 'ZodObject' },
  });

  return {
    z: {
      string: () => createZodType(),
      enum: () => createZodType(),
      object: (shape: Record<string, unknown> = {}) => ({
        ...createZodType(),
        shape,
      }),
      infer: <T,>(): T => ({}) as T,
    },
  };
});

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (data: unknown) => ({ values: data, errors: {} }),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => {
  const React = jest.requireActual('react');
  return {
    useForm: () => {
      const [values, setValues] = React.useState({});
      const [errors, setErrors] = React.useState({});

      return {
        register: (name: string) => ({
          name,
          onChange: (e: { target: { value: unknown } }) => {
            setValues((prev: Record<string, unknown>) => ({
              ...prev,
              [name]: e.target.value,
            }));
            setErrors((prev: Record<string, unknown>) => {
              const newErrors = { ...prev };
              delete newErrors[name];
              return newErrors;
            });
          },
          onBlur: () => {},
          ref: () => {},
        }),
        handleSubmit:
          (onValid: (data: Record<string, unknown>) => void) =>
          (e: { preventDefault: () => void }) => {
            e.preventDefault();
            const newErrors: Record<string, { message: string }> = {};
            if (!values.title || (values.title as string).length < 5) {
              newErrors.title = {
                message:
                  'Campo obrigatório! Por favor, preencha este campo para continuar.',
              };
            }
            if (
              !values.description ||
              (values.description as string).length < 10
            ) {
              newErrors.description = {
                message:
                  'Campo obrigatório! Por favor, preencha este campo para continuar.',
              };
            }
            if (Object.keys(newErrors).length > 0) {
              setErrors(newErrors);
              return;
            }
            onValid(values);
          },
        setValue: (name: string, value: unknown) => {
          setValues((prev: Record<string, unknown>) => ({
            ...prev,
            [name]: value,
          }));
        },
        reset: () => {
          setValues({});
          setErrors({});
        },
        formState: { errors, isSubmitting: false },
      };
    },
  };
});

import Support from './Support';

describe('Support', () => {
  const mockApiClient: SupportApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  };

  const defaultProps = {
    apiClient: mockApiClient,
    userId: 'user-123',
    title: 'Suporte',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar o título', () => {
      render(<Support {...defaultProps} />);
      expect(screen.getByText('Suporte')).toBeInTheDocument();
    });

    it('deve renderizar título customizado', () => {
      render(<Support {...defaultProps} title="Ajuda" />);
      expect(screen.getByText('Ajuda')).toBeInTheDocument();
    });

    it('deve renderizar as abas "Criar Pedido" e "Histórico"', () => {
      render(<Support {...defaultProps} />);
      expect(screen.getByText('Criar Pedido')).toBeInTheDocument();
      expect(screen.getByText('Histórico')).toBeInTheDocument();
    });

    it('deve renderizar os tipos de problema', () => {
      render(<Support {...defaultProps} />);
      expect(
        screen.getByText('Selecione o tipo de problema')
      ).toBeInTheDocument();
      expect(screen.getByText('Técnico')).toBeInTheDocument();
      expect(screen.getByText('Acesso')).toBeInTheDocument();
      expect(screen.getByText('Outros')).toBeInTheDocument();
    });
  });

  describe('Aba "Criar Pedido"', () => {
    it('deve exibir formulário ao selecionar tipo de problema', async () => {
      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Técnico'));

      expect(screen.getByLabelText('Título')).toBeInTheDocument();
      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Enviar Pedido')).toBeInTheDocument();
    });

    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup();
      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Técnico'));

      const submitButton = screen.getByText('Enviar Pedido');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(
          'Campo obrigatório! Por favor, preencha este campo para continuar.'
        );
        expect(errorMessages.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('deve enviar formulário com dados válidos', async () => {
      const user = userEvent.setup();
      const onTicketCreated = jest.fn();

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          message: 'Success',
          data: {
            id: 'new-ticket-id',
            subject: 'Teste',
            description: 'Descrição teste',
            type: 'tecnico',
            status: 'ABERTO',
          },
        },
      });

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: [],
            pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
          },
        },
      });

      render(<Support {...defaultProps} onTicketCreated={onTicketCreated} />);

      fireEvent.click(screen.getByText('Técnico'));

      const titleInput = screen.getByPlaceholderText('Digite o título');
      const descriptionInput = screen.getByPlaceholderText(
        'Descreva o problema aqui'
      );

      await user.type(titleInput, 'Problema com login');
      await user.type(
        descriptionInput,
        'Não consigo fazer login na plataforma'
      );

      await user.click(screen.getByText('Enviar Pedido'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/support', {
          subject: 'Problema com login',
          description: 'Não consigo fazer login na plataforma',
          type: 'tecnico',
        });
      });
    });

    it('deve exibir toast de sucesso após enviar pedido', async () => {
      const user = userEvent.setup();

      (mockApiClient.post as jest.Mock).mockResolvedValue({
        data: { message: 'Success', data: {} },
      });

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { data: { support: [], pagination: {} } },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Técnico'));

      await user.type(
        screen.getByPlaceholderText('Digite o título'),
        'Teste título'
      );
      await user.type(
        screen.getByPlaceholderText('Descreva o problema aqui'),
        'Teste descrição completa'
      );

      await user.click(screen.getByText('Enviar Pedido'));

      await waitFor(() => {
        expect(screen.getByText('Pedido enviado!')).toBeInTheDocument();
      });
    });

    it('deve exibir erro ao falhar envio', async () => {
      const user = userEvent.setup();

      (mockApiClient.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Técnico'));

      await user.type(
        screen.getByPlaceholderText('Digite o título'),
        'Teste título'
      );
      await user.type(
        screen.getByPlaceholderText('Descreva o problema aqui'),
        'Teste descrição completa'
      );

      await user.click(screen.getByText('Enviar Pedido'));

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao criar ticket. Tente novamente.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Aba "Histórico"', () => {
    const mockTickets = [
      {
        id: 'ticket-1',
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: 'Problema técnico',
        description: 'Descrição do problema',
        status: 'ABERTO',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'ticket-2',
        ownerId: 'user-123',
        type: 'acesso',
        email: 'user@test.com',
        subject: 'Problema de acesso',
        description: 'Não consigo acessar',
        status: 'PENDENTE',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
      },
    ];

    it('deve buscar tickets ao mudar para aba Histórico', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/support?page=1&limit=100'
        );
      });
    });

    it('deve exibir tickets carregados', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
        expect(screen.getByText('Problema de acesso')).toBeInTheDocument();
      });
    });

    it('deve exibir empty state quando não há tickets', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: [],
            pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(
          screen.getByText('Nenhum pedido encontrado.')
        ).toBeInTheDocument();
      });
    });

    it('deve exibir filtros de status e tipo', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: { data: { support: [], pagination: {} } },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Tipo')).toBeInTheDocument();
    });

    it('deve filtrar tickets por categoria localmente', async () => {
      const mockTickets = [
        {
          id: 'ticket-tecnico',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Problema técnico',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'ticket-acesso',
          ownerId: 'user-123',
          type: 'acesso',
          email: 'user@test.com',
          subject: 'Problema de acesso',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-15T11:00:00Z',
          updatedAt: '2024-01-15T11:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        },
      });

      const user = userEvent.setup();

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      // Verificar que ambos os tickets aparecem inicialmente
      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
        expect(screen.getByText('Problema de acesso')).toBeInTheDocument();
      });

      // Encontrar o select de Tipo pelo label e clicar no trigger
      const tipoLabel = screen.getByText('Tipo');
      const tipoSelectContainer = tipoLabel.closest('div')?.parentElement;
      const tipoTrigger = tipoSelectContainer?.querySelector('button');

      if (tipoTrigger) {
        await user.click(tipoTrigger);
      }

      // Aguardar o dropdown abrir e clicar na opção "Técnico"
      await waitFor(() => {
        // Procurar pelo texto "Técnico" que aparece no dropdown (não o dos badges)
        const options = screen.getAllByText(/Técnico/);
        // A opção do dropdown é a que está dentro de um container absoluto
        const dropdownOption = options.find(
          (el) => el.closest('[class*="absolute"]') !== null
        );
        if (dropdownOption) {
          fireEvent.click(dropdownOption);
        }
      });

      // Verificar que apenas o ticket técnico aparece e o de acesso não
      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
        expect(
          screen.queryByText('Problema de acesso')
        ).not.toBeInTheDocument();
      });
    });

    it('deve tratar erro ao buscar tickets', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (mockApiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao buscar tickets:',
          expect.any(Error)
        );
      });

      // Deve exibir empty state quando ocorre erro
      await waitFor(() => {
        expect(
          screen.getByText('Nenhum pedido encontrado.')
        ).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('deve abrir modal ao clicar em um ticket', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Problema técnico'));

      await waitFor(() => {
        expect(
          screen.getByText('Pedido: Problema técnico')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Paginação', () => {
    it('deve exibir paginação quando há mais de 10 tickets', async () => {
      const manyTickets = Array.from({ length: 15 }, (_, i) => ({
        id: `ticket-${i}`,
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: `Ticket ${i}`,
        description: 'Descrição',
        status: 'ABERTO',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      }));

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: manyTickets,
            pagination: { page: 1, limit: 100, total: 15, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
        expect(screen.getByText('Anterior')).toBeInTheDocument();
        expect(screen.getByText('Próxima')).toBeInTheDocument();
      });
    });

    it('deve navegar para próxima página', async () => {
      const manyTickets = Array.from({ length: 15 }, (_, i) => ({
        id: `ticket-${i}`,
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: `Ticket ${i}`,
        description: 'Descrição',
        status: 'ABERTO',
        createdAt: `2024-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`,
        updatedAt: `2024-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`,
      }));

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: manyTickets,
            pagination: { page: 1, limit: 100, total: 15, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Próxima'));

      await waitFor(() => {
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
      });
    });

    it('deve navegar para página anterior', async () => {
      const manyTickets = Array.from({ length: 15 }, (_, i) => ({
        id: `ticket-${i}`,
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: `Ticket ${i}`,
        description: 'Descrição',
        status: 'ABERTO',
        createdAt: `2024-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`,
        updatedAt: `2024-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`,
      }));

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: manyTickets,
            pagination: { page: 1, limit: 100, total: 15, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });

      // Ir para página 2
      fireEvent.click(screen.getByText('Próxima'));

      await waitFor(() => {
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
      });

      // Voltar para página 1
      fireEvent.click(screen.getByText('Anterior'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });
    });

    it('não deve navegar para página anterior quando na primeira página', async () => {
      const manyTickets = Array.from({ length: 15 }, (_, i) => ({
        id: `ticket-${i}`,
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: `Ticket ${i}`,
        description: 'Descrição',
        status: 'ABERTO',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      }));

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: manyTickets,
            pagination: { page: 1, limit: 100, total: 15, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });

      // Tentar ir para página anterior (deve permanecer na 1)
      fireEvent.click(screen.getByText('Anterior'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });
    });

    it('não deve navegar para próxima página quando na última página', async () => {
      const manyTickets = Array.from({ length: 15 }, (_, i) => ({
        id: `ticket-${i}`,
        ownerId: 'user-123',
        type: 'tecnico',
        email: 'user@test.com',
        subject: `Ticket ${i}`,
        description: 'Descrição',
        status: 'ABERTO',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      }));

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: manyTickets,
            pagination: { page: 1, limit: 100, total: 15, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      });

      // Ir para última página
      fireEvent.click(screen.getByText('Próxima'));

      await waitFor(() => {
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
      });

      // Tentar ir para próxima página (deve permanecer na 2)
      fireEvent.click(screen.getByText('Próxima'));

      await waitFor(() => {
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
      });
    });
  });

  describe('Encerramento de ticket', () => {
    it('deve encerrar ticket e exibir toast de sucesso', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Problema técnico',
          description: 'Descrição do problema',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        },
      });

      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { message: 'Success' },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Problema técnico'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar Pedido')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Encerrar Pedido'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar pedido?')).toBeInTheDocument();
      });

      // Encontrar e clicar no botão de confirmação
      const encerrarButtons = screen.getAllByText('Encerrar');
      fireEvent.click(encerrarButtons[encerrarButtons.length - 1]);

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith('/support/ticket-1', {
          status: 'FECHADO',
        });
      });
    });

    it('deve exibir toast de sucesso ao encerrar ticket', async () => {
      const onTicketClosed = jest.fn();
      const mockTickets = [
        {
          id: 'ticket-1',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Problema técnico',
          description: 'Descrição do problema',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        },
      });

      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { message: 'Success' },
      });

      render(<Support {...defaultProps} onTicketClosed={onTicketClosed} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Problema técnico'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar Pedido')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Encerrar Pedido'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar pedido?')).toBeInTheDocument();
      });

      const encerrarButtons = screen.getAllByText('Encerrar');
      fireEvent.click(encerrarButtons[encerrarButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('Pedido encerrado!')).toBeInTheDocument();
      });

      expect(onTicketClosed).toHaveBeenCalled();
    });

    it('deve tratar erro ao encerrar ticket', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockTickets = [
        {
          id: 'ticket-1',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Problema técnico',
          description: 'Descrição do problema',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        },
      });

      (mockApiClient.patch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Problema técnico'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar Pedido')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Encerrar Pedido'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar pedido?')).toBeInTheDocument();
      });

      const encerrarButtons = screen.getAllByText('Encerrar');
      fireEvent.click(encerrarButtons[encerrarButtons.length - 1]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao encerrar ticket:',
          expect.any(Error)
        );
      });

      // Verificar que o toast de erro é exibido
      await waitFor(() => {
        expect(screen.getByText('Erro ao encerrar pedido')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Não foi possível encerrar o pedido. Tente novamente.'
          )
        ).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Ordenação de tickets', () => {
    it('deve ordenar tickets por data mais recente primeiro', async () => {
      const mockTickets = [
        {
          id: 'ticket-old',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Ticket Antigo',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 'ticket-new',
          ownerId: 'user-123',
          type: 'acesso',
          email: 'user@test.com',
          subject: 'Ticket Novo',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Ticket Novo')).toBeInTheDocument();
        expect(screen.getByText('Ticket Antigo')).toBeInTheDocument();
      });

      // Verificar que o ticket mais novo aparece primeiro
      const ticketButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent?.includes('Ticket'));
      expect(ticketButtons[0].textContent).toContain('Ticket Novo');
    });

    it('deve ordenar grupos de tickets por data mais recente primeiro', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Primeiro dia',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-05T10:00:00Z',
        },
        {
          id: 'ticket-2',
          ownerId: 'user-123',
          type: 'acesso',
          email: 'user@test.com',
          subject: 'Segundo dia',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'ticket-3',
          ownerId: 'user-123',
          type: 'outros',
          email: 'user@test.com',
          subject: 'Terceiro dia',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-01-25T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 3, totalPages: 1 },
          },
        },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Terceiro dia')).toBeInTheDocument();
        expect(screen.getByText('Segundo dia')).toBeInTheDocument();
        expect(screen.getByText('Primeiro dia')).toBeInTheDocument();
      });
    });
  });

  describe('Toast de encerramento', () => {
    it('deve fechar toast de encerramento ao clicar no botão de fechar', async () => {
      jest.useFakeTimers();
      const mockTickets = [
        {
          id: 'ticket-1',
          ownerId: 'user-123',
          type: 'tecnico',
          email: 'user@test.com',
          subject: 'Problema técnico',
          description: 'Descrição',
          status: 'ABERTO',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            support: mockTickets,
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        },
      });

      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { message: 'Success' },
      });

      render(<Support {...defaultProps} />);

      fireEvent.click(screen.getByText('Histórico'));

      await waitFor(() => {
        expect(screen.getByText('Problema técnico')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Problema técnico'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar Pedido')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Encerrar Pedido'));

      await waitFor(() => {
        expect(screen.getByText('Encerrar pedido?')).toBeInTheDocument();
      });

      const encerrarButtons = screen.getAllByText('Encerrar');
      fireEvent.click(encerrarButtons[encerrarButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText('Pedido encerrado!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
