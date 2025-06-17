import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MagnifyingGlass } from 'phosphor-react';
import { IconRoundedButton } from './IconRoundedButton';

/**
 * Test icon component using phosphor-react
 */
const TestIcon = () => <MagnifyingGlass data-testid="test-icon" size={16} />;

describe('IconRoundedButton', () => {
  it('renders the button with icon', () => {
    render(<IconRoundedButton icon={<TestIcon />} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  describe('Base classes and styling', () => {
    it('applies base classes', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('w-8');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('cursor-pointer');
    });

    it('applies styling classes', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-background-200');
      expect(button).toHaveClass('bg-background');
      expect(button).toHaveClass('text-text-950');
    });

    it('applies hover and focus classes', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:shadow-hard-shadow-1');
      expect(button).toHaveClass('focus-visible:shadow-hard-shadow-1');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-indicator-info');
      expect(button).toHaveClass('focus-visible:ring-offset-0');
    });

    it('applies focus and disabled classes', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Icon rendering', () => {
    it('renders the icon inside a span wrapper', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
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

    it('renders complex icons correctly', () => {
      const ComplexIcon = () => (
        <svg data-testid="complex-icon" width="16" height="16">
          <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      );

      render(<IconRoundedButton icon={<ComplexIcon />} />);
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });
  });

  describe('Props and functionality', () => {
    it('applies custom className', () => {
      render(
        <IconRoundedButton icon={<TestIcon />} className="custom-class" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<IconRoundedButton icon={<TestIcon />} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles onClick events', () => {
      const handleClick = jest.fn();
      render(<IconRoundedButton icon={<TestIcon />} onClick={handleClick} />);
      const button = screen.getByRole('button');

      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles other HTML button attributes', () => {
      render(
        <IconRoundedButton
          icon={<TestIcon />}
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

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <IconRoundedButton icon={<TestIcon />} onClick={handleClick} disabled />
      );
      const button = screen.getByRole('button');

      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('is focusable when not disabled', () => {
      render(<IconRoundedButton icon={<TestIcon />} />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<IconRoundedButton icon={<TestIcon />} disabled />);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('supports aria attributes', () => {
      render(
        <IconRoundedButton
          icon={<TestIcon />}
          aria-label="Search button"
          aria-describedby="search-help"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Search button');
      expect(button).toHaveAttribute('aria-describedby', 'search-help');
    });
  });

  describe('Edge cases', () => {
    it('handles null icon gracefully', () => {
      render(<IconRoundedButton icon={null} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined icon gracefully', () => {
      render(<IconRoundedButton icon={undefined} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('combines multiple CSS classes correctly', () => {
      render(
        <IconRoundedButton icon={<TestIcon />} className="custom-1 custom-2" />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-1');
      expect(button).toHaveClass('custom-2');
      expect(button).toHaveClass('inline-flex'); // Base class still present
    });
  });
});
