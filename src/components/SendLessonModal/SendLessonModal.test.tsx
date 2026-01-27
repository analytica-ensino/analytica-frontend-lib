import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import SendLessonModal from './SendLessonModal';
import { CategoryConfig, Item } from './types';
import { useSendLessonModalStore } from './hooks/useSendLessonModal';

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
 * Mock categories for testing
 */
const mockCategories: CategoryConfig[] = [
  {
    key: 'students',
    label: 'Turmas',
    itens: [
      {
        id: 'class-1',
        name: 'Turma A',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'class-2',
        name: 'Turma B',
        studentId: 'student-2',
        userInstitutionId: 'ui-2',
      },
    ],
    selectedIds: [],
  },
];

/**
 * Categories with pre-selected items
 */
const mockCategoriesWithSelection: CategoryConfig[] = [
  {
    key: 'students',
    label: 'Turmas',
    itens: [
      {
        id: 'class-1',
        name: 'Turma A',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'class-2',
        name: 'Turma B',
        studentId: 'student-2',
        userInstitutionId: 'ui-2',
      },
    ],
    selectedIds: ['class-1'],
  },
];

describe('SendLessonModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    categories: mockCategories,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));
    const store = useSendLessonModalStore.getState();
    store.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<SendLessonModal {...defaultProps} />);

      expect(screen.getByText('Enviar aula recomendada')).toBeInTheDocument();
    });

    it('should render modal with custom title', () => {
      render(
        <SendLessonModal {...defaultProps} modalTitle="Aula de Matemática" />
      );

      expect(
        screen.getByText('Enviar aula: Aula de Matemática')
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<SendLessonModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Enviar aula')).not.toBeInTheDocument();
    });

    it('should render stepper with 3 steps', () => {
      render(<SendLessonModal {...defaultProps} />);

      expect(screen.getByText('Aula')).toBeInTheDocument();
      expect(screen.getByText('Destinatário')).toBeInTheDocument();
      expect(screen.getByText('Prazo')).toBeInTheDocument();
    });

    it('should render step 1 content by default', () => {
      render(<SendLessonModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Digite o título da aula')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Digite uma mensagem para a notificação (opcional)'
        )
      ).toBeInTheDocument();
    });
  });

  describe('step 1 - Lesson', () => {
    it('should render title and notification inputs', () => {
      render(<SendLessonModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Digite o título da aula')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Digite uma mensagem para a notificação (opcional)'
        )
      ).toBeInTheDocument();
    });

    it('should show validation error when title is missing', () => {
      render(<SendLessonModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, preencha este campo para continuar.'
        )
      ).toBeInTheDocument();
    });

    it('should advance to step 2 when title is provided', () => {
      render(<SendLessonModal {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText('Para quem você vai enviar a aula?')
      ).toBeInTheDocument();
    });
  });

  describe('step 2 - Recipient', () => {
    beforeEach(() => {
      render(<SendLessonModal {...defaultProps} />);
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo'));
    });

    it('should render CheckboxGroup with categories', () => {
      expect(screen.getByText('Turmas')).toBeInTheDocument();
    });

    it('should show validation error when no student selected', () => {
      fireEvent.click(screen.getByText('Próximo'));

      expect(
        screen.getByText(
          'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
        )
      ).toBeInTheDocument();
    });

    it('should auto-select chained single options (escola/serie/turma/aluno)', async () => {
      const singleHierarchyCategories: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [{ id: 'school-1', name: 'Escola Única' }],
          selectedIds: [],
        },
        {
          key: 'serie',
          label: 'Série',
          dependsOn: ['escola'],
          filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
          itens: [{ id: 'serie-1', name: '1ª Série', schoolId: 'school-1' }],
          selectedIds: [],
        },
        {
          key: 'turma',
          label: 'Turma',
          dependsOn: ['serie'],
          filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
          itens: [{ id: 'turma-1', name: 'Turma A', schoolYearId: 'serie-1' }],
          selectedIds: [],
        },
        {
          key: 'students',
          label: 'Alunos',
          dependsOn: ['turma'],
          filteredBy: [{ key: 'turma', internalField: 'classId' }],
          itens: [
            {
              id: 'student-1',
              name: 'Aluno Único',
              classId: 'turma-1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
          ],
          selectedIds: [],
        },
      ];

      render(
        <SendLessonModal
          {...defaultProps}
          categories={singleHierarchyCategories}
        />
      );

      await waitFor(() => {
        const state = useSendLessonModalStore.getState();
        const escola = state.categories.find((c) => c.key === 'escola');
        const serie = state.categories.find((c) => c.key === 'serie');
        const turma = state.categories.find((c) => c.key === 'turma');
        const students = state.categories.find((c) => c.key === 'students');

        expect(escola?.selectedIds).toEqual(['school-1']);
        expect(serie?.selectedIds).toEqual(['serie-1']);
        expect(turma?.selectedIds).toEqual(['turma-1']);
        expect(students?.selectedIds).toEqual(['student-1']);

        // formData should also have students populated
        expect(state.formData.students).toEqual([
          { studentId: 'student-1', userInstitutionId: 'ui-1' },
        ]);
      });
    });
  });

  describe('step 2 - Recipient with selected students', () => {
    it('should advance to step 3 when students are selected', () => {
      render(
        <SendLessonModal
          {...defaultProps}
          categories={mockCategoriesWithSelection}
        />
      );
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      expect(screen.getByText('Iniciar em*')).toBeInTheDocument();
      expect(screen.getByText('Finalizar até*')).toBeInTheDocument();
    });
  });

  describe('step 3 - Deadline', () => {
    beforeEach(() => {
      render(
        <SendLessonModal
          {...defaultProps}
          categories={mockCategoriesWithSelection}
        />
      );
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3
    });

    it('should render date pickers', () => {
      expect(screen.getByText('Iniciar em*')).toBeInTheDocument();
      expect(screen.getByText('Finalizar até*')).toBeInTheDocument();
    });

    it('should show submit button on step 3', () => {
      expect(
        screen.getByRole('button', { name: /Enviar aula/i })
      ).toBeInTheDocument();
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

    it('should update start time when changed via dropdown', async () => {
      const startDateInput = screen.getByTestId('start-datetime-input');
      fireEvent.click(startDateInput);

      await waitFor(() => {
        expect(screen.getByTestId('start-datetime-time')).toBeInTheDocument();
      });

      const startTimeInput = screen.getByTestId('start-datetime-time');
      fireEvent.change(startTimeInput, { target: { value: '10:30' } });

      expect(startTimeInput).toHaveValue('10:30');
    });

    it('should update final time when changed via dropdown', async () => {
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.click(finalDateInput);

      await waitFor(() => {
        expect(screen.getByTestId('final-datetime-time')).toBeInTheDocument();
      });

      const finalTimeInput = screen.getByTestId('final-datetime-time');
      fireEvent.change(finalTimeInput, { target: { value: '18:45' } });

      expect(finalTimeInput).toHaveValue('18:45');
    });
  });

  describe('navigation', () => {
    it('should go back to previous step', () => {
      render(
        <SendLessonModal
          {...defaultProps}
          categories={mockCategoriesWithSelection}
        />
      );

      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2
      fireEvent.click(screen.getByText('Anterior')); // Step 2 -> 1

      expect(
        screen.getByPlaceholderText('Digite o título da aula')
      ).toBeInTheDocument();
    });

    it('should not show previous button on step 1', () => {
      render(<SendLessonModal {...defaultProps} />);

      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    });
  });

  describe('cancel', () => {
    it('should call onClose when cancel is clicked', () => {
      const onClose = jest.fn();
      render(<SendLessonModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancelar'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should call onSubmit with form data', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <SendLessonModal
          {...defaultProps}
          onSubmit={onSubmit}
          categories={mockCategoriesWithSelection}
        />
      );

      // Fill step 1 (Lesson)
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2

      // Step 2 (Recipient) - students already selected via mockCategoriesWithSelection
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      // Fill step 3 (Deadline)
      const startDateInput = screen.getByTestId('start-datetime-input');
      const finalDateInput = screen.getByTestId('final-datetime-input');

      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T00:00' },
      });
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T23:59' },
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Enviar aula/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Aula de Matemática',
            students: expect.any(Array),
            startDate: '2025-01-20',
            finalDate: '2025-01-25',
          })
        );
      });
    });

    it('should show loading state when isLoading is true', () => {
      render(
        <SendLessonModal
          {...defaultProps}
          isLoading
          categories={mockCategoriesWithSelection}
        />
      );

      // Navigate to step 3
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      expect(screen.getByText('Enviando...')).toBeInTheDocument();
    });

    it('should call onError when submission fails and onError is provided', async () => {
      const submitError = new Error('Submission failed');
      const onSubmit = jest.fn().mockRejectedValue(submitError);
      const onError = jest.fn();

      render(
        <SendLessonModal
          {...defaultProps}
          onSubmit={onSubmit}
          onError={onError}
          categories={mockCategoriesWithSelection}
        />
      );

      // Fill step 1 (Lesson)
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2

      // Step 2 (Recipient) - students already selected
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      // Fill step 3 (Deadline)
      const startDateInput = screen.getByTestId('start-datetime-input');
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T00:00' },
      });
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T23:59' },
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Enviar aula/i }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(submitError);
      });
    });

    it('should log error to console when submission fails without onError', async () => {
      const submitError = new Error('Submission failed');
      const onSubmit = jest.fn().mockRejectedValue(submitError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <SendLessonModal
          {...defaultProps}
          onSubmit={onSubmit}
          categories={mockCategoriesWithSelection}
        />
      );

      // Fill step 1 (Lesson)
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2

      // Step 2 (Recipient) - students already selected
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      // Fill step 3 (Deadline)
      const startDateInput = screen.getByTestId('start-datetime-input');
      const finalDateInput = screen.getByTestId('final-datetime-input');
      fireEvent.change(startDateInput, {
        target: { value: '2025-01-20T00:00' },
      });
      fireEvent.change(finalDateInput, {
        target: { value: '2025-01-25T23:59' },
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Enviar aula/i }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Falha ao enviar aula:',
          submitError
        );
      });

      consoleSpy.mockRestore();
    });

    it('should not submit when validation fails', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <SendLessonModal
          {...defaultProps}
          onSubmit={onSubmit}
          categories={mockCategoriesWithSelection}
        />
      );

      // Fill step 1 (Lesson)
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo')); // Step 1 -> 2

      // Step 2 (Recipient) - students already selected
      fireEvent.click(screen.getByText('Próximo')); // Step 2 -> 3

      // Submit without filling dates (validation should fail)
      fireEvent.click(screen.getByRole('button', { name: /Enviar aula/i }));

      await waitFor(() => {
        // Should show validation errors for dates
        const errors = screen.getAllByText(
          'Campo obrigatório! Por favor, preencha este campo para continuar.'
        );
        expect(errors.length).toBeGreaterThan(0);
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('reset on close', () => {
    it('should reset store when modal closes', () => {
      const { rerender } = render(<SendLessonModal {...defaultProps} />);

      // Close modal
      rerender(<SendLessonModal {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<SendLessonModal {...defaultProps} isOpen={true} />);

      // Should be back to initial state (step 1 - Lesson)
      expect(
        screen.getByPlaceholderText('Digite o título da aula')
      ).toBeInTheDocument();
    });
  });

  describe('onCategoriesChange callback', () => {
    it('should call onCategoriesChange when categories are updated', () => {
      const onCategoriesChange = jest.fn();

      render(
        <SendLessonModal
          {...defaultProps}
          onCategoriesChange={onCategoriesChange}
        />
      );

      // Navigate to step 2 (Recipient) to access categories
      const titleInput = screen.getByPlaceholderText('Digite o título da aula');
      fireEvent.change(titleInput, { target: { value: 'Aula de Matemática' } });
      fireEvent.click(screen.getByText('Próximo'));

      // Click on a category item to trigger category change
      const classItem = screen.getByTestId('item-class-1');
      fireEvent.click(classItem);

      expect(onCategoriesChange).toHaveBeenCalled();
    });
  });

  describe('categories initialization', () => {
    it('should initialize categories only once per modal session', () => {
      const onCategoriesChange = jest.fn();

      const { rerender } = render(
        <SendLessonModal
          {...defaultProps}
          onCategoriesChange={onCategoriesChange}
        />
      );

      // Navigate to step 2 (Recipient) to access categories
      const store = useSendLessonModalStore.getState();
      act(() => {
        store.setFormData({ title: 'Aula de Matemática' });
        store.nextStep();
      });

      // Select a category item
      const classItem = screen.getByTestId('item-class-1');
      fireEvent.click(classItem);

      const callCount = onCategoriesChange.mock.calls.length;

      // Re-render with same props - should NOT re-initialize categories
      rerender(
        <SendLessonModal
          {...defaultProps}
          onCategoriesChange={onCategoriesChange}
        />
      );

      // Categories should remain the same, no additional initialization calls
      expect(onCategoriesChange.mock.calls.length).toBe(callCount);
    });

    it('should re-initialize categories when modal reopens', () => {
      const { rerender } = render(<SendLessonModal {...defaultProps} />);

      // Navigate to step 2 (Recipient) to access categories
      const store = useSendLessonModalStore.getState();
      act(() => {
        store.setFormData({ title: 'Aula de Matemática' });
        store.nextStep();
      });

      // Select a class
      const classItem = screen.getByTestId('item-class-1');
      fireEvent.click(classItem);

      // Close modal
      rerender(<SendLessonModal {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<SendLessonModal {...defaultProps} isOpen={true} />);

      // Categories should be fresh (no selections from previous session)
      const newStore = useSendLessonModalStore.getState();
      const studentsCategory = newStore.categories.find(
        (cat) => cat.key === 'students'
      );
      expect(studentsCategory?.selectedIds).toEqual([]);
    });
  });

  describe('render current step content', () => {
    it('should render null for invalid step', () => {
      render(<SendLessonModal {...defaultProps} />);

      // Force store to invalid step
      const store = useSendLessonModalStore.getState();
      store.goToStep(5 as unknown as number);

      // Re-render won't show any step content (but modal still shows)
      expect(screen.getByText('Enviar aula recomendada')).toBeInTheDocument();
    });
  });

  describe('use store categories when available', () => {
    it('should use store categories over initial categories when available', () => {
      render(<SendLessonModal {...defaultProps} categories={mockCategories} />);

      // Navigate to step 2 (Recipient) to access categories
      const store = useSendLessonModalStore.getState();
      act(() => {
        store.setFormData({ title: 'Aula de Matemática' });
        store.nextStep();
      });

      // Click on an item to update store categories
      const classItem = screen.getByTestId('item-class-1');
      fireEvent.click(classItem);

      // Store categories should now have selection
      const updatedStore = useSendLessonModalStore.getState();
      const studentsCategory = updatedStore.categories.find(
        (cat) => cat.key === 'students'
      );
      expect(studentsCategory?.selectedIds).toContain('class-1');
    });
  });
});
