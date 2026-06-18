// Mock the barrel export dependencies
jest.mock('../../..', () => ({
  Button: () => null,
  Text: () => null,
  SkeletonText: () => null,
  Skeleton: () => null,
  SkeletonCard: () => null,
}));

import {
  RecommendedLessonCreateHeader,
  RecommendedLessonCreateSkeleton,
} from './index';

describe('RecommendedLessonCreate components index', () => {
  describe('exports', () => {
    it('should export RecommendedLessonCreateHeader', () => {
      expect(RecommendedLessonCreateHeader).toBeDefined();
      expect(typeof RecommendedLessonCreateHeader).toBe('function');
    });

    it('should export RecommendedLessonCreateSkeleton', () => {
      expect(RecommendedLessonCreateSkeleton).toBeDefined();
      expect(typeof RecommendedLessonCreateSkeleton).toBe('function');
    });
  });
});
