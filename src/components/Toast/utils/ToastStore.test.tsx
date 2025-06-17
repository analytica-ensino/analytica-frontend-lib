import { generateRandomId, useToastStore } from './ToastStore';

describe('ToastStore', () => {
  afterEach(() => {
    useToastStore.setState({ toasts: [] });
  });
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

describe('generateRandomId', () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    globalThis.crypto = originalCrypto;
  });

  it('should generate a random ID using crypto when available', () => {
    const mockArray = new Uint8Array(9);
    mockArray.fill(123);

    const mockGetRandomValues = jest.fn().mockImplementation((array) => {
      array.set(mockArray);
      return array;
    });

    globalThis.crypto = {
      getRandomValues: mockGetRandomValues,
    } as unknown as Crypto;

    const id = generateRandomId();
    expect(id).toHaveLength(9);
    expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
    expect(id).toBe('3f3f3f3f3');
  });

  it('should generate a random ID using Math.random when crypto is not available', () => {
    delete (globalThis as { crypto?: unknown }).crypto;

    const mockMathRandom = jest
      .spyOn(Math, 'random')
      .mockReturnValue(0.123456789);

    const id = generateRandomId();
    expect(id).toHaveLength(9);

    mockMathRandom.mockRestore();
  });

  it('should generate IDs with custom length', () => {
    globalThis.crypto = {
      getRandomValues: jest.fn().mockImplementation((array) => {
        array.fill(100);
        return array;
      }),
    } as unknown as Crypto;

    const shortId = generateRandomId(5);
    expect(shortId).toHaveLength(5);

    const longId = generateRandomId(20);
    expect(longId).toHaveLength(20);
  });

  it('should handle edge case of length 0', () => {
    const id = generateRandomId(0);
    expect(id).toHaveLength(0);
  });
});
