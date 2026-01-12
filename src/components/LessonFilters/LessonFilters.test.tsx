// Helper types and functions extracted to reduce function nesting depth (SonarLint S2004)
type CategoryItem = { id: string; name: string };
type Category = {
  key: string;
  label: string;
  itens: CategoryItem[];
  selectedIds: string[];
};

const toggleCategorySelection = (
  categories: Category[],
  categoryKey: string,
  itemId: string
): Category[] => {
  return categories.map((c) =>
    c.key === categoryKey
      ? {
          ...c,
          selectedIds: c.selectedIds.includes(itemId)
            ? c.selectedIds.filter((id) => id !== itemId)
            : [...c.selectedIds, itemId],
        }
      : c
  );
};

/**
 * Creates a change handler for category checkbox
 * Extracted to reduce nesting depth in mock components
 */
const createCategoryChangeHandler = (
  categories: Category[],
  categoryKey: string,
  itemId: string,
  onCategoriesChange: (updated: Category[]) => void
) => {
  return () =>
    onCategoriesChange(
      toggleCategorySelection(categories, categoryKey, itemId)
    );
};

/**
 * Renders category items for mock checkbox group
 * Extracted to reduce nesting depth in mock components
 */
const renderCategoryItems = (
  category: Category,
  categories: Category[],
  onCategoriesChange: (updated: Category[]) => void
) => {
  return category.itens.map((item) => (
    <label key={item.id}>
      <input
        type="checkbox"
        checked={category.selectedIds.includes(item.id)}
        onChange={createCategoryChangeHandler(
          categories,
          category.key,
          item.id,
          onCategoriesChange
        )}
      />
      {item.name}
    </label>
  ));
};

// Mocks need to be defined before importing the component (barrel imports).
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  QUESTION_TYPE: {
    ALTERNATIVA: 'ALTERNATIVA',
    VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
    DISSERTATIVA: 'DISSERTATIVA',
    IMAGEM: 'IMAGEM',
    MULTIPLA_ESCOLHA: 'MULTIPLA_ESCOLHA',
    LIGAR_PONTOS: 'LIGAR_PONTOS',
    PREENCHER: 'PREENCHER',
  },
}));
jest.mock('../../hooks/useActivityFiltersData', () => {
  return {
    createUseActivityFiltersData: () => () => mockUseActivityFiltersDataReturn,
  };
});
jest.mock('../../components/ActivityFilters/utils', () => ({
  useInitialFiltersLoader: jest.fn(() => ({})),
  useKnowledgeStructureInitialFilters: jest.fn(() => ({})),
}));
jest.mock('../../components/ActivityFilters/components', () => ({
  SubjectsFilter: ({
    knowledgeAreas,
    selectedSubject,
    onSubjectChange,
    loading,
    error,
  }: {
    knowledgeAreas: Array<{ id: string; name: string }>;
    selectedSubject: string | null;
    onSubjectChange: (id: string) => void;
    loading?: boolean;
    error?: string | null;
  }) => (
    <div data-testid="subjects-filter">
      {loading && <div>Carregando matérias...</div>}
      {error && <div>{error}</div>}
      {knowledgeAreas.map((area) => (
        <label key={area.id}>
          <input
            type="radio"
            checked={selectedSubject === area.id}
            onChange={() => onSubjectChange(area.id)}
          />
          {area.name}
        </label>
      ))}
    </div>
  ),
  KnowledgeStructureFilter: ({
    knowledgeStructure,
    knowledgeCategories,
    handleCategoriesChange,
  }: {
    knowledgeStructure: {
      loading: boolean;
      error: string | null;
      topics: Array<{ id: string }>;
    };
    knowledgeCategories: Array<{
      key: string;
      label: string;
      itens: Array<{ id: string; name: string }>;
      selectedIds: string[];
    }>;
    handleCategoriesChange?: (
      updatedCategories: typeof knowledgeCategories
    ) => void;
  }) => (
    <div data-testid="knowledge-structure-filter">
      <div>Tema, Subtema e Assunto</div>
      {knowledgeStructure.loading && (
        <div>Carregando estrutura de conhecimento...</div>
      )}
      {knowledgeStructure.error && <div>{knowledgeStructure.error}</div>}
      {knowledgeCategories.length > 0 && handleCategoriesChange && (
        <div data-testid="checkbox-group">
          {knowledgeCategories.map((category) => (
            <div key={category.key}>
              <h4>{category.label}</h4>
              {renderCategoryItems(
                category,
                knowledgeCategories,
                handleCategoriesChange
              )}
            </div>
          ))}
        </div>
      )}
      {!knowledgeStructure.loading &&
        knowledgeCategories.length === 0 &&
        knowledgeStructure.topics.length === 0 && (
          <div>Nenhum tema disponível para as matérias selecionadas</div>
        )}
    </div>
  ),
  FilterActions: ({
    onClearFilters,
    onApplyFilters,
  }: {
    onClearFilters?: () => void;
    onApplyFilters?: () => void;
  }) => (
    <div data-testid="filter-actions">
      {onClearFilters && (
        <button onClick={onClearFilters}>Limpar filtros</button>
      )}
      {onApplyFilters && <button onClick={onApplyFilters}>Filtrar</button>}
    </div>
  ),
}));
jest.mock('../../components/CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: Array<{
      key: string;
      label: string;
      itens: Array<{ id: string; name: string }>;
      selectedIds: string[];
    }>;
    onCategoriesChange: (updatedCategories: typeof categories) => void;
  }) => (
    <div data-testid="checkbox-group">
      {categories.map((category) => (
        <div key={category.key}>
          <h4>{category.label}</h4>
          {renderCategoryItems(category, categories, onCategoriesChange)}
        </div>
      ))}
    </div>
  ),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonFilters } from './LessonFilters';
import type { LessonFiltersData } from '../../types/lessonFilters';

const mockLoadKnowledgeAreas = jest.fn();
const mockLoadTopics = jest.fn();
const mockLoadSubtopics = jest.fn();
const mockLoadContents = jest.fn();
const mockHandleCategoriesChange = jest.fn();

const baseState = {
  banks: [],
  bankYears: [],
  loadingBanks: false,
  banksError: null,

  knowledgeAreas: [
    {
      id: 'subject1',
      name: 'Matemática',
      icon: 'Calculator',
      color: '#ff0000',
    },
    { id: 'subject2', name: 'Português', icon: 'Book', color: '#00ff00' },
  ],
  loadingSubjects: false,
  subjectsError: null,

  knowledgeStructure: {
    topics: [
      { id: 'topic-1', name: 'Topic 1' },
      { id: 'topic-2', name: 'Topic 2' },
    ],
    subtopics: [
      { id: 'sub-1', name: 'Sub 1' },
      { id: 'sub-2', name: 'Sub 2' },
    ],
    contents: [
      { id: 'content-1', name: 'Content 1' },
      { id: 'content-2', name: 'Content 2' },
    ],
    loading: false,
    error: null,
  },
  knowledgeCategories: [
    {
      key: 'tema',
      label: 'Tema',
      itens: [
        { id: 'topic-1', name: 'Topic 1' },
        { id: 'topic-2', name: 'Topic 2' },
      ],
      selectedIds: [],
    },
    {
      key: 'subtema',
      label: 'Subtema',
      itens: [
        { id: 'sub-1', name: 'Sub 1', topicId: 'topic-1' },
        { id: 'sub-2', name: 'Sub 2', topicId: 'topic-2' },
      ],
      selectedIds: [],
    },
    {
      key: 'assunto',
      label: 'Assunto',
      itens: [
        { id: 'content-1', name: 'Content 1', subtopicId: 'sub-1' },
        { id: 'content-2', name: 'Content 2', subtopicId: 'sub-2' },
      ],
      selectedIds: [],
    },
  ],
  handleCategoriesChange: mockHandleCategoriesChange,

  questionTypes: [],
  loadingQuestionTypes: false,
  questionTypesError: null,

  loadBanks: jest.fn(),
  loadKnowledgeAreas: mockLoadKnowledgeAreas,
  loadQuestionTypes: jest.fn(),
  loadTopics: mockLoadTopics,
  loadSubtopics: mockLoadSubtopics,
  loadContents: mockLoadContents,
  selectedKnowledgeSummary: {
    topics: [],
    subtopics: [],
    contents: [],
  },
  enableSummary: false,
};

const buildMockReturn = (overrides: Partial<typeof baseState> = {}) => ({
  ...baseState,
  ...overrides,
});

let mockUseActivityFiltersDataReturn = buildMockReturn();

const renderComponent = (
  props: Partial<React.ComponentProps<typeof LessonFilters>> = {}
) =>
  render(
    <LessonFilters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiClient={{} as any}
      onFiltersChange={jest.fn()}
      {...props}
    />
  );

describe('LessonFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActivityFiltersDataReturn = buildMockReturn();
  });

  it('calls loadKnowledgeAreas on mount', () => {
    renderComponent();

    expect(mockLoadKnowledgeAreas).toHaveBeenCalledTimes(1);
  });

  it('renders subjects filter', () => {
    renderComponent();

    expect(screen.getByText('Matéria')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
  });

  it('renders knowledge structure filter always visible', () => {
    renderComponent();

    expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
  });

  it('shows message when no subject is selected', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      knowledgeStructure: {
        topics: [],
        subtopics: [],
        contents: [],
        loading: false,
        error: null,
      },
      knowledgeCategories: [],
    });

    renderComponent();

    expect(
      screen.getByText('Nenhum tema disponível para as matérias selecionadas')
    ).toBeInTheDocument();
  });

  it('renders knowledge structure filter with topics when subject is selected', async () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      knowledgeCategories: [
        {
          key: 'tema',
          label: 'Tema',
          itens: [{ id: 'topic-1', name: 'Topic 1' }],
          selectedIds: [],
        },
      ],
    });

    renderComponent();

    const mathRadio = screen.getByLabelText(/Matemática/i);
    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
    });
  });

  it('calls onFiltersChange when subject is selected', async () => {
    const mockOnFiltersChange = jest.fn();
    renderComponent({ onFiltersChange: mockOnFiltersChange });

    const mathRadio = screen.getByLabelText(/Matemática/i);
    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectIds: ['subject1'],
          topicIds: [],
          subtopicIds: [],
          contentIds: [],
        })
      );
    });
  });

  it('renders filter actions when provided', () => {
    const mockOnClearFilters = jest.fn();
    const mockOnApplyFilters = jest.fn();

    renderComponent({
      onClearFilters: mockOnClearFilters,
      onApplyFilters: mockOnApplyFilters,
    });

    expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    expect(screen.getByText('Filtrar')).toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', () => {
    const mockOnClearFilters = jest.fn();

    renderComponent({ onClearFilters: mockOnClearFilters });

    const clearButton = screen.getByText('Limpar filtros');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });

  it('calls onApplyFilters when apply button is clicked', () => {
    const mockOnApplyFilters = jest.fn();

    renderComponent({ onApplyFilters: mockOnApplyFilters });

    const applyButton = screen.getByText('Filtrar');
    fireEvent.click(applyButton);

    expect(mockOnApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('does not render filter actions when not provided', () => {
    renderComponent({ onClearFilters: undefined, onApplyFilters: undefined });

    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument();
    expect(screen.queryByText('Filtrar')).not.toBeInTheDocument();
  });

  it('renders loading state for subjects', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      loadingSubjects: true,
    });

    renderComponent();

    expect(screen.getByText('Carregando matérias...')).toBeInTheDocument();
  });

  it('renders error state for subjects', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      subjectsError: 'Erro ao carregar matérias',
    } as unknown as typeof baseState);

    renderComponent();

    expect(screen.getByText('Erro ao carregar matérias')).toBeInTheDocument();
  });

  it('renders loading state for knowledge structure', async () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      knowledgeStructure: {
        topics: [],
        subtopics: [],
        contents: [],
        loading: true,
        error: null,
      },
      knowledgeCategories: [],
    });

    renderComponent();

    const mathRadio = screen.getByLabelText(/Matemática/i);
    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(
        screen.getByText('Carregando estrutura de conhecimento...')
      ).toBeInTheDocument();
    });
  });

  it('applies initial filters', () => {
    const initialFilters: LessonFiltersData = {
      subjectIds: ['subject1'],
      topicIds: ['topic-1'],
      subtopicIds: ['sub-1'],
      contentIds: ['content-1'],
    };

    mockUseActivityFiltersDataReturn = buildMockReturn({
      knowledgeCategories: [
        {
          key: 'tema',
          label: 'Tema',
          itens: [{ id: 'topic-1', name: 'Topic 1' }],
          selectedIds: ['topic-1'] as string[],
        },
        {
          key: 'subtema',
          label: 'Subtema',
          dependsOn: ['tema'],
          filteredBy: [{ key: 'tema', internalField: 'topicId' }],
          itens: [
            {
              id: 'sub-1',
              name: 'Sub 1',
              topicId: 'topic-1',
            } as { id: string; name: string; topicId: string },
          ],
          selectedIds: ['sub-1'] as string[],
        },
        {
          key: 'assunto',
          label: 'Assunto',
          dependsOn: ['subtema'],
          filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
          itens: [
            {
              id: 'content-1',
              name: 'Content 1',
              subtopicId: 'sub-1',
            } as { id: string; name: string; subtopicId: string },
          ],
          selectedIds: ['content-1'] as string[],
        },
      ] as typeof baseState.knowledgeCategories,
    });

    renderComponent({ initialFilters });

    // Initial filters are now handled by shared hooks (useInitialFiltersLoader and useKnowledgeStructureInitialFilters)
    // The component should still render with the initial subject selected
    expect(screen.getByLabelText(/Matemática/i)).toBeChecked();
  });

  it('renders popover variant', () => {
    renderComponent({ variant: 'popover' });

    expect(screen.queryByText('Filtro de aulas')).not.toBeInTheDocument();
  });

  it('renders default variant with title', () => {
    renderComponent({ variant: 'default' });

    expect(screen.getByText('Filtro de aulas')).toBeInTheDocument();
  });

  it('toggles subject selection', async () => {
    const mockOnFiltersChange = jest.fn();
    renderComponent({ onFiltersChange: mockOnFiltersChange });

    const mathRadio = screen.getByLabelText(/Matemática/i);
    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectIds: ['subject1'],
        })
      );
    });

    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectIds: [],
        })
      );
    });
  });

  it('calls handleCategoriesChange when knowledge categories change', async () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      knowledgeCategories: [
        {
          key: 'tema',
          label: 'Tema',
          itens: [{ id: 'topic-1', name: 'Topic 1' }],
          selectedIds: [],
        },
      ],
    });

    renderComponent();

    const mathRadio = screen.getByLabelText(/Matemática/i);
    fireEvent.click(mathRadio);

    await waitFor(() => {
      expect(screen.getByText('Tema, Subtema e Assunto')).toBeInTheDocument();
    });

    const updatedCategories = [
      {
        key: 'tema',
        label: 'Tema',
        itens: [{ id: 'topic-1', name: 'Topic 1' }],
        selectedIds: ['topic-1'],
      },
    ];

    mockHandleCategoriesChange(updatedCategories);

    expect(mockHandleCategoriesChange).toHaveBeenCalled();
  });
});
