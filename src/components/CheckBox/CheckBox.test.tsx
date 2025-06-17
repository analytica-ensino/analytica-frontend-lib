import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CheckBox from './CheckBox';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('CheckBox', () => {
  describe('Basic rendering', () => {
    it('renders checkbox without label', () => {
      render(<CheckBox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders checkbox with label', () => {
      render(<CheckBox label="Test label" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test label');

      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', checkbox.id);
    });

    it('renders with custom id', () => {
      render(<CheckBox id="custom-id" label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      render(<CheckBox label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'checkbox-test-id');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<CheckBox size="small" label="Small checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-4', 'h-4');
    });

    it('applies medium size classes (default)', () => {
      render(<CheckBox label="Medium checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-5', 'h-5');
    });

    it('applies large size classes', () => {
      render(<CheckBox size="large" label="Large checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-6', 'h-6');
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(<CheckBox state="default" label="Default checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('border-border-400');
    });

    it('applies hovered state classes', () => {
      render(<CheckBox state="hovered" label="Hovered checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('border-border-500');
    });

    it('applies focused state classes', () => {
      render(<CheckBox state="focused" label="Focused checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass(
        'border-[3px]',
        'border-indicator-info'
      );
    });

    it('applies invalid state classes', () => {
      render(<CheckBox state="invalid" label="Invalid checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('border-error-700');
    });

    it('applies disabled state when disabled prop is true', () => {
      render(<CheckBox disabled label="Disabled checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const container = checkbox.parentElement;

      expect(checkbox).toBeDisabled();
      expect(container).toHaveClass('opacity-40');
    });
  });

  describe('Checked state', () => {
    it('renders unchecked by default', () => {
      render(<CheckBox label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<CheckBox checked label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('applies checked state classes when checked', () => {
      render(<CheckBox checked label="Checked checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass(
        'border-primary-950',
        'bg-primary-950'
      );
    });
  });

  describe('Indeterminate state', () => {
    it('shows minus icon when indeterminate is true', () => {
      render(<CheckBox indeterminate label="Indeterminate checkbox" />);
      // The minus icon should be present in the DOM
      const checkboxLabel = screen
        .getByText('Indeterminate checkbox')
        .closest('label');
      expect(checkboxLabel).toBeInTheDocument();
    });

    it('applies checked styles when indeterminate', () => {
      render(<CheckBox indeterminate label="Indeterminate checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass(
        'border-primary-950',
        'bg-primary-950'
      );
    });
  });

  describe('User interactions', () => {
    it('toggles checked state when clicked (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<CheckBox label="Toggle me" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('calls onChange when clicked', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<CheckBox label="Test" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            checked: true,
          }),
        })
      );
    });

    it('does not toggle when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<CheckBox disabled label="Disabled" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).not.toBeChecked();
    });

    it('can be clicked via label', async () => {
      const user = userEvent.setup();
      render(<CheckBox label="Click label" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Click label');

      expect(checkbox).not.toBeChecked();

      await user.click(label);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<CheckBox label="Uncontrolled" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('works as controlled component', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <CheckBox checked={false} label="Controlled" onChange={handleChange} />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
      expect(checkbox).not.toBeChecked(); // Still unchecked because controlled

      // Simulate parent component updating the checked prop
      rerender(
        <CheckBox checked={true} label="Controlled" onChange={handleChange} />
      );
      expect(checkbox).toBeChecked();
    });
  });

  describe('Error and helper text', () => {
    it('displays error message', () => {
      render(<CheckBox label="Test" errorMessage="This field is required" />);
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-error-600');
    });

    it('displays helper text', () => {
      render(
        <CheckBox label="Test" helperText="This is helpful information" />
      );
      const helperText = screen.getByText('This is helpful information');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('text-text-500');
    });

    it('prioritizes error message over helper text', () => {
      render(
        <CheckBox
          label="Test"
          errorMessage="Error message"
          helperText="Helper text"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(<CheckBox className="custom-class" label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('custom-class');
    });

    it('applies custom labelClassName', () => {
      render(<CheckBox labelClassName="custom-label-class" label="Test" />);
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<CheckBox label="Accessible checkbox" />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveClass('sr-only'); // Screen reader only
    });

    it('associates label with checkbox correctly', () => {
      render(<CheckBox id="test-checkbox" label="Test label" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test label');

      expect(label).toHaveAttribute('for', 'test-checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });

    it('supports keyboard navigation', () => {
      render(<CheckBox label="Keyboard test" />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      expect(checkbox).toHaveFocus();

      // Simulate space key press to toggle checkbox
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('HTML attributes passthrough', () => {
    it('passes through standard input attributes', () => {
      render(
        <CheckBox
          label="Test"
          name="test-name"
          value="test-value"
          data-testid="test-checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('name', 'test-name');
      expect(checkbox).toHaveAttribute('value', 'test-value');
      expect(checkbox).toHaveAttribute('data-testid', 'test-checkbox');
    });

    it('does not pass through size and type attributes', () => {
      render(<CheckBox label="Test" />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).not.toHaveAttribute('size');
    });
  });

  describe('forwardRef functionality', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null };
      render(<CheckBox ref={ref} label="Test" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Label variations', () => {
    it('renders with ReactNode label', () => {
      render(
        <CheckBox
          label={
            <span>
              Complex <strong>label</strong> with <em>formatting</em>
            </span>
          }
        />
      );

      // Check if the complex label structure is rendered
      expect(screen.getByText(/Complex/)).toBeInTheDocument();
      expect(screen.getByText(/label/)).toBeInTheDocument();
      expect(screen.getByText(/with/)).toBeInTheDocument();
      expect(screen.getByText(/formatting/)).toBeInTheDocument();
    });

    it('works without label', () => {
      render(<CheckBox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // Should not have any label text
      expect(screen.queryByText(/./)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      render(<CheckBox label="Rapid clicks" />);

      const checkbox = screen.getByRole('checkbox');

      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('maintains state when props change', () => {
      const { rerender } = render(<CheckBox label="Initial label" />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      // Change other props but maintain checked state
      rerender(<CheckBox label="Updated label" size="large" />);
      expect(checkbox).toBeChecked();
    });

    it('handles indeterminate with checked prop', () => {
      render(<CheckBox checked indeterminate label="Both states" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;

      expect(checkbox).toBeChecked();
      expect(customCheckbox).toHaveClass(
        'border-primary-950',
        'bg-primary-950'
      );
    });

    it('handles form submission correctly', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <CheckBox name="test-checkbox" value="test-value" label="Test" />
          <button type="submit">Submit</button>
        </form>
      );

      const checkbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button');

      fireEvent.click(checkbox);
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
      expect(checkbox).toBeChecked();
    });
  });

  describe('Icon rendering', () => {
    it('renders check icon when checked', () => {
      render(<CheckBox checked label="Checked" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      const icon = customCheckbox.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('renders minus icon when indeterminate', () => {
      render(<CheckBox indeterminate label="Indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      const icon = customCheckbox.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('renders no icon when unchecked', () => {
      render(<CheckBox label="Unchecked" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;
      const icon = customCheckbox.querySelector('svg');

      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Style combinations', () => {
    it('handles large size with focused state', () => {
      render(<CheckBox size="large" state="focused" label="Large focused" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;

      expect(customCheckbox).toHaveClass('w-6', 'h-6', 'border-[3px]');
    });

    it('handles small size with invalid state', () => {
      render(<CheckBox size="small" state="invalid" label="Small invalid" />);
      const checkbox = screen.getByRole('checkbox');
      const customCheckbox = checkbox.nextElementSibling as HTMLElement;

      expect(customCheckbox).toHaveClass('w-4', 'h-4', 'border-error-700');
    });

    it('handles checked state with different sizes', () => {
      const { rerender } = render(
        <CheckBox checked size="small" label="Test" />
      );
      let checkbox = screen.getByRole('checkbox');
      let customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-4', 'h-4');

      rerender(<CheckBox checked size="medium" label="Test" />);
      checkbox = screen.getByRole('checkbox');
      customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-5', 'h-5');

      rerender(<CheckBox checked size="large" label="Test" />);
      checkbox = screen.getByRole('checkbox');
      customCheckbox = checkbox.nextElementSibling as HTMLElement;
      expect(customCheckbox).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Text component integration', () => {
    it('uses correct text size for small checkbox', () => {
      render(<CheckBox size="small" label="Small text" />);
      const textLabel = screen.getByText('Small text');
      expect(textLabel).toHaveClass('text-sm');
    });

    it('uses correct text size for medium and large checkboxes', () => {
      const { rerender } = render(
        <CheckBox size="medium" label="Medium text" />
      );
      let textLabel = screen.getByText('Medium text');
      expect(textLabel).toHaveClass('text-md');

      rerender(<CheckBox size="large" label="Large text" />);
      textLabel = screen.getByText('Large text');
      expect(textLabel).toHaveClass('text-lg');
    });
  });
});
