import { toCsv } from './queryParams';

describe('toCsv', () => {
  it('joins the ids with commas', () => {
    expect(toCsv(['a', 'b', 'c'])).toBe('a,b,c');
  });

  it('returns the single id as-is', () => {
    expect(toCsv(['only'])).toBe('only');
  });

  it('returns undefined for an empty array so the param is omitted', () => {
    expect(toCsv([])).toBeUndefined();
  });

  it('returns undefined for non-array input', () => {
    expect(toCsv(undefined)).toBeUndefined();
    expect(toCsv(null)).toBeUndefined();
    expect(toCsv('a,b')).toBeUndefined();
  });

  it('stringifies non-string entries', () => {
    expect(toCsv([1, 2])).toBe('1,2');
  });
});
