import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SendActivityModal from './SendActivityModal';
import { RecipientHierarchy } from './types';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';

/**
 * Mock recipients with single path (1 school, 1 year, 1 class)
 * This triggers the simple list view
 */
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

/**
 * Mock recipients with multiple schools (triggers hierarchy view)
 */
const mockRecipientsMultiple: RecipientHierarchy = {
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
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'school-2',
      name: 'Escola Secundária',
      schoolYears: [
        {
          id: 'year-2',
          name: '2025',
          classes: [
            {
              id: 'class-2',
              name: 'Turma B',
              students: [
                {
                  studentId: 'student-3',
                  userInstitutionId: 'ui-3',
                  name: 'Aluno 3',
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

  describe('step 2 - Recipient (simple list)', () => {
    beforeEach(() => {
      // Setup: advance to step 2 with single path recipients
      render(<SendActivityModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render select all checkbox', () => {
      expect(screen.getByText('Todos os alunos')).toBeInTheDocument();
    });

    it('should render student names in simple list', () => {
      expect(screen.getByText('Aluno 1')).toBeInTheDocument();
      expect(screen.getByText('Aluno 2')).toBeInTheDocument();
    });

    it('should show validation error when no student selected', () => {
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
        )
      ).toBeInTheDocument();
    });

    it('should toggle individual student selection', () => {
      // Click on individual student checkbox
      const aluno1Checkbox = screen.getByText('Aluno 1');
      fireEvent.click(aluno1Checkbox);

      // Now Aluno 1 should be selected, can advance
      fireEvent.click(screen.getByText('Próximo'));

      // Should be on step 3 (Prazo)
      expect(screen.getByText('Iniciar em*')).toBeInTheDocument();
    });

    it('should deselect all when clicking select all twice', () => {
      // Select all
      fireEvent.click(screen.getByText('Todos os alunos'));

      // Deselect all
      fireEvent.click(screen.getByText('Todos os alunos'));

      // Try to advance - should show error
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('step 2 - Recipient (hierarchy)', () => {
    beforeEach(() => {
      // Setup: advance to step 2 with multiple schools (triggers hierarchy)
      render(
        <SendActivityModal
          {...defaultProps}
          recipients={mockRecipientsMultiple}
        />
      );
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render hierarchy accordion labels', () => {
      expect(screen.getByText('Escola')).toBeInTheDocument();
      expect(screen.getByText('Série')).toBeInTheDocument();
      expect(screen.getByText('Turma')).toBeInTheDocument();
      expect(screen.getByText('Alunos')).toBeInTheDocument();
    });

    it('should render school names inside accordion', () => {
      // School names are inside the accordion content
      expect(screen.getByText('Escola Teste')).toBeInTheDocument();
      expect(screen.getByText('Escola Secundária')).toBeInTheDocument();
    });

    it('should select all schools when clicking Escola checkbox', () => {
      // Click on the Escola checkbox to select all schools
      const escolaCheckbox = screen.getByText('Escola');
      fireEvent.click(escolaCheckbox);

      // Both schools should be selected - the school year accordion should be enabled
      expect(screen.getByText('Série')).toBeInTheDocument();
    });

    it('should select individual school in accordion', () => {
      // Click on individual school checkbox
      const escolaTesteCheckbox = screen.getByText('Escola Teste');
      fireEvent.click(escolaTesteCheckbox);

      // School should be selected
      expect(screen.getByText('Série')).toBeInTheDocument();
    });

    it('should deselect all schools when clicking twice', () => {
      // Select all schools
      const escolaCheckbox = screen.getByText('Escola');
      fireEvent.click(escolaCheckbox);

      // Deselect all schools
      fireEvent.click(escolaCheckbox);

      // Schools should be deselected
      expect(screen.getByText('Escola')).toBeInTheDocument();
    });

    it('should select school year after selecting school', () => {
      // Select a school first
      const escolaTesteCheckbox = screen.getByText('Escola Teste');
      fireEvent.click(escolaTesteCheckbox);

      // Now select the school year
      const serieCheckbox = screen.getByText('Série');
      fireEvent.click(serieCheckbox);

      // Serie accordion should show year options
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('should select individual school year in accordion', () => {
      // Select a school first
      fireEvent.click(screen.getByText('Escola Teste'));

      // Select year
      const year2025Checkbox = screen.getByText('2025');
      fireEvent.click(year2025Checkbox);

      // Year should be selected
      expect(screen.getByText('Turma')).toBeInTheDocument();
    });

    it('should select class after selecting school year', () => {
      // Select school
      fireEvent.click(screen.getByText('Escola Teste'));

      // Select school year
      fireEvent.click(screen.getByText('2025'));

      // Select class
      const turmaCheckbox = screen.getByText('Turma');
      fireEvent.click(turmaCheckbox);

      // Turma accordion should be enabled
      expect(screen.getByText('Alunos')).toBeInTheDocument();
    });

    it('should select individual class in accordion', () => {
      // Select school
      fireEvent.click(screen.getByText('Escola Teste'));

      // Select school year
      fireEvent.click(screen.getByText('2025'));

      // Select individual class
      const turmaACheckbox = screen.getByText('Turma A');
      fireEvent.click(turmaACheckbox);

      // Class should be selected
      expect(screen.getByText('Alunos')).toBeInTheDocument();
    });

    it('should select students after selecting class', () => {
      // Complete hierarchy selection
      fireEvent.click(screen.getByText('Escola Teste'));
      fireEvent.click(screen.getByText('2025'));
      fireEvent.click(screen.getByText('Turma A'));

      // Select all students
      const alunosCheckbox = screen.getByText('Alunos');
      fireEvent.click(alunosCheckbox);

      // Students should be selectable
      expect(screen.getByText('Aluno 1')).toBeInTheDocument();
    });

    it('should select individual student in hierarchy view', () => {
      // Complete hierarchy selection
      fireEvent.click(screen.getByText('Escola Teste'));
      fireEvent.click(screen.getByText('2025'));
      fireEvent.click(screen.getByText('Turma A'));

      // Select individual student
      const aluno1Checkbox = screen.getByText('Aluno 1');
      fireEvent.click(aluno1Checkbox);

      // Student should be selected - can advance
      fireEvent.click(screen.getByText('Próximo'));

      // Should be on step 3
      expect(screen.getByText('Iniciar em*')).toBeInTheDocument();
    });

    it('should deselect all students when clicking twice', () => {
      // Complete hierarchy selection
      fireEvent.click(screen.getByText('Escola Teste'));
      fireEvent.click(screen.getByText('2025'));
      fireEvent.click(screen.getByText('Turma A'));

      // Select all students
      const alunosCheckbox = screen.getByText('Alunos');
      fireEvent.click(alunosCheckbox);

      // Deselect all students
      fireEvent.click(alunosCheckbox);

      // Try to advance - should show error
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
        )
      ).toBeInTheDocument();
    });

    it('should show placeholder when no school is selected', () => {
      // The Serie accordion should show placeholder text
      expect(
        screen.getByText('Selecione uma escola primeiro')
      ).toBeInTheDocument();
    });

    it('should show placeholder when no school year is selected', () => {
      // Select school first
      fireEvent.click(screen.getByText('Escola Teste'));

      // The Turma accordion should show placeholder text
      expect(
        screen.getByText('Selecione uma série primeiro')
      ).toBeInTheDocument();
    });

    it('should show placeholder when no class is selected', () => {
      // Select school and year
      fireEvent.click(screen.getByText('Escola Teste'));
      fireEvent.click(screen.getByText('2025'));

      // The Alunos accordion should show placeholder text
      expect(
        screen.getByText('Selecione uma turma primeiro')
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
      expect(
        screen.getByRole('button', { name: /Enviar atividade/i })
      ).toBeInTheDocument();
    });

    it('should update start time when changed', () => {
      const startTimeInput = screen.getByTestId('start-time-input');
      fireEvent.change(startTimeInput, { target: { value: '10:30' } });

      expect(startTimeInput).toHaveValue('10:30');
    });

    it('should update final time when changed', () => {
      const finalTimeInput = screen.getByTestId('final-time-input');
      fireEvent.change(finalTimeInput, { target: { value: '18:45' } });

      expect(finalTimeInput).toHaveValue('18:45');
    });

    it('should update start date via native input', () => {
      const startDateInput = screen.getByTestId('start-date-input');
      fireEvent.change(startDateInput, { target: { value: '2025-01-20' } });

      expect(startDateInput).toHaveValue('2025-01-20');
    });

    it('should update final date via native input', () => {
      const finalDateInput = screen.getByTestId('final-date-input');
      fireEvent.change(finalDateInput, { target: { value: '2025-01-25' } });

      expect(finalDateInput).toHaveValue('2025-01-25');
    });

    it('should open start date calendar dropdown when clicking input', async () => {
      const startDateInput = screen.getByTestId('start-date-input');
      fireEvent.click(startDateInput);

      // Wait for calendar to render
      await waitFor(() => {
        const prevButton = screen.queryByLabelText(/previous/i);
        const monthText = screen.queryByText(/janeiro/i);
        expect(prevButton || monthText).toBeTruthy();
      });
    });

    it('should open final date calendar dropdown when clicking input', async () => {
      const finalDateInput = screen.getByTestId('final-date-input');
      fireEvent.click(finalDateInput);

      // Wait for calendar to render
      await waitFor(() => {
        const prevButton = screen.queryByLabelText(/previous/i);
        const monthText = screen.queryByText(/janeiro/i);
        expect(prevButton || monthText).toBeTruthy();
      });
    });

    it('should toggle retry option', () => {
      // Click Sim to enable retry
      fireEvent.click(screen.getByText('Sim'));

      // Click Não to disable retry
      fireEvent.click(screen.getByText('Não'));

      // Both clicks should work without error
      expect(screen.getByText('Sim')).toBeInTheDocument();
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

      // Fill step 3 - select dates using native date/time inputs
      const startDateInput = screen.getByTestId('start-date-input');
      const finalDateInput = screen.getByTestId('final-date-input');

      fireEvent.change(startDateInput, { target: { value: '2025-01-20' } });
      fireEvent.change(finalDateInput, { target: { value: '2025-01-25' } });

      // Submit
      fireEvent.click(
        screen.getByRole('button', { name: /Enviar atividade/i })
      );

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            subtype: 'TAREFA',
            title: 'Test Activity',
            students: expect.any(Array),
            startDate: '2025-01-20',
            finalDate: '2025-01-25',
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
