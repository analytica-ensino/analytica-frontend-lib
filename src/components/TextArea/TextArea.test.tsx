import { createRef, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TextArea from './TextArea';

// Mock the Text component
jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    htmlFor,
    className,
    ...props
  }: {
    children: ReactNode;
    htmlFor?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <label
      htmlFor={htmlFor}
      className={className}
      data-testid="text-component"
      {...props}
    >
      {children}
    </label>
  ),
}));

describe('TextArea', () => {
  describe('Basic Rendering', () => {
    it('renders a textarea element', () => {
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('renders with placeholder text', () => {
      const placeholder = 'Enter your message...';
      render(<TextArea placeholder={placeholder} />);
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    it('renders with a label when provided', () => {
      const labelText = 'Description';
      render(<TextArea label={labelText} />);
      expect(screen.getByText(labelText)).toBeInTheDocument();
    });

    it('renders with default value', () => {
      const defaultValue = 'Default content';
      render(<TextArea defaultValue={defaultValue} />);
      expect(screen.getByDisplayValue(defaultValue)).toBeInTheDocument();
    });

    it('generates unique IDs when not provided', () => {
      render(
        <div>
          <TextArea label="First" />
          <TextArea label="Second" />
        </div>
      );
      const textareas = screen.getAllByRole('textbox');
      expect(textareas[0]).toHaveAttribute('id');
      expect(textareas[1]).toHaveAttribute('id');
      expect(textareas[0].id).not.toBe(textareas[1].id);
    });

    it('uses provided ID when given', () => {
      const customId = 'custom-textarea-id';
      render(<TextArea id={customId} label="Custom ID" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', customId);
    });

    it('connects label to textarea with proper ID association', () => {
      render(<TextArea id="test-textarea" label="Test Label" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size with correct classes', () => {
      render(<TextArea size="small" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-sm', 'h-24');
    });

    it('renders medium size with correct classes (default)', () => {
      render(<TextArea size="medium" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-base', 'h-24');
    });

    it('renders large size with correct classes', () => {
      render(<TextArea size="large" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-lg', 'h-24');
    });

    it('renders extraLarge size with correct classes', () => {
      render(<TextArea size="extraLarge" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-xl', 'h-24');
    });

    it('defaults to medium size when no size specified', () => {
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-base', 'h-24');
    });
  });

  describe('State Variants', () => {
    it('renders default state with correct styling', () => {
      render(<TextArea state="default" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-300',
        'bg-background',
        'text-text-600'
      );
    });

    it('renders hovered state with correct styling', () => {
      render(<TextArea state="hovered" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-400',
        'bg-background',
        'text-text-600'
      );
    });

    it('renders focused state with correct styling', () => {
      render(<TextArea state="focused" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-2',
        'border-primary-950',
        'bg-background',
        'text-text-900'
      );
    });

    it('renders invalid state with correct styling', () => {
      render(<TextArea state="invalid" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-2',
        'border-red-700',
        'bg-white',
        'text-gray-800'
      );
    });

    it('renders disabled state with correct styling', () => {
      render(<TextArea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-300',
        'bg-background',
        'text-text-600',
        'cursor-not-allowed',
        'opacity-40'
      );
      expect(textarea).toBeDisabled();
    });

    it('defaults to default state when no state specified', () => {
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-300',
        'bg-background',
        'text-text-600'
      );
    });

    it('overrides state to disabled when disabled prop is true', () => {
      render(<TextArea state="hovered" disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-300',
        'bg-background',
        'text-text-600',
        'cursor-not-allowed',
        'opacity-40'
      );
    });

    it('automatically switches to focused when focused without content', async () => {
      const user = userEvent.setup();
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');

      // Focus without content
      await user.click(textarea);

      expect(textarea).toHaveClass(
        'border-2',
        'border-primary-950',
        'bg-background',
        'text-text-900'
      );
    });
  });

  describe('User Interactions', () => {
    it('handles onChange events', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<TextArea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(handleChange).toHaveBeenCalledTimes(5); // Once per character
    });

    it('handles onFocus events', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      render(<TextArea onFocus={handleFocus} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(<TextArea onBlur={handleBlur} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab(); // Move focus away

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('tracks focus state correctly', async () => {
      const user = userEvent.setup();
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');

      // Initially should have default styling
      expect(textarea).toHaveClass('border-border-300');

      // Focus should trigger focused state
      await user.click(textarea);
      expect(textarea).toHaveClass('border-2', 'border-primary-950');

      // Type content while focused should maintain focused state
      await user.type(textarea, 'Content');
      expect(textarea).toHaveClass('border-2', 'border-primary-950');

      // Blur should return to default state
      await user.tab();
      expect(textarea).toHaveClass('border-border-300');
    });

    it('maintains focused state while typing', async () => {
      const user = userEvent.setup();
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'Content');
      expect(textarea).toHaveClass('border-2', 'border-primary-950');

      // Clear content should maintain focused state (since still focused)
      await user.clear(textarea);
      expect(textarea).toHaveClass('border-2', 'border-primary-950');
    });

    it('maintains invalid state when focused', async () => {
      const user = userEvent.setup();
      render(<TextArea state="invalid" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'Content');

      // Should maintain invalid state styling
      expect(textarea).toHaveClass('border-red-700');
    });
  });

  describe('Error and Helper Messages', () => {
    it('displays error message when provided', () => {
      const errorMessage = 'This field is required';
      render(<TextArea errorMessage={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('displays helper message when provided', () => {
      const helperMessage = 'Enter detailed description';
      render(<TextArea helperMessage={helperMessage} />);
      expect(screen.getByText(helperMessage)).toBeInTheDocument();
    });

    it('prioritizes error message over helper message', () => {
      const errorMessage = 'Error occurred';
      const helperMessage = 'Helper text';
      render(
        <TextArea errorMessage={errorMessage} helperMessage={helperMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText(helperMessage)).not.toBeInTheDocument();
    });

    it('error message has correct styling', () => {
      render(<TextArea errorMessage="Error message" />);
      const errorElement = screen.getByText('Error message').closest('p');
      expect(errorElement).toHaveClass(
        'flex',
        'gap-1',
        'items-center',
        'text-sm',
        'text-indicator-error',
        'mt-1.5'
      );
    });

    it('error message displays warning icon', () => {
      render(<TextArea errorMessage="Error message" />);
      // Verifica se o ícone existe no container do erro
      const errorElement = screen.getByText('Error message').parentElement;
      const svgIcon = errorElement?.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to textarea', () => {
      const customClass = 'custom-textarea-class';
      render(<TextArea className={customClass} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(customClass);
    });

    it('applies custom labelClassName to label', () => {
      const customLabelClass = 'custom-label-class';
      render(
        <TextArea label="Custom Label" labelClassName={customLabelClass} />
      );
      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass(customLabelClass);
    });

    it('maintains base classes when custom classes are added', () => {
      render(<TextArea className="custom-class" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
      expect(textarea).toHaveClass('border-border-300');
      expect(textarea).toHaveClass('bg-background');
    });
  });

  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<TextArea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-describedby with error message', () => {
      render(
        <TextArea errorMessage="Error message" aria-describedby="custom-desc" />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'custom-desc');
    });

    it('supports other ARIA attributes', () => {
      render(
        <TextArea
          aria-label="Custom label"
          aria-required="true"
          aria-invalid="true"
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Custom label');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('is focusable when not disabled', () => {
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toHaveAttribute('disabled');
      textarea.focus();
      expect(textarea).toHaveFocus();
    });
  });

  describe('ForwardRef Functionality', () => {
    it('forwards ref to textarea element', () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<TextArea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toBe(screen.getByRole('textbox'));
    });

    it('ref provides access to textarea methods', () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<TextArea ref={ref} />);

      expect(ref.current).not.toBeNull();
      if (ref.current) {
        expect(typeof ref.current.focus).toBe('function');
        expect(typeof ref.current.blur).toBe('function');
        expect(typeof ref.current.select).toBe('function');
      }
    });
  });

  describe('Additional HTML Attributes', () => {
    it('passes through standard textarea attributes', () => {
      render(
        <TextArea
          rows={5}
          cols={40}
          maxLength={100}
          name="test-textarea"
          required
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('cols', '40');
      expect(textarea).toHaveAttribute('maxLength', '100');
      expect(textarea).toHaveAttribute('name', 'test-textarea');
      expect(textarea).toHaveAttribute('required');
    });

    it('supports data attributes', () => {
      render(<TextArea data-testid="custom-test-id" data-custom="value" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('data-testid', 'custom-test-id');
      expect(textarea).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Focus State Management', () => {
    it('maintains state consistency during focus/blur cycles', async () => {
      const user = userEvent.setup();
      render(<TextArea defaultValue="Initial content" />);
      const textarea = screen.getByRole('textbox');

      // Initially should be default state even with content
      expect(textarea).toHaveClass('border-border-300');

      // Focus with existing content should trigger focused state
      await user.click(textarea);
      expect(textarea).toHaveClass('border-2', 'border-primary-950');

      // Blur should return to default
      await user.tab();
      expect(textarea).toHaveClass('border-border-300');

      // Focus again should trigger focused state again
      await user.click(textarea);
      expect(textarea).toHaveClass('border-2', 'border-primary-950');
    });

    it('handles whitespace-only content correctly', async () => {
      const user = userEvent.setup();
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, '   '); // Only whitespace

      // Should maintain focused state for any content
      expect(textarea).toHaveClass('border-2', 'border-primary-950');
    });
  });
});
