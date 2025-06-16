import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from './ToastProvider';

beforeEach(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  jest.spyOn(globalThis, 'crypto', 'get').mockReturnValue({
    randomUUID: () => 'mock-uuid-123',
  } as any);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ToastProvider', () => {
  it('should render children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Test Child</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should add and remove toasts', () => {
    const TestComponent = () => {
      const { addToast, removeToast } = useToast();

      return (
        <div>
          <button
            onClick={() => addToast({ title: 'Test Toast'})}
            data-testid="add-toast"
          >
            Add Toast
          </button>
          <button
            onClick={() => removeToast('mock-uuid-123')}
            data-testid="remove-toast"
          >
            Remove Toast
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-toast'));
    });

    expect(screen.getByText('Test Toast')).toBeInTheDocument();

    // Remove the toast
    act(() => {
      fireEvent.click(screen.getByTestId('remove-toast'));
    });

    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
  });

  it('should render toast with all props', () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      return (
        <button
          onClick={() =>
            addToast({
              title: 'Full Toast',
              description: 'This is a description',
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
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-full-toast'));
    });

    expect(screen.getByText('Full Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
    // Você pode adicionar mais verificações para variant, action e position conforme necessário
  });
});

describe('useToast', () => {
  it('should throw error when used outside of ToastProvider', () => {
    // Suprimindo o erro esperado no console para o teste
    const originalError = console.error;
    console.error = jest.fn();

    const TestComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    console.error = originalError;
  });

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

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('add')).toBeInTheDocument();
    expect(screen.getByTestId('remove')).toBeInTheDocument();
  });

  it('should call removeToast when Toast onClose is triggered', () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      return (
        <button
          onClick={() => addToast({ title: 'Toast to close' })}
          data-testid="add-toast"
        >
          Add Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Adiciona o toast
    act(() => {
      fireEvent.click(screen.getByTestId('add-toast'));
    });

    // Verifica que o toast foi adicionado
    const toastElement = screen.getByText('Toast to close');
    expect(toastElement).toBeInTheDocument();

    // Encontra e clica no botão de fechar do Toast usando o aria-label correto
    const closeButton = screen.getByRole('button', {
      name: /dismiss notification/i,
    });
    act(() => {
      fireEvent.click(closeButton);
    });

    // Verifica que o toast foi removido
    expect(screen.queryByText('Toast to close')).not.toBeInTheDocument();
  });
});
