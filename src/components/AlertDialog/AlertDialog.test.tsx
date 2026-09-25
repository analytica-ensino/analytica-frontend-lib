import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  const defaultProps = {
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
    it('should render dialog content when isOpen is true', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Confirm' })
      ).toBeInTheDocument();
    });

    it('should not render dialog content when isOpen is false', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
      expect(
        screen.queryByText('This is a test dialog')
      ).not.toBeInTheDocument();
    });

    it('should render with custom button labels', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          cancelButtonLabel="No"
          submitButtonLabel="Yes"
        />
      );

      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    });

    it('should render with default button labels when not provided', () => {
      render(
        <AlertDialog
          title="Test Dialog"
          description="This is a test dialog"
          isOpen={true}
          onChangeOpen={jest.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Cancelar' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deletar' })
      ).toBeInTheDocument();
    });

    it('should render submit button with positive action classes when submitAction="positive"', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          submitAction="positive"
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveClass('bg-success-500');
    });
  });

  describe('Controlled Mode', () => {
    it('should use controlled state when isOpen is provided', () => {
      const onChangeOpen = jest.fn();

      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should not render when controlled isOpen is false', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should call onChangeOpen when dialog closes through button click in controlled mode', () => {
      const onChangeOpen = jest.fn();

      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      expect(onChangeOpen).not.toHaveBeenCalled();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onChangeOpen).toHaveBeenCalledTimes(1);
      expect(onChangeOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Event Handlers', () => {
    it('should call onSubmit when submit button is clicked', () => {
      const onSubmit = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          onSubmit={onSubmit}
        />
      );

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
          isOpen={true}
          onChangeOpen={jest.fn()}
          onSubmit={onSubmit}
          submitValue="test-value"
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('test-value');
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          onCancel={onCancel}
        />
      );

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
          isOpen={true}
          onChangeOpen={jest.fn()}
          onCancel={onCancel}
          cancelValue="cancel-value"
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledWith('cancel-value');
    });
  });

  describe('Backdrop and Escape Key', () => {
    it('should call onChangeOpen when backdrop is clicked', () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(overlay);

      expect(onChangeOpen).toHaveBeenCalledTimes(1);
      expect(onChangeOpen).toHaveBeenCalledWith(false);
    });

    it('should not call onChangeOpen when backdrop is clicked and closeOnBackdropClick is false', () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
          closeOnBackdropClick={false}
        />
      );

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.click(overlay);

      expect(onChangeOpen).not.toHaveBeenCalled();
    });

    it('should call onChangeOpen when Escape key is pressed', async () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onChangeOpen).toHaveBeenCalledTimes(1);
        expect(onChangeOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should not call onChangeOpen when Escape key is pressed and closeOnEscape is false', async () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
          closeOnEscape={false}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onChangeOpen).not.toHaveBeenCalled();
      });
    });

    it('should handle backdrop keydown event for Escape key', () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      // The backdrop keydown should trigger onChangeOpen through setIsOpen(false)
      // Note: There are two Escape listeners (document and backdrop), so onChangeOpen might be called twice
      expect(onChangeOpen).toHaveBeenCalled();
    });

    it('should not call onChangeOpen when backdrop keydown is not Escape', () => {
      const onChangeOpen = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={onChangeOpen}
        />
      );

      const overlay = screen.getByTestId('alert-dialog-overlay');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      expect(onChangeOpen).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('should hide body overflow when dialog is open', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when dialog is closed', () => {
      const { rerender } = render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should restore body overflow on unmount', () => {
      const { unmount } = render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Size Variants', () => {
    it('should apply extra-small size classes', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          size="extra-small"
        />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[324px]');
    });

    it('should apply small size classes', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          size="small"
        />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[378px]');
    });

    it('should apply medium size classes (default)', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[459px]');
    });

    it('should apply large size classes', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          size="large"
        />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[578px]');
    });

    it('should apply extra-large size classes', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          size="extra-large"
        />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('w-screen', 'max-w-[912px]');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          className="custom-class"
        />
      );

      const dialogContent = screen.getByRole('dialog');
      expect(dialogContent).toHaveClass('custom-class');
    });

    it('should apply additional props to dialog content', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          data-testid="custom-dialog"
        />
      );

      expect(screen.getByTestId('custom-dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      // O que importa é a LIGAÇÃO, não o valor do id: ele vem do `useId` e é
      // por instância, justamente para dois diálogos não colidirem.
      const dialogo = screen.getByRole('dialog');
      const titulo = screen.getByText('Test Dialog');
      const descricao = screen.getByText('This is a test dialog');

      expect(titulo.id).toBeTruthy();
      expect(descricao.id).toBeTruthy();
      expect(dialogo).toHaveAttribute('aria-labelledby', titulo.id);
      expect(dialogo).toHaveAttribute('aria-describedby', descricao.id);
    });

    it('dá ids próprios a cada diálogo, para não colidirem', () => {
      render(
        <>
          <AlertDialog
            {...defaultProps}
            title="Primeiro"
            description="Descrição do primeiro"
            isOpen={true}
            onChangeOpen={jest.fn()}
          />
          <AlertDialog
            {...defaultProps}
            title="Segundo"
            description="Descrição do segundo"
            isOpen={true}
            onChangeOpen={jest.fn()}
          />
        </>
      );

      const [primeiro, segundo] = screen.getAllByRole('dialog');

      expect(primeiro.getAttribute('aria-labelledby')).not.toBe(
        segundo.getAttribute('aria-labelledby')
      );
      // Com ids fixos os dois apontariam para o mesmo nó e o leitor anunciaria
      // "Primeiro" nos dois diálogos.
      expect(primeiro).toHaveAccessibleName('Primeiro');
      expect(segundo).toHaveAccessibleName('Segundo');
      expect(segundo).toHaveAccessibleDescription('Descrição do segundo');
    });

    it('se anuncia como diálogo, com título e descrição ligados', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      const dialogo = screen.getByRole('dialog');
      expect(dialogo).toHaveAttribute('aria-modal', 'true');
      expect(dialogo).toHaveAccessibleName('Test Dialog');
      expect(dialogo).toHaveAccessibleDescription('This is a test dialog');
    });
  });

  describe('Foco', () => {
    it('leva o foco pro diálogo ao abrir', () => {
      const { rerender } = render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      rerender(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      // No próprio diálogo, e não no primeiro botão: assim o leitor anuncia
      // título e descrição antes das ações.
      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('devolve o foco a quem abriu ao fechar', () => {
      const gatilho = document.createElement('button');
      document.body.appendChild(gatilho);
      gatilho.focus();

      const { rerender } = render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );
      rerender(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );
      expect(screen.getByRole('dialog')).toHaveFocus();

      rerender(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      expect(gatilho).toHaveFocus();
      gatilho.remove();
    });

    it('prende o Tab dentro do diálogo', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      const submeter = screen.getByRole('button', { name: 'Confirm' });
      submeter.focus();

      // Do último focusável o Tab volta pro primeiro, em vez de escapar pro
      // conteúdo que está visualmente bloqueado pelo backdrop.
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to dialog content', () => {
      const ref = jest.fn();
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          ref={ref}
        />
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callback functions', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={true}
          onChangeOpen={jest.fn()}
          onSubmit={undefined}
          onCancel={undefined}
        />
      );

      // Should render dialog
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: 'Confirm' });

      // Should not throw when submit is clicked with undefined callback
      expect(() => fireEvent.click(submitButton)).not.toThrow();
    });

    it('should handle controlled mode with state changes', () => {
      const { rerender } = render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      // Initially not rendered
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();

      // Simulate controlled mode
      rerender(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();

      // Simulate closing
      rerender(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );
      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should handle escape key when dialog is not open', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
          closeOnEscape={true}
        />
      );

      // Should not throw when escape is pressed on closed dialog
      expect(() =>
        fireEvent.keyDown(document, { key: 'Escape' })
      ).not.toThrow();
    });

    it('should handle backdrop click when dialog is not open', () => {
      render(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
          closeOnBackdropClick={true}
        />
      );

      // Should not throw when backdrop is clicked on closed dialog
      expect(() => fireEvent.click(document.body)).not.toThrow();
    });

    it('should handle multiple rapid state changes', () => {
      const { rerender } = render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();

      // Rapid state changes
      rerender(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );
      rerender(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );
      rerender(
        <AlertDialog
          {...defaultProps}
          isOpen={false}
          onChangeOpen={jest.fn()}
        />
      );

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('should handle button clicks when callbacks are not provided', () => {
      render(
        <AlertDialog {...defaultProps} isOpen={true} onChangeOpen={jest.fn()} />
      );

      const submitButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      // Should not throw when buttons are clicked without callbacks
      expect(() => fireEvent.click(submitButton)).not.toThrow();
      expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });
  });
});
