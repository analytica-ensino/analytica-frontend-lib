import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Radio from './Radio';

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
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
      expect(radio).not.toBeChecked();
    });

    it('renders radio with label', () => {
      render(<Radio name="test" value="1" label="Test label" />);
      const radio = screen.getByRole('radio');
      const label = screen.getByText('Test label');

      expect(radio).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', radio.id);
    });

    it('renders with custom id', () => {
      render(<Radio id="custom-id" name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('id', 'radio-test-id');
    });

    it('renders with name and value attributes', () => {
      render(<Radio name="test-group" value="option1" label="Option 1" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('name', 'test-group');
      expect(radio).toHaveAttribute('value', 'option1');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<Radio size="small" name="test" value="1" label="Small radio" />);
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-5', 'h-5');
    });

    it('applies medium size classes (default)', () => {
      render(<Radio name="test" value="1" label="Medium radio" />);
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-6', 'h-6');
    });

    it('applies large size classes', () => {
      render(<Radio size="large" name="test" value="1" label="Large radio" />);
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('w-8', 'h-8');
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(
        <Radio state="default" name="test" value="1" label="Default radio" />
      );
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('applies hovered state classes', () => {
      render(
        <Radio state="hovered" name="test" value="1" label="Hovered radio" />
      );
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-border-500');
    });

    it('applies focused state classes with wrapper', () => {
      const { container } = render(
        <Radio state="focused" name="test" value="1" label="Focused radio" />
      );
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-primary-950'); // Checked radio has different border
      expect(radio).toBeChecked();

      // Check for invalid wrapper border color specifically
      const wrapper = container.querySelector('.border-indicator-error');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies disabled state when disabled prop is true', () => {
      render(<Radio disabled name="test" value="1" label="Disabled radio" />);
      const radio = screen.getByRole('radio');
      const container = radio.parentElement;

      expect(radio).toBeDisabled();
      expect(container).toHaveClass('opacity-40');
    });
  });

  describe('Checked state', () => {
    it('renders unchecked by default', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();
    });

    it('renders checked when checked prop is true', () => {
      render(<Radio checked name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeChecked();
    });

    it('applies checked state classes when checked', () => {
      render(<Radio checked name="test" value="1" label="Checked radio" />);
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();
    });
  });

  describe('User interactions', () => {
    it('toggles checked state when clicked (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<Radio name="test" value="1" label="Toggle me" />);

      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');

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
      const radio = screen.getByRole('radio');

      await user.click(radio);
      expect(handleChange).not.toHaveBeenCalled();
      expect(radio).not.toBeChecked();
    });

    it('can be clicked via label', async () => {
      const user = userEvent.setup();
      render(<Radio name="test" value="1" label="Click label" />);

      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');

      await user.click(radio);
      expect(handleChange).toHaveBeenCalled();
      expect(radio).not.toBeChecked();
    });
  });

  describe('Focus handling', () => {
    it('applies focused state on focus', async () => {
      render(<Radio name="test" value="1" label="Focus test" />);
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('removes focused state on blur', async () => {
      render(<Radio name="test" value="1" label="Blur test" />);
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');

      fireEvent.focus(radio);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when blurred', () => {
      const handleBlur = jest.fn();
      render(<Radio name="test" value="1" label="Blur" onBlur={handleBlur} />);
      const radio = screen.getByRole('radio');

      fireEvent.focus(radio);
      fireEvent.blur(radio);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('does not override invalid state with focus', () => {
      render(
        <Radio state="invalid" name="test" value="1" label="Invalid focus" />
      );
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;

      fireEvent.focus(radio);
      expect(customRadio).toHaveClass('border-border-400');
    });

    it('does not override disabled state with focus', () => {
      render(<Radio disabled name="test" value="1" label="Disabled focus" />);
      const radio = screen.getByRole('radio');
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

  describe('Border width handling', () => {
    it('applies correct border width for focused state', () => {
      render(<Radio state="focused" name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-2');
    });

    it('applies correct border width for hovered large size', () => {
      render(
        <Radio
          state="hovered"
          size="large"
          name="test"
          value="1"
          label="Test"
        />
      );
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-2');
    });

    it('applies correct border width for hovered extraLarge size', () => {
      render(
        <Radio
          state="hovered"
          size="extraLarge"
          name="test"
          value="1"
          label="Test"
        />
      );
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-2');
    });

    it('applies default border width for small size', () => {
      render(<Radio size="small" name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      const customRadio = radio.nextElementSibling as HTMLElement;
      expect(customRadio).toHaveClass('border-2');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to radio', () => {
      render(
        <Radio name="test" value="1" label="Test" className="custom-class" />
      );
      const radio = screen.getByRole('radio');
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
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');

      fireEvent.focus(radio);
      fireEvent.change(radio, { target: { checked: true } });
      expect(radio).toBeChecked();
    });

    it('hides native input visually but keeps it accessible', () => {
      render(<Radio name="test" value="1" label="Test" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveClass('sr-only');
    });

    it('associates label with radio via htmlFor and id', () => {
      render(<Radio name="test" value="1" label="Associated label" />);
      const radio = screen.getByRole('radio');
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
});
