import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toaster, { useToast } from './Toaster';
import useToastStore from './ToastStore';

describe('Toaster', () => {
  it('should render toasts from store', () => {
    useToastStore.setState({
      toasts: [{ id: '1', title: 'Test Toast' }],
    });

    render(<Toaster />);

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  it('should call removeToast when Toast onClose is triggered', () => {
    useToastStore.setState({
      toasts: [{ id: '1', title: 'Toast to close' }],
    });

    render(<Toaster />);

    const toastElement = screen.getByText('Toast to close');
    expect(toastElement).toBeInTheDocument();

    const closeButton = screen.getByRole('button', {
      name: /dismiss notification/i,
    });
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByText('Toast to close')).not.toBeInTheDocument();
  });
});

describe('useToast', () => {
  it('should provide addToast and removeToast functions', () => {
    const TestComponent = () => {
      const { addToast, removeToast } = useToast();
      return (
        <div>
          <button onClick={() => addToast({ title: 'Test' })} data-testid="add">
            Add
          </button>
          <button onClick={() => removeToast('123')} data-testid="remove">
            Remove
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('add')).toBeInTheDocument();
    expect(screen.getByTestId('remove')).toBeInTheDocument();
  });

  it('should add toast when addToast is called', () => {
    const TestComponent = () => {
      const { addToast } = useToast();
      return (
        <button
          onClick={() => addToast({ title: 'New Toast' })}
          data-testid="add-toast"
        >
          Add Toast
        </button>
      );
    };

    render(
      <>
        <TestComponent />
        <Toaster />
      </>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-toast'));
    });

    expect(screen.getByText('New Toast')).toBeInTheDocument();
  });

  it('should remove toast when removeToast is called', () => {
    useToastStore.setState({
      toasts: [{ id: '1', title: 'Existing Toast' }],
    });

    const TestComponent = () => {
      const { removeToast } = useToast();
      return (
        <button onClick={() => removeToast('1')} data-testid="remove-toast">
          Remove Toast
        </button>
      );
    };

    render(
      <>
        <TestComponent />
        <Toaster />
      </>
    );

    expect(screen.getByText('Existing Toast')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('remove-toast'));
    });

    expect(screen.queryByText('Existing Toast')).not.toBeInTheDocument();
  });

  it('should handle all toast props', () => {
    const TestComponent = () => {
      const { addToast } = useToast();
      return (
        <button
          onClick={() =>
            addToast({
              title: 'Full Toast',
              description: 'Description',
              variant: 'outlined',
              action: 'success',
              position: 'top-right',
            })
          }
          data-testid="add-full-toast"
        >
          Add Full Toast
        </button>
      );
    };

    render(
      <>
        <TestComponent />
        <Toaster />
      </>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-full-toast'));
    });

    expect(screen.getByText('Full Toast')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
