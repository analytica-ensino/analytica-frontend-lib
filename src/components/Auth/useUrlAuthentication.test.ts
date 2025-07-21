import { renderHook, waitFor } from '@testing-library/react';
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
});
