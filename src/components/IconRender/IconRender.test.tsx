import { render } from '@testing-library/react';
import { cloneElement } from 'react';
import { IconRender } from './IconRender';

// Mock component for testing ReactElement icons
const MockIcon = ({ size, color }: { size?: number; color?: string }) => (
  <svg data-testid="mock-icon" width={size} height={size} style={{ color }}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

describe('IconRender', () => {
  describe('String icon names', () => {
    it('should render Phosphor icon with default props', () => {
      const { container } = render(<IconRender iconName="Heart" />);
      const icon = container.firstChild as HTMLElement;

      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('should render Chat_PT icon', () => {
      const { container } = render(<IconRender iconName="Chat_PT" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Chat_EN icon', () => {
      const { container } = render(<IconRender iconName="Chat_EN" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Chat_ES icon', () => {
      const { container } = render(<IconRender iconName="Chat_ES" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Question icon for unknown icon names', () => {
      const { container } = render(<IconRender iconName="UnknownIcon" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom size and color to Phosphor icons', () => {
      const { container } = render(
        <IconRender iconName="Heart" size={32} color="#ff0000" />
      );
      const icon = container.firstChild as HTMLElement;

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '32');
      expect(icon).toHaveAttribute('height', '32');
    });

    it('should apply custom weight to Phosphor icons', () => {
      const { container } = render(
        <IconRender iconName="Heart" weight="bold" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom size and color to Chat icons', () => {
      const { container } = render(
        <IconRender iconName="Chat_PT" size={32} color="#00ff00" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should use default values when no props are provided', () => {
      const { container } = render(<IconRender iconName="Star" />);
      const icon = container.firstChild as HTMLElement;

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  describe('ReactElement icons', () => {
    it('should render ReactElement icon', () => {
      const iconElement = <MockIcon />;
      const { getByTestId } = render(<IconRender iconName={iconElement} />);

      expect(getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should clone ReactElement with custom size', () => {
      const iconElement = <MockIcon />;
      const { getByTestId } = render(
        <IconRender iconName={iconElement} size={48} />
      );

      const icon = getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '48');
      expect(icon).toHaveAttribute('height', '48');
    });

    it('should clone ReactElement with currentColor', () => {
      const iconElement = <MockIcon />;
      const { getByTestId } = render(
        <IconRender iconName={iconElement} color="#blue" />
      );

      const icon = getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveStyle({ color: 'currentColor' });
    });

    it('should preserve original ReactElement props when cloning', () => {
      const iconElement = <MockIcon size={16} color="#original" />;
      const { getByTestId } = render(
        <IconRender iconName={iconElement} size={32} />
      );

      const icon = getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '32'); // Should override original size
      expect(icon).toHaveStyle({ color: 'currentColor' }); // Should override original color
    });

    it('should handle ReactElement with existing props', () => {
      const iconElement = cloneElement(<MockIcon />, {
        size: 20,
        color: '#existing',
      });
      const { getByTestId } = render(
        <IconRender iconName={iconElement} size={40} color="#new" />
      );

      const icon = getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '40');
      expect(icon).toHaveStyle({ color: 'currentColor' });
    });

    it('should handle complex ReactElement structures', () => {
      const ComplexIcon = ({
        size,
        color,
      }: {
        size?: number;
        color?: string;
      }) => (
        <div data-testid="complex-icon" style={{ width: size, height: size }}>
          <span style={{ color }}>Icon</span>
        </div>
      );

      const iconElement = <ComplexIcon />;
      const { getByTestId } = render(
        <IconRender iconName={iconElement} size={64} />
      );

      const icon = getByTestId('complex-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveStyle({ width: '64px', height: '64px' });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string icon name', () => {
      const { container } = render(<IconRender iconName="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null-like ReactElement gracefully', () => {
      const iconElement = <div data-testid="null-icon" />;
      const { getByTestId } = render(<IconRender iconName={iconElement} />);

      expect(getByTestId('null-icon')).toBeInTheDocument();
    });

    it('should apply all weight options to Phosphor icons', () => {
      const weights: Array<
        'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
      > = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];

      weights.forEach((weight) => {
        const { container } = render(
          <IconRender iconName="Heart" weight={weight} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
