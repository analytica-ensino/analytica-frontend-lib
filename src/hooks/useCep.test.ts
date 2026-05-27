/* global global:readonly */
import { renderHook, waitFor } from '@testing-library/react';
import { useCep } from './useCep';

describe('useCep', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize with loading false and no error', () => {
    const { result } = renderHook(() => useCep());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.fetchCep).toBeDefined();
  });

  it('should return error for invalid CEP (less than 8 digits)', async () => {
    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('12345');

    await waitFor(() => {
      expect(result.current.error).toBe('CEP deve conter 8 dígitos');
    });
    expect(data).toBe(null);
  });

  it('should return error for invalid CEP (more than 8 digits)', async () => {
    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('123456789');

    await waitFor(() => {
      expect(result.current.error).toBe('CEP deve conter 8 dígitos');
    });
    expect(data).toBe(null);
  });

  it('should clean CEP and fetch data successfully', async () => {
    const mockCepData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCepData,
    } as Response);

    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('01310-100');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/'
    );
    expect(data).toEqual(mockCepData);
    expect(result.current.error).toBe(null);
  });

  it('should handle CEP with special characters', async () => {
    const mockCepData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCepData,
    } as Response);

    const { result } = renderHook(() => useCep());

    await result.current.fetchCep('01.310-100');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/'
    );
  });

  it('should set loading state during fetch', async () => {
    const mockCepData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockCepData,
            } as Response);
          }, 100);
        })
    );

    const { result } = renderHook(() => useCep());

    const fetchPromise = result.current.fetchCep('01310100');

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await fetchPromise;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return null and set error when CEP is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ erro: true }),
    } as Response);

    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('99999999');

    await waitFor(() => {
      expect(result.current.error).toBe('CEP não encontrado');
    });
    expect(data).toBe(null);
  });

  it('should handle fetch error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('01310100');

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao buscar CEP');
    });
    expect(data).toBe(null);
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao buscar CEP:',
      expect.any(Error)
    );
  });

  it('should handle network error', async () => {
    const networkError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('01310100');

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao buscar CEP');
    });
    expect(data).toBe(null);
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao buscar CEP:',
      networkError
    );
  });

  it('should handle unknown error type', async () => {
    const unknownError = 'Unknown error';
    (global.fetch as jest.Mock).mockRejectedValueOnce(unknownError);

    const { result } = renderHook(() => useCep());

    const data = await result.current.fetchCep('01310100');

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao buscar CEP');
    });
    expect(data).toBe(null);
    expect(console.error).toHaveBeenCalledWith(
      'Erro ao buscar CEP:',
      unknownError
    );
  });

  it('should clear previous error on new successful fetch', async () => {
    const mockCepData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    };

    const { result } = renderHook(() => useCep());

    // First fetch with error
    await result.current.fetchCep('12345');
    await waitFor(() => {
      expect(result.current.error).toBe('CEP deve conter 8 dígitos');
    });

    // Second fetch successful
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCepData,
    } as Response);

    await result.current.fetchCep('01310100');
    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });
});
