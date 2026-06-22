import { renderHook, act } from '@testing-library/react';
import { useZendesk } from '@/hooks/useZendesk';

type GlobalWithZE = { zE?: jest.Mock };

const getScript = () =>
  document.getElementById('ze-snippet') as HTMLScriptElement | null;

describe('useZendesk', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
    delete (globalThis as unknown as GlobalWithZE).zE;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete (globalThis as unknown as GlobalWithZE).zE;
  });

  it('não injeta o script quando enabled é false', () => {
    renderHook(() => useZendesk({ zendeskKey: 'key', enabled: false }));
    expect(getScript()).toBeNull();
  });

  it('não injeta o script sem zendeskKey', () => {
    renderHook(() => useZendesk({ zendeskKey: '' }));
    expect(getScript()).toBeNull();
  });

  it('injeta o script e fica ready quando window.zE aparece', () => {
    const { result } = renderHook(() => useZendesk({ zendeskKey: 'key' }));

    expect(getScript()).not.toBeNull();
    expect(result.current.ready).toBe(false);

    const zE = jest.fn();
    (globalThis as unknown as GlobalWithZE).zE = zE;
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.ready).toBe(true);
    expect(zE).toHaveBeenCalledWith('messenger:set', 'locale', 'pt-BR');
  });

  it('re-injeta com backoff quando o script falha', () => {
    renderHook(() => useZendesk({ zendeskKey: 'key' }));

    const script = getScript();
    expect(script).not.toBeNull();

    act(() => {
      script!.dispatchEvent(new Event('error'));
    });
    expect(getScript()).toBeNull();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getScript()).not.toBeNull();
  });

  it('openChat abre o messenger quando zE existe', () => {
    const zE = jest.fn();
    (globalThis as unknown as GlobalWithZE).zE = zE;
    const { result } = renderHook(() => useZendesk({ zendeskKey: 'key' }));

    act(() => {
      result.current.openChat();
    });
    expect(zE).toHaveBeenCalledWith('messenger', 'open');
  });

  it('openChat é no-op quando zE não existe', () => {
    const { result } = renderHook(() => useZendesk({ zendeskKey: 'key' }));
    expect(() => {
      act(() => {
        result.current.openChat();
      });
    }).not.toThrow();
  });

  it('limpa timers no unmount sem erro', () => {
    const { unmount } = renderHook(() => useZendesk({ zendeskKey: 'key' }));
    expect(() => unmount()).not.toThrow();
  });
});
