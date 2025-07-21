import { createZustandAuthAdapter } from './zustandAuthAdapter';

describe('createZustandAuthAdapter', () => {
  const mockStore = {
    getState: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('checkAuth retorna true se sessionInfo e tokens existem', async () => {
    mockStore.getState.mockReturnValue({ sessionInfo: {}, tokens: {} });
    const adapter = createZustandAuthAdapter(mockStore);
    await expect(adapter.checkAuth()).resolves.toBe(true);
  });

  it('checkAuth retorna false se sessionInfo ou tokens não existem', async () => {
    mockStore.getState.mockReturnValue({ sessionInfo: null, tokens: {} });
    const adapter = createZustandAuthAdapter(mockStore);
    await expect(adapter.checkAuth()).resolves.toBe(false);
  });

  it('getUser retorna user do store', () => {
    mockStore.getState.mockReturnValue({ user: { id: '1' } });
    const adapter = createZustandAuthAdapter(mockStore);
    expect(adapter.getUser()).toEqual({ id: '1' });
  });

  it('getSessionInfo retorna sessionInfo do store', () => {
    mockStore.getState.mockReturnValue({ sessionInfo: { foo: 'bar' } });
    const adapter = createZustandAuthAdapter(mockStore);
    expect(adapter.getSessionInfo()).toEqual({ foo: 'bar' });
  });

  it('getTokens retorna tokens do store', () => {
    mockStore.getState.mockReturnValue({ tokens: { token: 'abc' } });
    const adapter = createZustandAuthAdapter(mockStore);
    expect(adapter.getTokens()).toEqual({ token: 'abc' });
  });

  it('signOut chama signOut do store se existir', () => {
    const signOut = jest.fn();
    mockStore.getState.mockReturnValue({ signOut });
    const adapter = createZustandAuthAdapter(mockStore);
    adapter.signOut();
    expect(signOut).toHaveBeenCalled();
  });

  it('signOut não quebra se signOut não existir', () => {
    mockStore.getState.mockReturnValue({});
    const adapter = createZustandAuthAdapter(mockStore);
    expect(() => adapter.signOut()).not.toThrow();
  });
});
