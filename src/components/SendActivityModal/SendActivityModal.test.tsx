import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SendActivityModal from './SendActivityModal';
import { RecipientHierarchy } from './types';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';

const mockRecipients: RecipientHierarchy = {
  schools: [
    {
      id: 'school-1',
      name: 'Escola Teste',
      schoolYears: [
        {
          id: 'year-1',
          name: '2025',
          classes: [
            {
              id: 'class-1',
              name: 'Turma A',
              students: [
                {
                  studentId: 'student-1',
                  userInstitutionId: 'ui-1',
                  name: 'Aluno 1',
                },
                {
                  studentId: 'student-2',
                  userInstitutionId: 'ui-2',
                  name: 'Aluno 2',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('SendActivityModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    recipients: mockRecipients,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));
    const store = useSendActivityModalStore.getState();
    store.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<SendActivityModal {...defaultProps} />);

      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<SendActivityModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Enviar atividade')).not.toBeInTheDocument();
    });

    it('should render stepper with 3 steps', () => {
      render(<SendActivityModal {...defaultProps} />);

      expect(screen.getByText('Atividade')).toBeInTheDocument();
      expect(screen.getByText('Destinatário')).toBeInTheDocument();
      expect(screen.getByText('Prazo')).toBeInTheDocument();
    });

    it('should render step 1 content by default', () => {
      render(<SendActivityModal {...defaultProps} />);

      expect(screen.getByText('Tipo de atividade*')).toBeInTheDocument();
      expect(screen.getByText('Tarefa')).toBeInTheDocument();
      expect(screen.getByText('Trabalho')).toBeInTheDocument();
      expect(screen.getByText('Prova')).toBeInTheDocument();
    });
  });

  describe('step 1 - Activity', () => {
    it('should select activity type when chip is clicked', () => {
      render(<SendActivityModal {...defaultProps} />);

      const tarefaChip = screen.getByText('Tarefa');
      fireEvent.click(tarefaChip);

      expect(tarefaChip.closest('button')).toHaveClass('bg-info-background');
    });

    it('should update title when typed', () => {
      render(<SendActivityModal {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText(
        'Digite o título da atividade'
      );
      fireEvent.change(titleInput, { target: { value: 'Minha Atividade' } });

      expect(titleInput).toHaveValue('Minha Atividade');
    });

    it('should update notification message when typed', () => {
      render(<SendActivityModal {...defaultProps} />);

      const notificationTextarea = screen.getByPlaceholderText(
        'Digite uma mensagem para a notificação (opcional)'
      );
      fireEvent.change(notificationTextarea, {
        target: { value: 'Mensagem de teste' },
      });

      expect(notificationTextarea).toHaveValue('Mensagem de teste');
    });

    it('should show validation errors when trying to advance without data', () => {
      render(<SendActivityModal {...defaultProps} />);

      const nextButton = screen.getByText('Próximo');
      fireEvent.click(nextButton);

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione uma opção para continuar.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, preencha este campo para continuar.'
        )
      ).toBeInTheDocument();
    });

    it('should advance to step 2 when data is valid', () => {
      render(<SendActivityModal {...defaultProps} />);

      // Fill step 1
      fireEvent.click(screen.getByText('Tarefa'));
      const titleInput = screen.getByPlaceholderText(
        'Digite o título da atividade'
      );
      fireEvent.change(titleInput, { target: { value: 'Minha Atividade' } });

      // Advance
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText('Para quem você vai enviar a atividade?')
      ).toBeInTheDocument();
    });
  });

  describe('step 2 - Recipient', () => {
    beforeEach(() => {
      // Setup: advance to step 2
      render(<SendActivityModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render recipient hierarchy', () => {
      expect(screen.getByText('Escola Teste')).toBeInTheDocument();
    });

    it('should render select all checkbox', () => {
      expect(screen.getByText('Todos os alunos')).toBeInTheDocument();
    });

    it('should show selected count', () => {
      expect(screen.getByText('0 aluno(s) selecionado(s)')).toBeInTheDocument();
    });

    it('should show validation error when no student selected', () => {
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('step 3 - Deadline', () => {
    beforeEach(async () => {
      render(<SendActivityModal {...defaultProps} />);

      // Fill step 1
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Fill step 2 - select all
      fireEvent.click(screen.getByText('Todos os alunos'));
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render date pickers', () => {
      expect(screen.getByText('Iniciar em*')).toBeInTheDocument();
      expect(screen.getByText('Finalizar até*')).toBeInTheDocument();
    });

    it('should render retry option', () => {
      expect(screen.getByText('Permitir refazer?')).toBeInTheDocument();
      expect(screen.getByText('Sim')).toBeInTheDocument();
      expect(screen.getByText('Não')).toBeInTheDocument();
    });

    it('should show submit button on step 3', () => {
      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should go back to previous step', () => {
      render(<SendActivityModal {...defaultProps} />);

      // Fill and advance to step 2
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Go back
      fireEvent.click(screen.getByText('Anterior'));

      expect(screen.getByText('Tipo de atividade*')).toBeInTheDocument();
    });

    it('should not show previous button on step 1', () => {
      render(<SendActivityModal {...defaultProps} />);

      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    });
  });

  describe('cancel', () => {
    it('should call onClose when cancel is clicked', () => {
      const onClose = jest.fn();
      render(<SendActivityModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancelar'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should call onSubmit with form data', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      render(<SendActivityModal {...defaultProps} onSubmit={onSubmit} />);

      // Fill step 1
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test Activity' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Fill step 2
      fireEvent.click(screen.getByText('Todos os alunos'));
      fireEvent.click(screen.getByText('Próximo'));

      // Fill step 3 - select dates
      const startDatePicker = screen.getByTestId('start-date-picker');
      fireEvent.click(startDatePicker);
      const startDay = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(startDay);

      const finalDatePicker = screen.getByTestId('final-date-picker');
      fireEvent.click(finalDatePicker);
      const finalDay = screen.getByLabelText('25 de Janeiro');
      fireEvent.click(finalDay);

      // Submit
      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            subtype: 'TAREFA',
            title: 'Test Activity',
            students: expect.any(Array),
            startDate: expect.any(Date),
            finalDate: expect.any(Date),
            canRetry: false,
          })
        );
      });
    });

    it('should show loading state when isLoading is true', () => {
      render(<SendActivityModal {...defaultProps} isLoading />);

      // Navigate to step 3
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
      fireEvent.click(screen.getByText('Todos os alunos'));
      fireEvent.click(screen.getByText('Próximo'));

      expect(screen.getByText('Enviando...')).toBeInTheDocument();
    });
  });

  describe('reset on close', () => {
    it('should reset store when modal closes', () => {
      const { rerender } = render(<SendActivityModal {...defaultProps} />);

      // Fill some data
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );

      // Close modal
      rerender(<SendActivityModal {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<SendActivityModal {...defaultProps} isOpen={true} />);

      // Should be back to initial state
      const titleInput = screen.getByPlaceholderText(
        'Digite o título da atividade'
      );
      expect(titleInput).toHaveValue('');
    });
  });
});
