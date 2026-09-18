import { hasContentData, roundProgress } from './lessonProgress';
import type { ContentProgressItem } from './types';

const content = (
  progress: number,
  isCompleted: boolean
): ContentProgressItem => ({
  content: { id: 'c-1', name: 'Aula' },
  progress,
  isCompleted,
});

describe('lessonProgress', () => {
  describe('hasContentData', () => {
    it('has data when there is any progress', () => {
      expect(hasContentData(content(35, false))).toBe(true);
    });

    // A completed lesson with zero progress exists in the type; the row shows
    // "0%" for it, not the no-data message.
    it('has data when completed, even at zero progress', () => {
      expect(hasContentData(content(0, true))).toBe(true);
    });

    it('has no data at zero progress on a lesson not completed', () => {
      expect(hasContentData(content(0, false))).toBe(false);
    });
  });

  describe('roundProgress', () => {
    it('rounds to the nearest whole percentage', () => {
      expect(roundProgress(66.6)).toBe(67);
      expect(roundProgress(33.3)).toBe(33);
      expect(roundProgress(0)).toBe(0);
    });
  });
});
