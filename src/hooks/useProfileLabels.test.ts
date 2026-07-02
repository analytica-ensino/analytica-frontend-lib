import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfileLabels } from '@/hooks/useProfileLabels';
import { useAppStore } from '@/store/appStore';
import { PROFILE_ROLES } from '@/types/chat';
import { DEFAULT_PROFILE_LABELS, getProfileLabel } from '@/types/profileLabels';

type ApiClient = { get: jest.Mock };

const createMockApiClient = (
  response?: unknown,
  shouldReject = false
): ApiClient => ({
  get: jest.fn().mockImplementation(() => {
    if (shouldReject) return Promise.reject(new Error('API Error'));
    return Promise.resolve({ data: response });
  }),
});

const flagResponse = (version: Record<string, string>) => ({
  data: {
    featureFlags: {
      institutionId: 'institution-123',
      page: 'PROFILE_LABELS',
      version,
    },
  },
});

describe('useProfileLabels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAppStore.setState({ institutionId: 'institution-123' });
    });
  });

  afterEach(() => {
    act(() => {
      useAppStore.setState({ institutionId: null });
    });
  });

  describe('estado inicial', () => {
    it('inicializa com os labels padrão e loading true', () => {
      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      expect(result.current.loading).toBe(true);
      expect(result.current.labels).toEqual(DEFAULT_PROFILE_LABELS);
      expect(result.current.getProfileLabel(PROFILE_ROLES.STUDENT)).toBe(
        'Aluno'
      );
    });
  });

  describe('fetch da feature flag', () => {
    it('busca a page PROFILE_LABELS com o institutionId correto', async () => {
      const apiClient = createMockApiClient(
        flagResponse({ STUDENT: 'Estudante' })
      );

      renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          '/featureFlags/institution/institution-123/page/PROFILE_LABELS'
        );
      });
    });

    it('mescla os labels customizados sobre os padrão', async () => {
      const apiClient = createMockApiClient(
        flagResponse({
          STUDENT: 'Estudante',
          UNIT_MANAGER: 'Diretor(a)/Pedagogo(a)',
        })
      );

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Customizados
      expect(result.current.getProfileLabel(PROFILE_ROLES.STUDENT)).toBe(
        'Estudante'
      );
      expect(result.current.getProfileLabel(PROFILE_ROLES.UNIT_MANAGER)).toBe(
        'Diretor(a)/Pedagogo(a)'
      );
      // Não customizado mantém o padrão
      expect(result.current.getProfileLabel(PROFILE_ROLES.TEACHER)).toBe(
        'Professor'
      );
    });

    it('expõe apenas os overrides explícitos em customLabels (sem defaults)', async () => {
      const apiClient = createMockApiClient(
        flagResponse({ STUDENT: 'Estudante' })
      );

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.customLabels).toEqual({ STUDENT: 'Estudante' });
    });

    it('não faz fetch quando institutionId é null', async () => {
      act(() => {
        useAppStore.setState({ institutionId: null });
      });

      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).not.toHaveBeenCalled();
      expect(result.current.labels).toEqual(DEFAULT_PROFILE_LABELS);
    });
  });

  describe('tratamento de erros', () => {
    it('mantém os labels padrão quando a API falha', async () => {
      const apiClient = createMockApiClient(undefined, true);

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.labels).toEqual(DEFAULT_PROFILE_LABELS);
    });
  });

  describe('reatividade ao institutionId', () => {
    it('refaz o fetch quando institutionId muda', async () => {
      const apiClient = createMockApiClient(
        flagResponse({ STUDENT: 'Estudante' })
      );

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);

      act(() => {
        useAppStore.setState({ institutionId: 'institution-456' });
      });

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });

      expect(apiClient.get).toHaveBeenLastCalledWith(
        '/featureFlags/institution/institution-456/page/PROFILE_LABELS'
      );
    });

    it('limpa os labels da instituição anterior enquanto o novo fetch está em andamento', async () => {
      let resolveSecond: (value: unknown) => void = () => {};
      const apiClient: ApiClient = {
        get: jest
          .fn()
          .mockResolvedValueOnce({
            data: flagResponse({ STUDENT: 'Estudante' }),
          })
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => {
                resolveSecond = resolve;
              })
          ),
      };

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      await waitFor(() =>
        expect(result.current.getProfileLabel(PROFILE_ROLES.STUDENT)).toBe(
          'Estudante'
        )
      );

      act(() => {
        useAppStore.setState({ institutionId: 'institution-456' });
      });

      // Enquanto o fetch da nova instituição não resolve, não pode exibir o
      // label customizado da anterior — cai no padrão.
      expect(result.current.customLabels).toEqual({});
      expect(result.current.getProfileLabel(PROFILE_ROLES.STUDENT)).toBe(
        'Aluno'
      );

      await act(async () => {
        resolveSecond({ data: flagResponse({ TEACHER: 'Professor(a)' }) });
      });

      expect(result.current.getProfileLabel(PROFILE_ROLES.TEACHER)).toBe(
        'Professor(a)'
      );
    });

    it('ignora uma resposta antiga que chega depois da troca de institutionId (race)', async () => {
      let resolveFirst: (value: unknown) => void = () => {};
      let resolveSecond: (value: unknown) => void = () => {};
      const apiClient: ApiClient = {
        get: jest
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => {
                resolveFirst = resolve;
              })
          )
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => {
                resolveSecond = resolve;
              })
          ),
      };

      const { result } = renderHook(() => useProfileLabels({ apiClient }));

      act(() => {
        useAppStore.setState({ institutionId: 'institution-456' });
      });

      // A resposta da instituição nova (a segunda chamada) chega primeiro.
      await act(async () => {
        resolveSecond({ data: flagResponse({ TEACHER: 'Professor(a)' }) });
      });
      expect(result.current.getProfileLabel(PROFILE_ROLES.TEACHER)).toBe(
        'Professor(a)'
      );

      // A resposta antiga (instituição já trocada) chega por último e deve ser
      // ignorada pelo guard de cleanup.
      await act(async () => {
        resolveFirst({ data: flagResponse({ STUDENT: 'Antigo' }) });
      });
      expect(result.current.getProfileLabel(PROFILE_ROLES.STUDENT)).toBe(
        'Aluno'
      );
      expect(result.current.getProfileLabel(PROFILE_ROLES.TEACHER)).toBe(
        'Professor(a)'
      );
    });
  });
});

describe('getProfileLabel (pure)', () => {
  it('prefere o label customizado', () => {
    expect(
      getProfileLabel(PROFILE_ROLES.STUDENT, { STUDENT: 'Estudante' })
    ).toBe('Estudante');
  });

  it('cai no padrão quando não há customizado', () => {
    expect(getProfileLabel(PROFILE_ROLES.STUDENT, {})).toBe('Aluno');
    expect(getProfileLabel(PROFILE_ROLES.STUDENT, null)).toBe('Aluno');
  });

  it('retorna o valor cru para um role desconhecido', () => {
    expect(getProfileLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
  });
});
