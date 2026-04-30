import { renderHook } from '@testing-library/react';
import { useBrandingLogo } from './useBrandingLogo';

const mockBranding = {
  theme: null as string | null,
  favicon: null as string | null,
  icon: null as string | null,
  mainLogo: null as string | null,
  internalLogo: null as string | null,
  loginImage: null as string | null,
};

jest.mock('./useTheme', () => ({
  useTheme: () => ({ branding: mockBranding }),
}));

describe('useBrandingLogo', () => {
  beforeEach(() => {
    mockBranding.mainLogo = null;
    mockBranding.internalLogo = null;
  });

  it('returns the internal logo by default when present', () => {
    mockBranding.internalLogo = 'https://cdn.example.com/internal.png';
    mockBranding.mainLogo = 'https://cdn.example.com/main.png';

    const { result } = renderHook(() => useBrandingLogo());

    expect(result.current).toBe('https://cdn.example.com/internal.png');
  });

  it('returns the main logo when variant is "main"', () => {
    mockBranding.internalLogo = 'https://cdn.example.com/internal.png';
    mockBranding.mainLogo = 'https://cdn.example.com/main.png';

    const { result } = renderHook(() => useBrandingLogo({ variant: 'main' }));

    expect(result.current).toBe('https://cdn.example.com/main.png');
  });

  it('returns the consumer-provided fallback when branding is missing', () => {
    const { result } = renderHook(() =>
      useBrandingLogo({ fallback: '/local.png' })
    );

    expect(result.current).toBe('/local.png');
  });

  it('returns the consumer fallback for variant "main" when branding is missing', () => {
    mockBranding.internalLogo = 'https://cdn.example.com/internal.png';

    const { result } = renderHook(() =>
      useBrandingLogo({ variant: 'main', fallback: '/local.png' })
    );

    expect(result.current).toBe('/local.png');
  });

  it('returns the bundled Analytica logo when neither branding nor fallback is provided', () => {
    const { result } = renderHook(() => useBrandingLogo());

    // The Jest fileMock returns a stub string for any imported PNG asset.
    expect(typeof result.current).toBe('string');
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns a string fallback for variant "main" too when no branding/fallback is provided', () => {
    const { result } = renderHook(() => useBrandingLogo({ variant: 'main' }));

    expect(typeof result.current).toBe('string');
    expect(result.current.length).toBeGreaterThan(0);
  });
});
