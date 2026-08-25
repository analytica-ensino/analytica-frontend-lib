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
    // plain 0 — rendering `0"` here would read as "the student guessed".
    it('treats a sub-second value as no measurement rather than rendering 0"', () => {
      expect(formatQuestionDuration(0.4)).toBeNull();
      expect(formatQuestionDuration(0.9)).toBeNull();
      expect(formatQuestionDuration(-0.5)).toBeNull();
    });
  });

  describe('seconds only (under a minute)', () => {
    it('formats without padding or a minute unit', () => {
      expect(formatQuestionDuration(1)).toBe('1"');
      expect(formatQuestionDuration(9)).toBe('9"');
      expect(formatQuestionDuration(40)).toBe('40"');
    });

    it('formats the last second before a minute', () => {
      expect(formatQuestionDuration(59)).toBe('59"');
    });
  });

  describe('minutes', () => {
    it('switches to the minute unit exactly at 60 seconds', () => {
      expect(formatQuestionDuration(60)).toBe('1\'00"');
    });

    it('zero-pads the seconds once a minute unit is present', () => {
      expect(formatQuestionDuration(61)).toBe('1\'01"');
      expect(formatQuestionDuration(69)).toBe('1\'09"');
      expect(formatQuestionDuration(150)).toBe('2\'30"');
    });

    it('formats the last second before an hour', () => {
      expect(formatQuestionDuration(3599)).toBe('59\'59"');
    });
  });

  describe('hours', () => {
    it('switches to the hour unit exactly at 3600 seconds', () => {
      expect(formatQuestionDuration(3600)).toBe('1h00\'00"');
    });

    it('zero-pads both minutes and seconds once an hour unit is present', () => {
      expect(formatQuestionDuration(3601)).toBe('1h00\'01"');
      expect(formatQuestionDuration(3660)).toBe('1h01\'00"');
      expect(formatQuestionDuration(3930)).toBe('1h05\'30"');
    });

    it('never pads the hour itself, so long sessions stay readable', () => {
      expect(formatQuestionDuration(36000)).toBe('10h00\'00"');
      expect(formatQuestionDuration(86399)).toBe('23h59\'59"');
      expect(formatQuestionDuration(360000)).toBe('100h00\'00"');
    });
  });

  describe('fractional input', () => {
    it('truncates rather than rounds, so a duration is never overstated', () => {
      expect(formatQuestionDuration(40.9)).toBe('40"');
      expect(formatQuestionDuration(59.999)).toBe('59"');
      expect(formatQuestionDuration(3599.9)).toBe('59\'59"');
    });
  });
});
