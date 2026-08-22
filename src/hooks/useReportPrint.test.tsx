import { renderHook } from '@testing-library/react';
import { printAsPdf } from '../utils/exportPdf';
import { useReportPrint } from './useReportPrint';

jest.mock('../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;

/** The app title the tab carries before any report is printed. */
const APP_TITLE = 'Analytica';

/** What the DOM looked like at the single instant that matters. */
interface PrintSnapshot {
  title: string;
  bodyClasses: string;
}

/**
 * Records `document.title` and the `<body>` classes from INSIDE `printAsPdf`.
 *
 * This is the only instant in which either value is load-bearing: the whole
 * point of the hook is that both are put back as soon as the dialog closes, so
 * an assertion made after `print()` returns would pass just as happily against
 * a hook that never touched the DOM at all.
 */
function captureDuringPrint(): PrintSnapshot[] {
  const snapshots: PrintSnapshot[] = [];

  printAsPdfMock.mockImplementation(() => {
    snapshots.push({
      title: document.title,
      bodyClasses: document.body.className,
    });
  });

  return snapshots;
}

/** The `afterprint` the browser fires when the print dialog is dismissed. */
function fireAfterPrint(): void {
  globalThis.dispatchEvent(new Event('afterprint'));
}

describe('useReportPrint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    printAsPdfMock.mockReset();
    document.title = APP_TITLE;
    document.body.className = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Requirement 1
  it('renames the tab to the report file name while the dialog is open', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-x-20-08-2026' });

    expect(snapshots).toEqual([
      { title: 'relatorio-x-20-08-2026', bodyClasses: '' },
    ]);
  });

  // Requirement 2
  it('tags the body with the print class while the dialog is open', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-x', bodyClass: 'printing-modal' });

    expect(snapshots).toEqual([
      { title: 'relatorio-x', bodyClasses: 'printing-modal' },
    ]);
  });

  // Requirement 2, with the option on its own: the modal print and the tab
  // rename must not be welded together. A hook that only added the class when a
  // `fileName` came with it — or only removed it then — would still satisfy
  // every test that passes both.
  it('tags the body without touching the title when only bodyClass is given', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ bodyClass: 'printing-modal' });

    expect(snapshots).toEqual([
      { title: APP_TITLE, bodyClasses: 'printing-modal' },
    ]);

    fireAfterPrint();

    expect(document.body.className).toBe('');
    expect(document.title).toBe(APP_TITLE);
  });

  it('leaves title and body alone when neither option is given', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    // Both spellings of "no options": the parameter is optional, so the
    // argument-less call is part of the API and not merely something the types
    // happen to allow.
    result.current();
    fireAfterPrint();
    result.current({});

    expect(snapshots).toEqual([
      { title: APP_TITLE, bodyClasses: '' },
      { title: APP_TITLE, bodyClasses: '' },
    ]);
  });

  // Requirement 3
  it('restores the title captured at call time, not a fixed one', () => {
    captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-1', bodyClass: 'printing-modal' });
    fireAfterPrint();

    expect(document.title).toBe(APP_TITLE);
    expect(document.body.className).toBe('');

    // A second print from a page that renamed its own tab in between must go
    // back to THAT title — the previous one is read on every call, not once.
    document.title = 'Desempenho | Analytica';

    result.current({ fileName: 'relatorio-2' });
    fireAfterPrint();

    expect(document.title).toBe('Desempenho | Analytica');
  });

  // Requirement 4
  it('keeps the report name on the tab for a full minute when afterprint never comes', () => {
    captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-x', bodyClass: 'printing-modal' });

    // A shorter safeguard would rename the tab back while the dialog is still
    // open — the failure the deferred restore exists to avoid, under the
    // premise documented on `ReportPrintOptions.fileName`.
    jest.advanceTimersByTime(59_999);
    expect(document.title).toBe('relatorio-x');
    expect(document.body.className).toBe('printing-modal');

    jest.advanceTimersByTime(1);
    expect(document.title).toBe(APP_TITLE);
    expect(document.body.className).toBe('');
  });

  // Requirement 5
  it('never overwrites a title set after the restore already ran', () => {
    captureDuringPrint();
    const { result, unmount } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-x', bodyClass: 'printing-modal' });
    fireAfterPrint();
    expect(document.title).toBe(APP_TITLE);

    // The page navigated after the dialog closed. None of the three paths that
    // could still call the restore may put the old title back.
    document.title = 'Outra tela';
    document.body.className = 'printing-modal';

    fireAfterPrint(); // a browser that fires the event twice for one dialog
    jest.advanceTimersByTime(60_000); // the safeguard, now stale
    unmount(); // the component going away

    expect(document.title).toBe('Outra tela');
    expect(document.body.className).toBe('printing-modal');
  });

  // Requirement 6
  it('restores on unmount when the dialog is still open', () => {
    captureDuringPrint();
    const { result, unmount } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-x', bodyClass: 'printing-modal' });

    unmount();

    expect(document.title).toBe(APP_TITLE);
    expect(document.body.className).toBe('');
  });

  // Requirement 7
  it('does not take the previous report name as the title to go back to', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    // First print, no `afterprint`: as far as the hook knows the dialog is
    // still open when the second click arrives.
    result.current({ fileName: 'relatorio-1' });
    result.current({ fileName: 'relatorio-2' });

    expect(snapshots).toEqual([
      { title: 'relatorio-1', bodyClasses: '' },
      { title: 'relatorio-2', bodyClasses: '' },
    ]);

    fireAfterPrint();

    expect(document.title).toBe(APP_TITLE);
  });

  it('drops the body class of the print it superseded', () => {
    const snapshots = captureDuringPrint();
    const { result } = renderHook(() => useReportPrint());

    result.current({ fileName: 'relatorio-1', bodyClass: 'printing-modal' });
    result.current({ fileName: 'relatorio-2' });

    // The second print is a whole-page one, so the class of the first must be
    // gone before it starts. What a leftover class would actually print is an
    // INFERENCE from the gestor's rules, not something measured: under
    // `printing-modal` those rules hide every branch of the page that holds no
    // `js-print-region` dialog, and this print opens none.
    expect(snapshots[1]).toEqual({ title: 'relatorio-2', bodyClasses: '' });
  });

  it('keeps the same callback identity across renders', () => {
    const { result, rerender } = renderHook(() => useReportPrint());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
