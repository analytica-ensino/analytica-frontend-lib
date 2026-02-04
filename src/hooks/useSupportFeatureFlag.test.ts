import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupportFeatureFlag } from '@/hooks/useSupportFeatureFlag';
import { useAppStore } from '@/store/appStore';
import type { SupportApiClient } from '@/types/support';

const createMockApiClient = (
  response?: unknown,
  shouldReject = false
): SupportApiClient => ({
  get: jest.fn().mockImplementation(() => {
    if (shouldReject) return Promise.reject(new Error('API Error'));
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
    it('deve inicializar com supportType NATIVE e loading true', () => {
      const apiClient = createMockApiClient();
      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      expect(result.current.supportType).toBe('NATIVE');
      expect(result.current.loading).toBe(true);
      expect(result.current.isNative).toBe(true);
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
            version: { supportType: 'NATIVE' },
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
            version: { supportType: 'ZENDESK' },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe('ZENDESK');
      expect(result.current.isZendesk).toBe(true);
      expect(result.current.isNative).toBe(false);
    });

    it('deve manter NATIVE quando a API retorna NATIVE', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: 'NATIVE' },
          },
        },
      });

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe('NATIVE');
      expect(result.current.isNative).toBe(true);
      expect(result.current.isZendesk).toBe(false);
    });

    it('deve definir loading como false após o fetch', async () => {
      const apiClient = createMockApiClient({
        data: {
          featureFlags: {
            institutionId: 'institution-123',
            page: 'SUPPORT',
            version: { supportType: 'NATIVE' },
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
      expect(result.current.supportType).toBe('NATIVE');
    });
  });

  describe('tratamento de erros', () => {
    it('deve definir NATIVE quando a API falha', async () => {
      const apiClient = createMockApiClient(undefined, true);

      const { result } = renderHook(() => useSupportFeatureFlag({ apiClient }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.supportType).toBe('NATIVE');
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

      expect(result.current.supportType).toBe('NATIVE');
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
            version: { supportType: 'NATIVE' },
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
});
