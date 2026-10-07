/**
 * How the reports write numbers and scores — pt-BR, and "—" for what the API
 * could not give.
 *
 * Shared because the same card is drawn from more than one report: the Momento
 * ENEM sections and the knowledge block of the generic reports must spell the
 * same figures the same way.
 */

/** Integer with pt-BR thousands separators: 16778 → "16.778". */
export const formatCount = (value: number): string =>
  value.toLocaleString('pt-BR');

/** Shown in place of a number the API could not give. */
export const MISSING_VALUE = '—';

/** A 0–10 score, one decimal, pt-BR — as the reports print it: "5,2". */
export const formatReportScore = (score: number): string =>
  score.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
