import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('returns the initials of the first two words', () => {
    expect(getInitials('Marina Costa')).toBe('MC');
  });

  it('ignores words after the second one', () => {
    expect(getInitials('ana maria souza')).toBe('AM');
  });

  it('returns a single initial for one-word names', () => {
    expect(getInitials('Ana')).toBe('A');
  });

  it('ignores extra whitespace', () => {
    expect(getInitials('  Marina   Costa ')).toBe('MC');
  });

  it('keeps astral characters (e.g. emoji) intact', () => {
    expect(getInitials('😀Marina Costa')).toBe('😀C');
  });

  it('returns an empty string for blank names', () => {
    expect(getInitials('   ')).toBe('');
  });
});
