import type { MultiSearchSelectSize, MultiSearchSelectVariant } from './types';

/**
 * Trigger height per size.
 *
 * Uses `min-h-*` where `SearchSelect` uses a fixed `h-*`: chips wrap onto more
 * than one line once several values are selected.
 */
export const SIZE_CLASSES: Record<MultiSearchSelectSize, string> = {
  small: 'text-sm min-h-8',
  medium: 'text-md min-h-9',
  large: 'text-lg min-h-10',
};

export const PADDING_CLASSES: Record<MultiSearchSelectSize, string> = {
  small: 'px-3 py-1',
  medium: 'px-3 py-2',
  large: 'px-4 py-3',
};

export const VARIANT_CLASSES: Record<MultiSearchSelectVariant, string> = {
  outlined: 'border-2 rounded-lg focus:border-primary-950',
  underlined: 'border-b-2 focus:border-primary-950',
  rounded: 'border-2 rounded-full focus:border-primary-950',
};

export const LABEL_SIZE_CLASSES: Record<MultiSearchSelectSize, string> = {
  small: 'text-sm',
  medium: 'text-md',
  large: 'text-lg',
};

/** Keys that open the dropdown while the trigger has focus. */
export const OPEN_KEYS = ['Enter', ' ', 'ArrowDown'];

/** Matches the dropdown's `max-h`, used to decide whether it flips above. */
export const DROPDOWN_MAX_HEIGHT = 300;

/**
 * Floor for the dropdown height, enough for the search field plus a couple of
 * rows. Guards against a trigger scrolled past a viewport edge, where the
 * measured space turns negative.
 */
export const DROPDOWN_MIN_HEIGHT = 120;

/** Distance between the trigger and the dropdown. */
export const DROPDOWN_GAP = 4;
