import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupportFeatureFlag } from '@/hooks/useSupportFeatureFlag';
import { useAppStore } from '@/store/appStore';
import { SupportType, type SupportApiClient } from '@/types/support';

const createMockApiClient = (
  response?: unknown,
  shouldReject = false,
  rejectStatus?: number
): SupportApiClient => ({
  get: jest.fn().mockImplementation(() => {
    if (shouldReject) {
      return Promise.reject(
        Object.assign(new Error('API Error'), {
          response: rejectStatus ? { status: rejectStatus } : undefined,
        })
      );
    }
    return Promise.resolve({ data: response });
  }),
  post: jest.fn(),
  patch: jest.fn(),
});

describe('useSupportFeatureFlag', () => {
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
    it('starts with no support type while the flag loads', () => {
      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      expect(result.current.supportType).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.isNative).toBe(false);
      expect(result.current.isZendesk).toBe(false);
    });

    it('deve retornar openZendeskChat como função', () => {
      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      expect(typeof result.current.openZendeskChat).toBe('function');
    });
  });

  describe('fetch da feature flag', () => {
    it('deve buscar a feature flag SUPPORT com institutionId correto', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: SupportType.NATIVE },
          },
        },
      });

      renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          '/featureFlags/institution/institution-123/page/SUPPORT'
        );
      });
    });

    it('deve atualizar para ZENDESK quando a API retorna ZENDESK', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: SupportType.ZENDESK },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe(SupportType.ZENDESK);
      expect(result.current.isZendesk).toBe(true);
      expect(result.current.isNative).toBe(false);
    });

    it('deve manter NATIVE quando a API retorna NATIVE', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: SupportType.NATIVE },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe(SupportType.NATIVE);
      expect(result.current.isNative).toBe(true);
      expect(result.current.isZendesk).toBe(false);
    });

    it('deve definir loading como false após o fetch', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: SupportType.NATIVE },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('não deve fazer fetch quando institutionId é null', async () => {
      act(() => {
        useAppStore.setState({ institutionId: null });
      });

      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).not.toHaveBeenCalled();
      expect(result.current.supportType).toBe(SupportType.NATIVE);
    });
  });

  describe('tratamento de erros', () => {
    it('shows no support when the flag cannot be read', async () => {
      const apiClient = createMockApiClient(undefined, true);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBeNull();
      expect(result.current.isNative).toBe(false);
      expect(result.current.isZendesk).toBe(false);
    });

    it('shows no support on a server error instead of falling back to native', async () => {
      const apiClient = createMockApiClient(undefined, true, 500);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBeNull();
      expect(result.current.isNative).toBe(false);
    });

    it('keeps the native default when the institution has no SUPPORT flag (404)', async () => {
      const apiClient = createMockApiClient(undefined, true, 404);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe(SupportType.NATIVE);
      expect(result.current.isNative).toBe(true);
    });

    it('deve definir loading como false mesmo em caso de erro', async () => {
      const apiClient = createMockApiClient(undefined, true);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('deve manter NATIVE quando resposta não tem supportType', async () => {
      const apiClient = createMockApiClient({
        data: { featureFlags: { version: {} } },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe(SupportType.NATIVE);
    });
  });

  describe('openZendeskChat', () => {
    it('deve chamar window.zE com messenger open quando zE existe', () => {
      const mockZE = jest.fn();
      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      act(() => {
        result.current.openZendeskChat();
      });

      expect(mockZE).toHaveBeenCalledWith('messenger', 'open');

      delete (globalThis as unknown as Record<string, unknown>).zE;
    });

    it('não deve lançar erro quando window.zE não existe', () => {
      delete (globalThis as unknown as Record<string, unknown>).zE;

      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      expect(() => {
        act(() => {
          result.current.openZendeskChat();
        });
      }).not.toThrow();
    });
  });

  describe('reatividade ao institutionId', () => {
    it('deve refazer o fetch quando institutionId muda', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: SupportType.NATIVE },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

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
        '/featureFlags/institution/institution-456/page/SUPPORT'
      );
    });
  });
  describe('zendeskKey', () => {
    const flagWith = (version: Record<string, unknown>) => ({
      data: {
        featureFlags: {
          institutionId: 'institution-123',
          page: 'SUPPORT',
          version,
        },
      },
    });

    it('deve expor a key do Web Widget vinda da flag', async () => {
      const apiClient = createMockApiClient(
        flagWith({
          supportType: SupportType.ZENDESK,
          zendeskKey: '23d34b27-650e-4fcb-b934-96f8d38b823b',
        })
      );

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.zendeskKey).toBe(
          '23d34b27-650e-4fcb-b934-96f8d38b823b'
        );
      });
      expect(result.current.isZendesk).toBe(true);
    });

    it('deve ficar undefined quando a instituição usa Zendesk sem key configurada', async () => {
      const apiClient = createMockApiClient(
        flagWith({ supportType: SupportType.ZENDESK })
      );

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.isZendesk).toBe(true);
      });
      expect(result.current.zendeskKey).toBeUndefined();
    });

    it('deve tratar key vazia como ausente', async () => {
      const apiClient = createMockApiClient(
        flagWith({ supportType: SupportType.ZENDESK, zendeskKey: '' })
      );

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.isZendesk).toBe(true);
      });
      expect(result.current.zendeskKey).toBeUndefined();
    });

    it('deve ficar undefined quando o fetch falha', async () => {
      const apiClient = createMockApiClient(undefined, true);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.zendeskKey).toBeUndefined();
    });
  });
});
