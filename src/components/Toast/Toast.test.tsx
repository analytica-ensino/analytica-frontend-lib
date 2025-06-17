import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from './Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic toast with title', () => {
    render(<Toast title="Test Title" onClose={mockOnClose} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByTestId('toast-description')).not.toBeInTheDocument();
  });

  it('renders toast with description when provided', () => {
    render(
      <Toast
        title="Test Title"
        description="Test Description"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  describe('Variant and action classes', () => {
    it('applies solid variant classes correctly', () => {
      const { container } = render(
        <Toast
          title="Test"
          variant="solid"
          action="success"
          onClose={mockOnClose}
        />
      );

      const toast = container.firstChild;
      expect(toast).toHaveClass('bg-success');
      expect(toast).toHaveClass('text-success-800');
      expect(toast).toHaveClass('border-none');
    });

    it('applies outlined variant classes correctly', () => {
      const { container } = render(
        <Toast
          title="Test"
          variant="outlined"
          action="success"
          onClose={mockOnClose}
        />
      );

      const toast = container.firstChild;
      expect(toast).toHaveClass('bg-success');
      expect(toast).toHaveClass('text-success-800');
      expect(toast).toHaveClass('border');
      expect(toast).toHaveClass('border-success-200');
    });
  });

  describe('Toast IconAction logic', () => {
    it('renders correct icon for error action', () => {
      render(<Toast action="info" title="Test" onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument();
    });

    it('renders success icon for warning action', () => {
      render(<Toast action="warning" title="Test" onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-icon-warning')).toBeInTheDocument();
    });

    it('renders success icon for success action', () => {
      render(<Toast action="success" title="Test" onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument();
    });

    it('renders success icon for invalid action', () => {
      // @ts-expect-error: Testing invalid action on purpose
      render(<Toast action="invalid" title="Test" onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-icon-invalid')).toBeInTheDocument();
    });
  });

  describe('Close button functionality', () => {
    it('renders close button', () => {
      render(<Toast title="Test" onClose={mockOnClose} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(<Toast title="Test" onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button');

      closeButton.click();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('has hover effect on close button', () => {
      render(<Toast title="Test" onClose={mockOnClose} />);
      const toast = screen.getByRole('alert');

      expect(toast).toHaveClass('group');
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass('opacity-0');
      expect(closeButton).toHaveClass('group-hover:opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate role and attributes', () => {
      render(
        <Toast title="Test" description="Description" onClose={mockOnClose} />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('aria-live', 'assertive');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Custom class names', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Toast title="Test" onClose={mockOnClose} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('combines custom class with base classes', () => {
      const { container } = render(
        <Toast title="Test" onClose={mockOnClose} className="custom-class" />
      );

      const toast = container.firstChild;
      expect(toast).toHaveClass('custom-class');
      expect(toast).toHaveClass('max-w-[390px]');
      expect(toast).toHaveClass('w-full');
      expect(toast).toHaveClass('flex');
    });
  });
});
