import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from './ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should render error message', () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should have correct container styling', () => {
    const { container } = render(<ErrorDisplay error="Test error" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('flex');
    expect(div).toHaveClass('items-center');
    expect(div).toHaveClass('justify-center');
    expect(div).toHaveClass('bg-background');
    expect(div).toHaveClass('rounded-xl');
    expect(div).toHaveClass('w-full');
    expect(div).toHaveClass('min-h-[705px]');
  });
});
