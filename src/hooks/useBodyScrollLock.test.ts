import { renderHook } from '@testing-library/react';
import { useBodyScrollLock } from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.getElementById('modal-scrollbar-overlay')?.remove();
  });

  it('locks body scroll while locked and restores on unlock', () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('does nothing while not locked', () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('reference-counts: closing one modal keeps the lock while another is open', () => {
    const first = renderHook(() => useBodyScrollLock(true));
    const second = renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    // Fecha o primeiro — o segundo ainda está aberto, então continua travado.
    first.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    // Fecha o último — agora o scroll é restaurado.
    second.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
