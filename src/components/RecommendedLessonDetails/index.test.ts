import {
  RecommendedLessonDetails,
  RecommendedLessonDetailsProps,
} from './index';

describe('RecommendedLessonDetails index exports', () => {
  it('should export RecommendedLessonDetails component', () => {
    expect(RecommendedLessonDetails).toBeDefined();
  });

  it('should have correct component type', () => {
    const props: RecommendedLessonDetailsProps = {
      data: null,
    };
    expect(props).toBeDefined();
  });
});
