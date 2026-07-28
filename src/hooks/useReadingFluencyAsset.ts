import { readingFluencyFallback } from '../assets/fallbacks/readingFluencyFallback';
import { useInstitution, type InstitutionData } from './useInstitution';
import type { BaseApiClient } from '../types/api';

/**
 * Assets de Fluência Leitora configuráveis por instituição. Cada chave mapeia
 * para a coluna correspondente na instituição (servida via `GET /institution/filter`).
 * Ao migrar um novo gif para o backend, adicione a chave aqui e o campo em
 * `InstitutionData`.
 */
const ASSET_FIELD = {
  /** Imagem do modal de sucesso (`SuccessModalReadingFluency`). */
  success: 'readingFluencySuccessImage',
  /** Passarinho do "leia em voz alta" (`ReadAloudPromptReadingFluency`). */
  readAloud: 'readingFluencyReadAloudImage',
  /** Imagem de splash/carregamento. */
  splash: 'readingFluencySplashImage',
  /** Passarinho (olhos). */
  eyes: 'readingFluencyEyesImage',
} as const satisfies Record<string, keyof InstitutionData>;

export type ReadingFluencyAsset = keyof typeof ASSET_FIELD;

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
   * Which Reading Fluency asset to resolve. Defaults to `'success'` for
   * backwards compatibility with the first consumer (success modal).
   */
  asset?: ReadingFluencyAsset;
  /**
   * URL to use while the institution has no configured asset. When omitted, the
   * generic fallback image bundled with the lib is used.
   */
  fallback?: string;
}

/**
 * Returns the URL of a Reading Fluency asset for the current white-label,
 * falling back to a consumer-provided URL or, ultimately, the generic fallback
 * image bundled with the lib.
 *
 * Mirrors `useBrandingLogo`'s three-tier resolution (institution → consumer
 * fallback → bundled asset), but the institution value is read from the API
 * (`GET /institution/filter`) instead of a `<meta>` tag — these assets live deep
 * in the authenticated flow, so they don't need the pre-login meta-tag path the
 * logo uses. The bundled default guarantees a valid URL during the async gap.
 */
export const useReadingFluencyAsset = ({
  apiClient,
  institutionId,
  asset = 'success',
  fallback,
}: UseReadingFluencyAssetOptions): string => {
  const { institution } = useInstitution({ apiClient, institutionId });
  const url = institution?.[ASSET_FIELD[asset]]?.trim();
  const consumerFallback = fallback?.trim();
  return url || consumerFallback || readingFluencyFallback;
};
