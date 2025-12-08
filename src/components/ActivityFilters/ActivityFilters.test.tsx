import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ActivityFilters, ActivityFiltersPopover } from './ActivityFilters';
import { QUESTION_TYPE } from '../..';
import type {
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeItem,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Mock image files
jest.mock('../../assets/img/mock-content.png', () => 'test-file-stub');
jest.mock(
  '../../assets/img/mock-image-question.png',
  () => 'mocked-image-2.png'
);
jest.mock('../../assets/img/suporthistory.png', () => 'test-file-stub');

// Mock Chips component
jest.mock('../Chips/Chips', () => {
  return React.forwardRef<
    HTMLButtonElement,
    {
      children: React.ReactNode;
      selected?: boolean;
      onClick?: () => void;
      className?: string;
    }
  >(({ children, selected, onClick, className, ...props }, ref) => (
    <button
      ref={ref}
      data-testid="activity-filter-chip"
      data-selected={selected}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ));
});

// Mock Radio component
jest.mock('../Radio/Radio', () => ({
  __esModule: true,
  default: React.forwardRef<
    HTMLInputElement,
    {
      value: string;
      checked?: boolean;
      onChange?: () => void;
      label?: React.ReactNode;
      className?: string;
    }
  >(({ value, checked, onChange, label, className, ...props }, ref) => (
    <label className={className}>
      <input
        ref={ref}
        type="radio"
        data-testid={`activity-filter-radio-${value}`}
        value={value}
        checked={checked}
        onChange={onChange}
        onClick={onChange} // Also trigger onChange on click to ensure it works
        {...props}
      />
      {label}
    </label>
  )),
  RadioGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radio-group">{children}</div>
  ),
  RadioGroupItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock CheckboxGroup component
jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange: (categories: CategoryConfig[]) => void;
  }) => (
    <div data-testid="checkbox-group">
      {categories.map((category) => (
        <div key={category.key} data-testid={`category-${category.key}`}>
          <h4>{category.label}</h4>
          {category.itens?.map((item) => (
            <button
              key={item.id}
              data-testid={`checkbox-item-${item.id}`}
              onClick={() => {
                const updatedCategories = categories.map((cat) => {
                  if (cat.key === category.key) {
                    const isSelected = cat.selectedIds?.includes(item.id);
                    return {
                      ...cat,
                      selectedIds: isSelected
                        ? cat.selectedIds?.filter((id) => id !== item.id)
                        : [...(cat.selectedIds || []), item.id],
                    };
                  }
                  return cat;
                });
                onCategoriesChange(updatedCategories);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  ),
}));

// Mock Text component
jest.mock('../Text/Text', () => {
  return React.forwardRef<
    HTMLParagraphElement,
    {
      children: React.ReactNode;
      size?: string;
      weight?: string;
      className?: string;
    }
  >(({ children, size, weight, className, ...props }, ref) => (
    <p
      ref={ref}
      data-testid="activity-filter-text"
      data-size={size}
      data-weight={weight}
      className={className}
      {...props}
    >
      {children}
    </p>
  ));
});

// Mock IconRender component
jest.mock('../IconRender/IconRender', () => ({
  __esModule: true,
  default: ({
    iconName,
    size,
    color,
  }: {
    iconName: string;
    size?: number;
    color?: string;
  }) => (
    <span
      data-testid="icon-render"
      data-icon={iconName}
      data-size={size}
      data-color={color}
    >
      {iconName}
    </span>
  ),
}));

// Mock Button component
jest.mock('../Button/Button', () => {
  return React.forwardRef<
    HTMLButtonElement,
    {
      children: React.ReactNode;
      variant?: string;
      size?: string;
      onClick?: () => void;
      className?: string;
    }
  >(({ children, variant, size, onClick, className, ...props }, ref) => (
    <button
      ref={ref}
      data-testid="activity-filter-button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ));
});

// Mock DropdownMenu components
jest.mock('../DropdownMenu/DropdownMenu', () => ({
  __esModule: true,
  default: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dropdown-menu" data-open={open}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    className,
    align,
  }: {
    children: React.ReactNode;
    className?: string;
    align?: string;
  }) => (
    <div
      data-testid="dropdown-content"
      className={className}
      data-align={align}
    >
      {children}
    </div>
  ),
}));

// Mock useTheme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    isDark: false,
    theme: 'light',
  })),
}));

// Mock getSubjectColorWithOpacity
jest.mock('../../utils/utils', () => ({
  ...jest.requireActual('../../utils/utils'),
  getSubjectColorWithOpacity: jest.fn((color: string, isDark: boolean) => {
    if (isDark) return color;
    return `${color}4d`;
  }),
}));

// Mock data
const mockBanks: Bank[] = [
  { examInstitution: 'ENEM', id: 'enem', name: 'ENEM' },
  { examInstitution: 'FUVEST', id: 'fuvest', name: 'FUVEST' },
  { examInstitution: 'UNICAMP', id: 'unicamp', name: 'UNICAMP' },
];

const mockBankYears: BankYear[] = [
  { id: 'year-2023', name: '2023', bankId: 'enem' },
  { id: 'year-2022', name: '2022', bankId: 'enem' },
  { id: 'year-2021', name: '2021', bankId: 'enem' },
  { id: 'year-2023-fuvest', name: '2023', bankId: 'fuvest' },
  { id: 'year-2022-fuvest', name: '2022', bankId: 'fuvest' },
];

const mockKnowledgeAreas: KnowledgeArea[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    color: '#0066b8',
    icon: 'MathOperations',
  },
  {
    id: 'portugues',
    name: 'Português',
    color: '#00a651',
    icon: 'ChatPT',
  },
  {
    id: 'fisica',
    name: 'Física',
    color: '#8b4513',
    icon: 'Atom',
  },
];

const mockTopics: KnowledgeItem[] = [
  { id: 'tema-1', name: 'Álgebra' },
  { id: 'tema-2', name: 'Geometria' },
];

const mockSubtopics: KnowledgeItem[] = [
  { id: 'subtema-1', name: 'Equações do 1º grau', parentId: 'tema-1' },
  { id: 'subtema-2', name: 'Equações do 2º grau', parentId: 'tema-1' },
];

const mockContents: KnowledgeItem[] = [
  {
    id: 'assunto-1',
    name: 'Resolução de equações lineares',
    parentId: 'subtema-1',
  },
];

const mockKnowledgeCategories: CategoryConfig[] = [
  {
    key: 'tema',
    label: 'Tema',
    itens: mockTopics.map((t) => ({ id: t.id, name: t.name })),
    selectedIds: [],
  },
  {
    key: 'subtema',
    label: 'Subtema',
    dependsOn: ['tema'],
    itens: mockSubtopics.map((st) => ({
      id: st.id,
      name: st.name,
      temaId: (st.parentId as string) || '',
    })),
    filteredBy: [{ key: 'tema', internalField: 'temaId' }],
    selectedIds: [],
  },
];

const mockKnowledgeStructure: KnowledgeStructureState = {
  topics: mockTopics,
  subtopics: mockSubtopics,
  contents: mockContents,
  loading: false,
  error: null,
};

describe('ActivityFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default variant', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
      expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
      expect(screen.getByText('Banca de vestibular')).toBeInTheDocument();
      expect(screen.getByText('Matéria')).toBeInTheDocument();
    });

    it('should render with popover variant', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          variant="popover"
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.queryByText('Filtro de questões')).not.toBeInTheDocument();
      expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
    });

    it('should render all question types', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Alternativa')).toBeInTheDocument();
      expect(screen.getByText('Verdadeiro ou Falso')).toBeInTheDocument();
      expect(screen.getByText('Discursiva')).toBeInTheDocument();
      expect(screen.getByText('Imagem')).toBeInTheDocument();
      expect(screen.getByText('Múltipla Escolha')).toBeInTheDocument();
      expect(screen.getByText('Ligar Pontos')).toBeInTheDocument();
      expect(screen.getByText('Preencher Lacunas')).toBeInTheDocument();
    });

    it('should render banks when provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
      expect(screen.getByTestId('category-banca')).toBeInTheDocument();
      expect(screen.getByText('Banca')).toBeInTheDocument();
    });

    it('should render knowledge areas when provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Português')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
    });

    it('should apply correct container classes for default variant', () => {
      const { container } = render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          variant="default"
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('w-[400px]', 'flex-shrink-0', 'p-4');
    });

    it('should apply correct container classes for popover variant', () => {
      const { container } = render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          variant="popover"
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('w-full');
    });
  });

  describe('Question Type Selection', () => {
    it('should toggle question type when chip is clicked', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const alternativaChip = screen.getByText('Alternativa').closest('button');
      expect(alternativaChip).toBeInTheDocument();

      fireEvent.click(alternativaChip!);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.types).toContain(QUESTION_TYPE.ALTERNATIVA);
    });

    it('should deselect question type when clicked again', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const alternativaChip = screen.getByText('Alternativa').closest('button');

      // Clear initial calls
      mockOnFiltersChange.mockClear();

      // First click - select
      fireEvent.click(alternativaChip!);

      // Second click - deselect
      fireEvent.click(alternativaChip!);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.types).not.toContain(QUESTION_TYPE.ALTERNATIVA);
    });

    it('should allow multiple question types to be selected', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const alternativaChip = screen.getByText('Alternativa').closest('button');
      const multiplaEscolhaChip = screen
        .getByText('Múltipla Escolha')
        .closest('button');

      fireEvent.click(alternativaChip!);
      fireEvent.click(multiplaEscolhaChip!);

      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.types).toContain(QUESTION_TYPE.ALTERNATIVA);
      expect(lastCall.types).toContain(QUESTION_TYPE.MULTIPLA_ESCOLHA);
    });
  });

  describe('Bank Selection', () => {
    it('should render CheckboxGroup for banks and years', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
      expect(screen.getByTestId('category-banca')).toBeInTheDocument();
      expect(screen.getByTestId('category-ano')).toBeInTheDocument();
    });

    it('should toggle bank when checkbox is clicked', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.bankIds).toContain('enem');
    });

    it('should allow multiple banks to be selected', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      const fuvestCheckbox = screen.getByTestId('checkbox-item-fuvest');

      fireEvent.click(enemCheckbox);
      fireEvent.click(fuvestCheckbox);

      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.bankIds).toContain('enem');
      expect(lastCall.bankIds).toContain('fuvest');
    });

    it('should show years when bank is selected', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      // Initially, years should not be visible (depends on bank selection)
      const yearCategory = screen.getByTestId('category-ano');
      expect(yearCategory).toBeInTheDocument();

      // Select a bank
      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      // Years should now be available
      await waitFor(() => {
        expect(
          screen.getByTestId('checkbox-item-year-2023')
        ).toBeInTheDocument();
      });
    });

    it('should filter years by selected bank', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      // Select ENEM bank
      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      await waitFor(() => {
        // Should show ENEM years
        expect(
          screen.getByTestId('checkbox-item-year-2023')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('checkbox-item-year-2022')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('checkbox-item-year-2021')
        ).toBeInTheDocument();
        // Should not show FUVEST years
        expect(
          screen.queryByTestId('checkbox-item-year-2023-fuvest')
        ).not.toBeInTheDocument();
      });
    });

    it('should update yearIds when year is selected', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      // Select ENEM bank first
      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      await waitFor(() => {
        const year2023Checkbox = screen.getByTestId('checkbox-item-year-2023');
        fireEvent.click(year2023Checkbox);
      });

      await waitFor(() => {
        const lastCall =
          mockOnFiltersChange.mock.calls[
            mockOnFiltersChange.mock.calls.length - 1
          ][0];
        expect(lastCall.yearIds).toContain('year-2023');
      });
    });
  });

  describe('Subject Selection', () => {
    it('should select subject when radio is clicked', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.knowledgeIds).toContain('matematica');
    });

    it('should deselect subject when same radio is clicked again', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );

      // First click - select
      fireEvent.click(matematicaRadio);

      // Wait for state update and verify it was selected
      await waitFor(() => {
        const calls = mockOnFiltersChange.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.knowledgeIds).toContain('matematica');
      });

      // Get the number of calls after selection
      const callsAfterSelect = mockOnFiltersChange.mock.calls.length;

      // Second click - deselect (should toggle off)
      fireEvent.click(matematicaRadio);

      // Wait for state update and verify it was deselected
      await waitFor(
        () => {
          const calls = mockOnFiltersChange.mock.calls;
          expect(calls.length).toBeGreaterThan(callsAfterSelect);
          const lastCall = calls[calls.length - 1][0];
          expect(lastCall.knowledgeIds).not.toContain('matematica');
        },
        { timeout: 3000 }
      );
    });

    it('should switch subject when different radio is clicked', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      const portuguesRadio = screen.getByTestId(
        'activity-filter-radio-portugues'
      );

      fireEvent.click(matematicaRadio);
      fireEvent.click(portuguesRadio);

      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.knowledgeIds).toContain('portugues');
      expect(lastCall.knowledgeIds).not.toContain('matematica');
    });
  });

  describe('Knowledge Structure', () => {
    it('should show knowledge structure when subject is selected', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
    });

    it('should not show knowledge structure when no subject is selected', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      expect(
        screen.queryByText('Tema, Subtema e Assunto')
      ).not.toBeInTheDocument();
    });

    it('should render CheckboxGroup when subject is selected', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });

    it('should call handleCategoriesChange when category item is clicked', () => {
      const mockHandleCategoriesChange = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={mockHandleCategoriesChange}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      const temaItem = screen.getByTestId('checkbox-item-tema-1');
      fireEvent.click(temaItem);

      expect(mockHandleCategoriesChange).toHaveBeenCalled();
    });

    it('should update filters when knowledge categories change', () => {
      const mockHandleCategoriesChange = jest.fn((updatedCategories) => {
        // Simulate parent updating categories
        render(
          <ActivityFilters
            onFiltersChange={mockOnFiltersChange}
            banks={mockBanks}
            knowledgeAreas={mockKnowledgeAreas}
            knowledgeStructure={mockKnowledgeStructure}
            knowledgeCategories={updatedCategories}
            handleCategoriesChange={mockHandleCategoriesChange}
          />,
          { container: document.body }
        );
      });

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={mockHandleCategoriesChange}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      const temaItem = screen.getByTestId('checkbox-item-tema-1');
      fireEvent.click(temaItem);

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading message for banks', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={[]}
          knowledgeAreas={mockKnowledgeAreas}
          loadingBanks={true}
        />
      );

      expect(screen.getByText('Carregando bancas...')).toBeInTheDocument();
    });

    it('should show loading message for subjects', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          knowledgeAreas={[]}
          loadingSubjects={true}
        />
      );

      expect(screen.getByText('Carregando matérias...')).toBeInTheDocument();
    });

    it('should show loading message for knowledge structure', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadingKnowledge={true}
          knowledgeStructure={{
            ...mockKnowledgeStructure,
            loading: true,
          }}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      // Wait for the knowledge structure section to appear
      expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
      expect(
        screen.getByText('Carregando estrutura de conhecimento...')
      ).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error message for banks', () => {
      const errorMessage = 'Erro ao carregar bancas';
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={[]}
          knowledgeAreas={mockKnowledgeAreas}
          banksError={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show error message for subjects', () => {
      const errorMessage = 'Erro ao carregar matérias';
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          knowledgeAreas={[]}
          subjectsError={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show error message for knowledge structure', () => {
      const errorMessage = 'Erro ao carregar estrutura de conhecimento';
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={{
            ...mockKnowledgeStructure,
            error: errorMessage,
          }}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty message when no banks are available', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={[]}
          bankYears={[]}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Nenhuma banca encontrada')).toBeInTheDocument();
    });

    it('should show empty message when no knowledge structure is available', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={{
            topics: [],
            subtopics: [],
            contents: [],
            loading: false,
            error: null,
          }}
          knowledgeCategories={[]}
          handleCategoriesChange={jest.fn()}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(
        screen.getByText('Nenhum tema disponível para as matérias selecionadas')
      ).toBeInTheDocument();
    });
  });

  describe('Load Functions', () => {
    it('should call loadBanks on mount', () => {
      const mockLoadBanks = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadBanks={mockLoadBanks}
        />
      );

      expect(mockLoadBanks).toHaveBeenCalledTimes(1);
    });

    it('should call loadKnowledge on mount', () => {
      const mockLoadKnowledge = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadKnowledge={mockLoadKnowledge}
        />
      );

      expect(mockLoadKnowledge).toHaveBeenCalledTimes(1);
    });

    it('should call loadTopics when subject is selected', () => {
      const mockLoadTopics = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadTopics={mockLoadTopics}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(mockLoadTopics).toHaveBeenCalledWith(['matematica']);
    });

    it('should not call loadTopics when subject is deselected', () => {
      const mockLoadTopics = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadTopics={mockLoadTopics}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );

      // Select
      fireEvent.click(matematicaRadio);
      expect(mockLoadTopics).toHaveBeenCalledTimes(1);

      // Deselect
      fireEvent.click(matematicaRadio);
      expect(mockLoadTopics).toHaveBeenCalledTimes(1);
    });
  });

  describe('Summary', () => {
    it('should show summary when enableSummary is true', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={{
            topics: [mockTopics[0]], // Only one topic to satisfy condition
            subtopics: [],
            contents: [],
            loading: false,
            error: null,
          }}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
          selectedKnowledgeSummary={{
            topics: ['Álgebra'],
            subtopics: [],
            contents: [],
          }}
          enableSummary={true}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByText('Resumo da seleção')).toBeInTheDocument();
      expect(screen.getByText('Tema:')).toBeInTheDocument();
      expect(screen.getAllByText('Álgebra').length).toBeGreaterThan(0);
    });

    it('should not show summary when enableSummary is false', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
          selectedKnowledgeSummary={{
            topics: ['Álgebra'],
            subtopics: [],
            contents: [],
          }}
          enableSummary={false}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.queryByText('Resumo da seleção')).not.toBeInTheDocument();
    });

    it('should show subtopics in summary when available', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={{
            topics: mockTopics,
            subtopics: [mockSubtopics[0]], // Only one subtopic to satisfy condition
            contents: [],
            loading: false,
            error: null,
          }}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
          selectedKnowledgeSummary={{
            topics: ['Álgebra'],
            subtopics: ['Equações do 1º grau'],
            contents: [],
          }}
          enableSummary={true}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByText('Subtema:')).toBeInTheDocument();
      expect(screen.getAllByText('Equações do 1º grau').length).toBeGreaterThan(
        0
      );
    });

    it('should show contents in summary when available', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={{
            topics: mockTopics,
            subtopics: mockSubtopics,
            contents: [mockContents[0]], // Only one content to satisfy condition
            loading: false,
            error: null,
          }}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
          selectedKnowledgeSummary={{
            topics: ['Álgebra'],
            subtopics: ['Equações do 1º grau'],
            contents: ['Resolução de equações lineares'],
          }}
          enableSummary={true}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(screen.getByText('Assunto:')).toBeInTheDocument();
      expect(
        screen.getAllByText('Resolução de equações lineares').length
      ).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    it('should render clear filters button when onClearFilters is provided', () => {
      const mockOnClearFilters = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText('Limpar filtros');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton.closest('button')).toHaveAttribute(
        'data-variant',
        'link'
      );
    });

    it('should render apply filters button when onApplyFilters is provided', () => {
      const mockOnApplyFilters = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      const applyButton = screen.getByText('Filtrar');
      expect(applyButton).toBeInTheDocument();
      expect(applyButton.closest('button')).toHaveAttribute(
        'data-variant',
        'outline'
      );
    });

    it('should call onClearFilters when clear button is clicked', () => {
      const mockOnClearFilters = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText('Limpar filtros');
      fireEvent.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should call onApplyFilters when apply button is clicked', () => {
      const mockOnApplyFilters = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      const applyButton = screen.getByText('Filtrar');
      fireEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
    });

    it('should not render action buttons when neither callback is provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument();
      expect(screen.queryByText('Filtrar')).not.toBeInTheDocument();
    });

    it('should render both buttons when both callbacks are provided', () => {
      const mockOnClearFilters = jest.fn();
      const mockOnApplyFilters = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
      expect(screen.getByText('Filtrar')).toBeInTheDocument();
    });
  });

  describe('Filters Change Callback', () => {
    it('should call onFiltersChange with initial empty filters', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const firstCall = mockOnFiltersChange.mock.calls[0][0];
      expect(firstCall.types).toEqual([]);
      expect(firstCall.bankIds).toEqual([]);
      expect(firstCall.yearIds).toEqual([]);
      expect(firstCall.knowledgeIds).toEqual([]);
      expect(firstCall.topicIds).toEqual([]);
      expect(firstCall.subtopicIds).toEqual([]);
      expect(firstCall.contentIds).toEqual([]);
    });

    it('should call onFiltersChange when question types change', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      mockOnFiltersChange.mockClear();

      const alternativaChip = screen.getByText('Alternativa').closest('button');
      fireEvent.click(alternativaChip!);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.types).toContain(QUESTION_TYPE.ALTERNATIVA);
    });

    it('should call onFiltersChange when banks change', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      mockOnFiltersChange.mockClear();

      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.bankIds).toContain('enem');
    });

    it('should call onFiltersChange when subject changes', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      mockOnFiltersChange.mockClear();

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.knowledgeIds).toContain('matematica');
    });

    it('should call onFiltersChange when knowledge categories change', async () => {
      const mockHandleCategoriesChange = jest.fn((updatedCategories) => {
        // Simulate parent updating and re-rendering
        const updatedCategoriesWithSelection = updatedCategories.map(
          (cat: CategoryConfig) => {
            if (cat.key === 'tema') {
              return { ...cat, selectedIds: ['tema-1'] };
            }
            return cat;
          }
        );

        render(
          <ActivityFilters
            onFiltersChange={mockOnFiltersChange}
            banks={mockBanks}
            knowledgeAreas={mockKnowledgeAreas}
            knowledgeStructure={mockKnowledgeStructure}
            knowledgeCategories={updatedCategoriesWithSelection}
            handleCategoriesChange={mockHandleCategoriesChange}
          />,
          { container: document.body }
        );
      });

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={mockHandleCategoriesChange}
        />
      );

      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      mockOnFiltersChange.mockClear();

      const temaItem = screen.getByTestId('checkbox-item-tema-1');
      fireEvent.click(temaItem);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      });
    });
  });

  describe('ActivityFiltersPopover', () => {
    it('should render trigger button', () => {
      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    });

    it('should render with custom trigger label', () => {
      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          triggerLabel="Custom Label"
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should render ActivityFilters inside dropdown content', () => {
      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
    });

    it('should pass all props to ActivityFilters', () => {
      const mockOnClearFilters = jest.fn();
      const mockOnApplyFilters = jest.fn();

      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
      expect(screen.getByText('Filtrar')).toBeInTheDocument();
    });

    it('should have correct dropdown content classes', () => {
      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const dropdownContent = screen.getByTestId('dropdown-content');
      expect(dropdownContent).toHaveClass('w-[90vw]', 'max-w-[400px]');
    });

    it('should handle dropdown open/close state', () => {
      render(
        <ActivityFiltersPopover
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const dropdownMenu = screen.getByTestId('dropdown-menu');
      expect(dropdownMenu).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty banks array', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={[]}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(screen.getByText('Nenhuma banca encontrada')).toBeInTheDocument();
    });

    it('should handle empty knowledge areas array', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          knowledgeAreas={[]}
        />
      );

      // Should render without errors
      expect(screen.getByText('Matéria')).toBeInTheDocument();
    });

    it('should handle missing icon in knowledge area', () => {
      const knowledgeAreaWithoutIcon: KnowledgeArea = {
        id: 'test',
        name: 'Test Subject',
        color: '#000000',
      };

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          knowledgeAreas={[knowledgeAreaWithoutIcon]}
        />
      );

      expect(screen.getByText('Test Subject')).toBeInTheDocument();
    });

    it('should handle multiple filter selections simultaneously', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      // Select question type
      const alternativaChip = screen.getByText('Alternativa').closest('button');
      fireEvent.click(alternativaChip!);

      // Select bank
      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      // Select subject
      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];

      expect(lastCall.types).toContain(QUESTION_TYPE.ALTERNATIVA);
      expect(lastCall.bankIds).toContain('enem');
      expect(lastCall.knowledgeIds).toContain('matematica');
    });

    it('should handle rapid successive clicks on same chip', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const alternativaChip = screen.getByText('Alternativa').closest('button');

      // Rapid clicks
      fireEvent.click(alternativaChip!);
      fireEvent.click(alternativaChip!);
      fireEvent.click(alternativaChip!);

      // Should handle gracefully
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should maintain state when props change', () => {
      const { rerender } = render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const alternativaChip = screen.getByText('Alternativa').closest('button');
      fireEvent.click(alternativaChip!);

      // Rerender with new banks
      rerender(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={[
            ...mockBanks,
            { examInstitution: 'UEL', id: 'uel', name: 'UEL' },
          ]}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      // Selection should be maintained
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should work with all features together', () => {
      const mockOnClearFilters = jest.fn();
      const mockOnApplyFilters = jest.fn();
      const mockHandleCategoriesChange = jest.fn();

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={mockHandleCategoriesChange}
          selectedKnowledgeSummary={{
            topics: ['Álgebra'],
            subtopics: [],
            contents: [],
          }}
          enableSummary={true}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      );

      // Select question type
      const alternativaChip = screen.getByText('Alternativa').closest('button');
      fireEvent.click(alternativaChip!);

      // Select bank
      const enemCheckbox = screen.getByTestId('checkbox-item-enem');
      fireEvent.click(enemCheckbox);

      // Select subject
      const matematicaRadio = screen.getByTestId(
        'activity-filter-radio-matematica'
      );
      fireEvent.click(matematicaRadio);

      // Verify knowledge structure appears
      expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();

      // Verify summary appears
      expect(screen.getByText('Resumo da seleção')).toBeInTheDocument();

      // Verify action buttons
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
      expect(screen.getByText('Filtrar')).toBeInTheDocument();

      // Test action buttons
      fireEvent.click(screen.getByText('Limpar filtros'));
      expect(mockOnClearFilters).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Filtrar'));
      expect(mockOnApplyFilters).toHaveBeenCalled();
    });
  });
});
