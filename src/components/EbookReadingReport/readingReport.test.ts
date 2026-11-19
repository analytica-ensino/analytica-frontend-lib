import { REPORT_PERIOD } from '../../types/common';
import {
  PERIOD_LABEL,
  formatPercent,
  formatReadingDate,
  readingTier,
  studentBookStatus,
} from './readingReport';
import { EBOOK_STUDENT_BOOK_STATUS, READING_TIER } from './types';

describe('readingTier', () => {
  it.each([
    [100, READING_TIER.HIGHLIGHT],
    [75, READING_TIER.HIGHLIGHT],
    [74.9, READING_TIER.ABOVE_AVERAGE],
    [50, READING_TIER.ABOVE_AVERAGE],
    [49.9, READING_TIER.BELOW_AVERAGE],
    [25, READING_TIER.BELOW_AVERAGE],
    [24.9, READING_TIER.ATTENTION],
    [0.5, READING_TIER.ATTENTION],
    [0, READING_TIER.NONE],
    [Number.NaN, READING_TIER.NONE],
  ])('puts %p%% in the %s tier, on the access map bands', (percent, tier) => {
    expect(readingTier(percent)).toBe(tier);
  });
});

describe('studentBookStatus', () => {
  it('is read once the reading rule is met, whatever the progress', () => {
    expect(
      studentBookStatus({
        effectiveReadAt: '2026-11-10T10:00:00Z',
        percent: 80,
      })
    ).toBe(EBOOK_STUDENT_BOOK_STATUS.READ);
  });

  it('is being read while pages are seen, and only opened before', () => {
    expect(studentBookStatus({ effectiveReadAt: null, percent: 30 })).toBe(
      EBOOK_STUDENT_BOOK_STATUS.READING
    );
    expect(studentBookStatus({ effectiveReadAt: null, percent: 0 })).toBe(
      EBOOK_STUDENT_BOOK_STATUS.OPENED
    );
  });
});

describe('report formatting', () => {
  it('writes percentages the pt-BR way, one decimal at most', () => {
    expect(formatPercent(60.25)).toBe('60,3%');
    expect(formatPercent(40)).toBe('40%');
  });

  it('writes dates day first, and a dash without one', () => {
    expect(formatReadingDate('2026-11-18T12:00:00Z')).toBe('18/11/2026');
    expect(formatReadingDate(null)).toBe('—');
  });

  it('names every period for the titles', () => {
    expect(PERIOD_LABEL[REPORT_PERIOD.SEVEN_DAYS]).toBe('7 dias');
    expect(PERIOD_LABEL[REPORT_PERIOD.ONE_YEAR]).toBe('1 ano');
  });
});
