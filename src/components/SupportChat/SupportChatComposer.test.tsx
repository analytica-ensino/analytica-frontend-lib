import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportChatComposer from './SupportChatComposer';
import { SUPPORT_CHAT_REPLY_MODE } from '../../types/supportChat';

const field = () => screen.getByLabelText('Resposta');
const type = (value: string) =>
  fireEvent.change(field(), { target: { value } });

describe('SupportChatComposer', () => {
  it('starts on the reply to the user and switches to internal note', () => {
    const onModeChange = jest.fn();
    render(
      <SupportChatComposer onSend={jest.fn()} onModeChange={onModeChange} />
    );

    const reply = screen.getByRole('button', { name: /Resposta ao usuário/ });
    const note = screen.getByRole('button', { name: /Nota interna/ });
    expect(reply).toHaveAttribute('aria-pressed', 'true');
    expect(note).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(note);
    expect(note).toHaveAttribute('aria-pressed', 'true');
    expect(reply).toHaveAttribute('aria-pressed', 'false');
    expect(onModeChange).toHaveBeenCalledWith(
      SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE
    );

    // clicking the selected chip again does nothing
    fireEvent.click(note);
    expect(onModeChange).toHaveBeenCalledTimes(1);
  });

  it('starts on the mode given by defaultMode', () => {
    render(
      <SupportChatComposer
        onSend={jest.fn()}
        defaultMode={SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE}
      />
    );
    expect(
      screen.getByRole('button', { name: /Nota interna/ })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('sends with Enter, trimmed, and clears the field', () => {
    const onSend = jest.fn();
    render(<SupportChatComposer onSend={onSend} />);

    type('  Olá, tudo bem?  ');
    fireEvent.keyDown(field(), { key: 'Enter' });

    expect(onSend).toHaveBeenCalledWith({
      text: 'Olá, tudo bem?',
      mode: SUPPORT_CHAT_REPLY_MODE.USER,
    });
    expect(field()).toHaveValue('');
  });

  it('keeps the line break with Shift+Enter and ignores other keys', () => {
    const onSend = jest.fn();
    render(<SupportChatComposer onSend={onSend} />);

    type('linha 1');
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(field(), { key: 'a' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send while an IME composition is open', () => {
    const onSend = jest.fn();
    render(<SupportChatComposer onSend={onSend} />);

    type('olá');
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends the internal note with the button', () => {
    const onSend = jest.fn();
    render(<SupportChatComposer onSend={onSend} />);

    fireEvent.click(screen.getByRole('button', { name: /Nota interna/ }));
    type('Cliente já falou com o financeiro');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSend).toHaveBeenCalledWith({
      text: 'Cliente já falou com o financeiro',
      mode: SUPPORT_CHAT_REPLY_MODE.INTERNAL_NOTE,
    });
  });

  it('does not send an empty text', () => {
    const onSend = jest.fn();
    render(<SupportChatComposer onSend={onSend} />);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    type('   ');
    fireEvent.keyDown(field(), { key: 'Enter' });

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('hides the image action when its callback is missing', () => {
    render(<SupportChatComposer onSend={jest.fn()} />);

    expect(screen.queryByLabelText('Anexar imagem')).not.toBeInTheDocument();
    expect(
      screen.getByText('Enter envia · Shift+Enter quebra linha')
    ).toBeInTheDocument();
  });

  it('passes the picked images and opens the picker from the button', () => {
    const onAttachImages = jest.fn();
    render(
      <SupportChatComposer onSend={jest.fn()} onAttachImages={onAttachImages} />
    );
    const input = screen.getByTestId(
      'support-chat-composer-file-input'
    ) as HTMLInputElement;
    const click = jest.spyOn(input, 'click');

    fireEvent.click(screen.getByLabelText('Anexar imagem'));
    expect(click).toHaveBeenCalled();

    const file = new File(['x'], 'print.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onAttachImages).toHaveBeenCalledWith([file]);

    // no file picked (dialog canceled): nothing is reported
    fireEvent.change(input, { target: { files: [] } });
    expect(onAttachImages).toHaveBeenCalledTimes(1);
  });

  it('blocks everything when disabled', () => {
    const onSend = jest.fn();
    render(
      <SupportChatComposer
        disabled
        onSend={onSend}
        onAttachImages={jest.fn()}
      />
    );

    expect(field()).toBeDisabled();
    expect(screen.getByLabelText('Anexar imagem')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('takes the full width and extra classes', () => {
    render(<SupportChatComposer onSend={jest.fn()} className="mt-4" />);
    expect(screen.getByTestId('support-chat-composer')).toHaveClass(
      'w-full',
      'mt-4'
    );
  });
});
