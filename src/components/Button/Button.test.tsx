import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button', () => {
  it('renders the button with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  describe('Variant tests', () => {
    it('applies default solid variant classes with primary action', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-950');
      expect(button).toHaveClass('text-text');
      expect(button).toHaveClass('border-primary-950');
    });

    it('applies solid variant with positive action classes', () => {
      render(
        <Button variant="solid" action="positive">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-success-500');
      expect(button).toHaveClass('text-text');
      expect(button).toHaveClass('border-success-500');
    });

    it('applies solid variant with negative action classes', () => {
      render(
        <Button variant="solid" action="negative">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error-500');
      expect(button).toHaveClass('text-text');
      expect(button).toHaveClass('border-error-500');
    });

    it('applies outline variant with primary action classes', () => {
      render(
        <Button variant="outline" action="primary">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-primary-950');
      expect(button).toHaveClass('border-primary-950');
    });

    it('applies outline variant with positive action classes', () => {
      render(
        <Button variant="outline" action="positive">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-success-500');
      expect(button).toHaveClass('border-success-300');
    });

    it('applies outline variant with negative action classes', () => {
      render(
        <Button variant="outline" action="negative">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-error-500');
      expect(button).toHaveClass('border-error-300');
    });

    it('applies link variant with primary action classes', () => {
      render(
        <Button variant="link" action="primary">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-primary-950');
    });

    it('applies link variant with positive action classes', () => {
      render(
        <Button variant="link" action="positive">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-success-500');
    });

    it('applies link variant with negative action classes', () => {
      render(
        <Button variant="link" action="negative">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-error-500');
    });
  });

  describe('Size tests', () => {
    it('applies extra-small size classes', () => {
      render(<Button size="extra-small">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xs');
      expect(button).toHaveClass('px-3.5');
      expect(button).toHaveClass('py-2');
    });

    it('applies small size classes', () => {
      render(<Button size="small">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
    });

    it('applies medium size classes (default)', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-md');
      expect(button).toHaveClass('px-5');
      expect(button).toHaveClass('py-2.5');
    });

    it('applies large size classes', () => {
      render(<Button size="large">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });

    it('applies extra-large size classes', () => {
      render(<Button size="extra-large">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('px-7');
      expect(button).toHaveClass('py-3.5');
    });
  });

  describe('Base classes and functionality', () => {
    it('applies base classes', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('cursor-pointer');
      expect(button).toHaveClass('font-medium');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<Button disabled>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Button disabled>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-40');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Icon rendering', () => {
    it('renders left icon when provided', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button iconLeft={<LeftIcon />}>Test</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button iconRight={<RightIcon />}>Test</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both icons when provided', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(
        <Button iconLeft={<LeftIcon />} iconRight={<RightIcon />}>
          Test
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Combined variant, action and size classes', () => {
    it('combines outline variant with positive action and large size correctly', () => {
      render(
        <Button variant="outline" action="positive" size="large">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      // Variant and action classes
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-success-500');
      expect(button).toHaveClass('border-success-300');
      // Size classes
      expect(button).toHaveClass('text-lg');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });

    it('combines link variant with negative action and small size correctly', () => {
      render(
        <Button variant="link" action="negative" size="small">
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      // Variant and action classes
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-error-500');
      // Size classes
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
    });
  });
});
