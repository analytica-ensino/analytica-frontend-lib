import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import Chips from './Chips';

describe('Chips', () => {
  it('renders the chip with children text', () => {
    render(<Chips>Label</Chips>);
    expect(screen.getByRole('button')).toHaveTextContent('Label');
  });

  describe('State tests', () => {
    it('applies default state classes', () => {
      render(<Chips>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('bg-background');
      expect(chip).toHaveClass('text-text-950');
      expect(chip).toHaveClass('border-border-100');
    });

    it('applies selected state classes', () => {
      render(<Chips selected>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('bg-info-background');
      expect(chip).toHaveClass('text-primary-950');
      expect(chip).toHaveClass('border-2');
      expect(chip).toHaveClass('border-primary-950');
    });

    it('shows check icon when selected', () => {
      render(<Chips selected>Test</Chips>);
      const checkIcon = screen.getByRole('button').querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('does not show any icon when not selected', () => {
      render(<Chips>Test</Chips>);
      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Base classes and functionality', () => {
    it('applies base classes', () => {
      render(<Chips>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('inline-flex');
      expect(chip).toHaveClass('items-center');
      expect(chip).toHaveClass('justify-center');
      expect(chip).toHaveClass('rounded-full');
      expect(chip).toHaveClass('cursor-pointer');
      expect(chip).toHaveClass('font-normal');
    });

    it('applies fixed size classes', () => {
      render(<Chips>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('text-sm');
      expect(chip).toHaveClass('px-4');
      expect(chip).toHaveClass('py-2');
      expect(chip).toHaveClass('gap-2');
    });

    it('applies custom className', () => {
      render(<Chips className="custom-class">Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('custom-class');
    });

    it('passes through button props', () => {
      render(<Chips disabled>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Chips disabled>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('disabled:opacity-40');
      expect(chip).toHaveClass('disabled:cursor-not-allowed');
    });

    it('has default type="button"', () => {
      render(<Chips>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('type', 'button');
    });

    it('allows type to be overridden', () => {
      render(<Chips type="submit">Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('type', 'submit');
    });
  });

  describe('Click functionality', () => {
    it('calls onClick when chip is clicked', () => {
      const mockOnClick = jest.fn();
      render(<Chips onClick={mockOnClick}>Test</Chips>);
      const chip = screen.getByRole('button');
      fireEvent.click(chip);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const mockOnClick = jest.fn();
      render(
        <Chips onClick={mockOnClick} disabled>
          Test
        </Chips>
      );
      const chip = screen.getByRole('button');
      fireEvent.click(chip);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Focus functionality', () => {
    it('applies focus styles', () => {
      render(<Chips>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('focus-visible:outline-none');
      expect(chip).toHaveClass('focus-visible:ring-2');
      expect(chip).toHaveClass('focus-visible:ring-offset-0');
      expect(chip).toHaveClass('focus-visible:ring-primary-600');
    });

    it('applies focus styles for selected state', () => {
      render(<Chips selected>Test</Chips>);
      const chip = screen.getByRole('button');
      expect(chip).toHaveClass('focus-visible:ring-primary-600');
    });
  });

  describe('Icon functionality', () => {
    it('renders check icon with correct attributes when selected', () => {
      render(<Chips selected>Test</Chips>);
      const iconSpan = screen.getByRole('button').querySelector('span');
      expect(iconSpan).toHaveClass('flex');
      expect(iconSpan).toHaveClass('items-center');

      // Verifica se o ícone de check está presente
      const checkIcon = screen.getByRole('button').querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('shows check icon only when selected', () => {
      const { rerender } = render(<Chips>Test</Chips>);

      // Initially not selected - no icon
      let icon = screen.getByRole('button').querySelector('svg');
      expect(icon).not.toBeInTheDocument();

      // When selected - shows check icon
      rerender(<Chips selected>Test</Chips>);
      icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
