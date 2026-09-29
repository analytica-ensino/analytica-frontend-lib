import { render, screen, fireEvent } from '@testing-library/react';
import ResizableDivider, {
  type ResizableDividerProps,
} from './ResizableDivider';

const baseProps: ResizableDividerProps = {
  value: 480,
  min: 400,
  max: 900,
  disabled: false,
  isDragging: false,
  label: 'Redimensionar prévia',
  onPointerDown: jest.fn(),
  onPointerMove: jest.fn(),
  onPointerUp: jest.fn(),
  onKeyDown: jest.fn(),
  onDoubleClick: jest.fn(),
};

const renderDivider = (props: Partial<ResizableDividerProps> = {}) =>
  render(<ResizableDivider {...baseProps} {...props} />);

describe('ResizableDivider', () => {
  beforeEach(jest.clearAllMocks);

  describe('accessibility', () => {
    it('should expose the window splitter role and orientation', () => {
      renderDivider();

      const divider = screen.getByRole('separator', {
        name: 'Redimensionar prévia',
      });
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should expose the current width and its bounds', () => {
      renderDivider();

      const divider = screen.getByTestId('resizable-divider');
      expect(divider).toHaveAttribute('aria-valuenow', '480');
      expect(divider).toHaveAttribute('aria-valuemin', '400');
      expect(divider).toHaveAttribute('aria-valuemax', '900');
    });

    it('should be reachable by keyboard', () => {
      renderDivider();

      expect(screen.getByTestId('resizable-divider')).toHaveAttribute(
        'tabindex',
        '0'
      );
    });

    it('should be skipped by the tab order when disabled', () => {
      renderDivider({ disabled: true });

      const divider = screen.getByTestId('resizable-divider');
      expect(divider).toHaveAttribute('tabindex', '-1');
      expect(divider).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not claim to be disabled when it is usable', () => {
      renderDivider();

      expect(screen.getByTestId('resizable-divider')).not.toHaveAttribute(
        'aria-disabled'
      );
    });
  });

  describe('interaction', () => {
    it('should forward the pointer down', () => {
      renderDivider();

      fireEvent.pointerDown(screen.getByTestId('resizable-divider'));

      expect(baseProps.onPointerDown).toHaveBeenCalled();
    });

    it('should forward the pointer move', () => {
      renderDivider();

      fireEvent.pointerMove(screen.getByTestId('resizable-divider'));

      expect(baseProps.onPointerMove).toHaveBeenCalled();
    });

    it('should forward the pointer up', () => {
      renderDivider();

      fireEvent.pointerUp(screen.getByTestId('resizable-divider'));

      expect(baseProps.onPointerUp).toHaveBeenCalled();
    });

    it('should end the drag when the pointer capture is lost', () => {
      renderDivider();

      fireEvent.lostPointerCapture(screen.getByTestId('resizable-divider'));

      // Sem isso um arraste interrompido pelo sistema deixaria o divisor preso.
      expect(baseProps.onPointerUp).toHaveBeenCalled();
    });

    it('should forward the keyboard', () => {
      renderDivider();

      fireEvent.keyDown(screen.getByTestId('resizable-divider'), {
        key: 'ArrowLeft',
      });

      expect(baseProps.onKeyDown).toHaveBeenCalled();
    });

    it('should forward the double click', () => {
      renderDivider();

      fireEvent.doubleClick(screen.getByTestId('resizable-divider'));

      expect(baseProps.onDoubleClick).toHaveBeenCalled();
    });
  });

  describe('appearance', () => {
    it('should keep the 1px footprint of the static divider', () => {
      renderDivider();

      const divider = screen.getByTestId('resizable-divider');
      expect(divider).toHaveClass('w-px');
      expect(divider).toHaveClass('flex-shrink-0');
    });

    it('should show the resize cursor on the hit area', () => {
      const { container } = renderDivider();

      expect(container.querySelector('.cursor-col-resize')).toBeInTheDocument();
    });

    it('should drop the resize cursor when disabled', () => {
      const { container } = renderDivider({ disabled: true });

      expect(container.querySelector('.cursor-col-resize')).toBeNull();
    });

    it('should flag the dragging state for styling', () => {
      renderDivider({ isDragging: true });

      expect(screen.getByTestId('resizable-divider')).toHaveAttribute(
        'data-dragging',
        'true'
      );
    });

    it('should not flag the dragging state at rest', () => {
      renderDivider();

      expect(screen.getByTestId('resizable-divider')).not.toHaveAttribute(
        'data-dragging'
      );
    });

    it('should accept extra classes', () => {
      renderDivider({ className: 'custom-class' });

      expect(screen.getByTestId('resizable-divider')).toHaveClass(
        'custom-class'
      );
    });

    it('should hide the decorative layers from assistive tech', () => {
      const { container } = renderDivider();

      const decorations = container.querySelectorAll(
        'span[aria-hidden="true"]'
      );
      expect(decorations).toHaveLength(2);
    });
  });
});
