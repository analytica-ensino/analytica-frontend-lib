import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparatorSelectItemsStep } from './ComparatorSelectItemsStep';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';
import type { ComparisonItem } from '../../types/comparator';

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

describe('ComparatorSelectItemsStep', () => {
  const defaultOptions = [
    { value: 'school-1', label: 'Escola A' },
    { value: 'school-2', label: 'Escola B' },
    { value: 'school-3', label: 'Escola C' },
  ];

  const defaultSelectedItems: ComparisonItem[] = [];

  const defaultProps = {
    options: defaultOptions,
    selectedItems: defaultSelectedItems,
    onSelectItem: jest.fn(),
    onRemoveItem: jest.fn(),
    comparisonType: 'school' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render instruction text for schools', () => {
      render(<ComparatorSelectItemsStep {...defaultProps} />);

      expect(
        screen.getByText(/Selecione uma escola para comparar/i)
      ).toBeInTheDocument();
    });

    it('should render instruction text for school years', () => {
      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          comparisonType="schoolYear"
        />
      );

      expect(
        screen.getByText(/Selecione uma turma para comparar/i)
      ).toBeInTheDocument();
    });

    it('should render the search select', () => {
      render(<ComparatorSelectItemsStep {...defaultProps} />);

      expect(screen.getByTestId('search-select')).toBeInTheDocument();
    });

    it('should render counter text', () => {
      render(<ComparatorSelectItemsStep {...defaultProps} />);

      expect(screen.getByText(/0 de 5 escolas/i)).toBeInTheDocument();
    });

    it('should render counter text for school years', () => {
      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          comparisonType="schoolYear"
        />
      );

      expect(screen.getByText(/0 de 5 turmas/i)).toBeInTheDocument();
    });
  });

  describe('Selected Items Display', () => {
    it('should not render selected items container when no items selected', () => {
      const { container } = render(
        <ComparatorSelectItemsStep {...defaultProps} />
      );

      const selectedContainer = container.querySelector('.bg-secondary-50');
      expect(selectedContainer).not.toBeInTheDocument();
    });

    it('should render selected items as badges', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
        { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      // Use getAllByText since the name appears in both select option and badge
      // Check that we have at least one visible badge for each school
      const escolaAElements = screen.getAllByText('Escola A');
      const escolaBElements = screen.getAllByText('Escola B');
      expect(escolaAElements.length).toBeGreaterThanOrEqual(1);
      expect(escolaBElements.length).toBeGreaterThanOrEqual(1);

      // Also verify the remove buttons exist (which confirms badges are rendered)
      expect(screen.getByRole('button', { name: /Remover Escola A/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Remover Escola B/i })).toBeInTheDocument();
    });

    it('should render color indicators for selected items', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      const { container } = render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      const colorIndicator = container.querySelector('.w-2.h-2.rounded-full');
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#1E40AF' });
    });

    it('should update counter with selected items count', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
        { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      expect(screen.getByText(/2 de 5 escolas/i)).toBeInTheDocument();
    });
  });

  describe('Remove Item', () => {
    it('should render remove button for each selected item', () => {
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
        { id: 'school-2', name: 'Escola B', color: '#F59E0B' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      const removeButtons = screen.getAllByRole('button', {
        name: /Remover/i,
      });
      expect(removeButtons).toHaveLength(2);
    });

    it('should call onRemoveItem when remove button is clicked', async () => {
      const user = userEvent.setup();
      const handleRemoveItem = jest.fn();
      const selectedItems: ComparisonItem[] = [
        { id: 'school-1', name: 'Escola A', color: '#1E40AF' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
          onRemoveItem={handleRemoveItem}
        />
      );

      const removeButton = screen.getByRole('button', {
        name: /Remover Escola A/i,
      });
      await user.click(removeButton);

      expect(handleRemoveItem).toHaveBeenCalledTimes(1);
      expect(handleRemoveItem).toHaveBeenCalledWith('school-1');
    });
  });

  describe('Max Limit', () => {
    it('should show warning when max limit is reached', () => {
      const selectedItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
        { id: '2', name: 'Item 2', color: '#F59E0B' },
        { id: '3', name: 'Item 3', color: '#10B981' },
        { id: '4', name: 'Item 4', color: '#EF4444' },
        { id: '5', name: 'Item 5', color: '#8B5CF6' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.maxLimitWarning)
      ).toBeInTheDocument();
    });

    it('should disable search select when max limit is reached', () => {
      const selectedItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
        { id: '2', name: 'Item 2', color: '#F59E0B' },
        { id: '3', name: 'Item 3', color: '#10B981' },
        { id: '4', name: 'Item 4', color: '#EF4444' },
        { id: '5', name: 'Item 5', color: '#8B5CF6' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      expect(screen.getByTestId('search-select')).toBeDisabled();
    });

    it('should not show warning when below max limit', () => {
      const selectedItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
        { id: '2', name: 'Item 2', color: '#F59E0B' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      expect(
        screen.queryByText(DEFAULT_COMPARATOR_LABELS.maxLimitWarning)
      ).not.toBeInTheDocument();
    });

    it('should not disable search select when below max limit', () => {
      const selectedItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      expect(screen.getByTestId('search-select')).not.toBeDisabled();
    });
  });

  describe('Select Item', () => {
    it('should call onSelectItem when an option is selected', async () => {
      const user = userEvent.setup();
      const handleSelectItem = jest.fn();

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          onSelectItem={handleSelectItem}
        />
      );

      const select = screen.getByTestId('search-select');
      await user.selectOptions(select, 'school-1');

      expect(handleSelectItem).toHaveBeenCalledTimes(1);
      expect(handleSelectItem).toHaveBeenCalledWith('school-1');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom schools label', () => {
      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          labels={{ schools: 'Unidades' }}
        />
      );

      expect(screen.getByText(/0 de 5 unidades/i)).toBeInTheDocument();
    });

    it('should use custom schoolYears label', () => {
      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          comparisonType="schoolYear"
          labels={{ schoolYears: 'Classes' }}
        />
      );

      expect(screen.getByText(/0 de 5 classes/i)).toBeInTheDocument();
    });

    it('should use custom maxLimitWarning label', () => {
      const selectedItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
        { id: '2', name: 'Item 2', color: '#F59E0B' },
        { id: '3', name: 'Item 3', color: '#10B981' },
        { id: '4', name: 'Item 4', color: '#EF4444' },
        { id: '5', name: 'Item 5', color: '#8B5CF6' },
      ];

      render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
          labels={{ maxLimitWarning: 'Maximum reached!' }}
        />
      );

      expect(screen.getByText('Maximum reached!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<ComparatorSelectItemsStep {...defaultProps} options={[]} />);

      expect(screen.getByTestId('search-select')).toBeInTheDocument();
    });

    it('should truncate long item names', () => {
      const selectedItems: ComparisonItem[] = [
        {
          id: 'school-1',
          name: 'This is a very long school name that should be truncated',
          color: '#1E40AF',
        },
      ];

      const { container } = render(
        <ComparatorSelectItemsStep
          {...defaultProps}
          selectedItems={selectedItems}
        />
      );

      const truncatedName = container.querySelector('.truncate.max-w-\\[200px\\]');
      expect(truncatedName).toBeInTheDocument();
    });
  });
});
