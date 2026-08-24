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

  it('should disable Save while the draft matches the saved value', () => {
    render(<QuestionCommentField value="Revise a soma." onSave={jest.fn()} />);

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

    await waitFor(() =>
      expect(
        screen.getByText('Erro ao salvar o comentário. Tente novamente.')
      ).toBeInTheDocument()
    );
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
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
    );
  });

  it('should follow the persisted value when it changes', () => {
    const { rerender } = render(
      <QuestionCommentField value="Primeiro" onSave={jest.fn()} />
    );

    expect(screen.getByDisplayValue('Primeiro')).toBeInTheDocument();

    rerender(<QuestionCommentField value="Segundo" onSave={jest.fn()} />);

    expect(screen.getByDisplayValue('Segundo')).toBeInTheDocument();
  });
});
