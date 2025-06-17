import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { NavButton } from './NavButton';

// Ícone de teste simples
const TestIcon = () => <span data-testid="test-icon">🏠</span>;

describe('NavButton', () => {
  it('renders the button with icon and label', () => {
    render(<NavButton icon={<TestIcon />} label="Test Label" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  describe('Base classes and styling', () => {
    it('applies base layout classes', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('flex');
      expect(button).toHaveClass('flex-col');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('gap-0.5');
      expect(button).toHaveClass('px-12');
      expect(button).toHaveClass('py-1');
      expect(button).toHaveClass('rounded-sm');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('applies base styling classes', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-text-950');
      expect(button).toHaveClass('text-xs');
      expect(button).toHaveClass('font-medium');
      expect(button).toHaveClass('hover:text-text');
      expect(button).toHaveClass('hover:bg-primary-600');
    });

    it('applies unselected state classes by default', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-text-950');
      expect(button).toHaveClass('hover:text-text');
      expect(button).toHaveClass('hover:bg-primary-600');
      expect(button).not.toHaveClass('bg-primary-50');
      expect(button).not.toHaveClass('text-primary-950');
    });

    it('applies selected state classes when selected=true', () => {
      render(<NavButton icon={<TestIcon />} label="Test" selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-50');
      expect(button).toHaveClass('text-primary-950');
      expect(button).toHaveClass('hover:text-text');
      expect(button).toHaveClass('hover:bg-primary-600');
    });

    it('applies unselected state classes when selected=false', () => {
      render(<NavButton icon={<TestIcon />} label="Test" selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-text-950');
      expect(button).toHaveClass('hover:text-text');
      expect(button).toHaveClass('hover:bg-primary-600');
      expect(button).not.toHaveClass('bg-primary-50');
      expect(button).not.toHaveClass('text-primary-950');
    });

    it('applies focus classes', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-0');
      expect(button).toHaveClass('focus-visible:ring-indicator-info');
    });

    it('applies disabled classes', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('Selection state', () => {
    it('defaults to unselected state', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-text-950');
      expect(button).not.toHaveClass('bg-primary-50');
      expect(button).not.toHaveClass('text-primary-950');
    });

    it('applies selected state when selected=true', () => {
      render(<NavButton icon={<TestIcon />} label="Test" selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-50');
      expect(button).toHaveClass('text-primary-950');
    });

    it('applies unselected state when selected=false', () => {
      render(<NavButton icon={<TestIcon />} label="Test" selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-text-950');
      expect(button).not.toHaveClass('bg-primary-50');
      expect(button).not.toHaveClass('text-primary-950');
    });

    it('maintains selection state with disabled prop', () => {
      render(
        <NavButton icon={<TestIcon />} label="Test" selected={true} disabled />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-50');
      expect(button).toHaveClass('text-primary-950');
      expect(button).toBeDisabled();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<NavButton ref={ref} icon={<TestIcon />} label="Test" />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('type', 'button');
    });

    it('allows programmatic focus through ref', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<NavButton ref={ref} icon={<TestIcon />} label="Test" />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('has correct displayName', () => {
      expect(NavButton.displayName).toBe('NavButton');
    });
  });

  describe('Icon and label rendering', () => {
    it('renders the icon inside a span wrapper with correct classes', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      const iconWrapper = button.querySelector('span');

      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass('flex');
      expect(iconWrapper).toHaveClass('items-center');
      expect(iconWrapper).toHaveClass('justify-center');
      expect(iconWrapper).toHaveClass('w-5');
      expect(iconWrapper).toHaveClass('h-5');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders the label text with correct classes', () => {
      render(<NavButton icon={<TestIcon />} label="My Label" />);
      const label = screen.getByText('My Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('whitespace-nowrap');
    });

    it('renders complex icons correctly', () => {
      const ComplexIcon = () => (
        <svg data-testid="complex-icon" width="20" height="20">
          <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      );

      render(<NavButton icon={<ComplexIcon />} label="Complex" />);
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });
  });

  describe('Props and functionality', () => {
    it('applies custom className', () => {
      render(
        <NavButton icon={<TestIcon />} label="Test" className="custom-class" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<NavButton icon={<TestIcon />} label="Test" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles onClick events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <NavButton icon={<TestIcon />} label="Test" onClick={handleClick} />
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles other HTML button attributes', () => {
      render(
        <NavButton
          icon={<TestIcon />}
          label="Test"
          title="Test tooltip"
          aria-label="Navigation button"
          data-testid="custom-button"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('title', 'Test tooltip');
      expect(button).toHaveAttribute('aria-label', 'Navigation button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <NavButton
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

    it('sets aria-pressed based on selected state', () => {
      const { rerender } = render(
        <NavButton icon={<TestIcon />} label="Test" selected={false} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<NavButton icon={<TestIcon />} label="Test" selected={true} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibility', () => {
    it('is focusable when not disabled', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<NavButton icon={<TestIcon />} label="Test" disabled />);
      const button = screen.getByRole('button') as HTMLButtonElement;

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
      expect(button.disabled).toBe(true);
    });

    it('supports aria attributes', () => {
      render(
        <NavButton
          icon={<TestIcon />}
          label="Test"
          aria-label="Navigation button"
          aria-describedby="nav-help"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Navigation button');
      expect(button).toHaveAttribute('aria-describedby', 'nav-help');
    });

    it('has button role', () => {
      render(<NavButton icon={<TestIcon />} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Navigation use cases', () => {
    it('works in navigation menu context', async () => {
      const user = userEvent.setup();
      const handleNavigation = jest.fn();

      render(
        <nav>
          <NavButton
            icon={<TestIcon />}
            label="Home"
            selected={true}
            onClick={() => handleNavigation('home')}
          />
          <NavButton
            icon={<TestIcon />}
            label="Dashboard"
            selected={false}
            onClick={() => handleNavigation('dashboard')}
          />
        </nav>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      expect(homeButton).toHaveClass('bg-primary-50');
      expect(dashboardButton).toHaveClass('text-text-950');
      expect(dashboardButton).not.toHaveClass('bg-primary-50');

      await user.click(dashboardButton);
      expect(handleNavigation).toHaveBeenCalledWith('dashboard');
    });

    it('maintains consistent sizing across different labels', () => {
      render(
        <div>
          <NavButton icon={<TestIcon />} label="Short" />
          <NavButton icon={<TestIcon />} label="Very Long Navigation Label" />
        </div>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('px-12');
        expect(button).toHaveClass('py-1');
      });
    });
  });

  describe('Edge cases', () => {
    it('handles null icon gracefully', () => {
      render(<NavButton icon={null} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles undefined icon gracefully', () => {
      render(<NavButton icon={undefined} label="Test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles empty label', () => {
      render(<NavButton icon={<TestIcon />} label="" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('combines multiple CSS classes correctly', () => {
      render(
        <NavButton
          icon={<TestIcon />}
          label="Test"
          className="custom-1 custom-2"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-1');
      expect(button).toHaveClass('custom-2');
      expect(button).toHaveClass('flex'); // Base class still present
    });

    it('works with different icon sizes', () => {
      const LargeIcon = () => (
        <svg data-testid="large-icon" width="32" height="32">
          <rect width="32" height="32" />
        </svg>
      );

      render(<NavButton icon={<LargeIcon />} label="Large Icon" />);
      const iconWrapper = screen.getByTestId('large-icon').parentElement;
      expect(iconWrapper).toHaveClass('w-5', 'h-5'); // Container maintains consistent size
    });
  });
});
