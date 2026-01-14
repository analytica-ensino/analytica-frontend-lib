import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from './ErrorDisplay';

// Mock Text component
jest.mock('../../Text/Text', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      ({
        children,
        size,
        color,
      }: {
        children: string;
        size?: string;
        color?: string;
      }) => (
        <span data-testid="text" data-size={size} data-color={color}>
          {children}
        </span>
      )
    ),
}));

describe('ErrorDisplay', () => {
  it('should render error message', () => {
    render(<ErrorDisplay error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render with correct container styles', () => {
    const { container } = render(<ErrorDisplay error="Error" />);

    const errorContainer = container.firstChild as HTMLElement;
    expect(errorContainer).toHaveClass('flex');
    expect(errorContainer).toHaveClass('items-center');
    expect(errorContainer).toHaveClass('justify-center');
    expect(errorContainer).toHaveClass('bg-background');
    expect(errorContainer).toHaveClass('rounded-xl');
    expect(errorContainer).toHaveClass('w-full');
    expect(errorContainer).toHaveClass('min-h-[705px]');
  });

  it('should pass correct props to Text component', () => {
    render(<ErrorDisplay error="Error message" />);

    const textElement = screen.getByTestId('text');
    expect(textElement).toHaveAttribute('data-size', 'lg');
    expect(textElement).toHaveAttribute('data-color', 'text-error-500');
  });

  it('should render different error messages', () => {
    const { rerender } = render(<ErrorDisplay error="First error" />);
    expect(screen.getByText('First error')).toBeInTheDocument();

    rerender(<ErrorDisplay error="Second error" />);
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });

  it('should render empty error message', () => {
    render(<ErrorDisplay error="" />);

    const textElement = screen.getByTestId('text');
    expect(textElement).toBeInTheDocument();
    expect(textElement.textContent).toBe('');
  });
});
