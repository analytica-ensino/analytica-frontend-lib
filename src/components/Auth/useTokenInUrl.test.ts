import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as React from 'react';
import { useTokenInUrl } from './useTokenInUrl';

const renderAt = (url: string) =>
  renderHook(() => useTokenInUrl(), {
    wrapper: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(MemoryRouter, { initialEntries: [url] }, children),
  });

describe('useTokenInUrl', () => {
  it('detects the single-use hand-off code', () => {
    const { result } = renderAt('/?authCode=abc');
    expect(result.current.hasTokenInUrl).toBe(true);
  });

  it('detects the three legacy token params', () => {
    const { result } = renderAt('/?token=t&refreshToken=r&sessionId=s');
    expect(result.current.hasTokenInUrl).toBe(true);
  });

  it('ignores an incomplete set of tokens', () => {
    const { result } = renderAt('/?token=t&sessionId=s');
    expect(result.current.hasTokenInUrl).toBe(false);
  });

  it('ignores a URL without auth params', () => {
    const { result } = renderAt('/painel?tab=1');
    expect(result.current.hasTokenInUrl).toBe(false);
  });
});
