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

  it.each([
    [
      'the legacy token params, no longer accepted',
      '/?token=t&refreshToken=r&sessionId=s',
    ],
    ['an incomplete set of tokens', '/?token=t&sessionId=s'],
    ['a URL without auth params', '/painel?tab=1'],
  ])('ignores %s', (_, url) => {
    const { result } = renderAt(url);
    expect(result.current.hasTokenInUrl).toBe(false);
  });
});
