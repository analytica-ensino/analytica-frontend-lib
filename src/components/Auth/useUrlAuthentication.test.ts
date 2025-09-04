import { renderHook, waitFor, render } from '@testing-library/react';
import { useUrlAuthentication } from './useUrlAuthentication';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';

const mockSetTokens = jest.fn();
const mockSetSessionInfo = jest.fn();
const mockSetSelectedProfile = jest.fn();
const mockClearParams = jest.fn();

const mockApi = {
  get: jest.fn(),
};

function wrapper(props: { children?: React.ReactNode }) {
  return React.createElement(
    MemoryRouter,
    { initialEntries: ['/?sessionId=abc&token=def&refreshToken=ghi'] },
    props.children
  );
}
function wrapperNoParams(props: { children?: React.ReactNode }) {
  return React.createElement(
    MemoryRouter,
    { initialEntries: ['/'] },
    props.children
  );
}
function wrapperError(props: { children?: React.ReactNode }) {
  return React.createElement(
    MemoryRouter,
    { initialEntries: ['/?sessionId=abc&token=def&refreshToken=ghi'] },
    props.children
  );
}

describe('useUrlAuthentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar setTokens, api.get, setSessionInfo e setSelectedProfile quando params estão presentes', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { profileId: 'p1', foo: 'bar' } },
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalledWith({
        token: 'def',
        refreshToken: 'ghi',
      });
      expect(mockApi.get).toHaveBeenCalledWith(
        '/auth/session-info',
        expect.any(Object)
      );
      expect(mockSetSessionInfo).toHaveBeenCalledWith({
        profileId: 'p1',
        foo: 'bar',
      });
      expect(mockSetSelectedProfile).toHaveBeenCalledWith({ id: 'p1' });
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  it('não chama nada se parâmetros não estão presentes', async () => {
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper: wrapperNoParams }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).not.toHaveBeenCalled();
      expect(mockApi.get).not.toHaveBeenCalled();
      expect(mockSetSessionInfo).not.toHaveBeenCalled();
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).not.toHaveBeenCalled();
    });
  });

  it('trata erro da api sem quebrar', async () => {
    mockApi.get.mockRejectedValue(new Error('fail'));
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper: wrapperError }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockApi.get).toHaveBeenCalled();
      expect(mockSetSessionInfo).not.toHaveBeenCalled(); // pois erro
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).not.toHaveBeenCalled();
    });
  });

  it('deve usar custom extractParams quando fornecido', async () => {
    const mockCustomExtractParams = jest.fn().mockReturnValue({
      sessionId: 'custom-session',
      token: 'custom-token',
      refreshToken: 'custom-refresh',
    });

    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
            extractParams: mockCustomExtractParams,
          }),
        { wrapper: wrapper }
      );
    });

    await waitFor(() => {
      expect(mockCustomExtractParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams)
      );
      expect(mockSetTokens).toHaveBeenCalledWith({
        token: 'custom-token',
        refreshToken: 'custom-refresh',
      });
    });
  });

  it('deve lidar com response.data.data null sem quebrar', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: null },
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockSetSessionInfo).toHaveBeenCalledWith(null);
      // setSelectedProfile não deve ser chamado quando response.data.data é null
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  it('deve lidar com response.data.data sem profileId sem quebrar', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { foo: 'bar' } }, // sem profileId
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockSetSessionInfo).toHaveBeenCalledWith({ foo: 'bar' });
      // setSelectedProfile não deve ser chamado quando profileId não existe
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  it('deve lidar com profileId null/undefined sem quebrar', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { profileId: null, foo: 'bar' } },
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockSetSessionInfo).toHaveBeenCalledWith({
        profileId: null,
        foo: 'bar',
      });
      // setSelectedProfile não deve ser chamado quando profileId é null
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  it('deve funcionar quando setSelectedProfile não é fornecido', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { profileId: 'p1', foo: 'bar' } },
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            // setSelectedProfile não fornecido (undefined)
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockSetSessionInfo).toHaveBeenCalledWith({
        profileId: 'p1',
        foo: 'bar',
      });
      // setSelectedProfile não foi fornecido, então não deve ser chamado
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  it('deve lidar com response.data.data não sendo um objeto válido', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: 'string inválido ao invés de objeto' },
    });
    await act(async () => {
      renderHook(
        () =>
          useUrlAuthentication({
            setTokens: mockSetTokens,
            setSessionInfo: mockSetSessionInfo,
            setSelectedProfile: mockSetSelectedProfile,
            api: mockApi,
            endpoint: '/auth/session-info',
            clearParamsFromURL: mockClearParams,
          }),
        { wrapper: wrapper }
      );
    });
    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockSetSessionInfo).toHaveBeenCalledWith(
        'string inválido ao invés de objeto'
      );
      // setSelectedProfile não deve ser chamado quando response.data.data não é objeto
      expect(mockSetSelectedProfile).not.toHaveBeenCalled();
      expect(mockClearParams).toHaveBeenCalled();
    });
  });

  describe('setUser Tests', () => {
    const mockSetUser = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve chamar setUser quando userId está presente na resposta', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: 'João Silva',
            userEmail: 'joao@example.com',
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          name: 'João Silva',
          email: 'joao@example.com',
        });
      });
    });

    it('deve chamar setUser apenas com id quando apenas userId está presente', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            // userName e userEmail não estão presentes
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
        });
      });
    });

    it('deve chamar setUser com id e name quando apenas userId e userName estão presentes', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: 'João Silva',
            // userEmail não está presente
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          name: 'João Silva',
        });
      });
    });

    it('deve chamar setUser com id e email quando apenas userId e userEmail estão presentes', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userEmail: 'joao@example.com',
            // userName não está presente
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          email: 'joao@example.com',
        });
      });
    });

    it('não deve chamar setUser quando userId não está presente', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userName: 'João Silva',
            userEmail: 'joao@example.com',
            // userId não está presente
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    it('não deve chamar setUser quando setUser não é fornecido', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: 'João Silva',
            userEmail: 'joao@example.com',
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              // setUser não fornecido
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    it('não deve chamar setUser quando response.data.data é null', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: null },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    it('não deve chamar setUser quando response.data.data não é um objeto', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: 'string inválida' },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    it('deve lidar com userId sendo null ou undefined', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: null,
            userName: 'João Silva',
            userEmail: 'joao@example.com',
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    it('deve lidar com userName sendo null ou undefined', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: null,
            userEmail: 'joao@example.com',
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          email: 'joao@example.com',
        });
      });
    });

    it('deve lidar com userEmail sendo null ou undefined', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: 'João Silva',
            userEmail: null,
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          name: 'João Silva',
        });
      });
    });

    it('deve funcionar corretamente com todos os campos de usuário preenchidos', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          data: {
            profileId: 'p1',
            userId: 'user123',
            userName: 'João Silva',
            userEmail: 'joao@example.com',
            // Campos adicionais que não são processados pelo handleUserData
            extraField: 'extra value',
            anotherField: 'another value',
          },
        },
      });

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              setUser: mockSetUser,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper: wrapper }
        );
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 'user123',
          name: 'João Silva',
          email: 'joao@example.com',
        });
        // Verificar que setSessionInfo recebe todos os campos, incluindo os extras
        expect(mockSetSessionInfo).toHaveBeenCalledWith({
          profileId: 'p1',
          userId: 'user123',
          userName: 'João Silva',
          userEmail: 'joao@example.com',
          extraField: 'extra value',
          anotherField: 'another value',
        });
      });
    });
  });

  // Testes para cenários não cobertos
  describe('Cenários avançados de retry e processamento', () => {
    it('deve não executar quando já foi processado (processedRef.current = true)', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: { profileId: 'p1', foo: 'bar' } },
      });

      const { rerender } = await act(async () => {
        return renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
            }),
          { wrapper }
        );
      });

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledTimes(1);
      });

      // Resetar mocks para verificar a segunda chamada
      jest.clearAllMocks();

      // Re-renderizar o hook - não deve fazer nova chamada pois processedRef.current = true
      rerender();

      await waitFor(() => {
        expect(mockApi.get).not.toHaveBeenCalled();
        expect(mockSetTokens).not.toHaveBeenCalled();
        expect(mockSetSessionInfo).not.toHaveBeenCalled();
      });
    });

    it('deve fazer retry até esgotar maxRetries e lançar erro', async () => {
      const mockOnError = jest.fn();
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
              maxRetries: 2, // Testar com 2 retries
              retryDelay: 10, // Delay baixo para teste rápido
              onError: mockOnError,
            }),
          { wrapper }
        );
      });

      await waitFor(
        () => {
          expect(mockApi.get).toHaveBeenCalledTimes(2);
          expect(mockOnError).toHaveBeenCalledWith(new Error('Network error'));
          expect(mockSetSessionInfo).not.toHaveBeenCalled();
          expect(mockClearParams).not.toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('deve resetar processedRef.current quando ocorre erro final', async () => {
      mockApi.get.mockRejectedValue(new Error('Permanent error'));

      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
              maxRetries: 1,
              retryDelay: 10,
            }),
          { wrapper }
        );
      });

      await waitFor(
        () => {
          expect(mockApi.get).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );

      // Resetar mocks
      jest.clearAllMocks();

      // Configurar sucesso para próxima chamada
      mockApi.get.mockResolvedValue({
        data: { data: { profileId: 'p1', foo: 'bar' } },
      });

      // Re-renderizar com nova instância - deve funcionar pois processedRef foi resetado
      await act(async () => {
        renderHook(
          () =>
            useUrlAuthentication({
              setTokens: mockSetTokens,
              setSessionInfo: mockSetSessionInfo,
              setSelectedProfile: mockSetSelectedProfile,
              api: mockApi,
              endpoint: '/auth/session-info',
              clearParamsFromURL: mockClearParams,
              maxRetries: 1,
              retryDelay: 10,
            }),
          { wrapper }
        );
      });

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledTimes(1);
        expect(mockSetSessionInfo).toHaveBeenCalledWith({
          profileId: 'p1',
          foo: 'bar',
        });
      });
    });

    it('deve executar o early return quando processedRef.current é true (cobertura linha 224)', async () => {
      // Mock console.warn para verificar que não há logs de retry (indica que não executou)
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockApi.get.mockResolvedValue({
        data: { data: { profileId: 'p1', foo: 'bar' } },
      });

      const TestComponent = () => {
        useUrlAuthentication({
          setTokens: mockSetTokens,
          setSessionInfo: mockSetSessionInfo,
          setSelectedProfile: mockSetSelectedProfile,
          api: mockApi,
          endpoint: '/auth/session-info',
          clearParamsFromURL: mockClearParams,
        });
        return null;
      };

      const { rerender } = render(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/?sessionId=abc&token=def&refreshToken=ghi'] },
          React.createElement(TestComponent)
        )
      );

      // Esperar primeira execução completar
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledTimes(1);
        expect(mockSetSessionInfo).toHaveBeenCalledTimes(1);
      });

      // Reset mocks para verificar próxima chamada
      mockApi.get.mockClear();
      mockSetTokens.mockClear();
      mockSetSessionInfo.mockClear();
      mockClearParams.mockClear();

      // Re-render que deve fazer early return
      rerender(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/?sessionId=abc&token=def&refreshToken=ghi'] },
          React.createElement(TestComponent)
        )
      );

      // Aguardar um tempo para garantir que nenhuma chamada adicional foi feita
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que não houve novas chamadas (early return funcionou)
      expect(mockApi.get).not.toHaveBeenCalled();
      expect(mockSetTokens).not.toHaveBeenCalled();
      expect(mockSetSessionInfo).not.toHaveBeenCalled();
      expect(mockClearParams).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});
