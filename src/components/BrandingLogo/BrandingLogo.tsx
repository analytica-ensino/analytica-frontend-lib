import type { ImgHTMLAttributes } from 'react';
import {
  useBrandingLogo,
  BrandingLogoVariant,
} from '../../hooks/useBrandingLogo';
import { useTheme } from '../../hooks/useTheme';

/** Rótulo usado quando o white-label não publica o nome da instituição. */
const FALLBACK_ALT = 'Logo da Instituição';

export interface BrandingLogoProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  /**
   * Which branding logo variant to render.
   * @default 'internal'
   */
  variant?: BrandingLogoVariant;
  /**
   * URL used when no branding logo is configured for the current institution.
   * When omitted, the Analytica Ensino logo bundled with the lib is used.
   */
  fallback?: string;
}

/**
 * Renders the institution logo (`<img>`) for the active white-label, reading
 * the URL from branding meta tags and falling back to a consumer-provided URL,
 * or ultimately the Analytica Ensino logo bundled with the lib.
 *
 * O texto alternativo sai como "Logo da <instituição>" quando o white-label
 * publica `<meta name="institution-name">`; sem essa meta ele cai num rótulo
 * genérico, que é o comportamento antigo. Um `alt` passado pelo consumidor
 * continua tendo precedência.
 */
export const BrandingLogo = ({
  variant = 'internal',
  fallback,
  alt,
  ...rest
}: BrandingLogoProps) => {
  const src = useBrandingLogo({ variant, fallback });
  const { branding } = useTheme();

  const institutionName = branding.institutionName?.trim();
  const resolvedAlt =
    alt ?? (institutionName ? `Logo da ${institutionName}` : FALLBACK_ALT);

  return <img src={src} alt={resolvedAlt} {...rest} />;
};
