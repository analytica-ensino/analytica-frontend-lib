import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('does not show tooltip content initially', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
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
  });

  describe('Mouse interactions', () => {
    it('shows tooltip on mouse enter', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      await user.unhover(wrapper);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Focus interactions', () => {
    it('shows tooltip on focus', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Focus me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Focus me').parentElement!;
      fireEvent.focus(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    it('hides tooltip on blur', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Focus me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Focus me').parentElement!;
      fireEvent.focus(wrapper);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.blur(wrapper);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Disabled prop', () => {
    it('does not show tooltip when disabled is true', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" disabled>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip when disabled is false', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" disabled={false}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Delay prop', () => {
    it('shows tooltip immediately when delay is 0', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('shows tooltip after delay when delay is set', () => {
      render(
        <Tooltip content="Tooltip text" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(wrapper);

      // Should not show immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Advance time by 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now tooltip should be visible
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('cancels delay timeout on mouse leave', () => {
      render(
        <Tooltip content="Tooltip text" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;

      // Mouse enter
      fireEvent.mouseEnter(wrapper);

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Mouse leave before delay completes
      fireEvent.mouseLeave(wrapper);

      // Advance time past the original delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Tooltip should not be visible
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Position variants', () => {
    it('applies top position classes by default', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      expect(tooltip).toHaveClass('mb-2');
    });

    it('applies top position classes when position=top', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      expect(tooltip).toHaveClass('mb-2');
    });

    it('applies bottom position classes when position=bottom', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full');
      expect(tooltip).toHaveClass('mt-2');
    });

    it('applies left position classes when position=left', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('right-full');
      expect(tooltip).toHaveClass('mr-2');
    });

    it('applies right position classes when position=right', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('left-full');
      expect(tooltip).toHaveClass('ml-2');
    });
  });

  describe('Accessibility', () => {
    it('has correct role="tooltip" for accessibility', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('can be accessed by assistive technologies', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Help information">
          <button aria-describedby="tooltip-content">Help</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Help').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Help information');
    });
  });

  describe('Custom content', () => {
    it('renders ReactNode content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Regular text')).toBeInTheDocument();
    });

    it('applies custom contentClassName to tooltip', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text" contentClassName="custom-tooltip-class">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip-class');
    });
  });

  describe('Styling', () => {
    it('applies base tooltip styling classes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

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

    it('applies animation classes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('animate-in');
      expect(tooltip).toHaveClass('fade-in-0');
      expect(tooltip).toHaveClass('zoom-in-95');
      expect(tooltip).toHaveClass('duration-150');
    });
  });

  describe('Wrapper element', () => {
    it('applies relative and inline-flex classes to wrapper', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('inline-flex');
    });

    it('has proper accessibility attributes on wrapper', () => {
      render(
        <Tooltip content="Tooltip text">
          <span>Info icon</span>
        </Tooltip>
      );

      const wrapper = screen.getByText('Info icon').parentElement!;
      expect(wrapper).toHaveAttribute('tabIndex', '0');
    });

    it('uses span element for wrapper', () => {
      render(
        <Tooltip content="Tooltip text">
          <span>Info icon</span>
        </Tooltip>
      );

      const wrapper = screen.getByText('Info icon').parentElement!;
      expect(wrapper.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(
        <Tooltip content="">
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      await user.hover(wrapper);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('handles rapid hover and unhover', () => {
      render(
        <Tooltip content="Tooltip text" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;

      // Rapid mouse enter/leave cycles
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseEnter(wrapper);
        act(() => {
          jest.advanceTimersByTime(50);
        });
        fireEvent.mouseLeave(wrapper);
      }

      // Tooltip should not be visible after rapid cycles
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('cleans up timeout on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Tooltip text" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const wrapper = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(wrapper);

      // Unmount before timeout completes
      unmount();

      // Advance timers - should not throw or cause issues
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
});
