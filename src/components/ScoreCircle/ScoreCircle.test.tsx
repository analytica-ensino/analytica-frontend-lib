import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreCircle from './ScoreCircle';

describe('ScoreCircle', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic rendering', () => {
    it('renders the value and "de {max}" label', () => {
      render(<ScoreCircle value={800} max={1000} />);
      expect(screen.getByText('800')).toBeInTheDocument();
      expect(screen.getByText('de 1000')).toBeInTheDocument();
    });

    it('defaults max to 1000 when omitted', () => {
      render(<ScoreCircle value={600} />);
      expect(screen.getByText('de 1000')).toBeInTheDocument();
    });

    it('renders optional label and labelIcon', () => {
      render(
        <ScoreCircle
          value={800}
          max={1000}
          label="Nota final"
          labelIcon={<span data-testid="lightbulb">💡</span>}
        />
      );

      expect(screen.getByText('Nota final')).toBeInTheDocument();
      expect(screen.getByTestId('lightbulb')).toBeInTheDocument();
    });

    it('does not render the label container when no label nor icon', () => {
      render(<ScoreCircle value={50} max={100} />);
      expect(screen.queryByText('Nota final')).not.toBeInTheDocument();
    });
  });

  describe('Clamping and percentage calculation', () => {
    it('clamps values above max', () => {
      render(<ScoreCircle value={1200} max={1000} />);
      expect(screen.getByText('1200')).toBeInTheDocument();
      const region = screen.getByRole('img');
      expect(region).toHaveAttribute('aria-label', '1200 de 1000');
    });

    it('clamps negative values to 0 (visual only, value text preserved)', () => {
      render(<ScoreCircle value={-50} max={1000} />);
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('handles max=0 safely (no NaN)', () => {
      const { container } = render(<ScoreCircle value={10} max={0} />);
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(2);
    });
  });

  describe('Variants', () => {
    it('uses green stroke by default', () => {
      const { container } = render(<ScoreCircle value={500} />);
      const fillCircle = container.querySelectorAll('circle')[1];
      expect(fillCircle).toHaveClass('stroke-success-200');
    });

    it('applies blue variant', () => {
      const { container } = render(<ScoreCircle value={500} variant="blue" />);
      const fillCircle = container.querySelectorAll('circle')[1];
      expect(fillCircle).toHaveClass('stroke-primary-700');
    });

    it('applies warning variant', () => {
      const { container } = render(
        <ScoreCircle value={500} variant="warning" />
      );
      const fillCircle = container.querySelectorAll('circle')[1];
      expect(fillCircle).toHaveClass('stroke-warning-300');
    });
  });

  describe('Sizing', () => {
    it('applies default size 180', () => {
      const { container } = render(<ScoreCircle value={500} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe('180px');
      expect(wrapper.style.height).toBe('180px');
    });

    it('applies custom size', () => {
      const { container } = render(<ScoreCircle value={500} size={240} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe('240px');
    });
  });

  describe('Accessibility', () => {
    it('has img role with aria-label combining label and score', () => {
      render(<ScoreCircle value={800} max={1000} label="Nota final" />);
      const region = screen.getByRole('img');
      expect(region).toHaveAttribute('aria-label', 'Nota final: 800 de 1000');
    });

    it('falls back to "X de Y" aria-label without label prop', () => {
      render(<ScoreCircle value={600} max={800} />);
      const region = screen.getByRole('img');
      expect(region).toHaveAttribute('aria-label', '600 de 800');
    });
  });
});
