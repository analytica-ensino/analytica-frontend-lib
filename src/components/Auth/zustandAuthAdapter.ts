// Adapter genérico para integração do AuthProvider com Zustand
// O usuário deve importar este arquivo e passar o store dele

export function createZustandAuthAdapter<
  S extends {
    sessionInfo?: unknown;
    tokens?: unknown;
    user?: unknown;
    signOut?: () => void;
  },
>(useAuthStore: { getState: () => S }) {
  return {
    checkAuth: async (): Promise<boolean> => {
      const { sessionInfo, tokens } = useAuthStore.getState();
      return Boolean(sessionInfo && tokens);
    },
    getUser: () => useAuthStore.getState().user,
    getSessionInfo: () => useAuthStore.getState().sessionInfo,
    getTokens: () => useAuthStore.getState().tokens,
    signOut: () => {
      const signOutFn = useAuthStore.getState().signOut;
      if (typeof signOutFn === 'function') signOutFn();
    },
  };
}
