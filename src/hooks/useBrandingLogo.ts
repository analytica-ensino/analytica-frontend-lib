import { useTheme } from './useTheme';

export type BrandingLogoVariant = 'main' | 'internal';

export interface UseBrandingLogoOptions {
  /**
   * Which branding logo variant to read from meta tags.
   * - `main`: reads `<meta name="main-logo">`
   * - `internal`: reads `<meta name="internal-logo">`
   * @default 'internal'
   */
  variant?: BrandingLogoVariant;
  /**
   * URL used when no branding logo is configured for the current institution
   * (e.g. an imported PNG asset shipped with the consumer app).
   */
  fallback?: string;
}

/**
 * Returns the institution logo URL for the current white-label, with a
 * consumer-provided fallback when no branding meta tag is set.
 */
export const useBrandingLogo = ({
  variant = 'internal',
  fallback,
}: UseBrandingLogoOptions = {}): string | undefined => {
  const { branding } = useTheme();
  const logo = variant === 'main' ? branding.mainLogo : branding.internalLogo;
  return logo ?? fallback;
};
