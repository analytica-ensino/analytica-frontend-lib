import { render, screen } from '@testing-library/react';
import { ChatLoading } from './ChatLoading';

// Mock Text component
jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      ({
        children,
        size,
        className,
      }: {
        children: string;
        size?: string;
        className?: string;
      }) => (
        <span data-testid="text" data-size={size} className={className}>
          {children}
        </span>
      )
    ),
}));

describe('ChatLoading', () => {
  it('should render loading text', () => {
    render(<ChatLoading />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should render with correct container styles', () => {
    const { container } = render(<ChatLoading />);

    const loadingContainer = container.firstChild as HTMLElement;
    expect(loadingContainer).toHaveClass('flex');
    expect(loadingContainer).toHaveClass('items-center');
    expect(loadingContainer).toHaveClass('justify-center');
    expect(loadingContainer).toHaveClass('h-96');
  });

  it('should pass correct props to Text component', () => {
    render(<ChatLoading />);

    const textElement = screen.getByTestId('text');
    expect(textElement).toHaveAttribute('data-size', 'sm');
    expect(textElement).toHaveClass('text-text-500');
  });
});
