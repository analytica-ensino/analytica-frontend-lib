import { readingFluencyFallback } from '../assets/fallbacks/readingFluencyFallback';
import { useInstitution } from './useInstitution';
import type { BaseApiClient } from '../types/api';

export interface UseReadingFluencyAssetOptions {
  /**
   * HTTP client used to read the institution config (`GET /institution/filter`).
   * Same client already used across the lib hooks (Axios-compatible).
   */
  apiClient: BaseApiClient;
  /**
   * Institution id for the current white-label. When `null`, no request is made
   * and the resolution falls straight through to `fallback`/bundled asset.
   */
  institutionId: string | null;
  /**
   * URL to use while the institution has no configured asset. When omitted, the
   * generic fallback image bundled with the lib is used.
   */
  fallback?: string;
}

/**
 * Returns the Reading Fluency success-modal image URL for the current
 * white-label, falling back to a consumer-provided URL or, ultimately, the
 * generic fallback image bundled with the lib.
 *
 * Mirrors `useBrandingLogo`'s three-tier resolution (institution → consumer
 * fallback → bundled asset), but the institution value is read from the API
 * (`GET /institution/filter`) instead of a `<meta>` tag — this asset lives deep
 * in the authenticated flow, so it doesn't need the pre-login meta-tag path the
 * logo uses. The bundled default guarantees a valid URL during the async gap.
 */
export const useReadingFluencyAsset = ({
  apiClient,
  institutionId,
  fallback,
}: UseReadingFluencyAssetOptions): string => {
  const { institution } = useInstitution({ apiClient, institutionId });
  const asset = institution?.readingFluencySuccessImage?.trim();
  const consumerFallback = fallback?.trim();
  return asset || consumerFallback || readingFluencyFallback;
};
