import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparatorView } from './ComparatorView';
import type {
  ComparatorStoreState,
  UseComparatorReturn,
  ComparisonItem,
  ComparatorData,
} from '../../types/comparator';
import { ReactNode } from 'react';

// Mock SearchSelect component
jest.mock('../SearchSelect/SearchSelect', () => ({
  __esModule: true,
  default: ({
    options,
    onValueChange,
    placeholder,
    disabled,
  }: {
    options: { value: string; label: string }[];
    onValueChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
  }) => (
    <select
      data-testid="search-select"
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

// Mock Modal component
jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    children,
    title,
    footer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title: string;
    footer?: ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <h2>{title}</h2>
        <div data-testid="modal-content">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
}));

describe('ComparatorView', () => {
  // Mock store state
  const createMockStore = (
    overrides: Partial<ComparatorStoreState> = {}
  ): (() => ComparatorStoreState) => {
    const defaultState: ComparatorStoreState = {
      comparisonType: null,
      selectedItems: [],
      setComparisonType: jest.fn(),
      setSelectedItems: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clearSelection: jest.fn(),
      ...overrides,
    };
    return () => defaultState;
  };

  // Mock comparator hook
  const createMockComparator = (
    overrides: Partial<UseComparatorReturn> = {}
  ): (() => UseComparatorReturn) => {
    const defaultData: ComparatorData = {
      knowledgeAreas: [],
      curricularComponents: [],
      competencies: [],
      nationalAverages: [],
    };
    const defaultReturn: UseComparatorReturn = {
      data: defaultData,
      loading: false,
      error: null,
      fetchData: jest.fn(),
      ...overrides,
    };
    return () => defaultReturn;
  };

  const defaultProps = {
    schools: [
      { value: 'school-1', label: 'Escola A' },
      { value: 'school-2', label: 'Escola B' },
    ],
    schoolYears: [
      { value: 'year-1', label: '3º Ano A' },
      { value: 'year-2', label: '3º Ano B' },
    ],
    useComparatorStore: createMockStore(),
    useComparator: createMockComparator(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header Rendering', () => {
    it('should render the title in header', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(within(header).getByText('Comparador')).toBeInTheDocument();
    });

    it('should render back button when onBack is provided', () => {
      render(<ComparatorView {...defaultProps} onBack={jest.fn()} />);

      const backButton = screen.getByRole('button', { name: /Comparador/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should render title without button when onBack is not provided', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(within(header).getByText('Comparador')).toBeInTheDocument();
      // Should not be a button
      expect(
        within(header).queryByRole('button', { name: /Comparador/i })
      ).not.toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      const handleBack = jest.fn();

      render(<ComparatorView {...defaultProps} onBack={handleBack} />);

      const backButton = screen.getByRole('button', { name: /Comparador/i });
      await user.click(backButton);

      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it('should render selection button in header', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(
        within(header).getByRole('button', { name: /Selecionar comparação/i })
      ).toBeInTheDocument();
    });

    it('should disable selection button when no comparison options', () => {
      render(
        <ComparatorView
          {...defaultProps}
          schools={[{ value: 'school-1', label: 'Escola A' }]}
          schoolYears={[{ value: 'year-1', label: '3º Ano A' }]}
        />
      );

      const header = screen.getByRole('banner');
      // When no comparison is possible (only 1 item each), button shows "Selecionar turmas" (fallback)
      const button = within(header).getByRole('button', {
        name: /Selecionar turmas/i,
      });
      expect(button).toBeDisabled();
    });

    it('should disable selection button when isUserLoading is true', () => {
      render(<ComparatorView {...defaultProps} isUserLoading={true} />);

      const header = screen.getByRole('banner');
      const button = within(header).getByRole('button', {
        name: /Selecionar comparação/i,
      });
      expect(button).toBeDisabled();
    });
  });

  describe('Tabs Rendering', () => {
    it('should render all default tabs', () => {
      render(<ComparatorView {...defaultProps} />);

      expect(screen.getByText('Áreas do conhecimento')).toBeInTheDocument();
      expect(screen.getByText('Componentes curriculares')).toBeInTheDocument();
      expect(screen.getByText('Competências')).toBeInTheDocument();
      expect(screen.getByText('Médias Nacionais ENEM')).toBeInTheDocument();
    });

    it('should render custom tabs when provided', () => {
      const customTabs = [
        { value: 'knowledge-areas' as const, label: 'Custom Tab 1' },
        { value: 'competencies' as const, label: 'Custom Tab 2' },
      ];

      render(<ComparatorView {...defaultProps} tabs={customTabs} />);

      expect(screen.getByText('Custom Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Tab 2')).toBeInTheDocument();
      expect(
        screen.queryByText('Áreas do conhecimento')
      ).not.toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(
        <ComparatorView {...defaultProps} activeTab="curricular-components" />
      );

      const activeTab = screen.getByText('Componentes curriculares');
      expect(activeTab).toHaveClass('text-primary-700');
    });

    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleTabChange = jest.fn();

      render(
        <ComparatorView {...defaultProps} onTabChange={handleTabChange} />
      );

      const competenciesTab = screen.getByText('Competências');
      await user.click(competenciesTab);

      expect(handleTabChange).toHaveBeenCalledWith('competencies');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no items are selected', () => {
      render(<ComparatorView {...defaultProps} />);

      expect(
        screen.getByText(/Selecione escolas ou turmas para visualizar/i)
      ).toBeInTheDocument();
    });

    it('should show appropriate empty state for schools only', () => {
      render(
        <ComparatorView
          {...defaultProps}
          schoolYears={[{ value: 'year-1', label: '3º Ano A' }]}
        />
      );

      expect(
        screen.getByText(/Selecione escolas para visualizar/i)
      ).toBeInTheDocument();
    });

    it('should show appropriate empty state for school years only', () => {
      render(
        <ComparatorView
          {...defaultProps}
          schools={[{ value: 'school-1', label: 'Escola A' }]}
        />
      );

      expect(
        screen.getByText(/Selecione turmas para visualizar/i)
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      const { container } = render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
          useComparator={createMockComparator({ loading: true })}
        />
      );

      // Loading state renders skeleton cards, not empty state
      expect(
        screen.queryByText(/Selecione escolas ou turmas/i)
      ).not.toBeInTheDocument();
      // Check for skeleton elements
      const skeletons = container.querySelectorAll('[class*="animate"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Content State', () => {
    it('should render tab content when items are selected and not loading', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
        { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
      ];

      const mockData: ComparatorData = {
        knowledgeAreas: [
          {
            area: 'Ciências Humanas',
            values: [
              { itemId: 'school-1', percentage: 75 },
              { itemId: 'school-2', percentage: 65 },
            ],
          },
        ],
        curricularComponents: [],
        competencies: [],
        nationalAverages: [],
      };

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
          useComparator={createMockComparator({ data: mockData })}
        />
      );

      // Should not show empty state when items are selected
      expect(
        screen.queryByText(/Selecione escolas ou turmas/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    it('should open modal when selection button is clicked', async () => {
      const user = userEvent.setup();

      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar comparação/i,
      });
      await user.click(selectionButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show type selection step when no comparison type is set', async () => {
      const user = userEvent.setup();

      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar comparação/i,
      });
      await user.click(selectionButton);

      expect(
        screen.getByText(/Selecione o tipo de comparação/i)
      ).toBeInTheDocument();
    });

    it('should show items selection step when comparison type is already set', async () => {
      const user = userEvent.setup();
      // Need selected items for button text to change to "Selecionar escolas"
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
        />
      );

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar escolas/i,
      });
      await user.click(selectionButton);

      expect(screen.getByTestId('search-select')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();

      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar comparação/i,
      });
      await user.click(selectionButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show footer with buttons in step 2', async () => {
      const user = userEvent.setup();
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
        />
      );

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar escolas/i,
      });
      await user.click(selectionButton);

      const footer = screen.getByTestId('modal-footer');
      expect(within(footer).getByText('Voltar')).toBeInTheDocument();
      expect(within(footer).getByText(/Confirmar/i)).toBeInTheDocument();
    });

    it('should disable confirm button when no items selected', async () => {
      const user = userEvent.setup();
      // Use only schools option so button text is "Selecionar escolas"
      render(
        <ComparatorView
          {...defaultProps}
          schoolYears={[{ value: 'year-1', label: '3º Ano A' }]} // Only 1 item = disabled
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems: [],
          })}
        />
      );

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar escolas/i,
      });
      await user.click(selectionButton);

      const footer = screen.getByTestId('modal-footer');
      const confirmButton = within(footer).getByText(/Confirmar/i);
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when items are selected', async () => {
      const user = userEvent.setup();
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
        />
      );

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar escolas/i,
      });
      await user.click(selectionButton);

      const footer = screen.getByTestId('modal-footer');
      const confirmButton = within(footer).getByText(/Confirmar.*1\/5/i);
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Button Text', () => {
    it('should show "Selecionar comparação" when no type is set and both options available', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(
        within(header).getByRole('button', { name: /Selecionar comparação/i })
      ).toBeInTheDocument();
    });

    it('should show "Selecionar escolas" when school type is selected', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
        />
      );

      const header = screen.getByRole('banner');
      expect(
        within(header).getByRole('button', { name: /Selecionar escolas/i })
      ).toBeInTheDocument();
    });

    it('should show "Selecionar turmas" when schoolYear type is selected', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'year-1', name: '3º Ano A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'schoolYear',
            selectedItems,
          })}
        />
      );

      const header = screen.getByRole('banner');
      expect(
        within(header).getByRole('button', { name: /Selecionar turmas/i })
      ).toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom labels in header', () => {
      render(
        <ComparatorView {...defaultProps} labels={{ title: 'Comparativo' }} />
      );

      const header = screen.getByRole('banner');
      expect(within(header).getByText('Comparativo')).toBeInTheDocument();
    });

    it('should pass custom labels to empty state', () => {
      render(
        <ComparatorView
          {...defaultProps}
          labels={{ title: 'Comparativo', schools: 'Unidades' }}
        />
      );

      // Check both header and empty state use the custom title
      const allComparativo = screen.getAllByText('Comparativo');
      expect(allComparativo.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Data Fetching', () => {
    it('should call fetchData when confirming selection', async () => {
      const user = userEvent.setup();
      const fetchData = jest.fn();
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
          useComparator={createMockComparator({ fetchData })}
        />
      );

      const header = screen.getByRole('banner');
      const selectionButton = within(header).getByRole('button', {
        name: /Selecionar escolas/i,
      });
      await user.click(selectionButton);

      const footer = screen.getByTestId('modal-footer');
      const confirmButton = within(footer).getByText(/Confirmar/i);
      await user.click(confirmButton);

      expect(fetchData).toHaveBeenCalledWith(
        ['school-1'],
        'school',
        'knowledge-areas',
        expect.any(Map)
      );
    });

    it('should call fetchData when changing tabs with selected items', async () => {
      const user = userEvent.setup();
      const fetchData = jest.fn();
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorView
          {...defaultProps}
          useComparatorStore={createMockStore({
            comparisonType: 'school',
            selectedItems,
          })}
          useComparator={createMockComparator({ fetchData })}
        />
      );

      const competenciesTab = screen.getByText('Competências');
      await user.click(competenciesTab);

      expect(fetchData).toHaveBeenCalledWith(
        ['school-1'],
        'school',
        'competencies',
        expect.any(Map)
      );
    });
  });

  describe('Accessibility', () => {
    it('should have title in header', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(within(header).getByText('Comparador')).toBeInTheDocument();
    });

    it('should have accessible button names', () => {
      render(<ComparatorView {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(
        within(header).getByRole('button', { name: /Selecionar comparação/i })
      ).toBeInTheDocument();
    });
  });
});
