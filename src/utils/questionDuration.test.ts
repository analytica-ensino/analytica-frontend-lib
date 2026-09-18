import { formatQuestionDuration } from './questionDuration';

describe('formatQuestionDuration', () => {
  describe('absent measurement', () => {
    it('returns null when there is no measured time', () => {
      expect(formatQuestionDuration(0)).toBeNull();
      expect(formatQuestionDuration(null)).toBeNull();
      expect(formatQuestionDuration(undefined)).toBeNull();
    });

    it('returns null for negative or non-finite input instead of rendering garbage', () => {
      expect(formatQuestionDuration(-1)).toBeNull();
      expect(formatQuestionDuration(-30)).toBeNull();
      expect(formatQuestionDuration(Number.NaN)).toBeNull();
      expect(formatQuestionDuration(Number.POSITIVE_INFINITY)).toBeNull();
      expect(formatQuestionDuration(Number.NEGATIVE_INFINITY)).toBeNull();
    });

    // A sub-second value floors to zero, so it must take the same path as a
    // plain 0 — rendering `00:00:00` here would read as "the student guessed".
    it('treats a sub-second value as no measurement rather than rendering 00:00:00', () => {
      expect(formatQuestionDuration(0.4)).toBeNull();
      expect(formatQuestionDuration(0.9)).toBeNull();
      expect(formatQuestionDuration(-0.5)).toBeNull();
    });
  });

  describe('seconds only (under a minute)', () => {
    it('zero-pads the empty hour and minute fields', () => {
      expect(formatQuestionDuration(1)).toBe('00:00:01');
      expect(formatQuestionDuration(9)).toBe('00:00:09');
      expect(formatQuestionDuration(40)).toBe('00:00:40');
    });

    it('formats the last second before a minute', () => {
      expect(formatQuestionDuration(59)).toBe('00:00:59');
    });
  });

  describe('minutes', () => {
    it('fills the minute field exactly at 60 seconds', () => {
      expect(formatQuestionDuration(60)).toBe('00:01:00');
    });

    it('keeps both fields zero-padded to two digits', () => {
      expect(formatQuestionDuration(61)).toBe('00:01:01');
      expect(formatQuestionDuration(69)).toBe('00:01:09');
      expect(formatQuestionDuration(150)).toBe('00:02:30');
    });

    it('formats the last second before an hour', () => {
      expect(formatQuestionDuration(3599)).toBe('00:59:59');
    });
  });

  describe('hours', () => {
    it('fills the hour field exactly at 3600 seconds', () => {
      expect(formatQuestionDuration(3600)).toBe('01:00:00');
    });

    it('keeps minutes and seconds zero-padded once an hour is present', () => {
      expect(formatQuestionDuration(3601)).toBe('01:00:01');
      expect(formatQuestionDuration(3660)).toBe('01:01:00');
      expect(formatQuestionDuration(3930)).toBe('01:05:30');
    });

    it('lets the hour field grow past two digits, so long sessions stay readable', () => {
      expect(formatQuestionDuration(36000)).toBe('10:00:00');
      expect(formatQuestionDuration(86399)).toBe('23:59:59');
      expect(formatQuestionDuration(360000)).toBe('100:00:00');
    });
  });

  describe('fractional input', () => {
    it('truncates rather than rounds, so a duration is never overstated', () => {
      expect(formatQuestionDuration(40.9)).toBe('00:00:40');
      expect(formatQuestionDuration(59.999)).toBe('00:00:59');
      expect(formatQuestionDuration(3599.9)).toBe('00:59:59');
    });
  });
});
