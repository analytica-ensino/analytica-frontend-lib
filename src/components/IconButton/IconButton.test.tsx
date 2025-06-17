import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Gear } from 'phosphor-react';
import { IconButton } from './IconButton';

/**
 * Test icon component using phosphor-react
 */
const TestIcon = () => <Gear data-testid="test-icon" size={16} />;

describe('IconButton', () => {
  it('renders the button with icon', () => {
    render(<IconButton icon={<TestIcon />} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  describe('Base classes and styling', () => {
    it('applies base layout classes', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('font-medium');
    });

    it('applies default styling classes', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-text-950');
      expect(button).toHaveClass('cursor-pointer');
      expect(button).toHaveClass('hover:bg-primary-600');
      expect(button).toHaveClass('hover:text-text');
    });

    it('applies focus classes', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-0');
      expect(button).toHaveClass('focus-visible:ring-indicator-info');
    });

    it('applies disabled classes', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes when size=sm', () => {
      render(<IconButton icon={<TestIcon />} size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-6');
      expect(button).toHaveClass('h-6');
      expect(button).toHaveClass('text-sm');
    });

    it('applies medium size classes by default', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('text-base');
    });

    it('applies medium size classes when size=md', () => {
      render(<IconButton icon={<TestIcon />} size="md" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('Active state', () => {
    it('defaults to inactive state', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('!bg-primary-50');
      expect(button).not.toHaveClass('!text-primary-950');
      expect(button).not.toHaveClass('hover:!bg-primary-100');
    });

    it('applies active state classes when active=true', () => {
      render(<IconButton icon={<TestIcon />} active={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('!bg-primary-50');
      expect(button).toHaveClass('!text-primary-950');
      expect(button).toHaveClass('hover:!bg-primary-100');
    });

    it('maintains active state with disabled prop', () => {
      render(<IconButton icon={<TestIcon />} active={true} disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('!bg-primary-50');
      expect(button).toHaveClass('!text-primary-950');
      expect(button).toHaveClass('hover:!bg-primary-100');
      expect(button).toBeDisabled();
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<IconButton ref={ref} icon={<TestIcon />} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveAttribute('type', 'button');
    });

    it('allows programmatic focus through ref', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<IconButton ref={ref} icon={<TestIcon />} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('has correct displayName', () => {
      expect(IconButton.displayName).toBe('IconButton');
    });
  });

  describe('Icon rendering', () => {
    it('renders the icon inside a span wrapper with correct classes', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      const iconWrapper = button.querySelector('span');

      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass('flex');
      expect(iconWrapper).toHaveClass('items-center');
      expect(iconWrapper).toHaveClass('justify-center');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders complex icons correctly', () => {
      const ComplexIcon = () => (
        <svg data-testid="complex-icon" width="20" height="20">
          <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      );

      render(<IconButton icon={<ComplexIcon />} />);
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });
  });

  describe('Props and functionality', () => {
    it('applies custom className', () => {
      render(<IconButton icon={<TestIcon />} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<IconButton icon={<TestIcon />} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles onClick events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<IconButton icon={<TestIcon />} onClick={handleClick} />);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles other HTML button attributes', () => {
      render(
        <IconButton
          icon={<TestIcon />}
          title="Test tooltip"
          aria-label="Icon button"
          data-testid="custom-button"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('title', 'Test tooltip');
      expect(button).toHaveAttribute('aria-label', 'Icon button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<IconButton icon={<TestIcon />} onClick={handleClick} disabled />);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('sets aria-pressed based on active state', () => {
      const { rerender } = render(
        <IconButton icon={<TestIcon />} active={false} />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<IconButton icon={<TestIcon />} active={true} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has default aria-label when none is provided', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Botão de ação');
    });

    it('uses custom aria-label when provided', () => {
      render(<IconButton icon={<TestIcon />} aria-label="Abrir menu" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Abrir menu');
    });

    it('is focusable when not disabled', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<IconButton icon={<TestIcon />} disabled />);
      const button = screen.getByRole('button') as HTMLButtonElement;

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
      expect(button.disabled).toBe(true);
    });

    it('supports aria attributes', () => {
      render(
        <IconButton
          icon={<TestIcon />}
          aria-label="Settings button"
          aria-describedby="settings-help"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Settings button');
      expect(button).toHaveAttribute('aria-describedby', 'settings-help');
    });

    it('has button role', () => {
      render(<IconButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Toolbar and menu use cases', () => {
    it('works in toolbar context with active states', async () => {
      const user = userEvent.setup();
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <div role="toolbar">
          <IconButton
            icon={<TestIcon />}
            size="sm"
            active={true}
            onClick={handleEdit}
            aria-label="Edit"
          />
          <IconButton
            icon={<TestIcon />}
            size="sm"
            onClick={handleDelete}
            aria-label="Delete"
          />
        </div>
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(editButton).toHaveClass('!bg-primary-50');
      expect(deleteButton).not.toHaveClass('!bg-primary-50');

      await user.click(deleteButton);
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('maintains consistent sizing in dropdown menus', () => {
      render(
        <div>
          <IconButton icon={<TestIcon />} size="sm" />
          <IconButton icon={<TestIcon />} size="sm" />
          <IconButton icon={<TestIcon />} size="sm" />
        </div>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-6');
        expect(button).toHaveClass('h-6');
        expect(button).toHaveClass('text-sm');
      });
    });

    it('simulates persistent active state behavior', async () => {
      const user = userEvent.setup();
      let activeButton = '';

      const handleButtonClick = (buttonName: string) => {
        activeButton = activeButton === buttonName ? '' : buttonName;
      };

      const { rerender } = render(
        <div>
          <IconButton
            icon={<TestIcon />}
            active={activeButton === 'bold'}
            onClick={() => handleButtonClick('bold')}
            data-testid="bold-button"
          />
          <IconButton
            icon={<TestIcon />}
            active={activeButton === 'italic'}
            onClick={() => handleButtonClick('italic')}
            data-testid="italic-button"
          />
        </div>
      );

      const boldButton = screen.getByTestId('bold-button');
      const italicButton = screen.getByTestId('italic-button');

      // Inicialmente nenhum ativo
      expect(boldButton).not.toHaveClass('!bg-primary-50');
      expect(italicButton).not.toHaveClass('!bg-primary-50');

      // Clica no bold
      await user.click(boldButton);
      activeButton = 'bold';

      rerender(
        <div>
          <IconButton
            icon={<TestIcon />}
            active={activeButton === 'bold'}
            onClick={() => handleButtonClick('bold')}
            data-testid="bold-button"
          />
          <IconButton
            icon={<TestIcon />}
            active={activeButton === 'italic'}
            onClick={() => handleButtonClick('italic')}
            data-testid="italic-button"
          />
        </div>
      );

      expect(screen.getByTestId('bold-button')).toHaveClass('!bg-primary-50');
      expect(screen.getByTestId('italic-button')).not.toHaveClass(
        '!bg-primary-50'
      );
    });
  });

  describe('Edge cases', () => {
    it('handles null icon gracefully', () => {
      render(<IconButton icon={null} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined icon gracefully', () => {
      render(<IconButton icon={undefined} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('combines multiple CSS classes correctly', () => {
      render(
        <IconButton
          icon={<TestIcon />}
          className="custom-1 custom-2"
          size="sm"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-1');
      expect(button).toHaveClass('custom-2');
      expect(button).toHaveClass('inline-flex'); // Base class still present
      expect(button).toHaveClass('w-6'); // Size class present
      expect(button).toHaveClass('bg-transparent'); // Default style present
      expect(button).toHaveClass('cursor-pointer'); // New cursor class
    });

    it('works with different icon sizes within fixed container', () => {
      const LargeIcon = () => (
        <svg data-testid="large-icon" width="32" height="32">
          <rect width="32" height="32" />
        </svg>
      );

      render(<IconButton icon={<LargeIcon />} size="sm" />);
      const button = screen.getByRole('button');
      const iconWrapper = screen.getByTestId('large-icon').parentElement;

      expect(button).toHaveClass('w-6', 'h-6'); // Button maintains consistent size
      expect(iconWrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('handles all size combinations', () => {
      const sizes = ['sm', 'md'] as const;

      sizes.forEach((size) => {
        const { unmount } = render(
          <IconButton
            icon={<TestIcon />}
            size={size}
            data-testid={`button-${size}`}
          />
        );

        const button = screen.getByTestId(`button-${size}`);
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });
});
