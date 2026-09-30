/**
 * Makes the text label cover the whole row through its `::after`, so a click
 * anywhere on the alternative (padding, badge, blank space) selects it — not
 * only the radio circle or the text itself. The row must be `relative`.
 */
export const STRETCHED_LABEL_CLASSES =
  "after:absolute after:inset-0 after:rounded-lg after:content-['']";

/**
 * Row classes for an interactive alternative: positioning context for the
 * stretched label and a focus ring on the whole row while the inner input
 * has keyboard focus.
 */
export const ROW_INTERACTION_CLASSES =
  'relative has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indicator-info';
