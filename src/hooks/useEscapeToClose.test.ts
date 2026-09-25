import { renderHook, fireEvent } from '@testing-library/react';
import { useEscapeToClose } from './useEscapeToClose';

describe('useEscapeToClose', () => {
  it('closes on Escape while enabled', () => {
    const onClose = jest.fn();
    renderHook(() => useEscapeToClose(true, onClose));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys and does nothing while disabled', () => {
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useEscapeToClose(enabled, onClose),
      { initialProps: { enabled: true } }
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    rerender({ enabled: false });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores an Escape already handled by a popup inside the overlay', () => {
    const onClose = jest.fn();
    renderHook(() => useEscapeToClose(true, onClose));
    const popupHandler = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener('keydown', popupHandler, true);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    document.removeEventListener('keydown', popupHandler, true);
  });
});
