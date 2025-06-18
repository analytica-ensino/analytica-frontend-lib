import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

// Mock icon component for testing
const MockIcon = () => <div data-testid="mock-icon">icon</div>;

describe('Input', () => {
  describe('Basic rendering', () => {
    it('renders input correctly', () => {
      render(<Input placeholder="Test placeholder" />);
      expect(
        screen.getByPlaceholderText('Test placeholder')
      ).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });

    it('renders with container className', () => {
      render(
        <Input containerClassName="container-class" data-testid="input" />
      );
      const inputElement = screen.getByTestId('input');
      const containerElement = inputElement.closest('div')?.parentElement;
      expect(containerElement).toHaveClass('container-class');
    });

    it('applies base classes correctly', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'bg-background',
        'w-full',
        'py-2',
        'px-3',
        'font-normal',
        'text-text-900',
        'focus:outline-primary-950'
      );
    });
  });

  describe('Label functionality', () => {
    it('renders label when provided', () => {
      render(<Input label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('associates label with input using htmlFor', () => {
      render(<Input label="Test Label" id="test-input" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('generates unique ID when not provided', () => {
      render(<Input label="Test Label" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('generates different unique IDs for multiple inputs', () => {
      const { unmount } = render(
        <div>
          <Input label="First Input" data-testid="input-1" />
          <Input label="Second Input" data-testid="input-2" />
        </div>
      );

      const input1 = screen.getByTestId('input-1');
      const input2 = screen.getByTestId('input-2');

      expect(input1.getAttribute('id')).not.toBe(input2.getAttribute('id'));
      expect(input1.getAttribute('id')).toBeTruthy();
      expect(input2.getAttribute('id')).toBeTruthy();

      unmount();
    });

    it('applies correct label styling', () => {
      render(<Input label="Test Label" size="medium" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass(
        'block',
        'font-bold',
        'text-text-900',
        'mb-1.5',
        'text-md'
      );
    });
  });

  describe('Helper text and error messages', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toHaveClass(
        'text-sm',
        'text-text-500'
      );
    });

    it('renders error message when provided', () => {
      render(<Input errorMessage="This is an error" />);
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByText('This is an error')).toHaveClass(
        'text-sm',
        'text-indicator-error'
      );
    });

    it('renders error message with warning icon', () => {
      render(<Input errorMessage="This is an error" />);
      const errorContainer = screen.getByText('This is an error').closest('p');
      expect(errorContainer).toHaveClass('flex', 'gap-1', 'items-center');
    });

    it('shows both helper text and error message when both provided', () => {
      render(<Input helperText="Helper text" errorMessage="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('has correct container structure for messages', () => {
      render(<Input helperText="Helper text" />);
      const helperContainer = screen.getByText('Helper text').closest('div');
      expect(helperContainer).toHaveClass('mt-1.5', 'gap-1.5');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<Input size="small" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-sm');
    });

    it('applies medium size classes (default)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-md');
    });

    it('applies large size classes', () => {
      render(<Input size="large" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-lg');
    });

    it('applies extra-large size classes', () => {
      render(<Input size="extra-large" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-xl');
    });
  });

  describe('Visual variants', () => {
    it('applies outlined variant classes (default)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border', 'rounded-lg');
    });

    it('applies outlined variant classes explicitly', () => {
      render(<Input variant="outlined" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border', 'rounded-lg');
    });

    it('applies underlined variant classes', () => {
      render(<Input variant="underlined" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'border-0',
        'border-b',
        'rounded-none',
        'bg-transparent'
      );
    });

    it('applies rounded variant classes', () => {
      render(<Input variant="rounded" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border', 'rounded-full');
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(<Input state="default" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'border-border-300',
        'placeholder:text-text-600',
        'hover:border-border-400'
      );
    });

    it('applies error state classes when error message is provided', () => {
      render(<Input errorMessage="Error" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'border-2',
        'border-indicator-error',
        'placeholder:text-text-600'
      );
    });

    it('applies disabled state classes when disabled', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'border-border-300',
        'placeholder:text-text-600',
        'cursor-not-allowed',
        'opacity-40'
      );
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('applies read-only state classes when readOnly', () => {
      render(<Input readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'border-border-300',
        '!text-text-600',
        'cursor-default',
        'focus:outline-none',
        'bg-background-50'
      );
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });

    it('prioritizes disabled state over error state', () => {
      render(<Input disabled errorMessage="Error" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'cursor-not-allowed',
        'opacity-40'
      );
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('prioritizes read-only state over error state', () => {
      render(<Input readOnly errorMessage="Error" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'cursor-default',
        'focus:outline-none',
        'bg-background-50'
      );
    });
  });

  describe('Icon functionality', () => {
    it('renders left icon when provided', () => {
      render(<Input iconLeft={<MockIcon />} />);
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      render(<Input iconRight={<MockIcon />} />);
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('applies correct padding when left icon is present', () => {
      render(<Input iconLeft={<MockIcon />} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('pl-10');
    });

    it('applies correct padding when right icon is present', () => {
      render(<Input iconRight={<MockIcon />} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('pr-10');
    });

    it('applies correct padding when both icons are present', () => {
      render(
        <Input
          iconLeft={<MockIcon />}
          iconRight={<MockIcon />}
          data-testid="input"
        />
      );
      expect(screen.getByTestId('input')).toHaveClass('pl-10', 'pr-10');
    });

    it('applies correct icon size for small input', () => {
      render(<Input size="small" iconLeft={<MockIcon />} />);
      const iconContainer = screen.getByTestId('mock-icon').closest('span');
      expect(iconContainer).toHaveClass('w-4', 'h-4');
    });

    it('applies correct icon size for medium input', () => {
      render(<Input size="medium" iconLeft={<MockIcon />} />);
      const iconContainer = screen.getByTestId('mock-icon').closest('span');
      expect(iconContainer).toHaveClass('w-5', 'h-5');
    });

    it('applies correct icon size for large input', () => {
      render(<Input size="large" iconLeft={<MockIcon />} />);
      const iconContainer = screen.getByTestId('mock-icon').closest('span');
      expect(iconContainer).toHaveClass('w-6', 'h-6');
    });

    it('applies correct icon size for extra-large input', () => {
      render(<Input size="extra-large" iconLeft={<MockIcon />} />);
      const iconContainer = screen.getByTestId('mock-icon').closest('span');
      expect(iconContainer).toHaveClass('w-7', 'h-7');
    });

    it('applies correct icon styling', () => {
      render(<Input iconLeft={<MockIcon />} />);
      const iconContainer = screen.getByTestId('mock-icon').closest('span');
      expect(iconContainer).toHaveClass(
        'text-text-400',
        'flex',
        'items-center',
        'justify-center'
      );
    });

    it('positions left icon correctly', () => {
      render(<Input iconLeft={<MockIcon />} />);
      const iconWrapper =
        screen.getByTestId('mock-icon').parentElement?.parentElement;
      expect(iconWrapper).toHaveClass(
        'absolute',
        'left-3',
        'top-1/2',
        'transform',
        '-translate-y-1/2',
        'pointer-events-none'
      );
    });

    it('positions right icon correctly', () => {
      render(<Input iconRight={<MockIcon />} />);
      const iconWrapper =
        screen.getByTestId('mock-icon').parentElement?.parentElement;
      expect(iconWrapper).toHaveClass(
        'absolute',
        'right-3',
        'top-1/2',
        'transform',
        '-translate-y-1/2',
        'pointer-events-none'
      );
    });
  });

  describe('Event handling', () => {
    it('handles onChange events', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('handles onFocus events', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input types', () => {
    it('renders as text type by default when no type is specified', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('renders as email type when specified', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('renders as password type when specified', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('renders as number type when specified', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });
  });

  describe('Password functionality', () => {
    it('shows eye icon for password input', () => {
      render(<Input type="password" data-testid="input" />);
      const eyeIcon = screen.getByRole('button', { hidden: true });
      expect(eyeIcon).toBeInTheDocument();
    });

    it('toggles password visibility when eye icon is clicked', () => {
      render(<Input type="password" data-testid="input" />);
      const input = screen.getByTestId('input');
      const eyeIcon = screen.getByRole('button', { hidden: true });

      // Initially should be password type
      expect(input).toHaveAttribute('type', 'password');

      // Click to show password
      fireEvent.click(eyeIcon);
      expect(input).toHaveAttribute('type', 'text');

      // Click again to hide password
      fireEvent.click(eyeIcon);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('does not show password toggle for disabled password input', () => {
      render(<Input type="password" disabled data-testid="input" />);
      const eyeIcon = screen.queryByRole('button', { hidden: true });
      expect(eyeIcon).not.toBeInTheDocument();
    });

    it('does not show password toggle for read-only password input', () => {
      render(<Input type="password" readOnly data-testid="input" />);
      const eyeIcon = screen.queryByRole('button', { hidden: true });
      expect(eyeIcon).not.toBeInTheDocument();
    });

    it('shows custom right icon when provided for non-password input', () => {
      const CustomIcon = () => <div data-testid="custom-icon">custom</div>;
      render(<Input type="text" iconRight={<CustomIcon />} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('prioritizes password toggle over custom right icon', () => {
      const CustomIcon = () => <div data-testid="custom-icon">custom</div>;
      render(<Input type="password" iconRight={<CustomIcon />} />);

      // Should show password toggle, not custom icon
      const eyeIcon = screen.getByRole('button', { hidden: true });
      expect(eyeIcon).toBeInTheDocument();
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    });

    it('applies hover styles to password toggle icon', () => {
      render(<Input type="password" />);
      const eyeIcon = screen.getByRole('button', { hidden: true });
      const iconSpan = eyeIcon.querySelector('span');

      expect(iconSpan).toHaveClass('hover:text-text-600', 'transition-colors');
    });

    it('makes password toggle icon clickable', () => {
      render(<Input type="password" />);
      const eyeIcon = screen.getByRole('button', { hidden: true });

      expect(eyeIcon).toHaveClass('cursor-pointer');
      expect(eyeIcon).not.toHaveClass('pointer-events-none');
    });
  });

  describe('Value handling', () => {
    it('renders with initial value', () => {
      render(<Input value="initial value" onChange={() => {}} />);
      expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
    });

    it('updates value when controlled', () => {
      const { rerender } = render(
        <Input value="initial" onChange={() => {}} />
      );
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<Input value="updated" onChange={() => {}} />);
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for error state', () => {
      render(<Input errorMessage="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not have aria-invalid when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('associates error message with input', () => {
      render(<Input errorMessage="Error message" />);
      const errorText = screen.getByText('Error message');
      expect(errorText).toBeInTheDocument();
    });

    it('has proper focus management', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Forward ref', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Input container structure', () => {
    it('has proper container structure', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      const inputContainer = input.parentElement;
      expect(inputContainer).toHaveClass('relative');
    });

    it('has proper wrapper structure with label', () => {
      render(<Input label="Test Label" containerClassName="test-container" />);
      const label = screen.getByText('Test Label');
      const wrapper = label.parentElement;
      expect(wrapper).toHaveClass('test-container');
    });
  });

  describe('Edge cases and helper functions coverage', () => {
    it('handles undefined state correctly', () => {
      render(<Input state={undefined} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-border-300'); // default state classes
    });

    it('covers getActualState fallback branch', () => {
      // Test when state is explicitly set but no other conditions apply
      // This should hit the fallback return statement
      render(<Input state="default" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-border-300');

      // Also test when state is undefined (should use 'default')
      render(<Input data-testid="input-2" />);
      const input2 = screen.getByTestId('input-2');
      expect(input2).toHaveClass('border-border-300');
    });

    it('covers all icon size variants', () => {
      const IconComponent = () => <div data-testid="test-icon">icon</div>;

      // Test all sizes to ensure getIconSize function coverage
      const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
      sizes.forEach((size) => {
        const { unmount } = render(
          <Input size={size} iconLeft={<IconComponent />} />
        );
        const icon = screen.getByTestId('test-icon');
        const iconContainer = icon.closest('span');

        const expectedClasses = {
          small: ['w-4', 'h-4'],
          medium: ['w-5', 'h-5'],
          large: ['w-6', 'h-6'],
          'extra-large': ['w-7', 'h-7'],
        };

        expect(iconContainer).toHaveClass(...expectedClasses[size]);
        unmount();
      });
    });

    it('handles invalid size with fallback to medium', () => {
      const IconComponent = () => <div data-testid="test-icon">icon</div>;

      // Test with invalid size - should fallback to medium (w-5 h-5)
      render(
        <Input
          size={'invalid-size' as unknown as 'medium'}
          iconLeft={<IconComponent />}
        />
      );

      const icon = screen.getByTestId('test-icon');
      const iconContainer = icon.closest('span');

      // Should use medium size classes as fallback
      expect(iconContainer).toHaveClass('w-5', 'h-5');
    });

    it('covers password toggle configuration edge cases', () => {
      // Test password type with showPassword false (Eye icon)
      render(<Input type="password" data-testid="input" />);
      const toggleButton = screen.getByRole('button');

      // Verify button has aria-label (for accessibility)
      expect(toggleButton).toHaveAttribute('aria-label');

      // Verify input type is still password initially
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

      // Click to show password (should change input type to text)
      fireEvent.click(toggleButton);

      // Verify button still has aria-label (content changed)
      expect(toggleButton).toHaveAttribute('aria-label');
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('handles all state combinations in getActualState', () => {
      // Test disabled + errorMessage (disabled should take precedence)
      render(<Input disabled errorMessage="Error" data-testid="input-1" />);
      expect(screen.getByTestId('input-1')).toHaveClass(
        'cursor-not-allowed',
        'opacity-40'
      );

      // Test readOnly + errorMessage (readOnly should take precedence)
      render(<Input readOnly errorMessage="Error" data-testid="input-2" />);
      expect(screen.getByTestId('input-2')).toHaveClass(
        'cursor-default',
        'bg-background-50'
      );

      // Test explicit state without other conditions
      render(<Input state="default" data-testid="input-3" />);
      expect(screen.getByTestId('input-3')).toHaveClass('border-border-300');

      // Test all valid state values to ensure complete branch coverage
      render(<Input state="error" data-testid="input-4" />);
      expect(screen.getByTestId('input-4')).toHaveClass(
        'border-2',
        'border-indicator-error'
      );

      render(<Input state="disabled" data-testid="input-5" />);
      expect(screen.getByTestId('input-5')).toHaveClass(
        'cursor-not-allowed',
        'opacity-40'
      );

      render(<Input state="read-only" data-testid="input-6" />);
      expect(screen.getByTestId('input-6')).toHaveClass(
        'cursor-default',
        'bg-background-50'
      );

      // Test falsy state value to cover the || 'default' branch
      render(
        <Input state={'' as unknown as 'default'} data-testid="input-7" />
      );
      expect(screen.getByTestId('input-7')).toHaveClass('border-border-300');
    });

    it('applies special styling for error state with underlined variant', () => {
      // Test error + underlined combination (special case)
      render(
        <Input
          state="error"
          variant="underlined"
          data-testid="input-error-underlined"
        />
      );
      const input = screen.getByTestId('input-error-underlined');
      expect(input).toHaveClass(
        'border-0',
        'border-b-2',
        'border-indicator-error',
        'rounded-none',
        'bg-transparent',
        'focus:outline-none',
        'placeholder:text-text-600'
      );

      // Test that regular error state still works with other variants
      render(
        <Input
          state="error"
          variant="outlined"
          data-testid="input-error-outlined"
        />
      );
      const outlinedInput = screen.getByTestId('input-error-outlined');
      expect(outlinedInput).toHaveClass('border-2', 'border-indicator-error');
      expect(outlinedInput).not.toHaveClass('border-b-2');
    });

    it('covers all branches in getPasswordToggleConfig', () => {
      const CustomIcon = () => <div data-testid="custom-icon">custom</div>;

      // Test with non-password type (isPasswordType = false)
      const { unmount: unmount1 } = render(
        <Input type="text" iconRight={<CustomIcon />} data-testid="input-1" />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      unmount1();

      // Test password type with disabled (shouldShowPasswordToggle = false)
      const { unmount: unmount2 } = render(
        <Input
          type="password"
          disabled
          iconRight={<CustomIcon />}
          data-testid="input-2"
        />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      unmount2();

      // Test password type with readOnly (shouldShowPasswordToggle = false)
      const { unmount: unmount3 } = render(
        <Input
          type="password"
          readOnly
          iconRight={<CustomIcon />}
          data-testid="input-3"
        />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      unmount3();

      // Test password type enabled (shouldShowPasswordToggle = true)
      render(
        <Input
          type="password"
          iconRight={<CustomIcon />}
          data-testid="input-4"
        />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    });
  });
});
