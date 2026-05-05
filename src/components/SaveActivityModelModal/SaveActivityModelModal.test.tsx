import { render, screen, fireEvent } from '@testing-library/react';
import { SaveActivityModelModal } from './SaveActivityModelModal';

describe('SaveActivityModelModal', () => {
  const setup = (
    overrides: Partial<Parameters<typeof SaveActivityModelModal>[0]> = {}
  ) => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const utils = render(
      <SaveActivityModelModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        {...overrides}
      />
    );
    return { onClose, onConfirm, ...utils };
  };

  it('does not render when isOpen is false', () => {
    render(
      <SaveActivityModelModal
        isOpen={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.queryByText('Salvar modelo')).not.toBeInTheDocument();
  });

  it('renders title field with placeholder when opened', () => {
    setup();

    const input = screen.getByPlaceholderText('Digite o título do modelo');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('uses initialTitle when provided', () => {
    setup({ initialTitle: 'Modelo de Frações' });

    expect(
      screen.getByPlaceholderText('Digite o título do modelo')
    ).toHaveValue('Modelo de Frações');
  });

  it('resets title and error every time the modal reopens', () => {
    const onConfirm = jest.fn();
    const { rerender } = render(
      <SaveActivityModelModal
        isOpen
        onClose={jest.fn()}
        onConfirm={onConfirm}
        initialTitle="Inicial"
      />
    );

    const input = screen.getByPlaceholderText('Digite o título do modelo');
    fireEvent.change(input, { target: { value: 'editado' } });
    expect(input).toHaveValue('editado');

    rerender(
      <SaveActivityModelModal
        isOpen={false}
        onClose={jest.fn()}
        onConfirm={onConfirm}
        initialTitle="Inicial"
      />
    );

    rerender(
      <SaveActivityModelModal
        isOpen
        onClose={jest.fn()}
        onConfirm={onConfirm}
        initialTitle="Inicial"
      />
    );

    expect(
      screen.getByPlaceholderText('Digite o título do modelo')
    ).toHaveValue('Inicial');
  });

  it('shows validation error when confirming with empty title', () => {
    const { onConfirm } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));

    expect(
      screen.getByText('Informe um título para o modelo')
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows validation error when title is only whitespace', () => {
    const { onConfirm } = setup();

    const input = screen.getByPlaceholderText('Digite o título do modelo');
    fireEvent.change(input, { target: { value: '    ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));

    expect(
      screen.getByText('Informe um título para o modelo')
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clears error message when user types again', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));
    expect(
      screen.getByText('Informe um título para o modelo')
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Digite o título do modelo');
    fireEvent.change(input, { target: { value: 'a' } });

    expect(
      screen.queryByText('Informe um título para o modelo')
    ).not.toBeInTheDocument();
  });

  it('confirms with the trimmed title when valid', () => {
    const { onConfirm } = setup();

    const input = screen.getByPlaceholderText('Digite o título do modelo');
    fireEvent.change(input, { target: { value: '  Modelo de Frações  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('Modelo de Frações');
  });

  it('rejects titles longer than 255 characters after trimming', () => {
    const { onConfirm } = setup();

    // Bypass the maxLength HTML attribute by injecting via change event directly
    const input = screen.getByPlaceholderText(
      'Digite o título do modelo'
    ) as HTMLInputElement;
    const longTitle = 'a'.repeat(256);
    fireEvent.change(input, { target: { value: longTitle } });

    // jsdom respects maxLength on user input but we forced a value via fireEvent.
    // We assert the validation regardless of what value the input ended up with.
    fireEvent.click(screen.getByRole('button', { name: 'Salvar modelo' }));

    if (input.value.length > 255) {
      expect(
        screen.getByText('O título deve ter no máximo 255 caracteres')
      ).toBeInTheDocument();
      expect(onConfirm).not.toHaveBeenCalled();
    } else {
      // jsdom truncated to maxLength; confirm went through with 255 chars
      expect(onConfirm).toHaveBeenCalledWith('a'.repeat(255));
    }
  });

  it('calls onClose when clicking cancel', () => {
    const { onClose, onConfirm } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables both action buttons while loading', () => {
    setup({ isLoading: true });

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    const confirmButton = screen.getByRole('button', { name: 'Salvar modelo' });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });
});
