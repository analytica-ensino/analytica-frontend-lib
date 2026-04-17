import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChatbotInput from './ChatbotInput';

describe('ChatbotInput', () => {
  it('disables the send button when input is empty', () => {
    render(<ChatbotInput onSend={() => undefined} />);
    expect(
      screen.getByRole('button', { name: /enviar mensagem/i })
    ).toBeDisabled();
  });

  it('enables the send button after typing non-whitespace', async () => {
    render(<ChatbotInput onSend={() => undefined} />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /mensagem para o assistente/i }),
      'hello'
    );
    expect(
      screen.getByRole('button', { name: /enviar mensagem/i })
    ).toBeEnabled();
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

  it('blocks submissions while disabled', async () => {
    const onSend = jest.fn();
    render(<ChatbotInput onSend={onSend} disabled />);
    const textarea = screen.getByRole('textbox', {
      name: /mensagem para o assistente/i,
    });
    expect(textarea).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /enviar mensagem/i })
    ).toBeDisabled();
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
