import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { MagnifyingGlass } from 'phosphor-react';
import SelectionButton from './SelectionButton';

/**
 * Test icon component using phosphor-react
 */
const TestIcon = () => <MagnifyingGlass data-testid="test-icon" size={24} />;

describe('SelectionButton', () => {
  it('renders the button with icon and label', () => {
    render(<SelectionButton icon={<TestIcon />} label="Test Label" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  describe('Base classes and styling', () => {
    it('applies base layout classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-start');
      expect(button).toHaveClass('gap-2');
      expect(button).toHaveClass('p-4');
      expect(button).toHaveClass('rounded-xl');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('applies base styling classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-border-50');
      expect(button).toHaveClass('bg-background');
      expect(button).toHaveClass('text-text-700');
      expect(button).toHaveClass('font-bold');
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('shadow-soft-shadow-1');
      expect(button).toHaveClass('hover:bg-background-100');
    });

    it('applies unselected state classes by default', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-border-50');
      expect(button).toHaveClass('hover:bg-background-100');
      expect(button).not.toHaveClass('ring-primary-950');
      expect(button).not.toHaveClass('ring-2');
    });

    it('applies selected state classes when selected=true', () => {
      render(
        <SelectionButton icon={<TestIcon />} label="Test" selected={true} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-primary-950');
      expect(button).toHaveClass('ring-2');
      expect(button).toHaveClass('ring-offset-0');
      expect(button).toHaveClass('shadow-none');
    });

    it('applies unselected state classes when selected=false', () => {
      render(
        <SelectionButton icon={<TestIcon />} label="Test" selected={false} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-border-50');
      expect(button).toHaveClass('hover:bg-background-100');
      expect(button).not.toHaveClass('ring-primary-950');
      expect(button).not.toHaveClass('ring-2');
    });

    it('applies focus classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-indicator-info');
      expect(button).toHaveClass('focus-visible:ring-offset-0');
      expect(button).toHaveClass('focus-visible:shadow-none');
    });

    it('applies active classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:ring-2');
      expect(button).toHaveClass('active:ring-primary-950');
      expect(button).toHaveClass('active:ring-offset-0');
      expect(button).toHaveClass('active:shadow-none');
    });

    it('applies disabled classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Selection state', () => {
    it('defaults to unselected state', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-border-50');
      expect(button).not.toHaveClass('ring-primary-950');
    });

    it('applies selected state when selected=true', () => {
      render(
        <SelectionButton icon={<TestIcon />} label="Test" selected={true} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-primary-950');
      expect(button).toHaveClass('ring-2');
    });

    it('applies unselected state when selected=false', () => {
      render(
        <SelectionButton icon={<TestIcon />} label="Test" selected={false} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-border-50');
      expect(button).not.toHaveClass('ring-primary-950');
    });

    it('maintains selection state with disabled prop', () => {
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          selected={true}
          disabled
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-primary-950');
      expect(button).toHaveClass('ring-2');
      expect(button).toBeDisabled();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<SelectionButton ref={ref} icon={<TestIcon />} label="Test" />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('type', 'button');
    });

    it('allows programmatic focus through ref', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<SelectionButton ref={ref} icon={<TestIcon />} label="Test" />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('has correct displayName', () => {
      expect(SelectionButton.displayName).toBe('SelectionButton');
    });
  });

  describe('Icon and label rendering', () => {
    it('renders the icon inside a span wrapper with correct classes', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      const iconWrapper = button.querySelector('span');

      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass('flex');
      expect(iconWrapper).toHaveClass('items-center');
      expect(iconWrapper).toHaveClass('justify-center');
      expect(iconWrapper).toHaveClass('w-6');
      expect(iconWrapper).toHaveClass('h-6');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders the label text', () => {
      render(<SelectionButton icon={<TestIcon />} label="My Label" />);
      expect(screen.getByText('My Label')).toBeInTheDocument();
    });

    it('renders complex icons correctly', () => {
      const ComplexIcon = () => (
        <svg data-testid="complex-icon" width="24" height="24">
          <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      );

      render(<SelectionButton icon={<ComplexIcon />} label="Complex" />);
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });
  });

  describe('Props and functionality', () => {
    it('applies custom className', () => {
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          className="custom-class"
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles onClick events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          onClick={handleClick}
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles other HTML button attributes', () => {
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          title="Test tooltip"
          aria-label="Test button"
          data-testid="custom-button"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('title', 'Test tooltip');
      expect(button).toHaveAttribute('aria-label', 'Test button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          onClick={handleClick}
          disabled
        />
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('is focusable when not disabled', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<SelectionButton icon={<TestIcon />} label="Test" disabled />);
      const button = screen.getByRole('button') as HTMLButtonElement;

      expect(button).toBeDisabled();
      // Disabled buttons should not be part of the tab order
      expect(button).toHaveAttribute('disabled');
      // In browsers, disabled buttons are automatically excluded from tab navigation
      expect(button.disabled).toBe(true);
    });

    it('supports aria attributes', () => {
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          aria-label="Selection button"
          aria-describedby="selection-help"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Selection button');
      expect(button).toHaveAttribute('aria-describedby', 'selection-help');
    });
  });

  describe('Edge cases', () => {
    it('handles null icon gracefully', () => {
      render(<SelectionButton icon={null} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles undefined icon gracefully', () => {
      render(<SelectionButton icon={undefined} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles empty label', () => {
      render(<SelectionButton icon={<TestIcon />} label="" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('combines multiple CSS classes correctly', () => {
      render(
        <SelectionButton
          icon={<TestIcon />}
          label="Test"
          className="custom-1 custom-2"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-1');
      expect(button).toHaveClass('custom-2');
      expect(button).toHaveClass('inline-flex'); // Base class still present
    });
  });
});
