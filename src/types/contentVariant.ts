/**
 * Content Variant Types
 *
 * Which product an institution runs, read from the `CONTENT_VARIANT` feature
 * flag. Shared so every app (professor, gestor) agrees on the vocabulary.
 */

/**
 * Content variant of an institution.
 *
 * - `DEFAULT`: the standard platform.
 * - `READING_FLUENCY`: reading-fluency mode, with its own shell and no menu.
 * - `B2C`: sold straight to the student; the teacher works with in-person
 *   activities.
 */
export enum ContentVariant {
  DEFAULT = 'DEFAULT',
  READING_FLUENCY = 'READING_FLUENCY',
  B2C = 'B2C',
}

/** Every variant this build knows about. */
export const CONTENT_VARIANTS: readonly ContentVariant[] =
  Object.values(ContentVariant);

/**
 * Normalise a raw flag value into a known variant.
 *
 * A variant this build does not know about must not change how it behaves, so
 * anything unrecognised falls back to `DEFAULT`.
 *
 * @param value - Raw `version.variant` coming from the feature flag
 * @returns A variant this build understands
 */
export const toContentVariant = (value: unknown): ContentVariant =>
  CONTENT_VARIANTS.includes(value as ContentVariant)
    ? (value as ContentVariant)
    : ContentVariant.DEFAULT;
