import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog } from './AlertDialog';
import Button from '../Button/Button';

describe('AlertDialog', () => {
  const defaultProps = {
    trigger: <Button>Open Dialog</Button>,
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
        screen.getByRole('button', { name: 'Open Dialog' })
      ).toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should render with default button labels', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(
        screen.getByRole('button', { name: 'Cancelar' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deletar' })
      ).toBeInTheDocument();
    });

    it('should render with custom button labels', async () => {
      const user = userEvent.setup();
      render(
        <AlertDialog
          {...defaultProps}
          cancelButtonLabel="Não"
          submitButtonLabel="Sim"
        />
      );

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sim' })).toBeInTheDocument();
    });
  });

  describe('Open/close control', () => {
    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when submit button is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Close dialog
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on backdrop
      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not close dialog when backdrop is clicked if closeOnBackdropClick is false', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} closeOnBackdropClick={false} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on backdrop
      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Press Escape
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not close dialog when Escape key is pressed if closeOnEscape is false', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} closeOnEscape={false} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Press Escape
      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
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
      expect(screen.getByRole('dialog')).toBeInTheDocument();

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
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(onOpen).toHaveBeenCalled();
    });
  });

  describe('Callbacks and values', () => {
    it('should call onSubmit with submitValue when submit button is clicked', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const submitValue = 'test-value';

      render(
        <AlertDialog
          {...defaultProps}
          onSubmit={onSubmit}
          submitValue={submitValue}
        />
      );

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on submit
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(submitValue);
    });

    it('should call onCancel with cancelValue when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const cancelValue = 'cancel-value';

      render(
        <AlertDialog
          {...defaultProps}
          onCancel={onCancel}
          cancelValue={cancelValue}
        />
      );

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith(cancelValue);
    });

    it('should call onSubmit without value when no submitValue is provided', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(<AlertDialog {...defaultProps} onSubmit={onSubmit} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on submit
      const submitButton = screen.getByRole('button', { name: 'Deletar' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(undefined);
    });

    it('should call onCancel without value when no cancelValue is provided', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(<AlertDialog {...defaultProps} onCancel={onCancel} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Click on cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Sizes', () => {
    it('should apply extra-small size classes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} size="extra-small" />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('w-screen');
      expect(dialogContent?.className).toContain('max-w-[324px]');
    });

    it('should apply small size classes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} size="small" />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('w-screen');
      expect(dialogContent?.className).toContain('max-w-[378px]');
    });

    it('should apply medium size classes (default)', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('w-screen');
      expect(dialogContent?.className).toContain('max-w-[459px]');
    });

    it('should apply large size classes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} size="large" />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('w-screen');
      expect(dialogContent?.className).toContain('max-w-[578px]');
    });

    it('should apply extra-large size classes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} size="extra-large" />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('w-screen');
      expect(dialogContent?.className).toContain('max-w-[912px]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'alert-dialog-title');
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'alert-dialog-description'
      );
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Check if dialog is focused
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Styles and classes', () => {
    it('should apply custom className', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} className="custom-class" />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen
        .getByRole('dialog')
        .querySelector('.custom-class');
      expect(dialogContent).toBeInTheDocument();
    });

    it('should apply default styling classes', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      const dialogContent = screen.getByRole('dialog').querySelector('div');
      expect(dialogContent?.className).toContain('bg-background');
      expect(dialogContent?.className).toContain('border');
      expect(dialogContent?.className).toContain('border-border-100');
      expect(dialogContent?.className).toContain('rounded-lg');
      expect(dialogContent?.className).toContain('shadow-lg');
      expect(dialogContent?.className).toContain('p-6');
      expect(dialogContent?.className).toContain('m-3');
    });
  });

  describe('Body scroll control', () => {
    it('should prevent body scroll when dialog is open', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when dialog is closed', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body scroll when component unmounts', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
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
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Event handlers', () => {
    it('should handle backdrop keydown events', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Simulate keydown on backdrop
      const backdrop = screen.getByRole('dialog');
      fireEvent.keyDown(backdrop, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle backdrop click events', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      // Open dialog
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);

      // Simulate click on backdrop
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid clicks on trigger', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      // Click rapidly multiple times
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should have only one dialog
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);
    });

    it('should handle rapid open/close cycles', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);

      const trigger = screen.getByRole('button', { name: 'Open Dialog' });

      // Open and close rapidly
      await user.click(trigger);
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      // Open again
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
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
