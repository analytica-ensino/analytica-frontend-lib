import { renderHook } from '@testing-library/react';
import { useApiConfig } from './useApiConfig';

describe('useApiConfig', () => {
  it('should create a memoized API configuration object', () => {
    const mockApi = {
      get: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    const { result } = renderHook(() => useApiConfig(mockApi));

    expect(result.current).toHaveProperty('get');
    expect(typeof result.current.get).toBe('function');
  });

  it('should call the original API get method with correct parameters', async () => {
    const mockApi = {
      get: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    const { result } = renderHook(() => useApiConfig(mockApi));

    const endpoint = '/test-endpoint';
    const config = { headers: { Authorization: 'Bearer token' } };

    await result.current.get(endpoint, config);

    expect(mockApi.get).toHaveBeenCalledWith(endpoint, config);
    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });

  it('should return the same object reference when API instance does not change', () => {
    const mockApi = {
      get: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    const { result, rerender } = renderHook(() => useApiConfig(mockApi));
    const firstResult = result.current;

    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it('should return a new object reference when API instance changes', () => {
    const mockApi1 = {
      get: jest.fn().mockResolvedValue({ data: 'test1' }),
    };

    const mockApi2 = {
      get: jest.fn().mockResolvedValue({ data: 'test2' }),
    };

    const { result, rerender } = renderHook(({ api }) => useApiConfig(api), {
      initialProps: { api: mockApi1 },
    });
    const firstResult = result.current;

    rerender({ api: mockApi2 });
    const secondResult = result.current;

    expect(firstResult).not.toBe(secondResult);
  });

  it('should handle API calls that return promises', async () => {
    const expectedResponse = { data: { user: 'test' } };
    const mockApi = {
      get: jest.fn().mockResolvedValue(expectedResponse),
    };

    const { result } = renderHook(() => useApiConfig(mockApi));

    const response = await result.current.get('/user', {});

    expect(response).toEqual(expectedResponse);
  });

  it('should handle API calls that throw errors', async () => {
    const mockError = new Error('API Error');
    const mockApi = {
      get: jest.fn().mockRejectedValue(mockError),
    };

    const { result } = renderHook(() => useApiConfig(mockApi));

    await expect(result.current.get('/error', {})).rejects.toThrow('API Error');
  });

  it('should cast config parameter to the correct type', async () => {
    interface CustomConfig {
      timeout: number;
      retries: number;
    }

    const mockApi = {
      get: jest.fn().mockResolvedValue({ data: 'test' }),
    };

    const { result } = renderHook(() => useApiConfig<CustomConfig>(mockApi));

    const config = { timeout: 5000, retries: 3 };
    await result.current.get('/test', config);

    expect(mockApi.get).toHaveBeenCalledWith('/test', config);
  });
});
