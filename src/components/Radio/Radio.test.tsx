import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Radio, { RadioGroup, RadioGroupItem } from './Radio';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('Radio', () => {
  describe('Basic rendering', () => {
    it('renders radio without label', () => {
      render(<Radio name="test" value="1" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeInTheDocument();
      expect(radio).not.toBeChecked();
    });

    it('renders radio with label', () => {
      render(<Radio name="test" value="1" label="Test label" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const label = screen.getByText('Test label');

      expect(radio).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', radio.id);
    });

    it('renders with custom id', () => {
      render(<Radio id="custom-id" name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('id', 'radio-test-id');
    });

    it('renders with name and value attributes', () => {
      render(<Radio name="test-group" value="option1" label="Option 1" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('name', 'test-group');
      expect(radio).toHaveAttribute('value', 'option1');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<Radio size="small" name="test" value="1" label="Small radio" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-5', 'h-5');
    });

    it('applies medium size classes (default)', () => {
      render(<Radio name="test" value="1" label="Medium radio" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-6', 'h-6');
    });

    it('applies large size classes', () => {
      render(<Radio size="large" name="test" value="1" label="Large radio" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-7', 'h-7');
    });

    it('applies extraLarge size classes', () => {
      render(
        <Radio
          size="extraLarge"
          name="test"
          value="1"
          label="Extra large radio"
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-8', 'h-8');
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(
        <Radio state="default" name="test" value="1" label="Default radio" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('applies hovered state classes', () => {
      render(
        <Radio state="hovered" name="test" value="1" label="Hovered radio" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-border-500');
    });

    it('applies focused state classes with wrapper', () => {
      const { container } = render(
        <Radio state="focused" name="test" value="1" label="Focused radio" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;

      expect(customRadio).toHaveClass('border-2', 'border-border-400');

      // Check for focused wrapper
      const wrapper = container.querySelector('.border-indicator-info');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies invalid state classes with wrapper', () => {
      const { container } = render(
        <Radio state="invalid" name="test" value="1" label="Invalid radio" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-border-400');

      // Check for invalid wrapper (this covers the missing branch)
      const wrapper = container.querySelector('.border-indicator-error');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies invalid state with checked radio and wrapper', () => {
      const { container } = render(
        <Radio
          state="invalid"
          checked
          name="test"
          value="1"
          label="Invalid checked radio"
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-primary-950'); // Checked radio has different border
      expect(radio).toBeChecked();

      // Check for invalid wrapper border color specifically
      const wrapper = container.querySelector('.border-indicator-error');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies disabled state when disabled prop is true', () => {
      render(<Radio disabled name="test" value="1" label="Disabled radio" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const container = radio.parentElement;

      expect(radio).toBeDisabled();
      expect(container).toHaveClass('opacity-40');
    });
  });

  describe('Checked state', () => {
    it('renders unchecked by default', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Radio checked name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeChecked();
    });

    it('applies checked state classes when checked', () => {
      render(<Radio checked name="test" value="1" label="Checked radio" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-primary-950');
    });

    it('shows dot when checked', () => {
      const { container } = render(
        <Radio checked name="test" value="1" label="Checked radio" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });

    it('does not show dot when unchecked', () => {
      const { container } = render(
        <Radio name="test" value="1" label="Unchecked radio" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).not.toBeInTheDocument();
    });

    it('renders checked when defaultChecked is true (uncontrolled)', () => {
      render(
        <Radio defaultChecked name="test" value="1" label="Default checked" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeChecked();
    });

    it('renders unchecked when defaultChecked is false (uncontrolled)', () => {
      render(
        <Radio
          defaultChecked={false}
          name="test"
          value="1"
          label="Default unchecked"
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toBeChecked();
    });

    it('shows dot when defaultChecked is true', () => {
      const { container } = render(
        <Radio
          defaultChecked
          name="test"
          value="1"
          label="Default checked with dot"
        />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });

    it('ignores defaultChecked when controlled (checked prop provided)', () => {
      render(
        <Radio
          checked={false}
          defaultChecked={true}
          name="test"
          value="1"
          label="Controlled overrides default"
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toBeChecked();
    });
  });

  describe('User interactions', () => {
    it('toggles checked state when clicked (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<Radio name="test" value="1" label="Toggle me" />);

      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toBeChecked();

      await user.click(radio);
      expect(radio).toBeChecked();
    });

    it('calls onChange when clicked', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Radio name="test" value="1" label="Test" onChange={handleChange} />
      );
      const radio = screen.getByRole('radio', { hidden: true });

      await user.click(radio);
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

      render(
        <Radio
          disabled
          name="test"
          value="1"
          label="Disabled"
          onChange={handleChange}
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });

      await user.click(radio);
      expect(handleChange).not.toHaveBeenCalled();
      expect(radio).not.toBeChecked();
    });

    it('can be clicked via label', async () => {
      const user = userEvent.setup();
      render(<Radio name="test" value="1" label="Click label" />);

      const radio = screen.getByRole('radio', { hidden: true });
      const label = screen.getByText('Click label');

      await user.click(label);
      expect(radio).toBeChecked();
    });

    it('maintains controlled state', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Radio
          checked={false}
          name="test"
          value="1"
          label="Controlled"
          onChange={handleChange}
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });

      await user.click(radio);
      expect(handleChange).toHaveBeenCalled();
      expect(radio).not.toBeChecked();
    });
  });

  describe('Focus handling', () => {
    it('applies focused state on focus', async () => {
      render(<Radio name="test" value="1" label="Focus test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('removes focused state on blur', async () => {
      render(<Radio name="test" value="1" label="Blur test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      fireEvent.blur(radio);
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('calls onFocus when focused', () => {
      const handleFocus = jest.fn();
      render(
        <Radio name="test" value="1" label="Focus" onFocus={handleFocus} />
      );
      const radio = screen.getByRole('radio', { hidden: true });

      fireEvent.focus(radio);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when blurred', () => {
      const handleBlur = jest.fn();
      render(<Radio name="test" value="1" label="Blur" onBlur={handleBlur} />);
      const radio = screen.getByRole('radio', { hidden: true });

      fireEvent.focus(radio);
      fireEvent.blur(radio);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('does not override invalid state with focus', () => {
      render(
        <Radio state="invalid" name="test" value="1" label="Invalid focus" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('does not override disabled state with focus', () => {
      render(<Radio disabled name="test" value="1" label="Disabled focus" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      expect(customRadio).toHaveClass(
        'border-border-400',
        'cursor-not-allowed'
      );
    });
  });

  describe('Error and helper messages', () => {
    it('displays error message', () => {
      render(
        <Radio
          name="test"
          value="1"
          label="Test"
          errorMessage="This field is required"
        />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays helper text when no error', () => {
      render(
        <Radio
          name="test"
          value="1"
          label="Test"
          helperText="Choose an option"
        />
      );
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
      render(
        <Radio
          name="test"
          value="1"
          label="Test"
          errorMessage="Error message"
          helperText="Helper text"
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('applies error styling to text', () => {
      render(<Radio name="test" value="1" label="Test" errorMessage="Error" />);
      const errorText = screen.getByText('Error');
      expect(errorText).toHaveClass('text-error-600');
    });

    it('applies helper styling to text', () => {
      render(<Radio name="test" value="1" label="Test" helperText="Helper" />);
      const helperText = screen.getByText('Helper');
      expect(helperText).toHaveClass('text-text-500');
    });
  });

  describe('Dot styling per state', () => {
    it('shows default dot color when checked', () => {
      const { container } = render(
        <Radio checked name="test" value="1" label="Test" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });

    it('shows hovered dot color when checked and hovered', () => {
      const { container } = render(
        <Radio checked state="hovered" name="test" value="1" label="Test" />
      );
      const dot = container.querySelector('.bg-info-700');
      expect(dot).toBeInTheDocument();
    });

    it('shows focused dot color when checked and focused', () => {
      const { container } = render(
        <Radio checked state="focused" name="test" value="1" label="Test" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });

    it('shows invalid dot color when checked and invalid', () => {
      const { container } = render(
        <Radio checked state="invalid" name="test" value="1" label="Test" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });

    it('shows disabled dot color when checked and disabled', () => {
      const { container } = render(
        <Radio checked disabled name="test" value="1" label="Test" />
      );
      const dot = container.querySelector('.bg-primary-950');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to radio', () => {
      render(
        <Radio name="test" value="1" label="Test" className="custom-class" />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('custom-class');
    });

    it('applies custom labelClassName to label', () => {
      render(
        <Radio
          name="test"
          value="1"
          label="Test"
          labelClassName="custom-label"
        />
      );
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label');
    });
  });

  describe('Label text color', () => {
    it('applies normal text color for enabled unchecked radio', () => {
      render(<Radio name="test" value="1" label="Enabled" />);
      const label = screen.getByText('Enabled');
      expect(label).toHaveClass('text-text-600');
    });

    it('applies checked text color for enabled checked radio', () => {
      render(<Radio checked name="test" value="1" label="Enabled Checked" />);
      const label = screen.getByText('Enabled Checked');
      expect(label).toHaveClass('text-text-900');
    });

    it('applies disabled text color for disabled radio', () => {
      render(<Radio disabled name="test" value="1" label="Disabled" />);
      const label = screen.getByText('Disabled');
      expect(label).toHaveClass('text-text-600');
    });

    it('applies disabled checked text color', () => {
      render(
        <Radio
          disabled
          checked
          name="test"
          value="1"
          label="Disabled Checked"
        />
      );
      const label = screen.getByText('Disabled Checked');
      expect(label).toHaveClass('text-text-900');
    });

    it('applies focused text color for both checked and unchecked', () => {
      const { rerender } = render(
        <Radio
          state="focused"
          name="test"
          value="1"
          label="Focused Unchecked"
        />
      );
      const label = screen.getByText('Focused Unchecked');
      expect(label).toHaveClass('text-text-900');

      rerender(
        <Radio
          state="focused"
          checked
          name="test"
          value="1"
          label="Focused Checked"
        />
      );
      const checkedLabel = screen.getByText('Focused Checked');
      expect(checkedLabel).toHaveClass('text-text-900');
    });
  });

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });

      fireEvent.focus(radio);
      fireEvent.change(radio, { target: { checked: true } });
      expect(radio).toBeChecked();
    });

    it('hides native input visually but keeps it accessible', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveClass('sr-only');
    });

    it('associates label with radio via htmlFor and id', () => {
      render(<Radio name="test" value="1" label="Associated label" />);
      const radio = screen.getByRole('radio', { hidden: true });
      const label = screen.getByText('Associated label');
      expect(label).toHaveAttribute('for', radio.id);
    });
  });

  describe('ReactNode label support', () => {
    it('renders ReactNode as label', () => {
      const complexLabel = (
        <span>
          Complex <strong>label</strong> with <em>formatting</em>
        </span>
      );
      render(<Radio name="test" value="1" label={complexLabel} />);

      // Use getByText with a function matcher to find partial text
      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName.toLowerCase() === 'span' &&
            content.includes('Complex')
          );
        })
      ).toBeInTheDocument();

      expect(screen.getByText('label')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();
    });
  });

  describe('Component display name', () => {
    it('has correct display name', () => {
      expect(Radio.displayName).toBe('Radio');
    });
  });

  describe('Custom label click handling (lines 313-320)', () => {
    it('prevents default and triggers input click when label is clicked', () => {
      render(<Radio name="test" value="1" label="Click test" />);

      const radio = screen.getByRole('radio', { hidden: true });
      const label = radio.nextElementSibling as HTMLElement;

      // Spy on input methods
      const clickSpy = jest.spyOn(radio, 'click');
      const blurSpy = jest.spyOn(radio, 'blur');

      // Spy on preventDefault
      const preventDefaultSpy = jest.fn();

      // Create a custom event with preventDefault
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'preventDefault', {
        value: preventDefaultSpy,
      });

      // Trigger click on custom label
      label.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
      blurSpy.mockRestore();
    });

    it('does not trigger input click when disabled radio label is clicked', () => {
      render(
        <Radio disabled name="test" value="1" label="Disabled click test" />
      );

      const radio = screen.getByRole('radio', { hidden: true });
      const label = radio.nextElementSibling as HTMLElement;

      // Spy on input methods
      const clickSpy = jest.spyOn(radio, 'click');
      const blurSpy = jest.spyOn(radio, 'blur');

      // Spy on preventDefault
      const preventDefaultSpy = jest.fn();

      // Create a custom event with preventDefault
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'preventDefault', {
        value: preventDefaultSpy,
      });

      // Trigger click on custom label
      label.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
      expect(blurSpy).not.toHaveBeenCalled();

      clickSpy.mockRestore();
      blurSpy.mockRestore();
    });

    it('handles case when input element is not found', () => {
      render(<Radio name="test" value="1" label="Edge case test" />);

      const radio = screen.getByRole('radio', { hidden: true });
      const label = radio.nextElementSibling as HTMLElement;

      // Mock getElementById to return null
      const getElementByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(null);

      // Spy on preventDefault
      const preventDefaultSpy = jest.fn();

      // Create a custom event with preventDefault
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'preventDefault', {
        value: preventDefaultSpy,
      });

      // Should not throw error when input is not found
      expect(() => {
        label.dispatchEvent(clickEvent);
      }).not.toThrow();

      expect(preventDefaultSpy).toHaveBeenCalled();

      getElementByIdSpy.mockRestore();
    });

    it('calls blur on input after click simulation', () => {
      render(<Radio name="test" value="1" label="Blur test" />);

      const radio = screen.getByRole('radio', { hidden: true });
      const label = radio.nextElementSibling as HTMLElement;

      // Spy on blur method specifically
      const blurSpy = jest.spyOn(radio, 'blur');

      // Trigger click on custom label
      fireEvent.click(label);

      expect(blurSpy).toHaveBeenCalled();

      blurSpy.mockRestore();
    });

    it('prevents scroll when handleChange is called', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(
        <Radio
          name="test"
          value="1"
          label="Scroll test"
          onChange={handleChange}
        />
      );

      const radio = screen.getByRole('radio', { hidden: true });

      // Spy on blur method
      const blurSpy = jest.spyOn(radio, 'blur');

      // Trigger click event which will cause change
      await user.click(radio);

      expect(handleChange).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();

      blurSpy.mockRestore();
    });

    it('prevents scroll when onFocus is triggered - tests blur call in focus handler', () => {
      render(<Radio name="test" value="1" label="Focus test" />);

      const radio = screen.getByRole('radio', { hidden: true });

      // Spy on blur method
      const blurSpy = jest.spyOn(radio, 'blur');

      // Trigger focus event which should call our internal blur
      fireEvent.focus(radio);

      // The blur should be called automatically by our onFocus handler to prevent scroll
      expect(blurSpy).toHaveBeenCalled();

      blurSpy.mockRestore();
    });
  });
});

// Tests for RadioGroup with Zustand store
describe('RadioGroup Component', () => {
  describe('Store initialization and injection', () => {
    it('creates store and injects it to RadioGroupItem children', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <div>
            <RadioGroupItem value="option1" data-testid="radio1" />
            <label htmlFor="radio1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="option2" data-testid="radio2" />
            <label htmlFor="radio2">Option 2</label>
          </div>
        </RadioGroup>
      );

      // Check if callback was called with default value
      expect(handleChange).toHaveBeenCalledWith('option1');

      // Check if radios are rendered
      expect(screen.getByTestId('radio1')).toBeInTheDocument();
      expect(screen.getByTestId('radio2')).toBeInTheDocument();
    });

    it('generates unique group name when not provided', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      const hiddenInput1 = screen.getByDisplayValue('option1');
      const hiddenInput2 = screen.getByDisplayValue('option2');

      // Both should have the same generated name
      expect(hiddenInput1).toHaveAttribute('name');
      expect(hiddenInput2).toHaveAttribute('name');
      expect(hiddenInput1.getAttribute('name')).toBe(
        hiddenInput2.getAttribute('name')
      );
      expect(hiddenInput1.getAttribute('name')).toContain('radio-group-');
    });

    it('uses provided group name', () => {
      render(
        <RadioGroup defaultValue="option1" name="custom-group">
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      const hiddenInput1 = screen.getByDisplayValue('option1');
      const hiddenInput2 = screen.getByDisplayValue('option2');

      expect(hiddenInput1).toHaveAttribute('name', 'custom-group');
      expect(hiddenInput2).toHaveAttribute('name', 'custom-group');
    });

    it('works with default parameters in store creation', () => {
      // Test default values without explicit params to cover lines 364-365
      render(
        <RadioGroup>
          <RadioGroupItem value="test" />
        </RadioGroup>
      );

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled behavior (defaultValue)', () => {
    it('calls onChange when selection changes', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // Initial call with default value
      expect(handleChange).toHaveBeenCalledWith('option1');

      // Change selection by clicking on radio2
      fireEvent.click(screen.getByTestId('radio2'));
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('works without defaultValue and calls onChange on selection', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // No initial call
      expect(handleChange).not.toHaveBeenCalled();

      // Select first option
      fireEvent.click(screen.getByTestId('radio1'));
      expect(handleChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('Controlled behavior (value prop)', () => {
    it('respects controlled value and calls onChange', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup
          value="option2"
          defaultValue="option1"
          onValueChange={handleChange}
        >
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // Should call with controlled value
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('handles controlled value updates', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <RadioGroup value="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      expect(handleChange).toHaveBeenCalledWith('option1');

      // Update controlled value
      rerender(
        <RadioGroup value="option2" onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // Should update the internal store
      expect(screen.getByTestId('radio1')).toBeInTheDocument();
      expect(screen.getByTestId('radio2')).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('does not call onChange when group is disabled', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup
          disabled
          defaultValue="option1"
          onValueChange={handleChange}
        >
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // Should not change selection when disabled
      fireEvent.click(screen.getByTestId('radio2'));
      expect(handleChange).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('does not call onChange when individual item is disabled', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" disabled data-testid="radio2" />
        </RadioGroup>
      );

      // Should not be able to select disabled item
      fireEvent.click(screen.getByTestId('radio2'));
      expect(handleChange).toHaveBeenCalledTimes(1); // Only initial call
    });
  });

  describe('Store functionality', () => {
    it('handles state updates correctly', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      // Should work with click events
      fireEvent.click(screen.getByTestId('radio1'));
      expect(handleChange).toHaveBeenCalledWith('option1');

      fireEvent.click(screen.getByTestId('radio2'));
      expect(handleChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('Basic interaction', () => {
    it('responds to click events', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio1" />
        </RadioGroup>
      );

      fireEvent.click(screen.getByTestId('radio1'));
      expect(handleChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('Store error handling', () => {
    it('throws error when RadioGroupItem is used without RadioGroup', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<RadioGroupItem value="option1" />);
      }).toThrow('RadioGroupItem must be used within a RadioGroup');

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper radiogroup role', () => {
      render(
        <RadioGroup name="test-group">
          <RadioGroupItem value="option1" data-testid="radio1" />
          <RadioGroupItem value="option2" data-testid="radio2" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'test-group');
      expect(screen.getByTestId('radio1')).toBeInTheDocument();
      expect(screen.getByTestId('radio2')).toBeInTheDocument();
    });
  });

  describe('Complex scenarios', () => {
    it('handles nested structure with store injection', () => {
      const handleChange = jest.fn();

      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <div className="group">
            <div className="item">
              <RadioGroupItem value="option1" data-testid="radio1" />
              <label>Option 1</label>
            </div>
            <div className="item">
              <RadioGroupItem value="option2" data-testid="radio2" />
              <label>Option 2</label>
            </div>
          </div>
        </RadioGroup>
      );

      // Initial call with default value
      expect(handleChange).toHaveBeenCalledWith('option1');

      // Should work with nested structure
      fireEvent.click(screen.getByTestId('radio2'));
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('handles multiple RadioGroups independently', () => {
      const handleChange1 = jest.fn();
      const handleChange2 = jest.fn();

      render(
        <div>
          <RadioGroup
            name="group1"
            defaultValue="a1"
            onValueChange={handleChange1}
          >
            <RadioGroupItem value="a1" data-testid="group1-radio1" />
            <RadioGroupItem value="a2" data-testid="group1-radio2" />
          </RadioGroup>
          <RadioGroup
            name="group2"
            defaultValue="b1"
            onValueChange={handleChange2}
          >
            <RadioGroupItem value="b1" data-testid="group2-radio1" />
            <RadioGroupItem value="b2" data-testid="group2-radio2" />
          </RadioGroup>
        </div>
      );

      // Each group should have called their initial values
      expect(handleChange1).toHaveBeenCalledWith('a1');
      expect(handleChange2).toHaveBeenCalledWith('b1');

      // Change in group1 shouldn't affect group2
      fireEvent.click(screen.getByTestId('group1-radio2'));
      expect(handleChange1).toHaveBeenCalledWith('a2');

      // group2 should not have been called again
      expect(handleChange2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component display names', () => {
    it('has correct display names', () => {
      expect(RadioGroup.displayName).toBe('RadioGroup');
      expect(RadioGroupItem.displayName).toBe('RadioGroupItem');
    });
  });

  describe('RadioGroupItem Focus Handling', () => {
    it('calls blur on hidden input when focused', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const hiddenInput = screen.getByDisplayValue('option1');
      const blurSpy = jest.spyOn(hiddenInput, 'blur');

      fireEvent.focus(hiddenInput);

      expect(blurSpy).toHaveBeenCalled();
      blurSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('covers all branch conditions in store creation', () => {
      // Test with onValueChange callback and defaultValue to cover branch
      const handleChange = jest.fn();
      render(
        <RadioGroup defaultValue="test" onValueChange={handleChange}>
          <RadioGroupItem value="test" />
        </RadioGroup>
      );

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      expect(handleChange).toHaveBeenCalledWith('test');

      // Test without onValueChange to cover the other branch
      render(
        <RadioGroup>
          <RadioGroupItem value="test2" />
        </RadioGroup>
      );

      expect(screen.getByDisplayValue('test2')).toBeInTheDocument();
    });

    it('covers edge cases in RadioGroupItem state management', () => {
      const { container } = render(
        <RadioGroup disabled>
          <RadioGroupItem value="test" state="invalid" />
        </RadioGroup>
      );

      // This should cover the currentState = isDisabled ? 'disabled' : state branch
      const radioElement = container.querySelector('[role="radio"]');
      expect(radioElement).not.toBeInTheDocument(); // RadioGroupItem now uses Radio component
    });
  });
});
