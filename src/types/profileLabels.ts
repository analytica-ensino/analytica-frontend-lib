/**
 * Profile labels (nomenclatura) types
 *
 * Some institutions rename the default profiles (e.g. Aluno -> Estudante,
 * Gestor Unidade -> Diretor(a)/Pedagogo(a)). Those overrides are stored in a
 * per-institution PROFILE_LABELS feature flag and consumed here so the apps can
 * render the institution's preferred nomenclatura.
 */

import { PROFILE_ROLES } from './chat';

/**
 * Map of canonical profile role -> custom display label (nomenclatura).
 * Mirrors the backend PROFILE_LABELS feature flag `version`. Any role may be
 * omitted, in which case the default label applies.
 */
export type ProfileLabelsMap = Partial<Record<PROFILE_ROLES, string>>;

/**
 * Default profile labels — mirror the seeded `profiles.description` values on
 * the backend. Used as the fallback baseline when an institution has no
 * PROFILE_LABELS feature flag (or omits a given role).
 */
export const DEFAULT_PROFILE_LABELS: Record<PROFILE_ROLES, string> = {
  [PROFILE_ROLES.SUPER_ADMIN]: 'Super Admin',
  [PROFILE_ROLES.GENERAL_MANAGER]: 'Gestor Geral',
  [PROFILE_ROLES.REGIONAL_MANAGER]: 'Gestor Regional',
  [PROFILE_ROLES.UNIT_MANAGER]: 'Gestor de Unidade',
  [PROFILE_ROLES.TEACHER]: 'Professor',
  [PROFILE_ROLES.STUDENT]: 'Aluno',
};

/**
 * Resolve the display label for a profile role, preferring the institution's
 * custom nomenclatura and falling back to the default. Unknown roles return the
 * raw value so callers never render `undefined`.
 *
 * @param role - Canonical profile role (e.g. PROFILE_ROLES.STUDENT)
 * @param labels - Optional custom label map (from the PROFILE_LABELS flag)
 * @returns The display label to render
 */
export const getProfileLabel = (
  role: PROFILE_ROLES | string,
  labels?: ProfileLabelsMap | null
): string => {
  return (
    labels?.[role as PROFILE_ROLES] ||
    DEFAULT_PROFILE_LABELS[role as PROFILE_ROLES] ||
    String(role)
  );
};

/**
 * Shape of the PROFILE_LABELS feature flag record returned by
 * `GET /featureFlags/institution/:id/page/PROFILE_LABELS`.
 */
export interface ProfileLabelsFeatureFlag {
  institutionId: string;
  page: string;
  version: ProfileLabelsMap;
}
