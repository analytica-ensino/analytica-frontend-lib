import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QuestionCommentField } from './QuestionCommentField';

describe('QuestionCommentField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the default label and the persisted comment', () => {
    render(<QuestionCommentField value="Revise a soma." onSave={jest.fn()} />);

    expect(screen.getByText('Comentário para o estudante')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Revise a soma.')).toBeInTheDocument();
  });

  it('should accept custom label, placeholder and rows', () => {
    render(
      <QuestionCommentField
        value=""
        onSave={jest.fn()}
        label="Observação"
        placeholder="Escreva algo"
        rows={7}
      />
    );

    expect(screen.getByText('Observação')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText('Escreva algo');
    expect(textarea).toHaveAttribute('rows', '7');
  });

  it('should disable Save while the draft matches the saved value', async () => {
    const user = userEvent.setup();
    render(<QuestionCommentField value="Revise a soma." onSave={jest.fn()} />);

    // A saved comment opens locked, so the rule only applies once unlocked.
    await user.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('should save the edited comment', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(<QuestionCommentField value="" onSave={onSave} />);

    await user.type(screen.getByRole('textbox'), 'Nova dica');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith('Nova dica'));
  });

  it('should allow saving an empty comment to clear it', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(<QuestionCommentField value="Comentário antigo" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(''));
  });

  it('should keep the draft and show an error when saving fails', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockRejectedValue(new Error('boom'));

    render(<QuestionCommentField value="" onSave={onSave} />);

    await user.type(screen.getByRole('textbox'), 'Tentativa');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Erro ao salvar o comentário. Tente novamente.')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tentativa')).toBeInTheDocument();
  });

  it('should show a saving state while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveSave: (() => void) | undefined;
    const onSave = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );

    render(<QuestionCommentField value="" onSave={onSave} />);

    await user.type(screen.getByRole('textbox'), 'Aguardando');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByRole('button', { name: 'Salvando...' })
    ).toBeDisabled();

    resolveSave?.();
    expect(
      await screen.findByRole('button', { name: 'Salvar' })
    ).toBeInTheDocument();
  });

  it('should follow the persisted value when it changes', () => {
    const { rerender } = render(
      <QuestionCommentField value="Primeiro" onSave={jest.fn()} />
    );

    expect(screen.getByDisplayValue('Primeiro')).toBeInTheDocument();

    rerender(<QuestionCommentField value="Segundo" onSave={jest.fn()} />);

    expect(screen.getByDisplayValue('Segundo')).toBeInTheDocument();
  });

  it('should not discard edits made while a save was in flight', async () => {
    // The textarea stays editable during a save, so the teacher can keep typing
    // between clicking Save and the parent echoing the saved comment back. That
    // echo used to overwrite the newer text.
    const user = userEvent.setup();
    let resolveSave: (() => void) | undefined;
    const onSave = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );

    const { rerender } = render(
      <QuestionCommentField value="" onSave={onSave} />
    );

    await user.type(screen.getByRole('textbox'), 'A');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await user.type(screen.getByRole('textbox'), 'B');

    resolveSave?.();
    // The parent now reports 'A' as persisted, while the draft already says 'AB'.
    rerender(<QuestionCommentField value="A" onSave={onSave} />);

    expect(await screen.findByDisplayValue('AB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('should adopt a new persisted value when the draft is untouched', () => {
    const { rerender } = render(
      <QuestionCommentField value="Original" onSave={jest.fn()} />
    );

    // Nothing was typed, so there is nothing to protect — a refetch or a switch
    // to another student must be reflected.
    rerender(<QuestionCommentField value="Do servidor" onSave={jest.fn()} />);

    expect(screen.getByDisplayValue('Do servidor')).toBeInTheDocument();
  });

  // A comment already written takes a deliberate click to change, so it cannot
  // be altered by someone typing into the wrong field.
  describe('locked state', () => {
    it('should open a saved comment read-only behind Editar', () => {
      render(
        <QuestionCommentField value="Revise a soma." onSave={jest.fn()} />
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
      expect(screen.getByRole('button', { name: 'Editar' })).toBeEnabled();
      expect(
        screen.queryByRole('button', { name: 'Salvar' })
      ).not.toBeInTheDocument();
    });

    it('should open an empty comment directly editable', () => {
      render(<QuestionCommentField value="" onSave={jest.fn()} />);

      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
      expect(
        screen.getByRole('button', { name: 'Salvar' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Editar' })
      ).not.toBeInTheDocument();
    });

    it('should unlock the textarea when Editar is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QuestionCommentField value="Revise a soma." onSave={jest.fn()} />
      );

      await user.click(screen.getByRole('button', { name: 'Editar' }));

      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
      expect(
        screen.getByRole('button', { name: 'Salvar' })
      ).toBeInTheDocument();
    });

    it('should lock again once the edit is saved', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      const { rerender } = render(
        <QuestionCommentField value="Antigo" onSave={onSave} />
      );

      await user.click(screen.getByRole('button', { name: 'Editar' }));
      await user.type(screen.getByRole('textbox'), ' e novo');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      // The parent echoes the saved comment back, as the consumers do.
      rerender(<QuestionCommentField value="Antigo e novo" onSave={onSave} />);

      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('should stay editable after clearing the comment', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      const { rerender } = render(
        <QuestionCommentField value="Antigo" onSave={onSave} />
      );

      await user.click(screen.getByRole('button', { name: 'Editar' }));
      await user.clear(screen.getByRole('textbox'));
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      rerender(<QuestionCommentField value="" onSave={onSave} />);

      // Nothing left to edit — the teacher is writing a new note from scratch.
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
      expect(
        screen.getByRole('button', { name: 'Salvar' })
      ).toBeInTheDocument();
    });

    it('should stay unlocked when the save fails, keeping the draft', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error('rede'));

      render(<QuestionCommentField value="Antigo" onSave={onSave} />);

      await user.click(screen.getByRole('button', { name: 'Editar' }));
      await user.type(screen.getByRole('textbox'), ' editado');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(
        await screen.findByText('Erro ao salvar o comentário. Tente novamente.')
      ).toBeInTheDocument();
      // Retrying must not cost another click on Editar.
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
      expect(screen.getByDisplayValue('Antigo editado')).toBeInTheDocument();
    });

    it('should not lock over text typed while a save was in flight', async () => {
      const user = userEvent.setup();
      let resolveSave: (() => void) | undefined;
      const onSave = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve;
          })
      );

      const { rerender } = render(
        <QuestionCommentField value="" onSave={onSave} />
      );

      await user.type(screen.getByRole('textbox'), 'A');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));
      await user.type(screen.getByRole('textbox'), 'B');

      resolveSave?.();
      rerender(<QuestionCommentField value="A" onSave={onSave} />);

      // 'AB' is not saved yet, so shutting the field here would hide unsaved
      // text behind an extra click.
      expect(await screen.findByDisplayValue('AB')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
    });

    it('should stay unlocked while the save that produced the value is still in flight', async () => {
      // Every consumer updates `value` inside the promise this field awaits, so
      // the echo lands while `saving` is still true. The teacher who did not
      // type past the save has `draft === value` at that point, and locking on
      // it swapped "Salvando..." for "Editar" and shut a field whose save had
      // not settled — against the rule that the field stays editable in flight.
      const user = userEvent.setup();
      let resolveSave: (() => void) | undefined;
      const onSave = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve;
          })
      );

      const { rerender } = render(
        <QuestionCommentField value="" onSave={onSave} />
      );

      await user.type(screen.getByRole('textbox'), 'A');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      // The parent echoes the saved comment back before `onSave` resolves.
      rerender(<QuestionCommentField value="A" onSave={onSave} />);

      expect(
        await screen.findByRole('button', { name: 'Salvando...' })
      ).toBeDisabled();
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');

      // Once the save settles it locks as usual — the delay is the whole fix.
      resolveSave?.();
      expect(
        await screen.findByRole('button', { name: 'Editar' })
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });
});
