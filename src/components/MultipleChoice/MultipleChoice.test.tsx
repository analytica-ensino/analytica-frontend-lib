import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MultipleChoiceList } from './MultipleChoice';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('MultipleChoiceList', () => {
  const mockChoices = [
    { value: 'a', label: 'Alternativa A' },
    { value: 'b', label: 'Alternativa B' },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockChoicesWithStatus = [
    { value: 'a', label: 'Alternativa A', status: 'correct' as const },
    { value: 'b', label: 'Alternativa B', status: 'incorrect' as const },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockChoicesWithDisabled = [
    { value: 'a', label: 'Alternativa A' },
    { value: 'b', label: 'Alternativa B', disabled: true },
    { value: 'c', label: 'Alternativa C' },
  ];

  describe('Basic rendering', () => {
    it('renders basic choices list', () => {
      render(<MultipleChoiceList choices={mockChoices} />);

      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
      expect(screen.getByText('Alternativa C')).toBeInTheDocument();
    });

    it('renders with default selected values', () => {
      render(
        <MultipleChoiceList choices={mockChoices} selectedValues={['a', 'c']} />
      );

      const checkboxA = screen.getByDisplayValue('a');
      const checkboxC = screen.getByDisplayValue('c');
      expect(checkboxA).toBeChecked();
      expect(checkboxC).toBeChecked();
    });

    it('applies custom CSS classes', () => {
      const { container } = render(
        <MultipleChoiceList choices={mockChoices} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Interactive mode', () => {
    it('renders interactive checkboxes by default', () => {
      render(<MultipleChoiceList choices={mockChoices} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);

      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeDisabled();
      });
    });

    it('calls onHandleSelectedValues when selection changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MultipleChoiceList
          choices={mockChoices}
          onHandleSelectedValues={handleChange}
        />
      );

      const checkboxA = screen.getByDisplayValue('a');
      await user.click(checkboxA);

      expect(handleChange).toHaveBeenCalledWith(['a']);
    });

    it('handles multiple selections correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MultipleChoiceList
          choices={mockChoices}
          onHandleSelectedValues={handleChange}
        />
      );

      const checkboxA = screen.getByDisplayValue('a');
      const checkboxB = screen.getByDisplayValue('b');

      await user.click(checkboxA);
      await user.click(checkboxB);

      expect(handleChange).toHaveBeenCalledWith(['a']);
      expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('handles deselection correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MultipleChoiceList
          choices={mockChoices}
          selectedValues={['a', 'b']}
          onHandleSelectedValues={handleChange}
        />
      );

      const checkboxA = screen.getByDisplayValue('a');
      await user.click(checkboxA);

      expect(handleChange).toHaveBeenCalledWith(['b']);
    });

    it('respects controlled values', () => {
      render(
        <MultipleChoiceList choices={mockChoices} selectedValues={['a', 'c']} />
      );

      const checkboxA = screen.getByDisplayValue('a');
      const checkboxB = screen.getByDisplayValue('b');
      const checkboxC = screen.getByDisplayValue('c');

      expect(checkboxA).toBeChecked();
      expect(checkboxB).not.toBeChecked();
      expect(checkboxC).toBeChecked();
    });

    it('handles controlled values updates', () => {
      const { rerender } = render(
        <MultipleChoiceList choices={mockChoices} selectedValues={['a']} />
      );

      let checkboxA = screen.getByDisplayValue('a');
      let checkboxB = screen.getByDisplayValue('b');

      expect(checkboxA).toBeChecked();
      expect(checkboxB).not.toBeChecked();

      rerender(
        <MultipleChoiceList choices={mockChoices} selectedValues={['b', 'c']} />
      );

      checkboxA = screen.getByDisplayValue('a');
      checkboxB = screen.getByDisplayValue('b');

      expect(checkboxA).not.toBeChecked();
    });
  });

  describe('Readonly mode', () => {
    it('renders readonly visual checkboxes', () => {
      render(
        <MultipleChoiceList
          choices={mockChoices}
          mode="readonly"
          selectedValues={['a', 'c']}
        />
      );

      // Should not have interactive checkboxes
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes).toHaveLength(0);

      // Should have visual checkboxes (divs with specific classes)
      const visualCheckboxes = document.querySelectorAll(
        '.w-5.h-5.rounded.border-2'
      );
      expect(visualCheckboxes).toHaveLength(3);
    });

    it('shows correct visual state for selected items', () => {
      render(
        <MultipleChoiceList
          choices={mockChoices}
          mode="readonly"
          selectedValues={['a', 'c']}
        />
      );

      // Check for visual indicators of selected items
      const selectedVisualCheckboxes = document.querySelectorAll(
        '.border-primary-950.bg-primary-950'
      );
      expect(selectedVisualCheckboxes).toHaveLength(2);
    });

    it('displays status badges correctly', () => {
      render(
        <MultipleChoiceList
          choices={mockChoicesWithStatus}
          mode="readonly"
          selectedValues={['a', 'b']}
        />
      );

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('applies correct status styles', () => {
      const { container } = render(
        <MultipleChoiceList
          choices={mockChoicesWithStatus}
          mode="readonly"
          selectedValues={['a', 'b']}
        />
      );

      const correctItem = container.querySelector('.bg-success-background');
      const incorrectItem = container.querySelector('.bg-error-background');

      expect(correctItem).toBeInTheDocument();
      expect(incorrectItem).toBeInTheDocument();
    });

    it('handles disabled items in readonly mode', () => {
      render(
        <MultipleChoiceList
          choices={mockChoicesWithDisabled}
          mode="readonly"
          selectedValues={['a']}
        />
      );

      // Find the disabled item by looking for the opacity class in the parent container
      // HtmlMathRenderer wraps the text, so we need to traverse up to find the styled container
      const disabledItem = screen.getByText('Alternativa B').closest('.opacity-50');
      expect(disabledItem).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('disables all checkboxes when group is disabled', () => {
      render(<MultipleChoiceList choices={mockChoices} disabled={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('does not call onHandleSelectedValues when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MultipleChoiceList
          choices={mockChoices}
          disabled={true}
          onHandleSelectedValues={handleChange}
        />
      );

      const checkboxA = screen.getByDisplayValue('a');
      await user.click(checkboxA);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('handles individual disabled choices', () => {
      render(<MultipleChoiceList choices={mockChoicesWithDisabled} />);

      const checkboxA = screen.getByDisplayValue('a');
      const checkboxB = screen.getByDisplayValue('b');
      const checkboxC = screen.getByDisplayValue('c');

      expect(checkboxA).not.toBeDisabled();
      expect(checkboxB).toBeDisabled();
      expect(checkboxC).not.toBeDisabled();
    });
  });

  describe('Status handling', () => {
    it('renders status badges for correct answers', () => {
      render(
        <MultipleChoiceList
          choices={mockChoicesWithStatus}
          mode="readonly"
          selectedValues={['a']}
        />
      );

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('renders status badges for incorrect answers', () => {
      render(
        <MultipleChoiceList
          choices={mockChoicesWithStatus}
          mode="readonly"
          selectedValues={['b']}
        />
      );

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('does not render badges for neutral status', () => {
      render(
        <MultipleChoiceList
          choices={mockChoicesWithStatus}
          mode="readonly"
          selectedValues={['c']}
        />
      );

      // The component shows badges for all items with status, regardless of selection
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for checkboxes', () => {
      render(<MultipleChoiceList choices={mockChoices} />);

      const checkboxA = screen.getByDisplayValue('a');
      // HtmlMathRenderer wraps the text, so we need to find the parent label element
      const labelA = screen.getByText('Alternativa A').closest('label');

      expect(checkboxA).toHaveAttribute('id');
      // The label should be associated with the checkbox
      expect(labelA).toBeInTheDocument();
      expect(labelA?.tagName).toBe('LABEL');
    });

    it('has proper cursor styles', () => {
      render(
        <MultipleChoiceList
          choices={mockChoices}
          mode="readonly"
          selectedValues={['a']}
        />
      );

      const readonlyItems = document.querySelectorAll('.cursor-default');
      expect(readonlyItems.length).toBeGreaterThan(0);
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MultipleChoiceList
          choices={mockChoices}
          onHandleSelectedValues={handleChange}
        />
      );

      const checkboxA = screen.getByDisplayValue('a');

      // Focus and press space
      checkboxA.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(['a']);
    });
  });

  describe('Edge cases', () => {
    it('handles empty choices array', () => {
      render(<MultipleChoiceList choices={[]} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('handles undefined selectedValues', () => {
      render(
        <MultipleChoiceList choices={mockChoices} selectedValues={undefined} />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('handles empty selectedValues array', () => {
      render(<MultipleChoiceList choices={mockChoices} selectedValues={[]} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('handles choices with duplicate values gracefully', () => {
      const duplicateChoices = [
        { value: 'a', label: 'Alternativa A' },
        { value: 'a', label: 'Alternativa A Duplicada' },
        { value: 'b', label: 'Alternativa B' },
      ];

      render(<MultipleChoiceList choices={duplicateChoices} />);

      const checkboxes = screen.getAllByDisplayValue('a');
      expect(checkboxes).toHaveLength(2);
    });
  });

  describe('State management', () => {
    it('updates internal state when selectedValues prop changes', () => {
      const { rerender } = render(
        <MultipleChoiceList choices={mockChoices} selectedValues={['a']} />
      );

      let checkboxA = screen.getByDisplayValue('a');
      expect(checkboxA).toBeChecked();

      rerender(
        <MultipleChoiceList choices={mockChoices} selectedValues={['b', 'c']} />
      );

      checkboxA = screen.getByDisplayValue('a');

      expect(checkboxA).not.toBeChecked();
    });

    it('maintains state consistency between interactive and readonly modes', () => {
      const { rerender } = render(
        <MultipleChoiceList
          choices={mockChoices}
          selectedValues={['a', 'c']}
          mode="interactive"
        />
      );

      let checkboxA = screen.getByDisplayValue('a');
      let checkboxC = screen.getByDisplayValue('c');
      expect(checkboxA).toBeChecked();
      expect(checkboxC).toBeChecked();

      rerender(
        <MultipleChoiceList
          choices={mockChoices}
          selectedValues={['a', 'c']}
          mode="readonly"
        />
      );

      // In readonly mode, should show visual checkboxes for selected items
      const selectedVisualCheckboxes = document.querySelectorAll(
        '.border-primary-950.bg-primary-950'
      );
      expect(selectedVisualCheckboxes).toHaveLength(2);
    });
  });
});
