import { getCorrectionPerformanceTag } from './performanceTag';

describe('getCorrectionPerformanceTag', () => {
  it.each([
    [10, 'HIGHLIGHT'],
    [9, 'HIGHLIGHT'],
    [8.9, 'ABOVE_AVERAGE'],
    [7, 'ABOVE_AVERAGE'],
    [6.9, 'BELOW_AVERAGE'],
    [4, 'BELOW_AVERAGE'],
    [3.9, 'ATTENTION_POINT'],
    [0, 'ATTENTION_POINT'],
  ])('classifies the grade %s as %s', (score, expected) => {
    expect(getCorrectionPerformanceTag(score)).toBe(expected);
  });

  // No grade means the activity was not corrected yet: there is no band to
  // name, and the header simply shows no badge.
  it.each([[null], [undefined], [Number.NaN]])(
    'returns null for %s',
    (score) => {
      expect(getCorrectionPerformanceTag(score)).toBeNull();
    }
  );
});
