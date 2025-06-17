import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MagnifyingGlass } from 'phosphor-react';
import Badge from './Badge';

/**
 * Test icon component using phosphor-react
 */
const TestIcon = () => <MagnifyingGlass data-testid="test-icon" size={16} />;

describe('Badge', () => {
  describe('Basic rendering', () => {
    it('renders the badge with text', () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
    });

    it('renders with icon on left', () => {
      render(<Badge iconLeft={<TestIcon />}>Test</Badge>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders with icon on right', () => {
      render(<Badge iconRight={<TestIcon />}>Test</Badge>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Variant and action classes', () => {
    it('applies solid variant classes', () => {
      render(
        <Badge variant="solid" action="success">
          Success
        </Badge>
      );
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-success');
      expect(badge).toHaveClass('text-success-800');
    });

    it('applies outline variant classes', () => {
      render(
        <Badge variant="outlined" action="error">
          Error
        </Badge>
      );
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('border-error-300');
      expect(badge).toHaveClass('bg-error');
    });

    it('applies exams variant classes', () => {
      render(
        <Badge variant="exams" action="exam1">
          Exam 1
        </Badge>
      );
      const badge = screen.getByText('Exam 1');
      expect(badge).toHaveClass('bg-exam-1');
      expect(badge).toHaveClass('text-info-700');
    });

    it('applies resultStatus variant classes', () => {
      render(
        <Badge variant="resultStatus" action="positive">
          Positive
        </Badge>
      );
      const badge = screen.getByText('Positive');
      expect(badge).toHaveClass('bg-success');
      expect(badge).toHaveClass('text-success-800');
    });

    it('applies notification variant classes', () => {
      render(<Badge variant="notification" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Size classes', () => {
    it('applies small size classes', () => {
      render(<Badge size="small">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('text-2xs');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-1');
    });

    it('applies medium size classes', () => {
      render(<Badge size="medium">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-1');
    });

    it('applies large size classes', () => {
      render(<Badge size="large">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('text-sm');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-1');
    });
  });

  describe('Icon size classes', () => {
    it('applies small icon size classes', () => {
      render(
        <Badge size="small" iconLeft={<TestIcon />}>
          Small
        </Badge>
      );
      const iconWrapper = screen.getByTestId('test-icon').parentElement;
      expect(iconWrapper).toHaveClass('size-3');
    });

    it('applies medium icon size classes', () => {
      render(
        <Badge size="medium" iconLeft={<TestIcon />}>
          Medium
        </Badge>
      );
      const iconWrapper = screen.getByTestId('test-icon').parentElement;
      expect(iconWrapper).toHaveClass('size-3.5');
    });

    it('applies large icon size classes', () => {
      render(
        <Badge size="large" iconLeft={<TestIcon />}>
          Large
        </Badge>
      );
      const iconWrapper = screen.getByTestId('test-icon').parentElement;
      expect(iconWrapper).toHaveClass('size-4');
    });
  });

  describe('Props and functionality', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class">Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('custom-class');
    });

    it('passes through HTML attributes', () => {
      render(
        <Badge
          data-testid="test-badge"
          title="Badge title"
          aria-label="Test badge"
        >
          Test
        </Badge>
      );
      const badge = screen.getByTestId('test-badge');
      expect(badge).toHaveAttribute('title', 'Badge title');
      expect(badge).toHaveAttribute('aria-label', 'Test badge');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Badge onClick={handleClick}>Clickable</Badge>);
      const badge = screen.getByText('Clickable');
      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification variant', () => {
    it('renders notification icon', () => {
      render(<Badge variant="notification" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not accept icons in notification variant', () => {
      render(
        <Badge variant="notification" iconLeft={<TestIcon />}>
          Notifications
        </Badge>
      );
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('renders without children', () => {
      render(<Badge variant="solid" action="info" />);
      const badge = document.querySelector('[class*="bg-info"]');
      expect(badge).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      const originalError = console.error;
      console.error = jest.fn();

      // @ts-expect-error - Testando caso inválido
      render(<Badge variant="invalid">Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Notification active indicator', () => {
    it('shows notification dot when active', () => {
      render(<Badge variant="notification" notificationActive={true} />);
      const dot = screen.getByTestId('notification-dot');
      expect(dot).toBeInTheDocument();
    });

    it('does not show notification dot when inactive', () => {
      render(<Badge variant="notification" notificationActive={false} />);
      const dot = screen.queryByTestId('notification-dot');
      expect(dot).not.toBeInTheDocument();
    });
  });
});
