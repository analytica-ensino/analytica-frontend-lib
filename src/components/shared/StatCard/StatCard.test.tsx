import { render, screen } from '@testing-library/react';
import { StatCard, variantConfig } from './StatCard';

describe('StatCard', () => {
  describe('rendering', () => {
    it('should render label and value correctly', () => {
      render(<StatCard label="Test Label" value="123" variant="score" />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render numeric value correctly', () => {
      render(<StatCard label="Count" value={42} variant="correct" />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatCard
          label="Test"
          value="10"
          variant="incorrect"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('should apply score variant styles', () => {
      const { container } = render(
        <StatCard label="NOTA" value="8.5" variant="score" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(variantConfig.score.bg);
    });

    it('should apply correct variant styles', () => {
      const { container } = render(
        <StatCard label="CORRETAS" value={10} variant="correct" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(variantConfig.correct.bg);
    });

    it('should apply incorrect variant styles', () => {
      const { container } = render(
        <StatCard label="INCORRETAS" value={2} variant="incorrect" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(variantConfig.incorrect.bg);
    });
  });

  describe('icon rendering', () => {
    it('should render Star icon for score variant', () => {
      const { container } = render(
        <StatCard label="Score" value="10" variant="score" />
      );

      // Check that the icon container exists
      const iconContainer = container.querySelector(
        `.${variantConfig.score.iconBg.replace('bg-', 'bg-')}`
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render Medal icon for correct variant', () => {
      const { container } = render(
        <StatCard label="Correct" value={5} variant="correct" />
      );

      const iconContainer = container.querySelector(
        `.${variantConfig.correct.iconBg.replace('bg-', 'bg-')}`
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render WarningCircle icon for incorrect variant', () => {
      const { container } = render(
        <StatCard label="Incorrect" value={3} variant="incorrect" />
      );

      const iconContainer = container.querySelector(
        `.${variantConfig.incorrect.iconBg.replace('bg-', 'bg-')}`
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('variantConfig', () => {
    it('should have correct configuration for score variant', () => {
      expect(variantConfig.score.bg).toBe('bg-warning-background');
      expect(variantConfig.score.text).toBe('text-warning-600');
      expect(variantConfig.score.iconBg).toBe('bg-warning-300');
      expect(variantConfig.score.iconColor).toBe('text-white');
      expect(variantConfig.score.IconComponent).toBeDefined();
    });

    it('should have correct configuration for correct variant', () => {
      expect(variantConfig.correct.bg).toBe('bg-success-200');
      expect(variantConfig.correct.text).toBe('text-success-700');
      expect(variantConfig.correct.iconBg).toBe('bg-indicator-positive');
      expect(variantConfig.correct.iconColor).toBe('text-text-950');
      expect(variantConfig.correct.IconComponent).toBeDefined();
    });

    it('should have correct configuration for incorrect variant', () => {
      expect(variantConfig.incorrect.bg).toBe('bg-error-100');
      expect(variantConfig.incorrect.text).toBe('text-error-700');
      expect(variantConfig.incorrect.iconBg).toBe('bg-indicator-negative');
      expect(variantConfig.incorrect.iconColor).toBe('text-white');
      expect(variantConfig.incorrect.IconComponent).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('should render label in uppercase', () => {
      render(<StatCard label="test label" value="10" variant="score" />);

      const label = screen.getByText('test label');
      expect(label).toHaveClass('uppercase');
    });

    it('should center the content', () => {
      const { container } = render(
        <StatCard label="Test" value="10" variant="score" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('items-center');
      expect(card).toHaveClass('justify-center');
    });
  });
});
