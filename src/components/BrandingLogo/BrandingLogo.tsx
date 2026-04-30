import type { ImgHTMLAttributes } from 'react';
import {
  useBrandingLogo,
  BrandingLogoVariant,
} from '../../hooks/useBrandingLogo';

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
 */
export const BrandingLogo = ({
  variant = 'internal',
  fallback,
  alt = 'Logo da Instituição',
  ...rest
}: BrandingLogoProps) => {
  const src = useBrandingLogo({ variant, fallback });

  return <img src={src} alt={alt} {...rest} />;
};
