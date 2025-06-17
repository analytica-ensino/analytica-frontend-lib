import { useToastStore } from './ToastStore';

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
});
