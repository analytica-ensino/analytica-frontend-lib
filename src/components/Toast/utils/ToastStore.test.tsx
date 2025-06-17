import { useToastStore } from './ToastStore';

beforeEach(() => {
  /* eslint-disable-next-line no-undef */
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'mock-uuid-123-1-1',
    },
    writable: true,
  });
});

afterEach(() => {
  useToastStore.setState({ toasts: [] });
});

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
});
