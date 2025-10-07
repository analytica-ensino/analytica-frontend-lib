import {
  useAuthStore,
  type User,
  type AuthTokens,
  type SessionInfo,
  type UserProfile,
} from '@/store/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Limpar o estado antes de cada teste
    useAuthStore.getState().signOut();
  });

  it('deve inicializar com estado não autenticado', () => {
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.profiles).toEqual([]);
    expect(state.selectedProfile).toBeNull();
    expect(state.sessionInfo).toBeNull();
  });

  it('deve definir tokens corretamente', () => {
    const tokens: AuthTokens = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    };

    useAuthStore.getState().setTokens(tokens);

    expect(useAuthStore.getState().tokens).toEqual(tokens);
  });

  it('deve definir perfil selecionado corretamente', () => {
    const profile: UserProfile = {
      id: 'profile-123',
      name: 'Test Profile',
      email: 'test@example.com',
    };

    useAuthStore.getState().setSelectedProfile(profile);

    expect(useAuthStore.getState().selectedProfile).toEqual(profile);
  });

  it('deve fazer login completo', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    const tokens: AuthTokens = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    };

    const profiles: UserProfile[] = [
      {
        id: 'profile-123',
        name: 'Test Profile',
        email: 'test@example.com',
      },
    ];

    useAuthStore.getState().signIn(user, tokens, profiles);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.tokens).toEqual(tokens);
    expect(state.profiles).toEqual(profiles);
  });

  it('deve fazer logout corretamente', () => {
    // Primeiro fazer login
    const user: User = { id: 'user-123', name: 'Test User' };
    const tokens: AuthTokens = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    };
    const profiles: UserProfile[] = [
      { id: 'profile-123', name: 'Test Profile' },
    ];

    useAuthStore.getState().signIn(user, tokens, profiles);

    // Verificar se está autenticado
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Fazer logout
    useAuthStore.getState().signOut();

    // Verificar se o estado foi limpo
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.profiles).toEqual([]);
    expect(state.selectedProfile).toBeNull();
    expect(state.sessionInfo).toBeNull();
  });

  it('deve definir usuário e atualizar isAuthenticated corretamente', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    // Testar setUser com usuário válido
    useAuthStore.getState().setUser(user);

    let state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);

    // Testar setUser com null
    useAuthStore.getState().setUser(null);

    state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('deve definir perfis corretamente', () => {
    const profiles: UserProfile[] = [
      { id: 'profile-1', name: 'Profile 1', email: 'profile1@example.com' },
      { id: 'profile-2', name: 'Profile 2', email: 'profile2@example.com' },
    ];

    useAuthStore.getState().setProfiles(profiles);

    expect(useAuthStore.getState().profiles).toEqual(profiles);
  });

  it('deve atualizar sessão do usuário quando usuário está autenticado', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      email: 'old@example.com',
    };

    // Primeiro definir o usuário
    useAuthStore.getState().setUser(user);

    // Atualizar dados da sessão
    const sessionData = {
      name: 'Updated User',
      email: 'new@example.com',
    };

    useAuthStore.getState().updateUserSession(sessionData);

    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      id: 'user-123',
      name: 'Updated User',
      email: 'new@example.com',
    });
  });

  it('não deve atualizar sessão quando usuário não está autenticado', () => {
    // Garantir que o usuário não está autenticado
    useAuthStore.getState().signOut();

    const sessionData = {
      name: 'Some Name',
      email: 'some@example.com',
    };

    useAuthStore.getState().updateUserSession(sessionData);

    // O usuário deve continuar null
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('deve limpar perfil selecionado com null', () => {
    const profile: UserProfile = {
      id: 'profile-123',
      name: 'Test Profile',
      email: 'test@example.com',
    };

    // Primeiro definir um perfil
    useAuthStore.getState().setSelectedProfile(profile);
    expect(useAuthStore.getState().selectedProfile).toEqual(profile);

    // Limpar o perfil
    useAuthStore.getState().setSelectedProfile(null);
    expect(useAuthStore.getState().selectedProfile).toBeNull();
  });

  it('deve limpar tokens com null', () => {
    const tokens: AuthTokens = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    };

    // Primeiro definir tokens
    useAuthStore.getState().setTokens(tokens);
    expect(useAuthStore.getState().tokens).toEqual(tokens);

    // Limpar tokens
    useAuthStore.getState().setTokens(null);
    expect(useAuthStore.getState().tokens).toBeNull();
  });

  it('deve definir sessionInfo corretamente', () => {
    const sessionInfo: SessionInfo = {
      sessionId: 'session-123',
      userId: 'user-123',
      profileId: 'profile-123',
      institutionId: 'institution-123',
      schoolId: 'school-123',
      schoolYearId: 'school-year-123',
      classId: 'class-123',
      subjects: ['subject-1', 'subject-2'],
      schools: ['school-1', 'school-2'],
    };

    useAuthStore.getState().setSessionInfo(sessionInfo);

    expect(useAuthStore.getState().sessionInfo).toEqual(sessionInfo);
  });

  it('deve limpar sessionInfo com null', () => {
    const sessionInfo: SessionInfo = {
      sessionId: 'session-123',
      userId: 'user-123',
      profileId: 'profile-123',
      institutionId: 'institution-123',
      schoolId: 'school-123',
      schoolYearId: 'school-year-123',
      classId: 'class-123',
      subjects: ['subject-1', 'subject-2'],
      schools: ['school-1', 'school-2'],
    };

    // Primeiro definir sessionInfo
    useAuthStore.getState().setSessionInfo(sessionInfo);
    expect(useAuthStore.getState().sessionInfo).toEqual(sessionInfo);

    // Limpar sessionInfo
    useAuthStore.getState().setSessionInfo(null);
    expect(useAuthStore.getState().sessionInfo).toBeNull();
  });
});
