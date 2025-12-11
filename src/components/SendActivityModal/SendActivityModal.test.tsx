import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SendActivityModal from './SendActivityModal';
import { CategoryConfig, Item } from './types';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';

/**
 * Toggle selection for an item in a category
 */
const toggleCategoryItem = (
  categories: CategoryConfig[],
  categoryKey: string,
  itemId: string
): CategoryConfig[] => {
  return categories.map((cat) => {
    if (cat.key !== categoryKey) return cat;
    const isSelected = cat.selectedIds?.includes(itemId);
    const newSelectedIds = isSelected
      ? cat.selectedIds?.filter((id) => id !== itemId) || []
      : [...(cat.selectedIds || []), itemId];
    return { ...cat, selectedIds: newSelectedIds };
  });
};

/**
 * Mock item button component
 */
const MockItemButton = ({
  item,
  categoryKey,
  categories,
  onCategoriesChange,
}: {
  item: Item;
  categoryKey: string;
  categories: CategoryConfig[];
  onCategoriesChange?: (categories: CategoryConfig[]) => void;
}) => (
  <button
    key={item.id}
    data-testid={`item-${item.id}`}
    onClick={() => {
      if (onCategoriesChange) {
        onCategoriesChange(
          toggleCategoryItem(categories, categoryKey, item.id)
        );
      }
    }}
  >
    {item.name}
  </button>
);

// Mock CheckboxGroup to avoid import chain issues with PNG files
jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange?: (categories: CategoryConfig[]) => void;
  }) => (
    <div data-testid="checkbox-group-mock">
      {categories.map((cat) => (
        <div key={cat.key} data-testid={`category-${cat.key}`}>
          <span>{cat.label}</span>
          {cat.itens?.map((item) => (
            <MockItemButton
              key={item.id}
              item={item}
              categoryKey={cat.key}
              categories={categories}
              onCategoriesChange={onCategoriesChange}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}));

/**
 * Mock categories with simple single school/class structure
 */
const mockCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [{ id: 'school-1', name: 'Escola Teste' }],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [{ id: 'year-1', name: '2025', schoolId: 'school-1' }],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [{ id: 'class-1', name: 'Turma A', yearId: 'year-1' }],
    selectedIds: [],
  },
  {
    key: 'alunos',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      {
        id: 'student-1',
        name: 'Aluno 1',
        classId: 'class-1',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'student-2',
        name: 'Aluno 2',
        classId: 'class-1',
        studentId: 'student-2',
        userInstitutionId: 'ui-2',
      },
    ],
    selectedIds: [],
  },
];

/**
 * Mock categories with multiple schools (triggers full hierarchy)
 */
const mockCategoriesMultiple: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [
      { id: 'school-1', name: 'Escola Teste' },
      { id: 'school-2', name: 'Escola Secundária' },
    ],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [
      { id: 'year-1', name: '2025', schoolId: 'school-1' },
      { id: 'year-2', name: '2025', schoolId: 'school-2' },
    ],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [
      { id: 'class-1', name: 'Turma A', yearId: 'year-1' },
      { id: 'class-2', name: 'Turma B', yearId: 'year-2' },
    ],
    selectedIds: [],
  },
  {
    key: 'alunos',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      {
        id: 'student-1',
        name: 'Aluno 1',
        classId: 'class-1',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'student-3',
        name: 'Aluno 3',
        classId: 'class-2',
        studentId: 'student-3',
        userInstitutionId: 'ui-3',
      },
    ],
    selectedIds: [],
  },
];

describe('SendActivityModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    categories: mockCategories,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));
    // Store reset is required here because:
    // 1. Zustand store is a global singleton that persists between tests
    // 2. Component's useEffect reset only triggers when isOpen changes to false
    // 3. Between tests, components are unmounted without isOpen transition
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

  describe('step 2 - Recipient (CheckboxGroup)', () => {
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

    it('should render CheckboxGroup with categories', () => {
      expect(screen.getByText('Escola')).toBeInTheDocument();
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

  describe('step 2 - Recipient (hierarchy with CheckboxGroup)', () => {
    beforeEach(() => {
      // Setup: advance to step 2 with multiple schools
      render(
        <SendActivityModal
          {...defaultProps}
          categories={mockCategoriesMultiple}
        />
      );
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render hierarchy accordion labels from CheckboxGroup', () => {
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

    it('should show validation error when trying to advance without students', () => {
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
      // Use pre-selected categories to enable step 2 advancement
      const categoriesWithSelection: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [{ id: 'school-1', name: 'Escola Teste' }],
          selectedIds: ['school-1'],
        },
        {
          key: 'serie',
          label: 'Série',
          dependsOn: ['escola'],
          filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
          itens: [{ id: 'year-1', name: '2025', schoolId: 'school-1' }],
          selectedIds: ['year-1'],
        },
        {
          key: 'turma',
          label: 'Turma',
          dependsOn: ['serie'],
          filteredBy: [{ key: 'serie', internalField: 'yearId' }],
          itens: [{ id: 'class-1', name: 'Turma A', yearId: 'year-1' }],
          selectedIds: ['class-1'],
        },
        {
          key: 'alunos',
          label: 'Alunos',
          dependsOn: ['turma'],
          filteredBy: [{ key: 'turma', internalField: 'classId' }],
          itens: [
            {
              id: 'student-1',
              name: 'Aluno 1',
              classId: 'class-1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
            {
              id: 'student-2',
              name: 'Aluno 2',
              classId: 'class-1',
              studentId: 'student-2',
              userInstitutionId: 'ui-2',
            },
          ],
          selectedIds: ['student-1', 'student-2'],
        },
      ];

      render(
        <SendActivityModal
          {...defaultProps}
          categories={categoriesWithSelection}
        />
      );

      // Fill step 1
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Step 2 - students already selected, advance
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

    it('should update start time when changed via dropdown', async () => {
      // Open the start datetime dropdown first
      const startDateInput = screen.getByTestId('start-datetime-input');
      fireEvent.click(startDateInput);

      // Wait for dropdown to open and time input to be visible
      await waitFor(() => {
        expect(screen.getByTestId('start-datetime-time')).toBeInTheDocument();
      });

      const startTimeInput = screen.getByTestId('start-datetime-time');
      fireEvent.change(startTimeInput, { target: { value: '10:30' } });

      expect(startTimeInput).toHaveValue('10:30');
    });

    it('should update final time when changed via dropdown', async () => {
      // Open the final datetime dropdown first
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.click(finalDateInput);

      // Wait for dropdown to open and time input to be visible
      await waitFor(() => {
        expect(screen.getByTestId('final-datetime-time')).toBeInTheDocument();
      });

      const finalTimeInput = screen.getByTestId('final-datetime-time');
      fireEvent.change(finalTimeInput, { target: { value: '18:45' } });

      expect(finalTimeInput).toHaveValue('18:45');
    });

    it('should update start datetime via native input', () => {
      const startDateInput = screen.getByTestId('start-datetime-input');
      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T10:30' },
      });

      expect(startDateInput).toHaveValue('2025-01-20T10:30');
    });

    it('should update final datetime via native input', () => {
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T18:00' },
      });

      expect(finalDateInput).toHaveValue('2025-01-25T18:00');
    });

    it('should clear start date when input is empty', () => {
      // First set a value
      const startDateInput = screen.getByTestId('start-datetime-input');
      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T10:30' },
      });

      // Then clear it
      fireEvent.change(startDateInput, { target: { value: '' } });

      // The input should be empty
      expect(startDateInput).toHaveValue('');
    });

    it('should clear final date when input is empty', () => {
      // First set a value
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T18:00' },
      });

      // Then clear it
      fireEvent.change(finalDateInput, { target: { value: '' } });

      // The input should be empty
      expect(finalDateInput).toHaveValue('');
    });

    it('should open start date calendar dropdown when clicking input', async () => {
      const startDateInput = screen.getByTestId('start-datetime-input');
      fireEvent.click(startDateInput);

      // Wait for calendar to render
      await waitFor(() => {
        const prevButton = screen.queryByLabelText(/previous/i);
        const monthText = screen.queryByText(/janeiro/i);
        expect(prevButton || monthText).toBeTruthy();
      });
    });

    it('should open final date calendar dropdown when clicking input', async () => {
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.click(finalDateInput);

      // Wait for calendar to render
      await waitFor(() => {
        const prevButton = screen.queryByLabelText(/previous/i);
        const monthText = screen.queryByText(/janeiro/i);
        expect(prevButton || monthText).toBeTruthy();
      });
    });

    it('should toggle retry option', () => {
      // Find radio buttons by their labels
      const simLabel = screen.getByText('Sim');
      const naoLabel = screen.getByText('Não');

      // Find the button elements with aria-pressed attribute
      const simContainer = simLabel.closest('.flex.items-center');
      const naoContainer = naoLabel.closest('.flex.items-center');
      const simButton = simContainer?.querySelector('button[aria-pressed]');
      const naoButton = naoContainer?.querySelector('button[aria-pressed]');

      // Verify buttons exist
      expect(simButton).toBeInTheDocument();
      expect(naoButton).toBeInTheDocument();

      // Initial state: Não should be selected (canRetry = false by default)
      expect(naoButton).toHaveAttribute('aria-pressed', 'true');
      expect(simButton).toHaveAttribute('aria-pressed', 'false');

      // Click Sim button directly to enable retry
      fireEvent.click(simButton!);
      expect(simButton).toHaveAttribute('aria-pressed', 'true');
      expect(naoButton).toHaveAttribute('aria-pressed', 'false');

      // Click Não button directly to disable retry
      fireEvent.click(naoButton!);
      expect(naoButton).toHaveAttribute('aria-pressed', 'true');
      expect(simButton).toHaveAttribute('aria-pressed', 'false');
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

      // Use pre-selected categories
      const categoriesWithSelection: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [{ id: 'school-1', name: 'Escola Teste' }],
          selectedIds: ['school-1'],
        },
        {
          key: 'serie',
          label: 'Série',
          dependsOn: ['escola'],
          filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
          itens: [{ id: 'year-1', name: '2025', schoolId: 'school-1' }],
          selectedIds: ['year-1'],
        },
        {
          key: 'turma',
          label: 'Turma',
          dependsOn: ['serie'],
          filteredBy: [{ key: 'serie', internalField: 'yearId' }],
          itens: [{ id: 'class-1', name: 'Turma A', yearId: 'year-1' }],
          selectedIds: ['class-1'],
        },
        {
          key: 'alunos',
          label: 'Alunos',
          dependsOn: ['turma'],
          filteredBy: [{ key: 'turma', internalField: 'classId' }],
          itens: [
            {
              id: 'student-1',
              name: 'Aluno 1',
              classId: 'class-1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
            {
              id: 'student-2',
              name: 'Aluno 2',
              classId: 'class-1',
              studentId: 'student-2',
              userInstitutionId: 'ui-2',
            },
          ],
          selectedIds: ['student-1', 'student-2'],
        },
      ];

      render(
        <SendActivityModal
          {...defaultProps}
          onSubmit={onSubmit}
          categories={categoriesWithSelection}
        />
      );

      // Fill step 1
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test Activity' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Step 2 - students already selected
      fireEvent.click(screen.getByText('Próximo'));

      // Fill step 3 - select dates using datetime-local inputs
      const startDateInput = screen.getByTestId('start-datetime-input');
      const finalDateInput = screen.getByTestId('final-datetime-input');

      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T00:00' },
      });
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T23:59' },
      });

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
      // Use pre-selected categories
      const categoriesWithSelection: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [{ id: 'school-1', name: 'Escola Teste' }],
          selectedIds: ['school-1'],
        },
        {
          key: 'serie',
          label: 'Série',
          dependsOn: ['escola'],
          filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
          itens: [{ id: 'year-1', name: '2025', schoolId: 'school-1' }],
          selectedIds: ['year-1'],
        },
        {
          key: 'turma',
          label: 'Turma',
          dependsOn: ['serie'],
          filteredBy: [{ key: 'serie', internalField: 'yearId' }],
          itens: [{ id: 'class-1', name: 'Turma A', yearId: 'year-1' }],
          selectedIds: ['class-1'],
        },
        {
          key: 'alunos',
          label: 'Alunos',
          dependsOn: ['turma'],
          filteredBy: [{ key: 'turma', internalField: 'classId' }],
          itens: [
            {
              id: 'student-1',
              name: 'Aluno 1',
              classId: 'class-1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
          ],
          selectedIds: ['student-1'],
        },
      ];

      render(
        <SendActivityModal
          {...defaultProps}
          isLoading
          categories={categoriesWithSelection}
        />
      );

      // Navigate to step 3
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));
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

  describe('onCategoriesChange callback', () => {
    it('should call onCategoriesChange when categories are updated', () => {
      const onCategoriesChange = jest.fn();

      render(
        <SendActivityModal
          {...defaultProps}
          onCategoriesChange={onCategoriesChange}
        />
      );

      // Navigate to step 2
      fireEvent.click(screen.getByText('Tarefa'));
      fireEvent.change(
        screen.getByPlaceholderText('Digite o título da atividade'),
        { target: { value: 'Test' } }
      );
      fireEvent.click(screen.getByText('Próximo'));

      // Click on a category item to trigger category change
      const escolaItem = screen.getByTestId('item-school-1');
      fireEvent.click(escolaItem);

      expect(onCategoriesChange).toHaveBeenCalled();
    });
  });
});
