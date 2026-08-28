import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AlertDialog } from '../../AlertDialog/AlertDialog';
import { useSubjectSwitchConfirm } from './useSubjectSwitchConfirm';

/**
 * Minimal host that wires the hook the way ActivityCreate does: a button that
 * asks the gate and reports the answer.
 */
const Harness = ({
  itemCount,
  onConfirmClear,
  onSettled,
}: {
  itemCount: number;
  onConfirmClear: () => void;
  onSettled: (allowed: boolean) => void;
}) => {
  const { requestSubjectChange, alertDialogProps } = useSubjectSwitchConfirm({
    itemCount,
    onConfirmClear,
    buildDescription: (nextSubjectId) =>
      `Trocando para ${nextSubjectId ?? 'nenhuma matéria'}`,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => requestSubjectChange('bio').then(onSettled)}
      >
        trocar
      </button>
      <button
        type="button"
        onClick={() => requestSubjectChange(null).then(onSettled)}
      >
        limpar
      </button>
      <AlertDialog {...alertDialogProps} />
    </>
  );
};

describe('useSubjectSwitchConfirm', () => {
  const renderHarness = (itemCount: number) => {
    const onConfirmClear = jest.fn();
    const onSettled = jest.fn();
    const view = render(
      <Harness
        itemCount={itemCount}
        onConfirmClear={onConfirmClear}
        onSettled={onSettled}
      />
    );
    return { ...view, onConfirmClear, onSettled };
  };

  it('allows the change without asking when the preview is empty', async () => {
    const user = userEvent.setup();
    const { onConfirmClear, onSettled } = renderHarness(0);

    await user.click(screen.getByText('trocar'));

    await waitFor(() => expect(onSettled).toHaveBeenCalledWith(true));
    expect(
      screen.queryByTestId('alert-dialog-overlay')
    ).not.toBeInTheDocument();
    expect(onConfirmClear).not.toHaveBeenCalled();
  });

  it('opens the dialog when the preview has items', async () => {
    const user = userEvent.setup();
    const { onSettled } = renderHarness(3);

    await user.click(screen.getByText('trocar'));

    expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    expect(
      screen.getByText('Trocar de componente curricular?')
    ).toBeInTheDocument();
    expect(screen.getByText('Trocando para bio')).toBeInTheDocument();
    expect(screen.getByText('Remover e trocar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    // Still pending — nothing settled yet.
    expect(onSettled).not.toHaveBeenCalled();
  });

  it('clears the preview and resolves true on confirm', async () => {
    const user = userEvent.setup();
    const { onConfirmClear, onSettled } = renderHarness(3);

    await user.click(screen.getByText('trocar'));
    await user.click(screen.getByText('Remover e trocar'));

    await waitFor(() => expect(onSettled).toHaveBeenCalledWith(true));
    expect(onConfirmClear).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('alert-dialog-overlay')
    ).not.toBeInTheDocument();
  });

  it('keeps the preview and resolves false on cancel', async () => {
    const user = userEvent.setup();
    const { onConfirmClear, onSettled } = renderHarness(3);

    await user.click(screen.getByText('trocar'));
    await user.click(screen.getByText('Cancelar'));

    await waitFor(() => expect(onSettled).toHaveBeenCalledWith(false));
    expect(onConfirmClear).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId('alert-dialog-overlay')
    ).not.toBeInTheDocument();
  });

  it('describes a clear (null subject) too', async () => {
    const user = userEvent.setup();
    renderHarness(2);

    await user.click(screen.getByText('limpar'));

    expect(
      screen.getByText('Trocando para nenhuma matéria')
    ).toBeInTheDocument();
  });

  it('cannot be dismissed by the backdrop — the choice is explicit', async () => {
    const user = userEvent.setup();
    const { onSettled } = renderHarness(3);

    await user.click(screen.getByText('trocar'));
    await user.click(screen.getByTestId('alert-dialog-overlay'));

    expect(screen.getByTestId('alert-dialog-overlay')).toBeInTheDocument();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it('resolves a pending request as refused when it unmounts', async () => {
    const user = userEvent.setup();
    const { onSettled, unmount } = renderHarness(3);

    await user.click(screen.getByText('trocar'));
    unmount();

    await waitFor(() => expect(onSettled).toHaveBeenCalledWith(false));
  });

  it('refuses an earlier request when a second one comes in', async () => {
    const user = userEvent.setup();
    const { onSettled } = renderHarness(3);

    await user.click(screen.getByText('trocar'));
    await user.click(screen.getByText('limpar'));

    await waitFor(() => expect(onSettled).toHaveBeenCalledWith(false));
    expect(
      screen.getByText('Trocando para nenhuma matéria')
    ).toBeInTheDocument();
  });
});
