import { renderHook, act, waitFor } from '@testing-library/react';
import { useInstitution, useInstitutionId } from './useInstitution';
import type { BaseApiClient } from '../types/api';

const mockGet = jest.fn();

// Stable reference — must NOT be recreated inside renderHook callbacks,
// otherwise the apiClient reference changes on every render and the useEffect
// runs infinitely (config.apiClient is in the dependency array).
const mockApiClient: BaseApiClient = {
  get: mockGet,
} as unknown as BaseApiClient;

describe('useInstitution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state with null institutionId', () => {
    const { result } = renderHook(() =>
      useInstitution({ apiClient: mockApiClient, institutionId: null })
    );

    expect(result.current.institution).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should fetch institution data when institutionId is provided', async () => {
    const mockData = {
      id: '1',
      name: 'Escola Teste',
      companyName: 'Escola',
      type: 'school',
      domain: 'escola.com',
      email: 'e@escola.com',
      phone: '11999999999',
      active: true,
      mainLogo: null,
      internalLogo: null,
      icon: null,
      favicon: null,
      loginImage: null,
      theme: null,
      city: null,
      state: null,
    };
    mockGet.mockResolvedValueOnce({ data: { data: mockData } });

    const { result } = renderHook(() =>
      useInstitution({ apiClient: mockApiClient, institutionId: 'inst-1' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith('/institution/filter', {
      params: { filter: 'inst-1' },
    });
    expect(result.current.institution).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should set loading to true while fetching', async () => {
    let resolveGet!: (value: unknown) => void;
    mockGet.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveGet = resolve;
      })
    );

    const { result } = renderHook(() =>
      useInstitution({ apiClient: mockApiClient, institutionId: 'inst-1' })
    );

    await waitFor(() => expect(result.current.loading).toBe(true));

    act(() => {
      resolveGet({ data: { data: {} } });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('should set error when API throws', async () => {
    const apiError = new Error('Network error');
    mockGet.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() =>
      useInstitution({ apiClient: mockApiClient, institutionId: 'inst-1' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(apiError);
    expect(result.current.institution).toBeNull();
  });

  it('should not update state when component unmounts during fetch', async () => {
    let resolveGet!: (value: unknown) => void;
    mockGet.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveGet = resolve;
      })
    );

    const { result, unmount } = renderHook(() =>
      useInstitution({ apiClient: mockApiClient, institutionId: 'inst-1' })
    );

    await waitFor(() => expect(result.current.loading).toBe(true));

    unmount();

    act(() => {
      resolveGet({ data: { data: { id: '1', name: 'Escola' } } });
    });

    // After unmount + resolve, state should remain at the last value before unmount
    expect(result.current.institution).toBeNull();
  });

  it('should refetch when institutionId changes', async () => {
    const mockData1 = { id: '1', name: 'Escola 1' };
    const mockData2 = { id: '2', name: 'Escola 2' };
    mockGet
      .mockResolvedValueOnce({ data: { data: mockData1 } })
      .mockResolvedValueOnce({ data: { data: mockData2 } });

    const { result, rerender } = renderHook(
      ({ institutionId }: { institutionId: string }) =>
        useInstitution({ apiClient: mockApiClient, institutionId }),
      { initialProps: { institutionId: 'inst-1' } }
    );

    await waitFor(() => expect(result.current.institution).toEqual(mockData1));

    rerender({ institutionId: 'inst-2' });

    await waitFor(() => expect(result.current.institution).toEqual(mockData2));

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(2, '/institution/filter', {
      params: { filter: 'inst-2' },
    });
  });

  it('should reset institution to null when institutionId changes mid-fetch', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { data: { id: '1', name: 'Escola 1' } } })
      .mockReturnValueOnce(
        new Promise(() => {
          /* never resolves */
        })
      );

    const { result, rerender } = renderHook(
      ({ institutionId }: { institutionId: string }) =>
        useInstitution({ apiClient: mockApiClient, institutionId }),
      { initialProps: { institutionId: 'inst-1' } }
    );

    await waitFor(() => expect(result.current.institution).not.toBeNull());

    rerender({ institutionId: 'inst-2' });

    await waitFor(() => expect(result.current.institution).toBeNull());
  });
});

describe('useInstitutionId', () => {
  let metaTag: HTMLMetaElement;

  afterEach(() => {
    metaTag?.remove();
    jest.clearAllMocks();
  });

  it('should return null when no institution-id meta tag exists', () => {
    const { result } = renderHook(() => useInstitutionId());
    expect(result.current).toBeNull();
  });

  it('should read the initial value from the meta tag', () => {
    metaTag = document.createElement('meta');
    metaTag.name = 'institution-id';
    metaTag.content = 'inst-abc';
    document.head.appendChild(metaTag);

    const { result } = renderHook(() => useInstitutionId());
    expect(result.current).toBe('inst-abc');
  });

  it('should update when MutationObserver detects attribute change', async () => {
    metaTag = document.createElement('meta');
    metaTag.name = 'institution-id';
    metaTag.content = 'inst-initial';
    document.head.appendChild(metaTag);

    const { result } = renderHook(() => useInstitutionId());
    expect(result.current).toBe('inst-initial');

    act(() => {
      metaTag.setAttribute('content', 'inst-updated');
    });

    await waitFor(() => expect(result.current).toBe('inst-updated'));
  });

  it('should not set up observer when meta tag does not exist', () => {
    const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

    renderHook(() => useInstitutionId());

    expect(observeSpy).not.toHaveBeenCalled();
    observeSpy.mockRestore();
  });

  it('should disconnect observer on unmount', () => {
    metaTag = document.createElement('meta');
    metaTag.name = 'institution-id';
    metaTag.content = 'inst-abc';
    document.head.appendChild(metaTag);

    const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');

    const { unmount } = renderHook(() => useInstitutionId());

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
  });
});
