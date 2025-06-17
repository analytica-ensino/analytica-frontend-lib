import { useToastStore } from './ToastStore';

describe('ToastStore', () => {
  it('should add a toast', () => {
    const { addToast } = useToastStore.getState();

    addToast({ title: 'Test Toast' });

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].title).toBe('Test Toast');
    expect(toasts[0].id).toBe('mock-uuid-123-1-1');
  });

  it('should remove a toast', () => {
    const { addToast, removeToast } = useToastStore.getState();

    addToast({ title: 'Test Toast' });
    removeToast('mock-uuid-123-1-1');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(0);
  });

  it('should fallback to Math.random when crypto.randomUUID is not available', () => {
    const originalCrypto = globalThis.crypto;
    const mockMathRandom = jest
      .spyOn(Math, 'random')
      .mockReturnValue(0.123456789);

    // @ts-expect-error - We're deliberately removing crypto for testing
    delete globalThis.crypto;

    const { addToast } = useToastStore.getState();
    addToast({ title: 'Fallback Toast' });

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].title).toBe('Fallback Toast');

    mockMathRandom.mockRestore();
    globalThis.crypto = originalCrypto;
  });
});
