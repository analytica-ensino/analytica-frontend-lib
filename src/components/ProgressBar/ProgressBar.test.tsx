import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar, { ProgressBarProps } from './ProgressBar';

// Import the types from the component
type ProgressBarSize = 'small' | 'medium';
type ProgressBarVariant = 'blue' | 'green';

describe('ProgressBar', () => {
  describe('Basic rendering', () => {
    it('renders progress bar without label', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders progress bar with label', () => {
      render(<ProgressBar value={50} label="Test Progress" />);
      const progressBar = screen.getByRole('progressbar');
      const label = screen.getByText('Test Progress');

      expect(progressBar).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('renders progress bar with percentage', () => {
      render(<ProgressBar value={75} showPercentage />);
      const progressBar = screen.getByRole('progressbar');
      const percentage = screen.getByText('75%');

      expect(progressBar).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('renders progress bar with both label and percentage', () => {
      render(<ProgressBar value={60} label="Complete" showPercentage />);
      const progressBar = screen.getByRole('progressbar');

      // For medium size (default), label won't be rendered when showPercentage is true
      // Only percentage is shown in horizontal layout
      const percentage = screen.getByText('60%');

      expect(progressBar).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      const { container } = render(<ProgressBar size="small" value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('h-1');
      expect(progressFill).toHaveClass('h-1');
    });

    it('applies medium size classes (default)', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('h-2');
      expect(progressFill).toHaveClass('h-2');
    });

    it('applies medium size classes explicitly', () => {
      const { container } = render(<ProgressBar size="medium" value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('h-2');
      expect(progressFill).toHaveClass('h-2');
    });

    it('uses correct text size for small size with label', () => {
      render(<ProgressBar size="small" value={50} label="Small Label" />);
      const label = screen.getByText('Small Label');
      expect(label).toHaveClass('text-xs');
    });

    it('uses correct text size for medium size with label', () => {
      render(<ProgressBar size="medium" value={50} label="Medium Label" />);
      const label = screen.getByText('Medium Label');
      expect(label).toHaveClass('text-xs');
    });
  });

  describe('Color variants', () => {
    it('applies blue variant classes (default)', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('bg-background-300');
      expect(progressFill).toHaveClass('bg-primary-700');
    });

    it('applies blue variant classes explicitly', () => {
      const { container } = render(<ProgressBar variant="blue" value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('bg-background-300');
      expect(progressFill).toHaveClass('bg-primary-700');
    });

    it('applies green variant classes', () => {
      const { container } = render(<ProgressBar variant="green" value={50} />);
      const progressContainer = screen.getByRole('progressbar');
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressContainer).toHaveClass('bg-background-300');
      expect(progressFill).toHaveClass('bg-success-200');
    });
  });

  describe('Value handling and percentage calculation', () => {
    it('handles zero value', () => {
      const { container } = render(<ProgressBar value={0} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 0%"]');
      const percentage = screen.getByText('0%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('handles maximum value', () => {
      const { container } = render(<ProgressBar value={100} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 100%"]');
      const percentage = screen.getByText('100%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('clamps values above maximum', () => {
      const { container } = render(<ProgressBar value={150} max={100} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 100%"]');
      const percentage = screen.getByText('100%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('clamps negative values to zero', () => {
      const { container } = render(<ProgressBar value={-10} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 0%"]');
      const percentage = screen.getByText('0%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('handles custom max values', () => {
      const { container } = render(<ProgressBar value={3} max={5} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 60%"]');
      const percentage = screen.getByText('60%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('rounds percentage to nearest integer', () => {
      render(<ProgressBar value={33.333} showPercentage />);
      const percentage = screen.getByText('33%');
      expect(percentage).toBeInTheDocument();
    });

    it('rounds percentage correctly for .5 decimals', () => {
      render(<ProgressBar value={33.5} showPercentage />);
      const percentage = screen.getByText('34%');
      expect(percentage).toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('sets correct aria attributes with default max', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });

    it('sets correct aria attributes with custom max', () => {
      render(<ProgressBar value={8} max={10} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '8');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('sets custom aria-label when label is provided as string', () => {
      render(<ProgressBar value={50} label="Custom Label" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('uses default aria-label when label is ReactNode', () => {
      const complexLabel = <span>Complex <strong>Label</strong></span>;
      render(<ProgressBar value={50} label={complexLabel} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });

    it('sets correct aria attributes with clamped values', () => {
      render(<ProgressBar value={150} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('CSS classes and styling', () => {
    it('applies additional className to container', () => {
      const { container } = render(
        <ProgressBar value={50} className="custom-class" />
      );
      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer).toHaveClass('custom-class');
    });

    it('applies labelClassName to label', () => {
      render(
        <ProgressBar
          value={50}
          label="Styled Label"
          labelClassName="custom-label-class"
        />
      );
      const label = screen.getByText('Styled Label');
      expect(label).toHaveClass('custom-label-class');
    });

    it('applies percentageClassName to percentage text', () => {
      render(
        <ProgressBar
          value={50}
          showPercentage
          percentageClassName="custom-percentage-class"
        />
      );
      const percentage = screen.getByText('50%');
      expect(percentage).toHaveClass('custom-percentage-class');
    });

    it('applies correct base classes to progress container', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveClass('flex-grow');
      expect(progressBar).toHaveClass('rounded-lg');
      expect(progressBar).toHaveClass('overflow-hidden');
    });

    it('applies correct classes to progress fill', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressFill = container.querySelector('[style*="width: 50%"]');

      expect(progressFill).toHaveClass('rounded-lg');
      expect(progressFill).toHaveClass('transition-all');
      expect(progressFill).toHaveClass('duration-300');
      expect(progressFill).toHaveClass('ease-out');
      expect(progressFill).toHaveClass('shadow-hard-shadow-3');
    });
  });

  describe('Label and percentage layout', () => {
    it('does not render label/percentage container when neither is provided', () => {
      const { container } = render(<ProgressBar value={50} />);
      const labelContainer = container.querySelector('.justify-between');
      expect(labelContainer).not.toBeInTheDocument();
    });

    it('renders label/percentage container when only label is provided', () => {
      const { container } = render(<ProgressBar value={50} label="Test" />);
      const label = screen.getByText('Test');
      expect(label).toBeInTheDocument();
    });

    it('renders label/percentage container when only percentage is provided', () => {
      const { container } = render(<ProgressBar value={50} showPercentage />);
      const percentage = screen.getByText('50%');
      expect(percentage).toBeInTheDocument();
    });

    it('renders both label and percentage in correct positions', () => {
      render(
        <ProgressBar value={50} label="Test Label" showPercentage />
      );

      const percentage = screen.getByText('50%');
      expect(percentage).toBeInTheDocument();

      // Label is not rendered when showPercentage is true in medium size
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });
  });

  describe('ReactNode label support', () => {
    it('renders ReactNode as label', () => {
      const complexLabel = (
        <span>
          Complex <strong>label</strong> with <em>formatting</em>
        </span>
      );
      render(<ProgressBar value={50} label={complexLabel} />);

      // Check that nested elements are rendered
      expect(screen.getByText('label')).toBeInTheDocument();
      expect(screen.getByText('formatting')).toBeInTheDocument();

      // Check that the full text content is present in the component
      const labelContainer = screen.getByText('label').closest('div');
      expect(labelContainer).toHaveTextContent('Complex label with formatting');
    });

    it('renders ReactNode with nested components', () => {
      const nestedLabel = (
        <>
          <span className="text-primary-500">Status:</span>
          <span className="font-bold">In Progress</span>
        </>
      );
      render(<ProgressBar value={70} label={nestedLabel} />);

      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Color and text classes', () => {
    it('applies correct text color classes to label', () => {
      render(<ProgressBar value={50} label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('text-text-950');
    });

    it('applies correct text color classes to percentage', () => {
      render(<ProgressBar value={50} showPercentage />);
      const percentage = screen.getByText('50%');
      expect(percentage).toHaveClass('text-text-950');
    });

    it('applies medium font weight to both label and percentage', () => {
      render(<ProgressBar size="small" value={50} label="Test" showPercentage />);
      const label = screen.getByText('Test');
      const percentage = screen.getByText('50%');

      expect(label).toHaveClass('font-medium');
      expect(percentage).toHaveClass('font-medium');
    });
  });

  describe('Edge cases and error handling', () => {
        it('handles NaN values gracefully', () => {
      const { container } = render(<ProgressBar value={NaN} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 0%"]');
      const percentage = screen.getByText('0%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();

      // Check that aria attributes handle NaN correctly
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles Infinity values gracefully', () => {
      const { container } = render(<ProgressBar value={Infinity} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 100%"]');
      const percentage = screen.getByText('100%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

        it('handles zero max value', () => {
      const { container } = render(<ProgressBar value={5} max={0} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 0%"]');
      const percentage = screen.getByText('0%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();

      // When max is 0, we handle it gracefully by setting percentage to 0
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '0');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles decimal max values', () => {
      const { container } = render(<ProgressBar value={0.5} max={1.5} showPercentage />);
      const progressFill = container.querySelector('[style*="width: 33"]'); // 0.5/1.5 = 33.33%
      const percentage = screen.getByText('33%');

      expect(progressFill).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('maintains precision in ARIA attributes with decimal values', () => {
      render(<ProgressBar value={0.5} max={1.5} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '0.5');
      expect(progressBar).toHaveAttribute('aria-valuemax', '1.5');
    });
  });

  describe('Combined props scenarios', () => {
    it('works with all props combined', () => {
      const { container } = render(
        <ProgressBar
          value={67}
          max={150}
          size="small"
          variant="green"
          label="Test Progress"
          showPercentage
          className="custom-container"
          labelClassName="custom-label"
          percentageClassName="custom-percentage"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      const label = screen.getByText('Test Progress');
      const percentage = screen.getByText('45%'); // 67/150 = 44.67% rounds to 45%
      const progressContainer = container.firstChild as HTMLElement;
      const progressFill = container.querySelector('[style*="width: 44"]'); // 44.67%

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('h-1', 'bg-background-300');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
      expect(progressBar).toHaveAttribute('aria-valuemax', '150');
      expect(progressBar).toHaveAttribute('aria-label', 'Test Progress');

      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('text-xs', 'custom-label');

      expect(percentage).toBeInTheDocument();
      expect(percentage).toHaveClass('custom-percentage');

      expect(progressContainer).toHaveClass('custom-container');
      expect(progressFill).toHaveClass('h-1', 'bg-success-200');
    });

    it('handles all size and variant combinations', () => {
      const sizes: ProgressBarSize[] = ['small', 'medium'];
      const variants: ProgressBarVariant[] = ['blue', 'green'];

      sizes.forEach((size) => {
        variants.forEach((variant) => {
          render(
            <ProgressBar
              size={size}
              variant={variant}
              value={50}
              label={`${size}-${variant}`}
              showPercentage
            />
          );

          const progressBar = screen.getByRole('progressbar');
          const percentage = screen.getByText('50%');

          expect(progressBar).toBeInTheDocument();
          expect(percentage).toBeInTheDocument();

          // For small size, label should be visible
          if (size === 'small') {
            const label = screen.getByText(`${size}-${variant}`);
            expect(label).toBeInTheDocument();
          }
          // For medium size, label is not shown when showPercentage is true
          if (size === 'medium') {
            expect(screen.queryByText(`${size}-${variant}`)).not.toBeInTheDocument();
          }

          cleanup();
        });
      });
    });
  });
});
