import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchSelect } from './SearchSelect';
import type {
  SearchSelectOption,
  SearchSelectPagination,
} from './SearchSelect';
import { ComponentProps } from 'react';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

// Mock scrollIntoView since JSDOM doesn't implement it
Element.prototype.scrollIntoView = jest.fn();

describe('SearchSelect component', () => {
  const mockOptions: SearchSelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const setup = (props?: Partial<ComponentProps<typeof SearchSelect>>) => {
    return render(
      <SearchSelect
        options={mockOptions}
        placeholder="Select an option"
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without errors', () => {
      setup();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with label', () => {
      setup({ label: 'Select a fruit' });
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      setup({ helperText: 'Choose your preferred option' });
      expect(
        screen.getByText('Choose your preferred option')
      ).toBeInTheDocument();
    });

    it('should render with error message', () => {
      setup({ errorMessage: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      const errorElement = screen
        .getByText('This field is required')
        .closest('p');
      expect(errorElement).toHaveClass('text-indicator-error');
    });

    it('should show placeholder when no value is selected', () => {
      setup({ placeholder: 'Select something' });
      expect(screen.getByText('Select something')).toBeInTheDocument();
    });

    it('should show selected value label', () => {
      setup({ value: 'option2' });
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('should apply small size classes', () => {
      setup({ size: 'small' });
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('h-8', 'px-3', 'py-1', 'text-sm');
    });

    it('should apply medium size classes', () => {
      setup({ size: 'medium' });
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('h-9', 'px-3', 'py-2', 'text-md');
    });

    it('should apply large size classes', () => {
      setup({ size: 'large' });
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('h-10', 'px-4', 'py-3', 'text-lg');
    });

    it('should use small size as default', () => {
      setup();
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('h-8', 'px-3', 'py-1', 'text-sm');
    });
  });

  describe('Variant styles', () => {
    it('should apply outlined variant classes', () => {
      setup({ variant: 'outlined' });
      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/border-2/);
      expect(trigger.className).toMatch(/rounded-lg/);
    });

    it('should apply underlined variant classes', () => {
      setup({ variant: 'underlined' });
      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/border-b-2/);
    });

    it('should apply rounded variant classes', () => {
      setup({ variant: 'rounded' });
      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/border-2/);
      expect(trigger.className).toMatch(/rounded-full/);
    });
  });

  describe('Dropdown behavior', () => {
    it('should open dropdown when clicked', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });

    it('should close dropdown after selecting an option', () => {
      const onValueChange = jest.fn();
      setup({ onValueChange });

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 2'));

      expect(onValueChange).toHaveBeenCalledWith('option2');
      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });

    it('should rotate caret icon when open', () => {
      setup();
      const trigger = screen.getByRole('button');
      const caret = trigger.querySelector('svg:last-child');

      expect(caret).not.toHaveClass('rotate-180');

      fireEvent.click(trigger);
      expect(caret).toHaveClass('rotate-180');
    });
  });

  describe('Search functionality', () => {
    it('should filter options locally when filterLocally is true', () => {
      setup({ filterLocally: true });
      fireEvent.click(screen.getByRole('button'));

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Option 1' } });

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('should show empty text when no results', () => {
      setup({ filterLocally: true, emptyText: 'No results found' });
      fireEvent.click(screen.getByRole('button'));

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should use custom search placeholder', () => {
      setup({ searchPlaceholder: 'Search items...' });
      fireEvent.click(screen.getByRole('button'));
      expect(
        screen.getByPlaceholderText('Search items...')
      ).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate with ArrowDown', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('bg-background-50');
    });

    it('should navigate with ArrowUp', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveClass('bg-background-50');
    });

    it('should select item with Enter key', () => {
      const onValueChange = jest.fn();
      setup({ onValueChange });

      fireEvent.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Buscar...');

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(onValueChange).toHaveBeenCalledWith('option1');
    });

    it('should close dropdown with Escape key', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.keyDown(searchInput, { key: 'Escape' });

      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should not open when disabled', () => {
      setup({ disabled: true });
      fireEvent.click(screen.getByRole('button'));
      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });

    it('should have disabled styling', () => {
      setup({ disabled: true });
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-50');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Loading state', () => {
    it('should not open when loading', () => {
      setup({ loading: true });
      fireEvent.click(screen.getByRole('button'));
      expect(
        screen.queryByPlaceholderText('Buscar...')
      ).not.toBeInTheDocument();
    });

    it('should show loading text in trigger', () => {
      setup({ loading: true, loadingText: 'Loading...' });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading spinner when loading', () => {
      setup({ loading: true });
      const trigger = screen.getByRole('button');
      const spinner = trigger.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Disabled options', () => {
    it('should not select disabled option on click', () => {
      const onValueChange = jest.fn();
      const optionsWithDisabled: SearchSelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ];

      setup({ options: optionsWithDisabled, onValueChange });

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 2'));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('should show disabled styling for disabled options', () => {
      const optionsWithDisabled: SearchSelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ];

      setup({ options: optionsWithDisabled });

      fireEvent.click(screen.getByRole('button'));
      const disabledOption = screen
        .getByText('Option 2')
        .closest('[role="option"]');
      expect(disabledOption).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should select option when pressing Enter directly on it', () => {
      const onValueChange = jest.fn();
      setup({ onValueChange });

      fireEvent.click(screen.getByRole('button'));
      const option = screen.getByText('Option 2').closest('[role="option"]');
      fireEvent.keyDown(option!, { key: 'Enter' });

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });

    it('should select option when pressing Space directly on it', () => {
      const onValueChange = jest.fn();
      setup({ onValueChange });

      fireEvent.click(screen.getByRole('button'));
      const option = screen.getByText('Option 2').closest('[role="option"]');
      fireEvent.keyDown(option!, { key: ' ' });

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });

    it('should not select disabled option when pressing Enter directly on it', () => {
      const onValueChange = jest.fn();
      const optionsWithDisabled: SearchSelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ];

      setup({ options: optionsWithDisabled, onValueChange });

      fireEvent.click(screen.getByRole('button'));
      const disabledOption = screen
        .getByText('Option 2')
        .closest('[role="option"]');
      fireEvent.keyDown(disabledOption!, { key: 'Enter' });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('should not select disabled option when pressing Space directly on it', () => {
      const onValueChange = jest.fn();
      const optionsWithDisabled: SearchSelectOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ];

      setup({ options: optionsWithDisabled, onValueChange });

      fireEvent.click(screen.getByRole('button'));
      const disabledOption = screen
        .getByText('Option 2')
        .closest('[role="option"]');
      fireEvent.keyDown(disabledOption!, { key: ' ' });

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should show pagination info', () => {
      const pagination: SearchSelectPagination = {
        page: 1,
        totalPages: 5,
        hasNext: true,
        total: 50,
      };

      setup({ pagination });

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('3 de 50 itens')).toBeInTheDocument();
    });

    it('should show loading more indicator', () => {
      setup({ loadingMore: true });

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Carregando mais...')).toBeInTheDocument();
    });
  });

  describe('Controlled mode', () => {
    it('should call onValueChange when selecting item', () => {
      const onValueChange = jest.fn();
      setup({ value: 'option1', onValueChange });

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 2'));

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });

    it('should display controlled value', () => {
      setup({ value: 'option2' });
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should update display when value prop changes', () => {
      const { rerender } = setup({ value: 'option1' });
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(<SearchSelect options={mockOptions} value="option3" />);
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  describe('Portal rendering', () => {
    it('should render dropdown in document.body', () => {
      const { container } = setup();

      fireEvent.click(screen.getByRole('button'));

      const dropdown = document.querySelector('[data-search-select-id]');
      expect(dropdown).toBeInTheDocument();
      expect(container.contains(dropdown)).toBe(false);
      expect(document.body.contains(dropdown)).toBe(true);
    });

    it('should use fixed positioning', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));

      const dropdown = document.querySelector(
        '[data-search-select-id]'
      ) as HTMLElement;
      expect(dropdown.style.position).toBe('fixed');
    });

    it('should set correct z-index', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));

      const dropdown = document.querySelector(
        '[data-search-select-id]'
      ) as HTMLElement;
      expect(dropdown.style.zIndex).toBe('9999');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded attribute', () => {
      setup();
      const trigger = screen.getByRole('button');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup attribute', () => {
      setup();
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should have role="option" on items', () => {
      setup();
      fireEvent.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('should have aria-selected on selected item', () => {
      setup({ value: 'option2' });
      fireEvent.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('should associate label with trigger via htmlFor', () => {
      setup({ label: 'Test Label', id: 'custom-id' });

      const label = screen.getByText('Test Label');
      const trigger = screen.getByRole('button');

      expect(label).toHaveAttribute('for', 'custom-id');
      expect(trigger).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to wrapper', () => {
      const { container } = setup({ className: 'custom-class' });
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Selected item visual', () => {
    it('should show check icon on selected item', () => {
      setup({ value: 'option2' });
      fireEvent.click(screen.getByRole('button'));

      // Use getAllByText since 'Option 2' appears in both trigger and dropdown
      const option2Elements = screen.getAllByText('Option 2');
      const dropdownOption = option2Elements[1].closest('[role="option"]');
      const checkIcon = dropdownOption?.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should highlight selected item with background color', () => {
      setup({ value: 'option2' });
      fireEvent.click(screen.getByRole('button'));

      // Use getAllByText since 'Option 2' appears in both trigger and dropdown
      const option2Elements = screen.getAllByText('Option 2');
      const dropdownOption = option2Elements[1].closest('[role="option"]');
      expect(dropdownOption).toHaveClass('bg-primary-50');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty options array', () => {
      setup({ options: [], emptyText: 'No options available' });
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      setup({ value: undefined });
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should clear search query when dropdown closes', () => {
      setup({ filterLocally: true });

      fireEvent.click(screen.getByRole('button'));
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Close dropdown
      fireEvent.mouseDown(document.body);

      // Reopen dropdown
      fireEvent.click(screen.getByRole('button'));
      const newSearchInput = screen.getByPlaceholderText('Buscar...');
      expect(newSearchInput).toHaveValue('');
    });

    it('should work with forwardRef', () => {
      const ref = jest.fn();
      render(<SearchSelect ref={ref} options={mockOptions} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Error state border', () => {
    it('should apply error border when errorMessage is present', () => {
      setup({ errorMessage: 'Error!' });
      const trigger = screen.getByRole('button');
      expect(trigger.className).toMatch(/border-indicator-error/);
    });
  });
});
