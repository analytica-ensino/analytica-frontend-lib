import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TextArea } from './TextArea';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('TextArea', () => {
  describe('Basic rendering', () => {
    it('renders textarea without label', () => {
      render(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('');
    });

    it('renders textarea with label', () => {
      render(<TextArea label="Test label" />);
      const textarea = screen.getByRole('textbox');
      const label = screen.getByText('Test label');

      expect(textarea).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', textarea.id);
    });

    it('renders with custom id', () => {
      render(<TextArea id="custom-id" label="Test" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'textarea-test-id');
    });

    it('renders with placeholder text', () => {
      render(<TextArea placeholder="Enter your text here" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your text here');
    });

    it('renders with initial value', () => {
      render(<TextArea value="Initial text" readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Initial text');
    });

    it('renders with default value', () => {
      render(<TextArea defaultValue="Default text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Default text');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<TextArea size="small" label="Small textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-sm', 'h-24');
    });

    it('applies medium size classes (default)', () => {
      render(<TextArea label="Medium textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-md', 'h-24');
    });

    it('applies large size classes', () => {
      render(<TextArea size="large" label="Large textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-lg', 'h-24');
    });

    it('applies extraLarge size classes', () => {
      render(<TextArea size="extraLarge" label="Extra large textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('text-xl', 'h-24');
    });

    it('applies corresponding label text size for each textarea size', () => {
      const { rerender } = render(<TextArea size="small" label="Test" />);
      let label = screen.getByText('Test');
      expect(label).toHaveClass('text-sm');

      rerender(<TextArea size="medium" label="Test" />);
      label = screen.getByText('Test');
      expect(label).toHaveClass('text-md');

      rerender(<TextArea size="large" label="Test" />);
      label = screen.getByText('Test');
      expect(label).toHaveClass('text-lg');

      rerender(<TextArea size="extraLarge" label="Test" />);
      label = screen.getByText('Test');
      expect(label).toHaveClass('text-xl');
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(<TextArea state="default" label="Default textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-300',
        'bg-background',
        'text-text-600'
      );
    });

    it('applies hovered state classes', () => {
      render(<TextArea state="hovered" label="Hovered textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-border-400',
        'bg-background',
        'text-text-600'
      );
    });

    it('applies invalid state classes', () => {
      render(<TextArea state="invalid" label="Invalid textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'border-error-600',
        'bg-background',
        'text-text-900'
      );
    });

    it('applies disabled state when disabled prop is true', () => {
      render(<TextArea disabled label="Disabled textarea" />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('cursor-not-allowed', 'opacity-40');
    });

    it('applies focusedAndTyping state when focused and has content', async () => {
      const user = userEvent.setup();
      render(<TextArea label="Test textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'test content');

      expect(textarea).toHaveClass('border-primary-500', 'text-text-900');
    });

    it('does not apply focusedAndTyping state when focused but no content', async () => {
      const user = userEvent.setup();
      render(<TextArea label="Test textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);

      expect(textarea).not.toHaveClass('border-primary-500');
    });

    it('prioritizes invalid state over focusedAndTyping', async () => {
      const user = userEvent.setup();
      render(<TextArea state="invalid" label="Test textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'test content');

      expect(textarea).toHaveClass('border-error-600');
      expect(textarea).not.toHaveClass('border-primary-500');
    });

    it('prioritizes disabled state over focusedAndTyping', async () => {
      const user = userEvent.setup();
      render(<TextArea disabled label="Test textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);

      expect(textarea).toHaveClass('cursor-not-allowed', 'opacity-40');
      expect(textarea).not.toHaveClass('border-primary-500');
    });
  });

  describe('User interactions', () => {
    it('calls onChange when text is typed', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<TextArea label="Test" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Hello');

      expect(handleChange).toHaveBeenCalledTimes(5); // Once for each character
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'Hello',
          }),
        })
      );
    });

    it('calls onFocus when textarea gains focus', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<TextArea label="Test" onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when textarea loses focus', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(
        <div>
          <TextArea label="Test" onBlur={handleBlur} />
          <button>Other element</button>
        </div>
      );
      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.click(textarea);
      await user.click(button);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<TextArea disabled label="Disabled" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('updates internal hasValue state when typing', async () => {
      const user = userEvent.setup();
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'test');

      // After typing and focusing, should apply focusedAndTyping state
      expect(textarea).toHaveClass('border-primary-500');
    });

    it('handles controlled textarea value changes', () => {
      const handleChange = jest.fn();
      const { rerender } = render(
        <TextArea value="" onChange={handleChange} label="Controlled" />
      );
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveValue('');

      rerender(
        <TextArea
          value="new value"
          onChange={handleChange}
          label="Controlled"
        />
      );

      expect(textarea).toHaveValue('new value');
    });
  });

  describe('Error and helper messages', () => {
    it('displays error message when provided', () => {
      render(
        <TextArea
          label="Test"
          errorMessage="This field is required"
          state="invalid"
        />
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-error-600');
    });

    it('displays helper text when provided and no error', () => {
      render(
        <TextArea label="Test" helperText="Enter at least 10 characters" />
      );

      const helperText = screen.getByText('Enter at least 10 characters');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('text-text-500');
    });

    it('prioritizes error message over helper text', () => {
      render(
        <TextArea
          label="Test"
          errorMessage="This field is required"
          helperText="Enter at least 10 characters"
          state="invalid"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(
        screen.queryByText('Enter at least 10 characters')
      ).not.toBeInTheDocument();
    });

    it('does not display error or helper messages when not provided', () => {
      render(<TextArea label="Test" />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/helper/i)).not.toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to textarea', () => {
      render(<TextArea className="custom-class" label="Test" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });

    it('applies custom labelClassName to label', () => {
      render(<TextArea labelClassName="custom-label-class" label="Test" />);
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label-class');
    });

    it('combines custom classes with default classes', () => {
      render(<TextArea className="custom-class" label="Test" />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('custom-class');
      expect(textarea).toHaveClass('w-full', 'rounded', 'border');
    });
  });

  describe('Accessibility', () => {
    it('associates label with textarea using htmlFor and id', () => {
      render(<TextArea id="test-textarea" label="Test label" />);
      const textarea = screen.getByRole('textbox');
      const label = screen.getByText('Test label');

      expect(label).toHaveAttribute('for', 'test-textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<TextArea disabled label="Disabled textarea" />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toBeDisabled();
      expect(textarea).toHaveAttribute('disabled');
    });

    it('maintains focus outline styles for keyboard navigation', () => {
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('focus:outline-none');
    });

    it('has resize disabled for consistent layout', () => {
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('ForwardRef functionality', () => {
    it('forwards ref to textarea element', () => {
      const ref = jest.fn();
      render(<TextArea ref={ref} label="Test" />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });

    it('allows ref access to textarea methods', () => {
      const textareaRef = { current: null as HTMLTextAreaElement | null };

      render(<TextArea ref={textareaRef} label="Test" />);

      expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(textareaRef.current).not.toBeNull();

      if (textareaRef.current) {
        expect(typeof textareaRef.current.focus).toBe('function');
        expect(typeof textareaRef.current.blur).toBe('function');
      }
    });
  });

  describe('Additional HTML attributes', () => {
    it('passes through additional HTML attributes', () => {
      render(
        <TextArea
          label="Test"
          data-testid="test-textarea"
          aria-describedby="description"
          maxLength={100}
          rows={5}
        />
      );
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveAttribute('data-testid', 'test-textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'description');
      expect(textarea).toHaveAttribute('maxLength', '100');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('handles form attributes correctly', () => {
      render(
        <TextArea
          label="Test"
          name="description"
          form="test-form"
          required
          readOnly
        />
      );
      const textarea = screen.getByRole('textbox');

      expect(textarea).toHaveAttribute('name', 'description');
      expect(textarea).toHaveAttribute('form', 'test-form');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('readOnly');
    });
  });

  describe('Focus state management', () => {
    it('tracks focus state correctly on focus and blur', async () => {
      const user = userEvent.setup();
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');

      // Initially not focused
      expect(textarea).not.toHaveClass('border-primary-500');

      // Focus without content
      await user.click(textarea);
      expect(textarea).not.toHaveClass('border-primary-500');

      // Type content while focused
      await user.type(textarea, 'test');
      expect(textarea).toHaveClass('border-primary-500');

      // Blur
      await user.tab();
      expect(textarea).not.toHaveClass('border-primary-500');
    });

    it('maintains hasValue state after blur if content exists', async () => {
      const user = userEvent.setup();
      render(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.type(textarea, 'test content');
      await user.tab(); // blur

      // Should maintain value but not focused state
      expect(textarea).toHaveValue('test content');
      expect(textarea).not.toHaveClass('border-primary-500');
    });
  });
});
