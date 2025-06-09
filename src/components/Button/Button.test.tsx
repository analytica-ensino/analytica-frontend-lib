import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button', () => {
  it('renders the button with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies default primary variant classes', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('hover:bg-blue-700');
    expect(button).toHaveClass('text-white');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('hover:bg-gray-300');
    expect(button).toHaveClass('text-black');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
    expect(button).toHaveClass('hover:bg-red-700');
    expect(button).toHaveClass('text-white');
  });

  it('applies small size classes', () => {
    render(<Button size="sm">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
  });

  it('applies large size classes', () => {
    render(<Button size="lg">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg');
    expect(button).toHaveClass('px-5');
    expect(button).toHaveClass('py-3');
  });

  it('applies base classes', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded');
    expect(button).toHaveClass('font-medium');
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring');
    expect(button).toHaveClass('transition');
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
});
