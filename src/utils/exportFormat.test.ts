import { PERIOD_TABS } from '../hooks/useStudentsHighlight';
import { REPORT_PERIOD } from '../types/common';
import {
  PERIOD_LABELS,
  describeSelection,
  formatDateForFileName,
  formatTimestamp,
  type AccessScope,
  type NamedEntity,
} from './exportFormat';

/**
 * The date fixtures below are built from local components, so a UTC-based
 * implementation prints a different string — but only where the runner's offset
 * is not zero. At UTC+0 local and UTC agree by definition, and no assertion on
 * the output alone can tell the two apart.
 *
 * Pinning the timezone from inside the suite does not rescue that. Assigning
 * `process.env.TZ` in a `beforeAll` is silently inert under Jest: the write is
 * stored (reading `process.env.TZ` back returns the new value) but the runtime
 * never learns the timezone changed, so `Date` keeps the offset the process
 * started with. Measured on this repo, formatting a fixed instant before and
 * after the assignment:
 *
 *   jest, testEnvironment 'node'    180 -> 180   (inert)
 *   jest, testEnvironment 'jsdom'   180 -> 180   (inert)
 *   plain node 22, same two lines   180 ->   0   (works)
 *
 * So the cause is Jest, not jsdom — the two environments behave identically and
 * only plain Node honours the reassignment. Setting `TZ` on the command line
 * (or in a `globalSetup`, which runs before the workers fork) does work,
 * because then the process starts in the wanted timezone and nothing has to
 * change afterwards.
 *
 * `readsOnlyLocalGetters` below therefore covers the same regression through
 * the mechanism instead of the output, and that one bites in every timezone.
 *
 * IF YOU MIGRATE THESE HELPERS TO A DATE LIBRARY, DELETE THAT GUARD — do not
 * try to satisfy it. It asserts that the formatters read the accessors of the
 * very `Date` instance they were handed, which is true only of hand-rolled
 * getter code. `dayjs(date).format('DD/MM/YYYY HH:mm')` returns the correct
 * '05/01/2026 23:50' for the fixture below while touching none of the spied
 * methods (verified: `called` comes back empty, `valueOf`/`getTime` included),
 * so the guard would fail correct code. Replace it by running the suite with an
 * explicit non-zero-offset `TZ` — that restores real timezone coverage through
 * the fixtures, whatever the implementation is built on.
 */

/** The accessors a correct implementation must read. */
const LOCAL_GETTERS = [
  'getDate',
  'getMonth',
  'getFullYear',
  'getHours',
  'getMinutes',
] as const;

/**
 * The accessors that would silently move the report to another day.
 * `toJSON` is here because it delegates to `toISOString`.
 */
const UTC_GETTERS = [
  'toISOString',
  'toJSON',
  'getUTCDate',
  'getUTCMonth',
  'getUTCFullYear',
  'getUTCHours',
  'getUTCMinutes',
] as const;

/**
 * Assert that `format` reads `date` through local accessors only.
 *
 * Timezone-independent, unlike the fixture assertions: it fails on a UTC-based
 * implementation even when the suite runs at UTC+0.
 *
 * IF THIS FAILED BECAUSE THE FORMATTER MOVED TO A DATE LIBRARY, DELETE THIS
 * GUARD — do not try to satisfy it. It asserts that the formatter reads the
 * accessors of the very `Date` instance it was handed, which is true only of
 * hand-rolled getter code. `dayjs(date).format('DD/MM/YYYY HH:mm')` returns the
 * correct '05/01/2026 23:50' for the fixture used here while touching none of
 * the spied methods (verified: `called` comes back empty, `valueOf`/`getTime`
 * included), so this would reject correct code. Replace it by running the suite
 * with an explicit non-zero-offset `TZ`, which restores real timezone coverage
 * through the fixtures whatever the implementation is built on. Full reasoning
 * in the note at the top of this file.
 */
function readsOnlyLocalGetters(
  format: (date: Date) => string,
  date: Date,
  expectedLocal: readonly (typeof LOCAL_GETTERS)[number][]
) {
  const spies = [...LOCAL_GETTERS, ...UTC_GETTERS].map((method) => ({
    method,
    spy: jest.spyOn(date, method),
  }));

  format(date);

  const called = spies
    .filter(({ spy }) => spy.mock.calls.length > 0)
    .map(({ method }) => method);

  expect(called.slice().sort()).toEqual(expectedLocal.slice().sort());
}

describe('formatTimestamp', () => {
  it('pads single-digit day, month, hour and minute to two digits', () => {
    expect(formatTimestamp(new Date(2026, 0, 5, 9, 5))).toBe(
      '05/01/2026 09:05'
    );
  });

  it('keeps the local hour just after midnight', () => {
    // 00:10 in São Paulo is 03:10Z on the same day: a UTC-based
    // implementation would print the wrong hour here.
    expect(formatTimestamp(new Date(2026, 0, 5, 0, 10))).toBe(
      '05/01/2026 00:10'
    );
  });

  it('keeps the local day late in the evening', () => {
    // 23:50 in São Paulo is 02:50Z on the NEXT day: a UTC-based
    // implementation would print both the wrong hour and the wrong date.
    expect(formatTimestamp(new Date(2026, 0, 5, 23, 50))).toBe(
      '05/01/2026 23:50'
    );
  });

  it('reads the local calendar accessors and never the UTC ones', () => {
    readsOnlyLocalGetters(formatTimestamp, new Date(2026, 0, 5, 23, 50), [
      'getDate',
      'getMonth',
      'getFullYear',
      'getHours',
      'getMinutes',
    ]);
  });
});

describe('formatDateForFileName', () => {
  it('pads single-digit day and month to two digits, separated by hyphens', () => {
    expect(formatDateForFileName(new Date(2026, 0, 5, 9, 5))).toBe(
      '05-01-2026'
    );
  });

  it('keeps the local date late on the last evening of the year', () => {
    // 31/12/2026 23:50 in São Paulo is 01/01/2027 02:50Z: a UTC-based
    // implementation would stamp the wrong day, month AND year.
    expect(formatDateForFileName(new Date(2026, 11, 31, 23, 50))).toBe(
      '31-12-2026'
    );
  });

  it('reads the local calendar accessors and never the UTC ones', () => {
    // No hour or minute here: the file name carries a date only.
    readsOnlyLocalGetters(
      formatDateForFileName,
      new Date(2026, 11, 31, 23, 50),
      ['getDate', 'getMonth', 'getFullYear']
    );
  });
});

describe('describeSelection', () => {
  const options: NamedEntity[] = [
    { id: 'school-a', name: 'Escola A' },
    { id: 'school-b', name: 'Escola B' },
  ];

  it('reports an empty selection as "Todos"', () => {
    expect(describeSelection([], options)).toBe('Todos');
  });

  it('resolves a selected id to its name', () => {
    expect(describeSelection(['school-b'], options)).toBe('Escola B');
  });

  it('falls back to the id itself when no option matches', () => {
    expect(describeSelection(['school-ghost'], options)).toBe('school-ghost');
  });

  it('joins several ids with a comma, in the selected order, resolving each one independently', () => {
    expect(
      describeSelection(['school-b', 'school-ghost', 'school-a'], options)
    ).toBe('Escola B, school-ghost, Escola A');
  });

  it('accepts the readonly lists an AccessScope carries', () => {
    const scope: AccessScope = {
      schools: options,
      schoolYears: [{ id: 'year-1', name: '1º ano' }],
      classes: [],
    };

    expect(describeSelection(['year-1'], scope.schoolYears)).toBe('1º ano');
    expect(describeSelection(['class-1'], scope.classes)).toBe('class-1');
  });
});

describe('PERIOD_LABELS', () => {
  it('spells every period out in full, with no extra key', () => {
    // `toEqual` on the whole table, not a per-key loop: it pins the five labels
    // AND rejects a sixth key, so no separate key-set assertion is needed.
    expect(PERIOD_LABELS).toEqual({
      [REPORT_PERIOD.SEVEN_DAYS]: 'Últimos 7 dias',
      [REPORT_PERIOD.ONE_MONTH]: 'Último mês',
      [REPORT_PERIOD.THREE_MONTHS]: 'Últimos 3 meses',
      [REPORT_PERIOD.SIX_MONTHS]: 'Últimos 6 meses',
      [REPORT_PERIOD.ONE_YEAR]: 'Último ano',
    });
  });

  it('does not reuse the on-screen tab labels of PERIOD_TABS', () => {
    // Guards the divergence documented on PERIOD_LABELS: a spreadsheet is read
    // away from the tab bar, so "7 dias" alone would not read as a period.
    // If someone "aligns" the two wordings, this goes red.
    //
    // PERIOD_TABS, not the PeriodSelector component's PERIOD_OPTIONS: it is
    // PERIOD_TABS that renders the tab bar next to these reports. The two lists
    // happen to carry the same wording today, which is exactly why the one
    // being compared has to be named explicitly.
    // Widened to plain strings on purpose. Both tables are `as const`, so
    // comparing them directly makes TS reject the test with TS2367 ("no
    // overlap") — it can already prove the two label sets are disjoint TODAY.
    // That proof is not the guard we want: the moment someone aligns a wording
    // the unions overlap, TS2367 vanishes, and only a runtime check still
    // fails. Do not "simplify" this back to indexing PERIOD_LABELS directly.
    const labels: Record<string, string> = PERIOD_LABELS;
    const collisions = PERIOD_TABS.filter(
      (tab) => labels[tab.value] === tab.label
    );

    expect(collisions).toEqual([]);
  });
});
