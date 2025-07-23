import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertDialog } from './AlertDialog';
import Button from '../Button/Button';

describe('AlertDialog', () => {
  const defaultProps = {
    trigger: <Button>Open Dialog</Button>,
    title: 'Test Dialog',
    description: 'This is a test dialog',
    cancelButtonLabel: 'Cancel',
    submitButtonLabel: 'Confirm',
  };

  let originalOverflow: string;

  beforeEach(() => {
    jest.clearAllMocks();
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe('Rendering', () => {
    it('should render trigger button', () => {
      render(<AlertDialog {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Open Dialog' })
      ).toBeInTheDocument();
    });

    it('should not render dialog content initially', () => {
      render(<AlertDialog {...defaultProps} />);

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      expect(
        screen.queryByText('This is a test dialog')
      ).not.toBeInTheDocument();
    });

    it('should render dialog content when opened', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Confirm' })
      ).toBeInTheDocument();
    });

    it('should render with default button labels', () => {
      render(
        <AlertDialog
          trigger={<Button>Open</Button>}
          title="Test"
          description="Test description"
        />
      );

      const triggerButton = screen.getByRole('button', { name: 'Open' });
      fireEvent.click(triggerButton);

      expect(
        screen.getByRole('button', { name: 'Cancelar' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deletar' })
      ).toBeInTheDocument();
    });

    it('should render with custom button labels', () => {
      render(
        <AlertDialog
          {...defaultProps}
          cancelButtonLabel="No"
          submitButtonLabel="Yes"
        />
      );

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should use controlled state when isOpen is provided', () => {
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

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should not render when controlled isOpen is false', () => {
      render(<AlertDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should call onOpen when dialog opens through trigger click in controlled mode', () => {
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

      expect(onOpen).not.toHaveBeenCalled();

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when dialog closes through button click in controlled mode', () => {
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

      expect(onClose).not.toHaveBeenCalled();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Uncontrolled Mode', () => {
    it('should open dialog when trigger is clicked', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should close dialog when cancel button is clicked', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when submit button is clicked', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onSubmit when submit button is clicked', () => {
      const onSubmit = jest.fn();
      render(<AlertDialog {...defaultProps} onSubmit={onSubmit} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(undefined);
    });

    it('should call onSubmit with submitValue when provided', () => {
      const onSubmit = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onSubmit={onSubmit}
          submitValue="test-value"
        />
      );

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('test-value');
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn();
      render(<AlertDialog {...defaultProps} onCancel={onCancel} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onCancel).toHaveBeenCalledWith(undefined);
    });

    it('should call onCancel with cancelValue when provided', () => {
      const onCancel = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onCancel={onCancel}
          cancelValue="cancel-value"
        />
      );

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith('cancel-value');
    });
  });

  describe('Backdrop and Escape Key', () => {
    it('should close dialog when backdrop is clicked', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(overlay);

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should not close dialog when backdrop is clicked and closeOnBackdropClick is false', () => {
      render(<AlertDialog {...defaultProps} closeOnBackdropClick={false} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(overlay);

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should close dialog when Escape key is pressed', async () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      });
    });

    it('should not close dialog when Escape key is pressed and closeOnEscape is false', async () => {
      render(<AlertDialog {...defaultProps} closeOnEscape={false} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      });
    });

    it('should handle backdrop keydown event', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should not close dialog when backdrop keydown is not Escape', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Management', () => {
    it('should hide body overflow when dialog is open', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when dialog is closed', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body overflow on unmount', () => {
      const { unmount } = render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Size Variants', () => {
    it('should apply extra-small size classes', () => {
      render(<AlertDialog {...defaultProps} size="extra-small" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[324px]');
    });

    it('should apply small size classes', () => {
      render(<AlertDialog {...defaultProps} size="small" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[378px]');
    });

    it('should apply medium size classes (default)', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[459px]');
    });

    it('should apply large size classes', () => {
      render(<AlertDialog {...defaultProps} size="large" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[578px]');
    });

    it('should apply extra-large size classes', () => {
      render(<AlertDialog {...defaultProps} size="extra-large" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[912px]');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<AlertDialog {...defaultProps} className="custom-class" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      const dialogContent = screen.getByText('Test Dialog').closest('div');
      expect(dialogContent).toHaveClass('custom-class');
    });

    it('should apply additional props to dialog content', () => {
      render(<AlertDialog {...defaultProps} data-testid="custom-dialog" />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(screen.getByText('Test Dialog')).toHaveAttribute(
        'id',
        'alert-dialog-title'
      );
      expect(screen.getByText('This is a test dialog')).toHaveAttribute(
        'id',
        'alert-dialog-description'
      );
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to dialog content', () => {
      const ref = jest.fn();
      render(<AlertDialog {...defaultProps} ref={ref} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle trigger click when dialog is already open', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);
      fireEvent.click(triggerButton); // Click again

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks on trigger', () => {
      render(<AlertDialog {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);
      fireEvent.click(triggerButton);
      fireEvent.click(triggerButton);

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should handle complex trigger elements', () => {
      const complexTrigger = (
        <div>
          <span>Complex</span>
          <Button>Trigger</Button>
        </div>
      );

      render(<AlertDialog {...defaultProps} trigger={complexTrigger} />);

      const triggerButton = screen.getByRole('button', { name: 'Trigger' });
      fireEvent.click(triggerButton);

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should handle undefined callback functions', () => {
      render(
        <AlertDialog
          {...defaultProps}
          onSubmit={undefined}
          onCancel={undefined}
          onOpen={undefined}
          onClose={undefined}
        />
      );

      const triggerButton = screen.getByRole('button', { name: 'Open Dialog' });
      fireEvent.click(triggerButton);

      // Should open dialog
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: 'Confirm' });

      // Should close dialog when submit is clicked
      fireEvent.click(submitButton);
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });
  });
});
