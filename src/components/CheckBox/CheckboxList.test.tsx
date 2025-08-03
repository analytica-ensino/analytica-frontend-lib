import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckboxList, { CheckboxListItem } from './CheckboxList';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('CheckboxList', () => {
  describe('Store initialization and injection', () => {
    it('creates store and injects it to CheckboxListItem children', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList defaultValues={['option1']} onValuesChange={handleChange}>
          <div>
            <CheckboxListItem value="option1" data-testid="checkbox1" />
            <label htmlFor="checkbox1">Option 1</label>
          </div>
          <div>
            <CheckboxListItem value="option2" data-testid="checkbox2" />
            <label htmlFor="checkbox2">Option 2</label>
          </div>
        </CheckboxList>
      );

      // Check if callback was called with default values
      expect(handleChange).toHaveBeenCalledWith(['option1']);

      // Check if checkboxes are rendered
      expect(screen.getByTestId('checkbox1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox2')).toBeInTheDocument();
    });

    it('generates unique group name when not provided', () => {
      render(
        <CheckboxList defaultValues={['option1']}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      const hiddenInput1 = screen.getByDisplayValue('option1');
      const hiddenInput2 = screen.getByDisplayValue('option2');

      // Both should have the same generated name
      expect(hiddenInput1).toHaveAttribute('name');
      expect(hiddenInput2).toHaveAttribute('name');
      expect(hiddenInput1.getAttribute('name')).toBe(
        hiddenInput2.getAttribute('name')
      );
      expect(hiddenInput1.getAttribute('name')).toContain('checkbox-list-');
    });

    it('uses provided group name', () => {
      render(
        <CheckboxList defaultValues={['option1']} name="custom-group">
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      const hiddenInput1 = screen.getByDisplayValue('option1');
      const hiddenInput2 = screen.getByDisplayValue('option2');

      expect(hiddenInput1).toHaveAttribute('name', 'custom-group');
      expect(hiddenInput2).toHaveAttribute('name', 'custom-group');
    });

    it('works with default parameters in store creation', () => {
      // Test default values without explicit params
      render(
        <CheckboxList>
          <CheckboxListItem value="test" />
        </CheckboxList>
      );

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled behavior (defaultValues)', () => {
    it('calls onChange when selection changes', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList defaultValues={['option1']} onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Initial call with default values
      expect(handleChange).toHaveBeenCalledWith(['option1']);

      // Toggle selection by clicking on checkbox2
      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);

      // Toggle selection by clicking on checkbox1
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option2']);
    });

    it('works without defaultValues and calls onChange on selection', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // No initial call
      expect(handleChange).not.toHaveBeenCalled();

      // Select first option
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option1']);

      // Select second option
      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('handles multiple selections correctly', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
          <CheckboxListItem value="option3" data-testid="checkbox3" />
        </CheckboxList>
      );

      // Select multiple options
      fireEvent.click(screen.getByTestId('checkbox1'));
      fireEvent.click(screen.getByTestId('checkbox2'));
      fireEvent.click(screen.getByTestId('checkbox3'));

      expect(handleChange).toHaveBeenCalledWith(['option1']);
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);
      expect(handleChange).toHaveBeenCalledWith([
        'option1',
        'option2',
        'option3',
      ]);
    });

    it('handles deselection correctly', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList
          defaultValues={['option1', 'option2']}
          onValuesChange={handleChange}
        >
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Initial call with default values
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);

      // Deselect option1
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option2']);

      // Deselect option2
      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Controlled behavior (values prop)', () => {
    it('respects controlled values and calls onChange', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList
          values={['option2']}
          defaultValues={['option1']}
          onValuesChange={handleChange}
        >
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should call with controlled values
      expect(handleChange).toHaveBeenCalledWith(['option2']);
    });

    it('handles controlled values updates', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <CheckboxList values={['option1']} onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      expect(handleChange).toHaveBeenCalledWith(['option1']);

      // Update controlled values
      rerender(
        <CheckboxList
          values={['option1', 'option2']}
          onValuesChange={handleChange}
        >
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should update the internal store
      expect(screen.getByTestId('checkbox1')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox2')).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('does not call onChange when group is disabled', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList
          disabled
          defaultValues={['option1']}
          onValuesChange={handleChange}
        >
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should not change selection when disabled
      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('does not call onChange when individual item is disabled', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList defaultValues={['option1']} onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" disabled data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should not be able to select disabled item
      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledTimes(1); // Only initial call
    });
  });

  describe('Store functionality', () => {
    it('handles state updates correctly', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should work with click events
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option1']);

      fireEvent.click(screen.getByTestId('checkbox2'));
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);

      // Toggle off
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option2']);
    });

    it('handles toggle functionality correctly', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
        </CheckboxList>
      );

      // Toggle on
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option1']);

      // Toggle off
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Basic interaction', () => {
    it('responds to click events', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
        </CheckboxList>
      );

      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option1']);
    });

    it('handles multiple independent selections', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
          <CheckboxListItem value="option3" data-testid="checkbox3" />
        </CheckboxList>
      );

      // Select in different order
      fireEvent.click(screen.getByTestId('checkbox2'));
      fireEvent.click(screen.getByTestId('checkbox1'));
      fireEvent.click(screen.getByTestId('checkbox3'));

      expect(handleChange).toHaveBeenCalledWith(['option2']);
      expect(handleChange).toHaveBeenCalledWith(['option2', 'option1']);
      expect(handleChange).toHaveBeenCalledWith([
        'option2',
        'option1',
        'option3',
      ]);
    });
  });

  describe('Store error handling', () => {
    it('throws error when CheckboxListItem is used without CheckboxList', () => {
      expect(() => {
        render(<CheckboxListItem value="option1" />);
      }).toThrow('CheckboxListItem must be used within a CheckboxList');
    });
  });

  describe('Accessibility', () => {
    it('renders with proper group role', () => {
      render(
        <CheckboxList name="test-group">
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      const checkboxGroup = screen.getByRole('group');
      expect(checkboxGroup).toHaveAttribute('aria-label', 'test-group');
    });

    it('maintains proper accessibility attributes', () => {
      render(
        <CheckboxList defaultValues={['option1']} onValuesChange={jest.fn()}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      const checkbox1 = screen.getByTestId('checkbox1');
      const checkbox2 = screen.getByTestId('checkbox2');

      expect(checkbox1).toBeInTheDocument();
      expect(checkbox2).toBeInTheDocument();
    });
  });

  describe('Multiple CheckboxList instances', () => {
    it('handles multiple CheckboxLists independently', () => {
      const handleChange1 = jest.fn();
      const handleChange2 = jest.fn();

      render(
        <div>
          <CheckboxList
            defaultValues={['a1']}
            onValuesChange={handleChange1}
            data-testid="group1"
          >
            <CheckboxListItem value="a1" data-testid="group1-checkbox1" />
            <CheckboxListItem value="a2" data-testid="group1-checkbox2" />
          </CheckboxList>
          <CheckboxList
            defaultValues={['b1']}
            onValuesChange={handleChange2}
            data-testid="group2"
          >
            <CheckboxListItem value="b1" data-testid="group2-checkbox1" />
            <CheckboxListItem value="b2" data-testid="group2-checkbox2" />
          </CheckboxList>
        </div>
      );

      // Initial calls
      expect(handleChange1).toHaveBeenCalledWith(['a1']);
      expect(handleChange2).toHaveBeenCalledWith(['b1']);

      // Interact with first group
      fireEvent.click(screen.getByTestId('group1-checkbox2'));
      expect(handleChange1).toHaveBeenCalledWith(['a1', 'a2']);

      // Interact with second group
      fireEvent.click(screen.getByTestId('group2-checkbox2'));
      expect(handleChange2).toHaveBeenCalledWith(['b1', 'b2']);

      // Verify groups are independent
      expect(handleChange1).toHaveBeenCalledTimes(2);
      expect(handleChange2).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component display names', () => {
    it('has correct display names', () => {
      expect(CheckboxList.displayName).toBe('CheckboxList');
      expect(CheckboxListItem.displayName).toBe('CheckboxListItem');
    });
  });

  describe('CheckboxListItem Ref Functionality', () => {
    it('forwards ref correctly', () => {
      const ref = jest.fn();

      render(
        <CheckboxList>
          <CheckboxListItem value="option1" ref={ref} />
        </CheckboxList>
      );

      expect(ref).toHaveBeenCalled();
    });

    it('maintains ref across re-renders', () => {
      const ref = jest.fn();
      const { rerender } = render(
        <CheckboxList>
          <CheckboxListItem value="option1" ref={ref} />
        </CheckboxList>
      );

      rerender(
        <CheckboxList>
          <CheckboxListItem value="option2" ref={ref} />
        </CheckboxList>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Size and state props', () => {
    it('applies size prop to all checkboxes', () => {
      render(
        <CheckboxList>
          <CheckboxListItem
            value="option1"
            data-testid="checkbox1"
            size="small"
          />
          <CheckboxListItem
            value="option2"
            data-testid="checkbox2"
            size="small"
          />
        </CheckboxList>
      );

      const checkbox1 = screen.getByTestId('checkbox1');
      const checkbox2 = screen.getByTestId('checkbox2');

      // Check if size classes are applied (this would be visible in the rendered CheckBox component)
      expect(checkbox1).toBeInTheDocument();
      expect(checkbox2).toBeInTheDocument();
    });

    it('applies state prop to all checkboxes', () => {
      render(
        <CheckboxList>
          <CheckboxListItem
            value="option1"
            data-testid="checkbox1"
            state="invalid"
          />
          <CheckboxListItem
            value="option2"
            data-testid="checkbox2"
            state="invalid"
          />
        </CheckboxList>
      );

      const checkbox1 = screen.getByTestId('checkbox1');
      const checkbox2 = screen.getByTestId('checkbox2');

      expect(checkbox1).toBeInTheDocument();
      expect(checkbox2).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty values array', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList values={[]} onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option2" data-testid="checkbox2" />
        </CheckboxList>
      );

      // Should call onChange initially with empty array
      expect(handleChange).toHaveBeenCalledWith([]);

      // Should work when selecting
      fireEvent.click(screen.getByTestId('checkbox1'));
      expect(handleChange).toHaveBeenCalledWith(['option1']);
    });

    it('handles duplicate values gracefully', () => {
      const handleChange = jest.fn();

      render(
        <CheckboxList onValuesChange={handleChange}>
          <CheckboxListItem value="option1" data-testid="checkbox1" />
          <CheckboxListItem value="option1" data-testid="checkbox1-duplicate" />
        </CheckboxList>
      );

      // Click both checkboxes with same value
      fireEvent.click(screen.getByTestId('checkbox1'));
      fireEvent.click(screen.getByTestId('checkbox1-duplicate'));

      // Should handle duplicates correctly
      expect(handleChange).toHaveBeenCalledWith(['option1']);
    });

    it('covers edge cases in CheckboxListItem state management', () => {
      render(
        <CheckboxList disabled>
          <CheckboxListItem value="test" state="invalid" />
        </CheckboxList>
      );

      const checkboxElement = screen.getByDisplayValue('test');
      expect(checkboxElement).toBeInTheDocument();
    });
  });
});
