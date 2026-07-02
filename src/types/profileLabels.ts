import { PROFILE_ROLES } from './chat';

/**
 * Map of profile roles to their custom labels.
 * Used by the PROFILE_LABELS feature flag to customize profile names.
 */
export type ProfileLabelsMap = Partial<Record<PROFILE_ROLES, string>>;

/**
 * API client interface for the useProfileLabels hook
 */
export interface ProfileLabelsApiClient {
  get<T>(url: string): Promise<{ data: T }>;
}

/**
 * Feature flag version structure for PROFILE_LABELS
 */
export interface ProfileLabelsFlagVersion {
  [key: string]: string | undefined;
}
