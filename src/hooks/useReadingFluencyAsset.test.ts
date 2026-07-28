import { renderHook } from '@testing-library/react';
import { useReadingFluencyAsset } from './useReadingFluencyAsset';
import { readingFluencyFallback } from '../assets/fallbacks/readingFluencyFallback';
import type { BaseApiClient } from '../types/api';

const mockInstitution = {
  readingFluencySuccessImage: null as string | null,
};

jest.mock('./useInstitution', () => ({
  useInstitution: () => ({ institution: mockInstitution }),
}));

// The api client / institutionId are consumed only by the mocked useInstitution.
const apiClient = {} as BaseApiClient;
const institutionId = 'inst-123';

describe('useReadingFluencyAsset', () => {
  beforeEach(() => {
    mockInstitution.readingFluencySuccessImage = null;
  });

  it('returns the institution asset when present', () => {
    mockInstitution.readingFluencySuccessImage =
      'https://cdn.example.com/success.gif';

    const { result } = renderHook(() =>
      useReadingFluencyAsset({ apiClient, institutionId })
    );

    expect(result.current).toBe('https://cdn.example.com/success.gif');
  });

  it('returns the consumer-provided fallback when the institution asset is missing', () => {
    const { result } = renderHook(() =>
      useReadingFluencyAsset({
        apiClient,
        institutionId,
        fallback: '/local.gif',
      })
    );

    expect(result.current).toBe('/local.gif');
  });

  it('returns the bundled generic fallback when neither institution asset nor fallback is provided', () => {
    const { result } = renderHook(() =>
      useReadingFluencyAsset({ apiClient, institutionId })
    );

    expect(result.current).toBe(readingFluencyFallback);
  });

  it('treats whitespace-only institution asset as missing and falls back to consumer fallback', () => {
    mockInstitution.readingFluencySuccessImage = '   ';

    const { result } = renderHook(() =>
      useReadingFluencyAsset({
        apiClient,
        institutionId,
        fallback: '/local.gif',
      })
    );

    expect(result.current).toBe('/local.gif');
  });

  it('treats whitespace-only consumer fallback as missing and uses the bundled default', () => {
    const { result } = renderHook(() =>
      useReadingFluencyAsset({ apiClient, institutionId, fallback: '   ' })
    );

    expect(result.current).toBe(readingFluencyFallback);
  });
});
