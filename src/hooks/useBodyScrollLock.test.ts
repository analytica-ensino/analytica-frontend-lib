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

  it('adds the scrollbar width to existing padding-right instead of replacing it', () => {
    // Força uma scrollbar de 15px (1024 - 1009).
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1009,
    });
    document.body.style.paddingRight = '20px';

    const { unmount } = renderHook(() => useBodyScrollLock(true));

    // 20px existentes + 15px de scrollbar, sem descartar os 20px.
    expect(document.body.style.paddingRight).toBe('35px');

    unmount();

    // Restaura o valor original.
    expect(document.body.style.paddingRight).toBe('20px');
  });
});
