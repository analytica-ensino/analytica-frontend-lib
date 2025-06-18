import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Divider from './Divider';

describe('Divider', () => {
  it('renders with default horizontal orientation', () => {
    render(<Divider />);
    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('applies default classes for horizontal orientation', () => {
    render(<Divider />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('bg-background-200');
    expect(divider).toHaveClass('w-full');
    expect(divider).toHaveClass('h-px');
  });

  it('applies classes for vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('bg-background-200');
    expect(divider).toHaveClass('h-full');
    expect(divider).toHaveClass('w-px');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies custom className', () => {
    render(<Divider className="custom-class" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('custom-class');
  });

  it('passes through div props', () => {
    render(<Divider data-testid="custom-divider" />);
    const divider = screen.getByTestId('custom-divider');
    expect(divider).toBeInTheDocument();
  });

  it('has correct role and aria attributes', () => {
    render(<Divider orientation="vertical" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });
});
