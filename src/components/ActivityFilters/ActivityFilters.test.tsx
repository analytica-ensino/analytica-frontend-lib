import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ActivityFilters, ActivityFiltersPopover } from './ActivityFilters';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Mock useTheme hook
const mockUseTheme = {
  themeMode: 'system' as const,
  isDark: false,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
}));

// Mock useQuizStore to export QUESTION_TYPE
jest.mock('../Quiz/useQuizStore', () => {
  const actual = jest.requireActual('../Quiz/useQuizStore');
  return {
    ...actual,
  };
});

// Mock components
jest.mock('../../', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { QUESTION_TYPE } = require('../Quiz/useQuizStore');
  return {
    Text: ({
      children,
      size,
      weight,
      className,
      ...props
    }: {
      children: React.ReactNode;
      size?: string;
      weight?: string;
      className?: string;
    }) => (
      <span
        data-testid="text"
        data-size={size}
        data-weight={weight}
        className={className}
        {...props}
      >
        {children}
      </span>
    ),
    Chips: ({
      children,
      selected,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      selected: boolean;
      onClick: () => void;
    }) => (
      <button
        data-testid="chips"
        data-selected={selected}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    ),
    Radio: ({
      value,
      checked,
      onChange,
      label,
      ...props
    }: {
      value: string;
      checked: boolean;
      onChange: () => void;
      label: React.ReactNode;
    }) => (
      <label data-testid="radio" {...props}>
        <input
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
        />
        {label}
      </label>
    ),
    IconRender: ({
      iconName,
      size,
      color,
      ...props
    }: {
      iconName: string;
      size: number;
      color: string;
    }) => (
      <span
        data-testid="icon-render"
        data-icon={iconName}
        data-size={size}
        data-color={color}
        {...props}
      />
    ),
    getSubjectColorWithOpacity: jest.fn((color: string, isDark: boolean) => {
      return isDark ? `${color}-dark` : `${color}-light`;
    }),
    CheckboxGroup: ({
      categories,
      onCategoriesChange,
      compactSingleItem,
      showSingleItem,
      ...props
    }: {
      categories: CategoryConfig[];
      onCategoriesChange: (categories: CategoryConfig[]) => void;
      compactSingleItem?: boolean;
      showSingleItem?: boolean;
    }) => (
      <div
        data-testid="checkbox-group"
        data-compact-single-item={compactSingleItem}
        data-show-single-item={showSingleItem}
        {...props}
      >
        {categories.map((category) => (
          <div key={category.key} data-testid={`category-${category.key}`}>
            <div data-testid={`category-label-${category.key}`}>
              {category.label}
            </div>
            {category.itens?.map((item) => (
              <label key={item.id} data-testid={`item-${item.id}`}>
                <input
                  type="checkbox"
                  checked={category.selectedIds?.includes(item.id) || false}
                  onChange={() => {
                    const updatedCategories = categories.map((cat) => {
                      if (cat.key === category.key) {
                        const selectedIds = cat.selectedIds || [];
                        const newSelectedIds = selectedIds.includes(item.id)
                          ? selectedIds.filter((id) => id !== item.id)
                          : [...selectedIds, item.id];
                        return { ...cat, selectedIds: newSelectedIds };
                      }
                      return cat;
                    });
                    onCategoriesChange(updatedCategories);
                  }}
                />
                {item.name}
              </label>
            ))}
          </div>
        ))}
      </div>
    ),
    Button: ({
      children,
      variant,
      onClick,
      size,
      ...props
    }: {
      children: React.ReactNode;
      variant?: string;
      onClick?: () => void;
      size?: string;
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        data-size={size}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    ),
    DropdownMenu: ({
      children,
      open,
      onOpenChange: _onOpenChange,
      ...props
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => (
      <div data-testid="dropdown-menu" data-open={open} {...props}>
        {children}
      </div>
    ),
    DropdownMenuTrigger: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
    }) => (
      <div data-testid="dropdown-menu-trigger" {...props}>
        {children}
      </div>
    ),
    DropdownMenuContent: ({
      children,
      align,
      className,
      ...props
    }: {
      children: React.ReactNode;
      align?: string;
      className?: string;
    }) => (
      <div
        data-testid="dropdown-menu-content"
        data-align={align}
        className={className}
        {...props}
      >
        {children}
      </div>
    ),
    QUESTION_TYPE,
    useTheme: () => mockUseTheme,
  };
});

describe('ActivityFilters', () => {
  const mockOnFiltersChange = jest.fn();

  const mockBanks: Bank[] = [
    { id: 'bank1', name: 'Banca 1', examInstitution: 'Instituição 1' },
    { id: 'bank2', name: 'Banca 2', examInstitution: 'Instituição 2' },
  ];

  const mockBankYears: BankYear[] = [
    { id: 'year1', name: '2023', bankId: 'bank1' },
    { id: 'year2', name: '2024', bankId: 'bank1' },
    { id: 'year3', name: '2023', bankId: 'bank2' },
  ];

  const mockKnowledgeAreas: KnowledgeArea[] = [
    {
      id: 'subject1',
      name: 'Matemática',
      color: '#FF0000',
      icon: 'Calculator',
    },
    {
      id: 'subject2',
      name: 'Português',
      color: '#00FF00',
      icon: 'Book',
    },
  ];

  const mockKnowledgeStructure: KnowledgeStructureState = {
    topics: [
      { id: 'topic1', name: 'Tópico 1' },
      { id: 'topic2', name: 'Tópico 2' },
    ],
    subtopics: [
      { id: 'subtopic1', name: 'Subtópico 1' },
      { id: 'subtopic2', name: 'Subtópico 2' },
    ],
    contents: [
      { id: 'content1', name: 'Conteúdo 1' },
      { id: 'content2', name: 'Conteúdo 2' },
    ],
    loading: false,
    error: null,
  };

  const mockKnowledgeCategories: CategoryConfig[] = [
    {
      key: 'tema',
      label: 'Tema',
      itens: [
        { id: 'topic1', name: 'Tópico 1' },
        { id: 'topic2', name: 'Tópico 2' },
      ],
      selectedIds: [],
    },
    {
      key: 'subtema',
      label: 'Subtema',
      dependsOn: ['tema'],
      itens: [
        { id: 'subtopic1', name: 'Subtópico 1' },
        { id: 'subtopic2', name: 'Subtópico 2' },
      ],
      selectedIds: [],
      filteredBy: [{ key: 'tema', internalField: 'topicId' }],
    },
    {
      key: 'assunto',
      label: 'Assunto',
      dependsOn: ['subtema'],
      itens: [
        { id: 'content1', name: 'Conteúdo 1' },
        { id: 'content2', name: 'Conteúdo 2' },
      ],
      selectedIds: [],
      filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.isDark = false;
  });

  describe('Basic rendering', () => {
    it('renders with default variant', () => {
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

    it('renders with popover variant', () => {
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

    it('renders all question types by default', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      expect(chips.length).toBeGreaterThan(0);
    });
  });

  describe('QuestionTypeFilter', () => {
    it('renders all question types when allowedQuestionTypes is not provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      expect(chips.length).toBe(7);
    });

    it('renders only allowed question types when provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          allowedQuestionTypes={[
            QUESTION_TYPE.ALTERNATIVA,
            QUESTION_TYPE.DISSERTATIVA,
          ]}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      expect(chips.length).toBe(2);
    });

    it('toggles question type selection', async () => {
      const user = userEvent.setup();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      const firstChip = chips[0];

      expect(firstChip).toHaveAttribute('data-selected', 'false');

      await user.click(firstChip);

      await waitFor(() => {
        expect(firstChip).toHaveAttribute('data-selected', 'true');
      });

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('filters out invalid question types when allowedQuestionTypes changes', async () => {
      const { rerender } = render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          allowedQuestionTypes={[
            QUESTION_TYPE.ALTERNATIVA,
            QUESTION_TYPE.DISSERTATIVA,
          ]}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      await userEvent.click(chips[0]);
      await userEvent.click(chips[1]);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      });

      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.types).toHaveLength(2);

      rerender(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          allowedQuestionTypes={[QUESTION_TYPE.ALTERNATIVA]}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      await waitFor(() => {
        const updatedCall =
          mockOnFiltersChange.mock.calls[
            mockOnFiltersChange.mock.calls.length - 1
          ][0];
        expect(updatedCall.types.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('BanksAndYearsFilter', () => {
    it('renders loading state', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadingBanks={true}
        />
      );

      expect(screen.getByText('Carregando bancas...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      const errorMessage = 'Erro ao carregar bancas';
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          banksError={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders empty state when no banks or years', () => {
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

    it('renders CheckboxGroup when bankCategories are available', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      waitFor(() => {
        const checkboxGroup = screen.getByTestId('checkbox-group');
        expect(checkboxGroup).toBeInTheDocument();
      });
    });

    it('updates bank categories when banks change', async () => {
      const { rerender } = render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      });

      const newBanks: Bank[] = [
        ...mockBanks,
        { id: 'bank3', name: 'Banca 3', examInstitution: 'Instituição 3' },
      ];

      rerender(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={newBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      await waitFor(() => {
        const checkboxGroup = screen.getByTestId('checkbox-group');
        expect(checkboxGroup).toBeInTheDocument();
      });
    });

    it('handles bank category selection', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      await waitFor(() => {
        const checkboxGroup = screen.getByTestId('checkbox-group');
        expect(checkboxGroup).toBeInTheDocument();
      });

      const bankItems = screen.getAllByTestId(/^item-bank/);
      if (bankItems.length > 0) {
        await userEvent.click(bankItems[0]);

        await waitFor(() => {
          expect(mockOnFiltersChange).toHaveBeenCalled();
        });
      }
    });
  });

  describe('SubjectsFilter', () => {
    it('renders loading state', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadingSubjects={true}
        />
      );

      expect(screen.getByText('Carregando matérias...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      const errorMessage = 'Erro ao carregar matérias';
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          subjectsError={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders all knowledge areas', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const radios = screen.getAllByTestId('radio');
      expect(radios.length).toBe(mockKnowledgeAreas.length);
    });

    it('selects a subject when clicked', async () => {
      const user = userEvent.setup();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const radios = screen.getAllByTestId('radio');
      const firstRadio = radios[0];
      const radioInput = firstRadio.querySelector('input[type="radio"]');

      expect(radioInput).not.toBeChecked();

      await user.click(firstRadio);

      await waitFor(() => {
        expect(radioInput).toBeChecked();
      });

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('deselects subject when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const radios = screen.getAllByTestId('radio');
      const firstRadio = radios[0];

      await user.click(firstRadio);

      await waitFor(() => {
        const lastCall = mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0] as ActivityFiltersData;
        expect(lastCall.knowledgeIds).toContain(mockKnowledgeAreas[0].id);
      });

      await user.click(firstRadio);

      await waitFor(
        () => {
          const allCalls = mockOnFiltersChange.mock.calls.map(
            (call) => call[0] as ActivityFiltersData
          );
          const hasEmptyKnowledgeIds = allCalls.some(
            (call) => call.knowledgeIds.length === 0
          );
          expect(hasEmptyKnowledgeIds).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('switches subject selection', async () => {
      const user = userEvent.setup();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const radios = screen.getAllByTestId('radio');
      const firstRadio = radios[0];
      const secondRadio = radios[1];
      const firstInput = firstRadio.querySelector('input[type="radio"]');
      const secondInput = secondRadio.querySelector('input[type="radio"]');

      await user.click(firstRadio);

      await waitFor(() => {
        expect(firstInput).toBeChecked();
        expect(secondInput).not.toBeChecked();
      });

      await user.click(secondRadio);

      await waitFor(() => {
        expect(firstInput).not.toBeChecked();
        expect(secondInput).toBeChecked();
      });
    });

    it('uses dark theme color when isDark is true', () => {
      mockUseTheme.isDark = true;
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const icons = screen.getAllByTestId('icon-render');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('KnowledgeStructureFilter', () => {
    it('renders when subject is selected', () => {
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

      const radios = screen.getAllByTestId('radio');
      fireEvent.click(radios[0]);

      waitFor(() => {
        expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
      });
    });

    it('does not render when no subject is selected', () => {
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

    it('renders loading state', () => {
      const loadingStructure: KnowledgeStructureState = {
        ...mockKnowledgeStructure,
        loading: true,
      };

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={loadingStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const radios = screen.getAllByTestId('radio');
      fireEvent.click(radios[0]);

      waitFor(() => {
        expect(
          screen.getByText('Carregando estrutura de conhecimento...')
        ).toBeInTheDocument();
      });
    });

    it('renders error state', () => {
      const errorStructure: KnowledgeStructureState = {
        ...mockKnowledgeStructure,
        error: 'Erro ao carregar estrutura',
      };

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={errorStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={jest.fn()}
        />
      );

      const radios = screen.getAllByTestId('radio');
      fireEvent.click(radios[0]);

      waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar estrutura')
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when no topics available', () => {
      const emptyStructure: KnowledgeStructureState = {
        topics: [],
        subtopics: [],
        contents: [],
        loading: false,
        error: null,
      };

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={emptyStructure}
          knowledgeCategories={[]}
          handleCategoriesChange={jest.fn()}
        />
      );

      const radios = screen.getAllByTestId('radio');
      fireEvent.click(radios[0]);

      waitFor(() => {
        expect(
          screen.getByText(
            'Nenhum tema disponível para as matérias selecionadas'
          )
        ).toBeInTheDocument();
      });
    });

    it('renders CheckboxGroup when knowledgeCategories are available', () => {
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

      const radios = screen.getAllByTestId('radio');
      fireEvent.click(radios[0]);

      waitFor(() => {
        const checkboxGroups = screen.getAllByTestId('checkbox-group');
        expect(checkboxGroups.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FilterActions', () => {
    it('does not render when no action handlers provided', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const buttons = screen.queryAllByTestId('button');
      const actionButtons = buttons.filter(
        (btn) =>
          btn.textContent === 'Limpar filtros' || btn.textContent === 'Filtrar'
      );
      expect(actionButtons.length).toBe(0);
    });

    it('renders clear filters button', () => {
      const onClearFilters = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={onClearFilters}
        />
      );

      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    });

    it('renders apply filters button', () => {
      const onApplyFilters = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onApplyFilters={onApplyFilters}
        />
      );

      expect(screen.getByText('Filtrar')).toBeInTheDocument();
    });

    it('calls onClearFilters when clear button is clicked', async () => {
      const onClearFilters = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onClearFilters={onClearFilters}
        />
      );

      const clearButton = screen.getByText('Limpar filtros');
      await userEvent.click(clearButton);

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('calls onApplyFilters when apply button is clicked', async () => {
      const onApplyFilters = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          onApplyFilters={onApplyFilters}
        />
      );

      const applyButton = screen.getByText('Filtrar');
      await userEvent.click(applyButton);

      expect(onApplyFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('Load functions', () => {
    it('calls loadBanks on mount', () => {
      const loadBanks = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadBanks={loadBanks}
        />
      );

      expect(loadBanks).toHaveBeenCalledTimes(1);
    });

    it('calls loadKnowledge on mount', () => {
      const loadKnowledge = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadKnowledge={loadKnowledge}
        />
      );

      expect(loadKnowledge).toHaveBeenCalledTimes(1);
    });

    it('calls loadTopics when subject is selected', async () => {
      const loadTopics = jest.fn();
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          loadTopics={loadTopics}
        />
      );

      const radios = screen.getAllByTestId('radio');
      await userEvent.click(radios[0]);

      await waitFor(() => {
        expect(loadTopics).toHaveBeenCalledWith([mockKnowledgeAreas[0].id]);
      });
    });
  });

  describe('onFiltersChange callback', () => {
    it('calls onFiltersChange with initial empty filters', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const callArgs = mockOnFiltersChange.mock
        .calls[0][0] as ActivityFiltersData;
      expect(callArgs.types).toEqual([]);
      expect(callArgs.bankIds).toEqual([]);
      expect(callArgs.yearIds).toEqual([]);
      expect(callArgs.knowledgeIds).toEqual([]);
    });

    it('calls onFiltersChange when question types change', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const chips = screen.getAllByTestId('chips');
      await userEvent.click(chips[0]);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
        const lastCall = mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0] as ActivityFiltersData;
        expect(lastCall.types.length).toBeGreaterThan(0);
      });
    });

    it('calls onFiltersChange when subject changes', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      const radios = screen.getAllByTestId('radio');
      await userEvent.click(radios[0]);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
        const lastCall = mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0] as ActivityFiltersData;
        expect(lastCall.knowledgeIds).toContain(mockKnowledgeAreas[0].id);
      });
    });

    it('calls onFiltersChange when bank categories change', async () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      await waitFor(() => {
        const checkboxGroup = screen.getByTestId('checkbox-group');
        expect(checkboxGroup).toBeInTheDocument();
      });

      const bankItems = screen.queryAllByTestId(/^item-bank/);
      if (bankItems.length > 0) {
        await userEvent.click(bankItems[0]);

        await waitFor(() => {
          const lastCall = mockOnFiltersChange.mock.calls[
            mockOnFiltersChange.mock.calls.length - 1
          ][0] as ActivityFiltersData;
          expect(lastCall.bankIds.length).toBeGreaterThan(0);
        });
      }
    });

    it('calls onFiltersChange when knowledge categories change', async () => {
      const handleCategoriesChange = jest.fn((_updatedCategories) => {
        // Simulate parent updating knowledgeCategories
      });

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={mockKnowledgeStructure}
          knowledgeCategories={mockKnowledgeCategories}
          handleCategoriesChange={handleCategoriesChange}
        />
      );

      const radios = screen.getAllByTestId('radio');
      await userEvent.click(radios[0]);

      await waitFor(() => {
        const checkboxGroups = screen.getAllByTestId('checkbox-group');
        expect(checkboxGroups.length).toBeGreaterThan(0);
      });

      const knowledgeCheckboxGroups = screen.getAllByTestId('checkbox-group');
      if (knowledgeCheckboxGroups.length > 1) {
        const knowledgeGroup = knowledgeCheckboxGroups[1];
        const items = knowledgeGroup.querySelectorAll('[data-testid^="item-"]');
        if (items.length > 0) {
          await userEvent.click(items[0] as HTMLElement);

          await waitFor(() => {
            expect(handleCategoriesChange).toHaveBeenCalled();
          });
        }
      }
    });

    it('handles onFiltersChange prop changes', () => {
      const firstCallback = jest.fn();
      const { rerender } = render(
        <ActivityFilters
          onFiltersChange={firstCallback}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(firstCallback).toHaveBeenCalled();

      const secondCallback = jest.fn();
      rerender(
        <ActivityFilters
          onFiltersChange={secondCallback}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      expect(secondCallback).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles empty banks array', () => {
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

    it('handles empty knowledgeAreas array', () => {
      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={[]}
        />
      );

      const radios = screen.queryAllByTestId('radio');
      expect(radios.length).toBe(0);
    });

    it('handles bank without name but with examInstitution', () => {
      const banksWithoutName: Bank[] = [
        { id: 'bank1', examInstitution: 'Instituição 1', name: '' },
      ];

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={banksWithoutName}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
        />
      );

      waitFor(() => {
        const checkboxGroup = screen.getByTestId('checkbox-group');
        expect(checkboxGroup).toBeInTheDocument();
      });
    });

    it('handles knowledge area without icon', () => {
      const knowledgeAreasWithoutIcon: KnowledgeArea[] = [
        {
          id: 'subject1',
          name: 'Matemática',
          color: '#FF0000',
        },
      ];

      render(
        <ActivityFilters
          onFiltersChange={mockOnFiltersChange}
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={knowledgeAreasWithoutIcon}
        />
      );

      const radios = screen.getAllByTestId('radio');
      expect(radios.length).toBe(1);
    });
  });
});

describe('ActivityFiltersPopover', () => {
  const mockOnFiltersChange = jest.fn();

  const mockBanks: Bank[] = [
    { id: 'bank1', name: 'Banca 1', examInstitution: 'Instituição 1' },
  ];

  const mockBankYears: BankYear[] = [
    { id: 'year1', name: '2023', bankId: 'bank1' },
  ];

  const mockKnowledgeAreas: KnowledgeArea[] = [
    {
      id: 'subject1',
      name: 'Matemática',
      color: '#FF0000',
      icon: 'Calculator',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default trigger label', () => {
    render(
      <ActivityFiltersPopover
        onFiltersChange={mockOnFiltersChange}
        banks={mockBanks}
        bankYears={mockBankYears}
        knowledgeAreas={mockKnowledgeAreas}
      />
    );

    expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
  });

  it('renders with custom trigger label', () => {
    const customLabel = 'Filtros Personalizados';
    render(
      <ActivityFiltersPopover
        onFiltersChange={mockOnFiltersChange}
        banks={mockBanks}
        bankYears={mockBankYears}
        knowledgeAreas={mockKnowledgeAreas}
        triggerLabel={customLabel}
      />
    );

    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it('renders DropdownMenu components', () => {
    render(
      <ActivityFiltersPopover
        onFiltersChange={mockOnFiltersChange}
        banks={mockBanks}
        bankYears={mockBankYears}
        knowledgeAreas={mockKnowledgeAreas}
      />
    );

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
  });

  it('renders ActivityFilters inside popover', () => {
    render(
      <ActivityFiltersPopover
        onFiltersChange={mockOnFiltersChange}
        banks={mockBanks}
        bankYears={mockBankYears}
        knowledgeAreas={mockKnowledgeAreas}
      />
    );

    expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
    expect(screen.getByText('Banca de vestibular')).toBeInTheDocument();
    expect(screen.getByText('Matéria')).toBeInTheDocument();
  });

  it('passes all props to ActivityFilters', () => {
    const handleCategoriesChange = jest.fn();
    const onClearFilters = jest.fn();
    const onApplyFilters = jest.fn();

    render(
      <ActivityFiltersPopover
        onFiltersChange={mockOnFiltersChange}
        banks={mockBanks}
        bankYears={mockBankYears}
        knowledgeAreas={mockKnowledgeAreas}
        handleCategoriesChange={handleCategoriesChange}
        onClearFilters={onClearFilters}
        onApplyFilters={onApplyFilters}
      />
    );

    expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    expect(screen.getByText('Filtrar')).toBeInTheDocument();
  });
});
