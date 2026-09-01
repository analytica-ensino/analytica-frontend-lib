import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import DragHandleButton from './DragHandleButton';

describe('DragHandleButton', () => {
  it('renders a real button carrying the accessible name', () => {
    render(<DragHandleButton aria-label="Reordenar Biologia" />);

    const handle = screen.getByRole('button', { name: 'Reordenar Biologia' });
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute('type', 'button');
    expect(handle).toHaveAttribute('draggable', 'true');
  });

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DragHandleButton aria-label="Reordenar" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  describe('drag', () => {
    it('puts dragData on the dataTransfer as text/plain', () => {
      const setData = jest.fn();
      render(<DragHandleButton aria-label="Reordenar" dragData="item-1" />);

      fireEvent.dragStart(screen.getByRole('button'), {
        dataTransfer: { setData },
      });

      expect(setData).toHaveBeenCalledWith('text/plain', 'item-1');
    });

    it('leaves the dataTransfer alone when there is no dragData', () => {
      const setData = jest.fn();
      render(<DragHandleButton aria-label="Reordenar" />);

      fireEvent.dragStart(screen.getByRole('button'), {
        dataTransfer: { setData },
      });

      expect(setData).not.toHaveBeenCalled();
    });

    it('still calls a consumer onDragStart', () => {
      const onDragStart = jest.fn();
      render(
        <DragHandleButton
          aria-label="Reordenar"
          dragData="item-1"
          onDragStart={onDragStart}
        />
      );

      fireEvent.dragStart(screen.getByRole('button'), {
        dataTransfer: { setData: jest.fn() },
      });

      expect(onDragStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard', () => {
    it('moves up on ArrowUp and down on ArrowDown', async () => {
      const onMove = jest.fn();
      render(<DragHandleButton aria-label="Reordenar" onMove={onMove} />);

      const handle = screen.getByRole('button');
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });

      expect(onMove).toHaveBeenNthCalledWith(1, -1);
      expect(onMove).toHaveBeenNthCalledWith(2, 1);
    });

    it('prevents the default so the page does not scroll with the item', () => {
      render(<DragHandleButton aria-label="Reordenar" onMove={jest.fn()} />);

      const event = createEvent();
      fireEvent(screen.getByRole('button'), event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const onMove = jest.fn();
      render(<DragHandleButton aria-label="Reordenar" onMove={onMove} />);

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

      expect(onMove).not.toHaveBeenCalled();
    });

    it('still calls a consumer onKeyDown', () => {
      const onKeyDown = jest.fn();
      render(
        <DragHandleButton
          aria-label="Reordenar"
          onMove={jest.fn()}
          onKeyDown={onKeyDown}
        />
      );

      fireEvent.keyDown(screen.getByRole('button'), { key: 'ArrowUp' });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('does nothing without onMove', () => {
      render(<DragHandleButton aria-label="Reordenar" />);

      expect(() =>
        fireEvent.keyDown(screen.getByRole('button'), { key: 'ArrowUp' })
      ).not.toThrow();
    });
  });

  describe('states and styling', () => {
    it('is not draggable when disabled', () => {
      render(<DragHandleButton aria-label="Reordenar" disabled />);

      const handle = screen.getByRole('button');
      expect(handle).toBeDisabled();
      expect(handle).toHaveAttribute('draggable', 'false');
    });

    it('applies the size classes', () => {
      const { rerender } = render(
        <DragHandleButton aria-label="Reordenar" size="sm" />
      );
      expect(screen.getByRole('button')).toHaveClass('w-6', 'h-6');

      rerender(<DragHandleButton aria-label="Reordenar" size="md" />);
      expect(screen.getByRole('button')).toHaveClass('w-10', 'h-10');
    });

    it('signals dragging through the cursor', () => {
      render(<DragHandleButton aria-label="Reordenar" />);

      expect(screen.getByRole('button')).toHaveClass('cursor-grab');
    });

    it('merges an extra className', () => {
      render(<DragHandleButton aria-label="Reordenar" className="shrink-0" />);

      expect(screen.getByRole('button')).toHaveClass('shrink-0');
    });

    it('accepts a custom icon', () => {
      render(
        <DragHandleButton
          aria-label="Reordenar"
          icon={<span data-testid="custom-icon" />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  it('is reachable by keyboard, being a native button', async () => {
    const user = userEvent.setup();
    render(<DragHandleButton aria-label="Reordenar" />);

    await user.tab();

    expect(screen.getByRole('button')).toHaveFocus();
  });
});

/** keydown de ArrowUp que consegue reportar se o default foi prevenido */
function createEvent() {
  return new KeyboardEvent('keydown', {
    key: 'ArrowUp',
    bubbles: true,
    cancelable: true,
  });
}
