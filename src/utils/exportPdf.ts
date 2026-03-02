/**
 * Trigger the browser print dialog for PDF export.
 * Relies on @media print CSS rules to hide non-report elements.
 */
export function printReportAsPdf(): void {
  globalThis.print();
}
