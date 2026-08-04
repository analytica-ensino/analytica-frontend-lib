/**
 * Shared sizing rules for resizable images inside the RichEditor.
 *
 * Both the Tiptap image extension and the image insertion dialog need the same
 * numbers, so they live here instead of being duplicated on each side.
 */

/** Smallest width a resize handle may produce, in pixels. */
export const MIN_IMAGE_WIDTH = 48;

/**
 * Smallest height a resize handle may produce, in pixels.
 * Lower than the width floor so wide, short banners can still be shrunk without
 * the height constraint fighting the width.
 */
export const MIN_IMAGE_HEIGHT = 24;

/**
 * Width applied on insert when the source image is wider than this.
 * Exam boards upload figures at their original scan resolution, which would
 * otherwise fill the whole statement.
 */
export const DEFAULT_MAX_INSERT_WIDTH = 640;

/** Milliseconds to wait for an image to load before giving up on measuring it. */
const MEASURE_TIMEOUT_MS = 3000;

/** Matches a pixel width in an inline style, e.g. `width: 320px`. */
const STYLE_WIDTH_PATTERN = /(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px/i;

/**
 * Converts a raw width value into a usable number of pixels.
 * Percentages and other units are rejected: the resizable node view appends
 * `px` to whatever it is given, so a stored `50%` would become `50%px`.
 * @param value - Raw attribute or style value
 * @returns The width in pixels, or null when it cannot be used
 */
const toPixelWidth = (value: string | null): number | null => {
  if (!value) return null;

  const trimmed = value.trim();
  // Accepts "400" and "400px" only. Anything else (%, em, vw, calc) is dropped.
  const match = /^(\d+(?:\.\d+)?)(px)?$/i.exec(trimmed);
  if (!match) return null;

  const parsed = Number.parseFloat(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return Math.round(parsed);
};

/**
 * Reads a usable pixel width from an `<img>` element.
 * The `width` attribute wins; an inline `width: Npx` style is used as fallback
 * so images pasted from other editors keep their intended size.
 * @param element - The image element being parsed by Tiptap
 * @returns The width in pixels, or null when the image has no usable width
 */
export const parseImageWidth = (element: HTMLElement): number | null => {
  const fromAttribute = toPixelWidth(element.getAttribute('width'));
  if (fromAttribute !== null) return fromAttribute;

  const inlineStyle = element.getAttribute('style');
  if (!inlineStyle) return null;

  const styleMatch = STYLE_WIDTH_PATTERN.exec(inlineStyle);
  return styleMatch ? toPixelWidth(styleMatch[1]) : null;
};

/**
 * Loads an image off-DOM to discover its natural width.
 * Never rejects: a broken URL or a slow CDN resolves to null so the caller can
 * insert the image without a width instead of blocking on the network.
 * @param src - Public URL of the image
 * @param timeoutMs - How long to wait before giving up
 * @returns The natural width in pixels, or null when it cannot be measured
 */
export const measureNaturalWidth = (
  src: string,
  timeoutMs: number = MEASURE_TIMEOUT_MS
): Promise<number | null> => {
  if (!src || globalThis.Image === undefined) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new globalThis.Image();
    let settled = false;

    const finish = (width: number | null) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeoutId);
      image.onload = null;
      image.onerror = null;
      resolve(width);
    };

    const timeoutId = globalThis.setTimeout(() => finish(null), timeoutMs);

    image.onload = () => finish(image.naturalWidth || null);
    image.onerror = () => finish(null);
    image.src = src;
  });
};
