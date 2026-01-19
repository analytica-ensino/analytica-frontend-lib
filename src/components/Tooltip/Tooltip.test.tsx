import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  describe('Basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('renders tooltip content in DOM (hidden by CSS)', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      // Tooltip is always in DOM but hidden via CSS classes
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass('opacity-0', 'invisible');
    });

    it('renders with custom className on wrapper', () => {
      render(
        <Tooltip content="Tooltip text" className="custom-wrapper-class">
          <button>Hover me</button>
        </Tooltip>
      );
      const wrapper = screen.getByText('Hover me').parentElement;
      expect(wrapper).toHaveClass('custom-wrapper-class');
    });

    it('renders tooltip text content', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  describe('Disabled prop', () => {
    it('does not render tooltip wrapper when disabled is true', () => {
      render(
        <Tooltip content="Tooltip text" disabled>
          <button>Hover me</button>
        </Tooltip>
      );

      // When disabled, only children are rendered (no wrapper)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('renders children directly without wrapper when disabled', () => {
      render(
        <Tooltip content="Tooltip text" disabled>
          <button>Hover me</button>
        </Tooltip>
      );

      const button = screen.getByText('Hover me');
      // Parent should not be the tooltip wrapper div
      expect(button.parentElement?.classList.contains('group')).toBe(false);
    });

    it('renders tooltip when disabled is false', () => {
      render(
        <Tooltip content="Tooltip text" disabled={false}>
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Position variants', () => {
    it('applies top position classes by default', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      expect(tooltip).toHaveClass('mb-2');
    });

    it('applies top position classes when position=top', () => {
      render(
        <Tooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      expect(tooltip).toHaveClass('mb-2');
    });

    it('applies bottom position classes when position=bottom', () => {
      render(
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full');
      expect(tooltip).toHaveClass('mt-2');
    });

    it('applies left position classes when position=left', () => {
      render(
        <Tooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('right-full');
      expect(tooltip).toHaveClass('mr-2');
    });

    it('applies right position classes when position=right', () => {
      render(
        <Tooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('left-full');
      expect(tooltip).toHaveClass('ml-2');
    });
  });

  describe('Accessibility', () => {
    it('has correct role="tooltip" for accessibility', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('tooltip content is accessible to assistive technologies', () => {
      render(
        <Tooltip content="Help information">
          <button>Help</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Help information');
    });
  });

  describe('Custom content', () => {
    it('renders ReactNode content', () => {
      render(
        <Tooltip
          content={
            <div data-testid="custom-content">
              <strong>Bold text</strong>
              <span>Regular text</span>
            </div>
          }
        >
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Regular text')).toBeInTheDocument();
    });

    it('applies custom contentClassName to tooltip', () => {
      render(
        <Tooltip content="Tooltip text" contentClassName="custom-tooltip-class">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip-class');
    });
  });

  describe('Styling', () => {
    it('applies base tooltip styling classes', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('absolute');
      expect(tooltip).toHaveClass('z-50');
      expect(tooltip).toHaveClass('whitespace-nowrap');
      expect(tooltip).toHaveClass('px-4');
      expect(tooltip).toHaveClass('py-2');
      expect(tooltip).toHaveClass('rounded-lg');
      expect(tooltip).toHaveClass('bg-background-900');
      expect(tooltip).toHaveClass('text-white');
      expect(tooltip).toHaveClass('text-sm');
      expect(tooltip).toHaveClass('font-medium');
      expect(tooltip).toHaveClass(
        'shadow-[0px_3px_10px_0px_rgba(38,38,38,0.2)]'
      );
    });

    it('applies CSS hover classes for visibility', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      // Hidden by default
      expect(tooltip).toHaveClass('opacity-0');
      expect(tooltip).toHaveClass('invisible');
      // Has hover classes for visibility
      expect(tooltip).toHaveClass('group-hover:opacity-100');
      expect(tooltip).toHaveClass('group-hover:visible');
    });

    it('applies CSS focus-within classes for accessibility', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('group-focus-within:opacity-100');
      expect(tooltip).toHaveClass('group-focus-within:visible');
    });

    it('applies transition classes', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('transition-opacity');
      expect(tooltip).toHaveClass('duration-150');
    });
  });

  describe('Wrapper element', () => {
    it('applies relative, inline-flex and group classes to wrapper', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('inline-flex');
      expect(wrapper).toHaveClass('group');
    });

    it('uses div element for wrapper', () => {
      render(
        <Tooltip content="Tooltip text">
          <span>Info icon</span>
        </Tooltip>
      );

      const wrapper = screen.getByText('Info icon').parentElement!;
      expect(wrapper.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string content', () => {
      render(
        <Tooltip content="">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('renders correctly with complex children', () => {
      render(
        <Tooltip content="Tooltip text">
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </Tooltip>
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});
