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

  describe('quick replies, FAQ and internal note', () => {
    const quickReplies = [
      { id: 'q1', title: 'Saudação', text: 'Olá! Vou te ajudar.' },
      { id: 'q2', title: 'Atualizar o app', text: 'Atualize para a 3.8.' },
    ];

    it('hides the quick replies and FAQ buttons without their props', () => {
      render(<SupportChatComposer onSend={jest.fn()} />);

      expect(
        screen.queryByRole('button', { name: /Respostas rápidas/ })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /FAQ/ })
      ).not.toBeInTheDocument();
      expect(field()).toHaveAttribute('placeholder', 'Escreva sua resposta…');
    });

    it('opens the quick replies from the button and fills the field', () => {
      render(
        <SupportChatComposer onSend={jest.fn()} quickReplies={quickReplies} />
      );

      expect(field()).toHaveAttribute(
        'placeholder',
        'Escreva sua resposta… digite / para respostas rápidas'
      );
      fireEvent.click(
        screen.getByRole('button', { name: /Respostas rápidas/ })
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('menuitem', { name: /Saudação/ }));

      expect(field()).toHaveValue('Olá! Vou te ajudar.');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens the menu with "/" and filters by what follows it', () => {
      render(
        <SupportChatComposer onSend={jest.fn()} quickReplies={quickReplies} />
      );

      type('/');
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);

      type('/atual');
      expect(screen.getAllByRole('menuitem')).toHaveLength(1);
      expect(screen.getByRole('menuitem')).toHaveTextContent('Atualizar o app');

      type('/nada');
      expect(
        screen.getByText('Nenhuma resposta rápida encontrada')
      ).toBeInTheDocument();
    });

    it('closes the menu with Escape and clears the slash command', () => {
      render(
        <SupportChatComposer onSend={jest.fn()} quickReplies={quickReplies} />
      );

      type('/sau');
      fireEvent.keyDown(field(), { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(field()).toHaveValue('');
    });

    it('closes the menu opened by the button with Escape, keeping the text', () => {
      render(
        <SupportChatComposer onSend={jest.fn()} quickReplies={quickReplies} />
      );

      type('rascunho');
      fireEvent.click(
        screen.getByRole('button', { name: /Respostas rápidas/ })
      );
      fireEvent.keyDown(field(), { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(field()).toHaveValue('rascunho');
    });

    it('does not open the menu while disabled', () => {
      render(
        <SupportChatComposer
          onSend={jest.fn()}
          quickReplies={quickReplies}
          disabled
        />
      );

      type('/');

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls onOpenFaq', () => {
      const onOpenFaq = jest.fn();
      render(<SupportChatComposer onSend={jest.fn()} onOpenFaq={onOpenFaq} />);

      fireEvent.click(screen.getByRole('button', { name: /FAQ/ }));

      expect(onOpenFaq).toHaveBeenCalledTimes(1);
    });

    it('paints the field with the note color in internal note mode', () => {
      render(<SupportChatComposer onSend={jest.fn()} />);

      expect(field()).not.toHaveClass('bg-exam-3');
      fireEvent.click(screen.getByRole('button', { name: /Nota interna/ }));

      expect(field()).toHaveClass('bg-exam-3');
      expect(field()).toHaveAttribute(
        'placeholder',
        'Escreva uma nota para a equipe…'
      );
    });
  });

  it('starts the field at a single line instead of the tall default', () => {
    render(<SupportChatComposer onSend={jest.fn()} />);

    expect(field().style.height).toBe('48px');
  });
});
