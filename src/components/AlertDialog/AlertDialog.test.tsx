import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  const defaultProps = {
    trigger: <span>Open Dialog</span>,
    title: 'Test Dialog',
    description: 'Dialog content',
  };

  beforeEach(() => {
    // Clear body style after each test
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Restore body style
    document.body.style.overflow = '';
  });

  describe('Basic rendering', () => {
    it('should render trigger button', () => {
      render(<AlertDialog {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Open dialog' })
      ).toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should render with default and custom button labels', async () => {
      const user = userEvent.setup();

      // Test default labels
      const { rerender } = render(<AlertDialog {...defaultProps} />);
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(
        screen.getByRole('button', { name: 'Cancelar' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deletar' })
      ).toBeInTheDocument();

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      // Test custom labels
      rerender(
        <AlertDialog
          {...defaultProps}
          cancelButtonLabel="Não"
          submitButtonLabel="Sim"
        />
      );
      await user.click(trigger);

      expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sim' })).toBeInTheDocument();
    });
  });

  describe('Open/close control', () => {
    it('should close dialog when buttons are clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Close with cancel button
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();

      // Open again
      await user.click(trigger);

      // Close with submit button
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();
    });

    it('should close dialog when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Click on backdrop
      const backdrop = screen.getByTestId('alert-dialog-overlay');
      await user.click(backdrop);

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();
    });

    it('should not close dialog when backdrop is clicked if closeOnBackdropClick is false', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} closeOnBackdropClick={false} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Click on backdrop
      const backdrop = screen.getByTestId('alert-dialog-overlay');
      await user.click(backdrop);

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    });

    it('should close dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Press Escape
      await user.keyboard('{Escape}');

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();
    });

    it('should not close dialog when Escape key is pressed if closeOnEscape is false', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} closeOnEscape={false} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Press Escape
      await user.keyboard('{Escape}');

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    });
  });

  describe('Controlled mode', () => {
    it('should work in controlled mode', async () => {
      const user = userEvent.setup();
      const onOpen = jest.fn();
      const onClose = jest.fn();

      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onOpen={onOpen}
          onClose={onClose}
        />
      );

      // Dialog should be open
      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onOpen when dialog opens in controlled mode', async () => {
      const user = userEvent.setup();
      const onOpen = jest.fn();
      const onClose = jest.fn();

      render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onOpen={onOpen}
          onClose={onClose}
        />
      );

      // Dialog should be closed
      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(onOpen).toHaveBeenCalled();
    });
  });

  describe('Callbacks and values', () => {
    it('should call onSubmit and onCancel with values', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const onCancel = jest.fn();
      const submitValue = 'test-value';
      const cancelValue = 'cancel-value';

      render(
        <AlertDialog
          {...defaultProps}
          onSubmit={onSubmit}
          submitValue={submitValue}
          onCancel={onCancel}
          cancelValue={cancelValue}
        />
      );

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Click on submit
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(submitValue);

      // Open dialog again
      await user.click(trigger);

      // Click on cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith(cancelValue);
    });

    it('should call onSubmit and onCancel without values when not provided', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const onCancel = jest.fn();

      render(
        <AlertDialog
          {...defaultProps}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Click on submit
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(undefined);

      // Open dialog again
      await user.click(trigger);

      // Click on cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Sizes and styles', () => {
    it('should apply different size classes', async () => {
      const user = userEvent.setup();

      // Test extra-small
      const { rerender } = render(
        <AlertDialog {...defaultProps} size="extra-small" />
      );
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      let dialogContent = screen
        .getByTestId('alert-dialog-overlay')
        .querySelector('div');
      expect(dialogContent?.className).toContain('max-w-[324px]');

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      // Test large
      rerender(<AlertDialog {...defaultProps} size="large" />);
      await user.click(trigger);

      dialogContent = screen
        .getByTestId('alert-dialog-overlay')
        .querySelector('div');
      expect(dialogContent?.className).toContain('max-w-[578px]');
    });

    it('should apply custom className and default styling', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} className="custom-class" />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      const dialogContent = screen
        .getByTestId('alert-dialog-overlay')
        .querySelector('.custom-class');
      expect(dialogContent).toBeInTheDocument();

      // Check default styling
      expect(dialogContent?.className).toContain('bg-background');
      expect(dialogContent?.className).toContain('border');
      expect(dialogContent?.className).toContain('rounded-lg');
    });
  });

  describe('Body scroll control', () => {
    it('should prevent and restore body scroll', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(document.body.style.overflow).toBe('hidden');

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body scroll when component unmounts', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Unmount component
      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Ref forwarding', () => {
    it('should forward ref to dialog content', async () => {
      const user = userEvent.setup();
      const ref = jest.fn();

      render(<AlertDialog {...defaultProps} ref={ref} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Event handlers and accessibility', () => {
    it('should handle backdrop events and keyboard accessibility', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(trigger);

      // Test backdrop keydown
      const backdrop = screen.getByTestId('alert-dialog-overlay');
      fireEvent.keyDown(backdrop, { key: 'Escape' });

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();

      // Open dialog again
      await user.click(trigger);

      // Test backdrop click
      const backdrop2 = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(backdrop2);

      expect(
        screen.queryByTestId('alert-dialog-overlay')
      ).not.toBeInTheDocument();

      // Test keyboard events on trigger
      await user.click(trigger);
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      // Test Space key
      await user.click(trigger);
      await user.keyboard(' ');

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', {
        name: 'Open dialog',
      });

      expect(triggerButton).toHaveAttribute('aria-label', 'Open dialog');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid clicks and different trigger elements', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open dialog' });

      // Click rapidly multiple times
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should have only one dialog
      const dialogs = screen.getAllByTestId('alert-dialog-overlay');
      expect(dialogs).toHaveLength(1);

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      // Test rapid open/close cycles
      await user.click(trigger);
      await user.click(cancelButton);
      await user.click(trigger);

      expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    });

    it('should work with different trigger elements', () => {
      render(
        <AlertDialog
          trigger={<div data-testid="custom-trigger">Custom Trigger</div>}
          title="Test"
          description="Test"
        />
      );

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    });
  });
});
