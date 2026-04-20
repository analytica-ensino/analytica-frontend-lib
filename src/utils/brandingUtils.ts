/**
 * Helper function to normalize branding field values to string | null
 * Handles undefined values from SessionInfo by coercing to null
 *
 * @param value - The value to normalize (can be any type)
 * @returns string if the value is a string, null otherwise
 *
 * @example
 * ```ts
 * normalizeBrandingField('logo.png') // 'logo.png'
 * normalizeBrandingField(null) // null
 * normalizeBrandingField(undefined) // null
 * normalizeBrandingField({}) // null
 * ```
 */
export const normalizeBrandingField = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  return null;
};
