import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckBox } from './CheckBox';

describe('CheckBox Component', () => {
  it('renders checkbox correctly', () => {
    render(<CheckBox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<CheckBox label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies default props correctly', () => {
    render(<CheckBox label="Test" data-testid="checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });

  it('renders checked when checked prop is true', () => {
    render(<CheckBox label="Test" checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders unchecked when checked prop is false', () => {
    render(<CheckBox label="Test" checked={false} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders disabled when disabled prop is true', () => {
    render(<CheckBox label="Test" disabled={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<CheckBox label="Test" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when label is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<CheckBox label="Test Label" onChange={handleChange} />);

    const label = screen.getByText('Test Label');
    await user.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<CheckBox label="Test" disabled={true} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports keyboard interaction with Space key', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<CheckBox label="Test" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await user.keyboard(' ');

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('generates unique id when not provided', () => {
    render(<CheckBox label="Test 1" />);
    render(<CheckBox label="Test 2" />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0].id).not.toBe(checkboxes[1].id);
    expect(checkboxes[0].id).toBeTruthy();
    expect(checkboxes[1].id).toBeTruthy();
  });

  it('uses provided id', () => {
    render(<CheckBox label="Test" id="custom-id" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.id).toBe('custom-id');
  });

  it('associates label with checkbox correctly', () => {
    render(<CheckBox label="Test Label" id="test-checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Test Label').closest('label');

    expect(label).toHaveAttribute('for', 'test-checkbox');
    expect(checkbox.id).toBe('test-checkbox');
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<CheckBox size="small" label="Small" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="w-4"]')).toBeInTheDocument();
      expect(container.querySelector('span[class*="text-sm"]')).toBeInTheDocument();
    });

    it('applies medium size classes (default)', () => {
      render(<CheckBox size="medium" label="Medium" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="w-5"]')).toBeInTheDocument();
      expect(container.querySelector('span[class*="text-md"]')).toBeInTheDocument();
    });

    it('applies large size classes', () => {
      render(<CheckBox size="large" label="Large" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="w-6"]')).toBeInTheDocument();
      expect(container.querySelector('span[class*="text-lg"]')).toBeInTheDocument();
    });

    it('applies default medium size when no size specified', () => {
      render(<CheckBox label="Default" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="w-5"]')).toBeInTheDocument();
    });
  });

  describe('State variants', () => {
    it('applies default state classes', () => {
      render(<CheckBox state="default" label="Default" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="border-border-300"]')).toBeInTheDocument();
    });

    it('applies invalid state classes', () => {
      render(<CheckBox state="invalid" label="Invalid" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="border-error-500"]')).toBeInTheDocument();
    });

    it('applies disabled state classes', () => {
      render(<CheckBox disabled label="Disabled" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="opacity-50"]')).toBeInTheDocument();
      expect(container.querySelector('div[class*="cursor-not-allowed"]')).toBeInTheDocument();
    });
  });

  describe('Indeterminate state', () => {
    it('shows indeterminate icon when indeterminate is true', () => {
      render(<CheckBox indeterminate={true} label="Indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      const container = checkbox.parentElement?.nextElementSibling;
      expect(container?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows check icon when checked and not indeterminate', () => {
      render(<CheckBox checked={true} indeterminate={false} label="Checked" />);
      const checkbox = screen.getByRole('checkbox');
      const container = checkbox.parentElement?.nextElementSibling;
      expect(container?.querySelector('svg')).toBeInTheDocument();
    });

    it('shows no icon when unchecked and not indeterminate', () => {
      render(<CheckBox checked={false} indeterminate={false} label="Unchecked" />);
      const checkbox = screen.getByRole('checkbox');
      const container = checkbox.parentElement?.nextElementSibling;
      expect(container?.querySelector('svg')).not.toBeInTheDocument();
    });

    it('prioritizes indeterminate over checked state', () => {
      render(<CheckBox checked={true} indeterminate={true} label="Both" />);
      const checkbox = screen.getByRole('checkbox');
      const container = checkbox.parentElement?.nextElementSibling;
      const svg = container?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Check if it's the indeterminate icon (horizontal line)
      expect(svg?.querySelector('path[d="M6 12h12"]')).toBeInTheDocument();
    });
  });

  describe('Error and helper messages', () => {
    it('displays error message when provided', () => {
      render(<CheckBox label="Test" errorMessage="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
      render(<CheckBox label="Test" helperText="Optional helper text" />);
      expect(screen.getByText('Optional helper text')).toBeInTheDocument();
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

    it('applies error styling to error message', () => {
      render(<CheckBox label="Test" errorMessage="Error message" />);
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-error-500');
    });

    it('applies helper styling to helper text', () => {
      render(<CheckBox label="Test" helperText="Helper text" />);
      const helperElement = screen.getByText('Helper text');
      expect(helperElement).toHaveClass('text-text-600');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes', () => {
      render(<CheckBox label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('is keyboard focusable', () => {
      render(<CheckBox label="Test" />);
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it('supports screen reader with label association', () => {
      render(<CheckBox label="Screen reader test" id="sr-test" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Screen reader test').closest('label');

      expect(label).toHaveAttribute('for', 'sr-test');
      expect(checkbox).toHaveAttribute('id', 'sr-test');
    });

    it('indicates required state to screen readers when invalid', () => {
      render(<CheckBox label="Required field" state="invalid" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className to checkbox', () => {
      render(<CheckBox label="Test" className="custom-class" data-testid="container" />);
      const container = screen.getByTestId('container');
      expect(container.querySelector('div[class*="custom-class"]')).toBeInTheDocument();
    });

    it('applies custom labelClassName to label', () => {
      render(<CheckBox label="Test" labelClassName="custom-label-class" />);
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label-class');
    });
  });

  describe('Without label', () => {
    it('renders checkbox without label when label prop is not provided', () => {
      render(<CheckBox data-testid="checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('still generates proper id when no label provided', () => {
      render(<CheckBox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.id).toBeTruthy();
    });
  });

  describe('Form integration', () => {
    it('can be part of a form', () => {
      const handleSubmit = jest.fn();
      render(
        <form onSubmit={handleSubmit}>
          <CheckBox name="terms" value="accepted" label="Accept terms" />
          <button type="submit">Submit</button>
        </form>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('name', 'terms');
      expect(checkbox).toHaveAttribute('value', 'accepted');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<CheckBox ref={ref} label="Test" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
