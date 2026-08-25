import { useCallback, useEffect, useRef } from 'react';
import { printAsPdf } from '../utils/exportPdf';

/**
 * How long the print-time DOM changes may stay in place without an `afterprint`.
 *
 * Reached only when the event never comes. Generous on purpose: it is a
 * safeguard, not the normal path, and a short one could undo the rename while
 * the dialog is still open — which is the failure the whole deferred restore
 * exists to prevent.
 */
const RESTORE_TIMEOUT_MS = 60_000;

/** What one print run should look like. Both fields are optional. */
export interface ReportPrintOptions {
  /**
   * Name the PDF should be offered under, extension aside.
   *
   * Applied by renaming the tab: `printAsPdf` is `globalThis.print()`, so there
   * is no library and no file name to hand anyone — the report IS the printed
   * page.
   *
   * PREMISE, INHERITED AND NOT MEASURED HERE: that the browser's print-to-PDF
   * takes the file name from `document.title`, and reads it at some moment the
   * restore must not race. Nothing in this repo verifies it and no test here
   * can — everything that would do the reading lives past `globalThis.print()`,
   * which the suite replaces with a mock. It is carried over from
   * frontend-professor-web, which renames the tab for this stated reason
   * (`usePerformanceExport.ts:620-624`) and defers the undo rather than doing it
   * inline. Every claim below phrased as "before the browser reads it" rests on
   * this premise and is no better established than it is.
   *
   * Omit it and the title is left untouched.
   */
  readonly fileName?: string;
  /**
   * Class to put on `<body>` for the duration of the print.
   *
   * The hook only adds and removes it; what it MEANS lives in the consumer's
   * `@media print` CSS. The established value is `printing-modal`, whose rules in
   * frontend-gestor-web (`src/styles/global.css:112-146`) hide every branch of
   * the page that does not contain the dialog tagged `js-print-region`, and
   * un-float that dialog, so the printed pages carry the modal alone. Both
   * names are kept as they are so that app needs no change; a consumer that
   * wants other print-time behaviour passes its own class and writes its own
   * rules. Omit it and `<body>` is left untouched, which is the whole-page
   * report.
   */
  readonly bodyClass?: string;
}

/**
 * Print the current page as a report PDF, restoring the DOM afterwards.
 *
 * Consolidates the two independent implementations the apps grew — the tab
 * rename in frontend-professor-web and the body tagging in
 * frontend-gestor-web — into one call that can do either, both, or neither:
 *
 * ```ts
 * const print = useReportPrint();
 *
 * print({ fileName: 'relatorio-x-20-08-2026' });                   // page
 * print({ fileName: '...', bodyClass: 'printing-modal' });         // modal
 * ```
 *
 * The DOM changes are undone on `afterprint`, on a timeout should that event
 * never arrive, and on unmount should the user leave with the dialog open —
 * whichever comes first, once. "Once" is the load-bearing part: the restore
 * detaches every remaining path to itself BEFORE it writes anything, so a title
 * the page set after the dialog closed is never clobbered by a late timeout, a
 * duplicated event or an unmount.
 *
 * @returns A stable callback; safe in a dependency array.
 */
export function useReportPrint(): (options?: ReportPrintOptions) => void {
  // Undoes the print in flight, or null when none is. A ref so the listener,
  // the timeout and the unmount below all reach the same restore instead of
  // each holding its own copy of what to put back.
  const restoreRef = useRef<(() => void) | null>(null);

  // Leaving the screen mid-dialog would otherwise strand the report name on the
  // tab, the class on the body, and the listener on the window.
  useEffect(() => () => restoreRef.current?.(), []);

  return useCallback((options: ReportPrintOptions = {}) => {
    const { fileName, bodyClass } = options;

    // A second print while a dialog is open would otherwise take the FIRST
    // report's name as the title to go back to, and inherit its body class.
    restoreRef.current?.();

    const previousTitle = document.title;

    if (fileName) document.title = fileName;
    if (bodyClass) document.body.classList.add(bodyClass);

    let timeoutId: ReturnType<typeof setTimeout>;

    // Runs once: it detaches the listener, the safeguard and the ref the
    // unmount reads before touching the DOM, so nothing that fires afterwards
    // can overwrite state the page has moved on to.
    //
    // THE ORDER OF THE STATEMENTS BELOW IS A DELIBERATE INVARIANT THAT NO TEST
    // CATCHES — measured, not assumed: inverting it, so the DOM writes come
    // first and the three detachments after, leaves the whole suite green. JS
    // is single-threaded and none of these writes re-enters `restore`
    // synchronously, so jsdom cannot tell the two orders apart. What the tests
    // do pin is the observable idempotency — dropping `restoreRef.current =
    // null` or the `removeEventListener` turns tests red — not the ordering
    // that would keep it holding if a write ever did re-enter. Detach-then-write
    // is the order that needs no such assumption, so it stays; do not let a
    // refactor "tidy" the writes up to the top on the grounds that nothing
    // fails.
    const restore = () => {
      restoreRef.current = null;
      globalThis.removeEventListener('afterprint', restore);
      clearTimeout(timeoutId);

      if (fileName) document.title = previousTitle;
      if (bodyClass) document.body.classList.remove(bodyClass);
    };

    restoreRef.current = restore;

    // Restoring right after `print()` returns would only be safe if the call
    // blocked until the dialog closed. Under the premise on `fileName` — and
    // only under it — an inline undo risks putting the title back before it is
    // read, handing over a file named after the app. Hence three deferred
    // paths instead: the event, the safeguard, the unmount.
    globalThis.addEventListener('afterprint', restore);
    timeoutId = setTimeout(restore, RESTORE_TIMEOUT_MS);

    printAsPdf();
  }, []);
}
