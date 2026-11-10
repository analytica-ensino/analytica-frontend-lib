/** Lets the player pick the rendition (ABR). It is the default choice. */
export const AUTO_QUALITY = 'auto';

/** A quality choice: automatic, or a rendition by picture height (720). */
export type QualitySelection = typeof AUTO_QUALITY | number;

/**
 * Label shown in the quality menu.
 *
 * @param quality - Automatic, or a picture height in pixels
 * @returns "Automático" or the height with a "p" (720p)
 */
export const formatQualityLabel = (quality: QualitySelection): string =>
  quality === AUTO_QUALITY ? 'Automático' : `${quality}p`;
