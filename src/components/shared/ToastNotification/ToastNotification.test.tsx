import { render, screen } from '@testing-library/react';
import { ToastNotification } from './ToastNotification';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('ToastNotification', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ToastNotification isOpen={false} onClose={() => {}} title="Test Toast" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <ToastNotification isOpen={true} onClose={() => {}} title="Test Toast" />
    );

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <ToastNotification
        isOpen={true}
        onClose={() => {}}
        title="Test Toast"
        description="This is a description"
      />
    );

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ToastNotification isOpen={true} onClose={onClose} title="Test Toast" />
    );

    const closeButton = screen.getByLabelText('Dismiss notification');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render with success action by default', () => {
    render(
      <ToastNotification isOpen={true} onClose={() => {}} title="Test Toast" />
    );

    const icon = screen.getByTestId('toast-icon-success');
    expect(icon).toBeInTheDocument();
  });

  it('should render with warning action', () => {
    render(
      <ToastNotification
        isOpen={true}
        onClose={() => {}}
        title="Test Toast"
        action="warning"
      />
    );

    const icon = screen.getByTestId('toast-icon-warning');
    expect(icon).toBeInTheDocument();
  });

  it('should render with info action', () => {
    render(
      <ToastNotification
        isOpen={true}
        onClose={() => {}}
        title="Test Toast"
        action="info"
      />
    );

    const icon = screen.getByTestId('toast-icon-info');
    expect(icon).toBeInTheDocument();
  });

  it('should have correct positioning classes', () => {
    const { container } = render(
      <ToastNotification isOpen={true} onClose={() => {}} title="Test Toast" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('fixed', 'top-4', 'left-1/2', 'z-50');
  });

  it('should render with solid variant by default', () => {
    render(
      <ToastNotification isOpen={true} onClose={() => {}} title="Test Toast" />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('should render with outlined variant', () => {
    render(
      <ToastNotification
        isOpen={true}
        onClose={() => {}}
        title="Test Toast"
        variant="outlined"
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });
});
