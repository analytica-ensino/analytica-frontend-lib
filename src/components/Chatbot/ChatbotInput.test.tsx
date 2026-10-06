import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChatbotInput from './ChatbotInput';

describe('ChatbotInput', () => {
  it('marks the send button as aria-disabled when input is empty', () => {
    render(<ChatbotInput onSend={() => undefined} />);
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    expect(sendButton).toHaveAttribute('aria-disabled', 'true');
    // O estado desabilitado precisa ir no rótulo: o `disabled` nativo faria o
    // VoiceOver dizer "escurecido" em vez de "desabilitado" (AE-2667).
    expect(sendButton).toHaveAccessibleName('Enviar mensagem, desabilitado');
    expect(sendButton).not.toHaveAttribute('disabled');
  });

  it('keeps the send button focusable while disabled', async () => {
    render(<ChatbotInput onSend={() => undefined} />);
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    await userEvent.tab();
    await userEvent.tab();
    expect(sendButton).toHaveFocus();
  });

  it('enables the send button after typing non-whitespace', async () => {
    render(<ChatbotInput onSend={() => undefined} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /mensagem para o assistente/i }),
      'hello'
    );
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    expect(sendButton).toHaveAttribute('aria-disabled', 'false');
    expect(sendButton).toHaveAccessibleName('Enviar mensagem');
  });

  it('hides the decorative send icon from screen readers', () => {
    render(<ChatbotInput onSend={() => undefined} />);
    expect(screen.getByTestId('phosphor-paper-plane-tilt')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('sends the trimmed text when Enter is pressed without Shift', async () => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} />);
    const textarea = screen.getByRole('textbox', {
      name: /mensagem para o assistente/i,
    });
    await userEvent.type(textarea, '  olá  {Enter}');
    expect(onSend).toHaveBeenCalledWith('olá');
    expect(textarea).toHaveValue('');
  });

  it('does not send when Shift+Enter is pressed', async () => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} />);
    const textarea = screen.getByRole('textbox', {
      name: /mensagem para o assistente/i,
    });
    await userEvent.type(textarea, 'linha 1{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends when clicking the send button', async () => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /mensagem para o assistente/i }),
      'oi'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /enviar mensagem/i })
    );
    expect(onSend).toHaveBeenCalledWith('oi');
  });

  // O botão deixou de ser `disabled` nativo, então precisa continuar
  // acionável pelo teclado nos dois gatilhos padrão de um `<button>`.
  it.each([
    ['Enter', '{Enter}'],
    ['Espaço', ' '],
  ])('sends with %s while the send button is focused', async (_name, key) => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /mensagem para o assistente/i }),
      'oi'
    );
    screen.getByRole('button', { name: /enviar mensagem/i }).focus();
    await userEvent.keyboard(key);
    expect(onSend).toHaveBeenCalledWith('oi');
  });

  it('blocks submissions while disabled', async () => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} disabled />);
    const textarea = screen.getByRole('textbox', {
      name: /mensagem para o assistente/i,
    });
    const sendButton = screen.getByRole('button', {
      name: /enviar mensagem/i,
    });
    expect(textarea).toBeDisabled();
    expect(sendButton).toHaveAttribute('aria-disabled', 'true');

    // O botão com `aria-disabled` continua clicável e focável, então o clique
    // e as teclas de ativação chegam ao handler — a guarda do `submit` é o
    // que impede o envio.
    await userEvent.click(sendButton);
    sendButton.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    // userEvent.type on a disabled textarea is a no-op, but we still fire
    // the Enter key against it to exercise the handler's disabled guard.
    await userEvent.type(textarea, '{Enter}', { skipClick: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('renders the provided placeholder', () => {
    render(
      <ChatbotInput onSend={() => undefined} placeholder="placeholder custom" />
    );
    expect(
      screen.getByPlaceholderText('placeholder custom')
    ).toBeInTheDocument();
  });
});
