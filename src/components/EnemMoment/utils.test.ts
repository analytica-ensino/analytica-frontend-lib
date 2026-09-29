import {
  MISSING_VALUE,
  formatClock,
  formatCount,
  formatDateTime,
  formatHoursMinutes,
  formatMinutesSeconds,
  formatPercentage,
  formatScore,
} from './utils';

describe('formatCount', () => {
  it('writes an integer with pt-BR thousands separators', () => {
    expect(formatCount(16778)).toBe('16.778');
    expect(formatCount(0)).toBe('0');
  });
});

describe('formatPercentage', () => {
  it('writes a 0–100 share with up to one decimal, pt-BR', () => {
    expect(formatPercentage(18.3)).toBe('18,3%');
    expect(formatPercentage(100)).toBe('100%');
    expect(formatPercentage(71.45)).toBe('71,5%');
  });

  it('marks a missing value', () => {
    expect(formatPercentage(null)).toBe(MISSING_VALUE);
    expect(MISSING_VALUE).toBe('—');
  });
});

describe('formatHoursMinutes', () => {
  it.each([
    [4800, '1h 20min'],
    [7200, '2h'],
    [1500, '25min'],
    [12600, '3h 30min'],
    [3599, '1h'],
    [20, '20s'],
  ])('%is → %s', (seconds, expected) => {
    expect(formatHoursMinutes(seconds)).toBe(expected);
  });

  it('marks a missing value', () => {
    expect(formatHoursMinutes(null)).toBe('—');
    expect(formatHoursMinutes(Number.NaN)).toBe('—');
    expect(formatHoursMinutes(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('formatMinutesSeconds', () => {
  it.each([
    [89, '1min 29s'],
    [60, '1min'],
    [45, '45s'],
    [59.6, '1min'],
  ])('%is → %s', (seconds, expected) => {
    expect(formatMinutesSeconds(seconds)).toBe(expected);
  });

  it('marks a missing value', () => {
    expect(formatMinutesSeconds(null)).toBe('—');
    expect(formatMinutesSeconds(Number.NaN)).toBe('—');
  });
});

describe('formatScore', () => {
  it('writes a 0–10 score with one decimal, pt-BR', () => {
    expect(formatScore(9.5)).toBe('9,5');
    expect(formatScore(7)).toBe('7,0');
    expect(formatScore(5.14)).toBe('5,1');
  });
});

describe('formatClock', () => {
  it.each([
    [4805, '01:20:05'],
    [59, '00:00:59'],
    [36000, '10:00:00'],
    [89.4, '00:01:29'],
  ])('%is → %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected);
  });

  it('marks a missing value', () => {
    expect(formatClock(null)).toBe('—');
    expect(formatClock(Number.NaN)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('writes the day and the time the way the student modals do', () => {
    expect(formatDateTime('2026-09-25T14:05:00')).toBe('25/09/2026 • 14:05h');
    expect(formatDateTime('2026-01-02T08:03:00')).toBe('02/01/2026 • 08:03h');
  });

  it('marks a missing or unreadable date', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('')).toBe('—');
    expect(formatDateTime('not a date')).toBe('—');
  });
});
