import logoAnalytica from '../assets/img/logo-analytica.png';
import logoAnalyticaLight from '../assets/img/logo-analytica-light.png';
import { useTheme } from './useTheme';

export type BrandingLogoVariant = 'main' | 'internal';

export interface UseBrandingLogoOptions {
  /**
   * Which branding logo variant to read from meta tags.
   * - `main`: reads `<meta name="main-logo">` (intended for dark backgrounds)
   * - `internal`: reads `<meta name="internal-logo">` (intended for light backgrounds)
   * @default 'internal'
   */
  variant?: BrandingLogoVariant;
  /**
   * URL to use when no branding logo is configured for the current institution.
   * When omitted, the Analytica Ensino logo bundled with the lib is used —
   * the light variant for `main` (dark backgrounds) and the dark variant for
   * `internal` (light backgrounds).
   */
  fallback?: string;
}

/**
 * Returns the institution logo URL for the current white-label, falling back to
 * a consumer-provided URL or, ultimately, the Analytica Ensino logo bundled
 * with the lib (matching the requested variant for dark/light backgrounds).
 */
export const useBrandingLogo = ({
  variant = 'internal',
  fallback,
}: UseBrandingLogoOptions = {}): string => {
  const { branding } = useTheme();
  const logo = variant === 'main' ? branding.mainLogo : branding.internalLogo;
  const defaultFallback =
    variant === 'main' ? logoAnalyticaLight : logoAnalytica;
  return logo ?? fallback ?? defaultFallback;
};
