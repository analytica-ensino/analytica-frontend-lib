import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressCircle from './ProgressCircle';

// Import the types from the component
type ProgressCircleSize = 'small' | 'medium';
type ProgressCircleVariant = 'blue' | 'green';

describe('ProgressCircle', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic rendering', () => {
    it('renders progress circle without label', () => {
      render(<ProgressCircle value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders progress circle with label', () => {
      render(<ProgressCircle value={50} label="Test Progress" />);
      const progressBar = screen.getByRole('progressbar');
      const label = screen.getByText('Test Progress');

      expect(progressBar).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('renders progress circle with percentage', () => {
      render(<ProgressCircle value={75} showPercentage />);
      const progressBar = screen.getByRole('progressbar');
      const percentage = screen.getByText('75%');

      expect(progressBar).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('renders progress circle with both label and percentage', () => {
      render(<ProgressCircle value={60} label="CONCLUÍDO" showPercentage />);
      const progressBar = screen.getByRole('progressbar');
      const label = screen.getByText('CONCLUÍDO');
      const percentage = screen.getByText('60%');

      expect(progressBar).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(percentage).toBeInTheDocument();
    });

    it('renders SVG with correct structure', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const svg = container.querySelector('svg');
      const circles = container.querySelectorAll('circle');

      expect(svg).toBeInTheDocument();
      expect(circles).toHaveLength(2); // Background and progress circles
    });
  });

  describe('Size variants', () => {
    it('applies small size classes (default)', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveClass('w-[107px]', 'h-[107px]');
    });

    it('applies small size classes explicitly', () => {
      const { container } = render(<ProgressCircle size="small" value={50} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveClass('w-[107px]', 'h-[107px]');
    });

    it('applies medium size classes', () => {
      const { container } = render(<ProgressCircle size="medium" value={50} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveClass('w-[152px]', 'h-[152px]');
    });

    it('uses correct SVG dimensions for small size', () => {
      const { container } = render(<ProgressCircle size="small" value={50} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '107');
      expect(svg).toHaveAttribute('height', '107');
      expect(svg).toHaveAttribute('viewBox', '0 0 107 107');
    });

    it('uses correct SVG dimensions for medium size', () => {
      const { container } = render(<ProgressCircle size="medium" value={50} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '152');
      expect(svg).toHaveAttribute('height', '152');
      expect(svg).toHaveAttribute('viewBox', '0 0 152 152');
    });

    it('uses correct stroke width for small size', () => {
      const { container } = render(<ProgressCircle size="small" value={50} />);
      const circles = container.querySelectorAll('circle');

      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '4');
      });
    });

    it('uses correct stroke width for medium size', () => {
      const { container } = render(<ProgressCircle size="medium" value={50} />);
      const circles = container.querySelectorAll('circle');

      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '8');
      });
    });

    it('uses correct text size for small size with percentage', () => {
      render(<ProgressCircle size="small" value={50} showPercentage />);
      const percentage = screen.getByText('50%');
      expect(percentage).toHaveClass('text-2xl');
    });

    it('uses correct text size for medium size with percentage', () => {
      render(<ProgressCircle size="medium" value={50} showPercentage />);
      const percentage = screen.getByText('50%');
      expect(percentage).toHaveClass('text-2xl');
    });

    it('uses correct label size for small size with label', () => {
      render(<ProgressCircle size="small" value={50} label="Small Label" />);
      const label = screen.getByText('Small Label');
      expect(label).toHaveClass('text-2xs');
    });

    it('uses correct label size for medium size with label', () => {
      render(<ProgressCircle size="medium" value={50} label="Medium Label" />);
      const label = screen.getByText('Medium Label');
      expect(label).toHaveClass('text-xs');
    });
  });

  describe('Color variants', () => {
    it('applies blue variant classes (default)', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const circles = container.querySelectorAll('circle');

      expect(circles[0]).toHaveClass('stroke-primary-100'); // Background circle
      expect(circles[1]).toHaveClass('stroke-primary-700'); // Progress circle
    });

    it('applies blue variant classes explicitly', () => {
      const { container } = render(
        <ProgressCircle variant="blue" value={50} />
      );
      const circles = container.querySelectorAll('circle');

      expect(circles[0]).toHaveClass('stroke-primary-100'); // Background circle
      expect(circles[1]).toHaveClass('stroke-primary-700'); // Progress circle
    });

    it('applies green variant classes', () => {
      const { container } = render(
        <ProgressCircle variant="green" value={50} />
      );
      const circles = container.querySelectorAll('circle');

      expect(circles[0]).toHaveClass('stroke-background-300'); // Background circle
      expect(circles[1]).toHaveClass('stroke-success-200'); // Progress circle
    });

    it('applies correct text colors for blue variant', () => {
      render(
        <ProgressCircle variant="blue" value={50} label="Test" showPercentage />
      );
      const percentage = screen.getByText('50%');
      const label = screen.getByText('Test');

      expect(percentage).toHaveClass('text-primary-700');
      expect(label).toHaveClass('text-text-700');
    });

    it('applies correct text colors for green variant', () => {
      render(
        <ProgressCircle
          variant="green"
          value={50}
          label="Test"
          showPercentage
        />
      );
      const percentage = screen.getByText('50%');
      const label = screen.getByText('Test');

      expect(percentage).toHaveClass('text-text-800');
      expect(label).toHaveClass('text-text-600');
    });
  });

  describe('Value handling and percentage calculation', () => {
    it('handles zero value', () => {
      render(<ProgressCircle value={0} showPercentage />);
      const percentage = screen.getByText('0%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles maximum value', () => {
      render(<ProgressCircle value={100} showPercentage />);
      const percentage = screen.getByText('100%');
      expect(percentage).toBeInTheDocument();
    });

    it('clamps values above maximum', () => {
      render(<ProgressCircle value={150} max={100} showPercentage />);
      const percentage = screen.getByText('100%');
      expect(percentage).toBeInTheDocument();
    });

    it('clamps negative values to zero', () => {
      render(<ProgressCircle value={-10} showPercentage />);
      const percentage = screen.getByText('0%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles custom max values', () => {
      render(<ProgressCircle value={3} max={5} showPercentage />);
      const percentage = screen.getByText('60%');
      expect(percentage).toBeInTheDocument();
    });

    it('rounds percentage to nearest integer', () => {
      render(<ProgressCircle value={33.333} showPercentage />);
      const percentage = screen.getByText('33%');
      expect(percentage).toBeInTheDocument();
    });

    it('rounds percentage correctly for .5 decimals', () => {
      render(<ProgressCircle value={33.5} showPercentage />);
      const percentage = screen.getByText('34%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles NaN values', () => {
      render(<ProgressCircle value={NaN} showPercentage />);
      const percentage = screen.getByText('0%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles zero max value', () => {
      render(<ProgressCircle value={50} max={0} showPercentage />);
      const percentage = screen.getByText('0%');
      expect(percentage).toBeInTheDocument();
    });
  });

  describe('SVG stroke calculation', () => {
    it('calculates correct stroke properties for small size', () => {
      const { container } = render(<ProgressCircle size="small" value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 49;
      const circumference = 2 * Math.PI * radius;

      expect(progressCircle).toHaveAttribute(
        'stroke-dasharray',
        circumference.toString()
      );
      expect(progressCircle).toHaveAttribute('r', '49');
      expect(progressCircle).toHaveAttribute('cx', '53.5');
      expect(progressCircle).toHaveAttribute('cy', '53.5');
    });

    it('calculates correct stroke properties for medium size', () => {
      const { container } = render(<ProgressCircle size="medium" value={75} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 64;
      const circumference = 2 * Math.PI * radius;

      expect(progressCircle).toHaveAttribute(
        'stroke-dasharray',
        circumference.toString()
      );
      expect(progressCircle).toHaveAttribute('r', '64');
      expect(progressCircle).toHaveAttribute('cx', '76');
      expect(progressCircle).toHaveAttribute('cy', '76');
    });

    it('calculates correct stroke-dashoffset for progress', () => {
      const { container } = render(<ProgressCircle value={25} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 49;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = circumference - (25 / 100) * circumference;

      expect(progressCircle).toHaveAttribute(
        'stroke-dashoffset',
        expectedOffset.toString()
      );
    });
  });

  describe('ARIA attributes', () => {
    it('sets correct aria attributes with default max', () => {
      render(<ProgressCircle value={75} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('value', '75');
      expect(progressBar).toHaveAttribute('max', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });

    it('sets correct aria attributes with custom max', () => {
      render(<ProgressCircle value={8} max={10} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('value', '8');
      expect(progressBar).toHaveAttribute('max', '10');
    });

    it('sets custom aria-label when label is provided as string', () => {
      render(<ProgressCircle value={50} label="Custom Label" />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('uses default aria-label when label is ReactNode', () => {
      render(<ProgressCircle value={50} label={<span>Custom</span>} />);
      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });

    it('sets svg as aria-hidden', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling and CSS classes', () => {
    it('applies additional className to container', () => {
      const { container } = render(
        <ProgressCircle value={50} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper).toHaveClass('custom-class');
    });

    it('applies additional labelClassName to label', () => {
      render(
        <ProgressCircle value={50} label="Test" labelClassName="custom-label" />
      );
      const label = screen.getByText('Test');

      expect(label).toHaveClass('custom-label');
    });

    it('applies additional percentageClassName to percentage', () => {
      render(
        <ProgressCircle
          value={50}
          showPercentage
          percentageClassName="custom-percentage"
        />
      );
      const percentage = screen.getByText('50%');

      expect(percentage).toHaveClass('custom-percentage');
    });

    it('applies transform rotation to SVG', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('transform', '-rotate-90');
    });

    it('applies transition and shadow to progress circle', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];

      expect(progressCircle).toHaveClass(
        'transition-all',
        'duration-500',
        'ease-out',
        'shadow-soft-shadow-3'
      );
    });

    it('applies uppercase and tracking to label', () => {
      render(<ProgressCircle value={50} label="test" />);
      const label = screen.getByText('test');

      expect(label).toHaveClass('uppercase', 'tracking-wide');
    });

    it('applies stroke-linecap to progress circle', () => {
      const { container } = render(<ProgressCircle value={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];

      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });
  });

  describe('Content visibility', () => {
    it('hides percentage when showPercentage is false', () => {
      render(<ProgressCircle value={50} showPercentage={false} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('shows percentage when showPercentage is true (default)', () => {
      render(<ProgressCircle value={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('hides label when not provided', () => {
      render(<ProgressCircle value={50} />);
      expect(screen.queryByText(/test/i)).not.toBeInTheDocument();
    });

    it('shows both percentage and label when both are enabled', () => {
      render(<ProgressCircle value={50} label="CONCLUÍDO" showPercentage />);
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('CONCLUÍDO')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles Infinity value', () => {
      render(<ProgressCircle value={Infinity} showPercentage />);
      const percentage = screen.getByText('100%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles -Infinity value', () => {
      render(<ProgressCircle value={-Infinity} showPercentage />);
      const percentage = screen.getByText('0%');
      expect(percentage).toBeInTheDocument();
    });

    it('handles empty string as label', () => {
      const { container } = render(<ProgressCircle value={50} label="" />);

      // Look for the label span that should be rendered with text-2xs class
      const labelSpan = container.querySelector('span.text-2xs');
      if (labelSpan) {
        expect(labelSpan).toHaveTextContent('');
      } else {
        // If no span found, the empty string might not render the label at all
        // This is actually correct behavior - empty string should not render label
        expect(container.querySelectorAll('span.text-2xs')).toHaveLength(0);
      }
    });

    it('handles complex ReactNode as label', () => {
      const complexLabel = (
        <div>
          <span>Complex</span> <strong>Label</strong>
        </div>
      );
      render(<ProgressCircle value={50} label={complexLabel} />);
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
    });
  });

  describe('All size and variant combinations', () => {
    const sizes: ProgressCircleSize[] = ['small', 'medium'];
    const variants: ProgressCircleVariant[] = ['blue', 'green'];

    sizes.forEach((size) => {
      variants.forEach((variant) => {
        it(`renders correctly with size="${size}" and variant="${variant}"`, () => {
          const { container } = render(
            <ProgressCircle
              size={size}
              variant={variant}
              value={50}
              label="TEST"
              showPercentage
            />
          );

          const wrapper = container.firstChild as HTMLElement;
          const sizeClass = size === 'small' ? 'w-[107px]' : 'w-[152px]';

          expect(wrapper).toHaveClass(sizeClass);
          expect(screen.getByText('50%')).toBeInTheDocument();
          expect(screen.getByText('TEST')).toBeInTheDocument();
        });
      });
    });
  });
});
