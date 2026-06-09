import { splitDateTime } from './splitDateTime';

describe('splitDateTime', () => {
  it('returns empty strings for null/undefined/empty', () => {
    expect(splitDateTime(null)).toEqual({ date: '', time: '' });
    expect(splitDateTime()).toEqual({ date: '', time: '' });
    expect(splitDateTime('')).toEqual({ date: '', time: '' });
  });

  it('returns empty strings for an invalid date', () => {
    expect(splitDateTime('not-a-date')).toEqual({ date: '', time: '' });
  });

  it('splits a valid ISO datetime into local date and time', () => {
    // Build the ISO from a local Date so the assertion is timezone-independent
    const local = new Date(2026, 0, 10, 8, 5); // 2026-01-10 08:05 local
    const result = splitDateTime(local.toISOString());
    expect(result).toEqual({ date: '2026-01-10', time: '08:05' });
  });

  it('zero-pads month, day, hour and minute', () => {
    const local = new Date(2026, 2, 4, 9, 7); // 2026-03-04 09:07 local
    expect(splitDateTime(local.toISOString())).toEqual({
      date: '2026-03-04',
      time: '09:07',
    });
  });
});
