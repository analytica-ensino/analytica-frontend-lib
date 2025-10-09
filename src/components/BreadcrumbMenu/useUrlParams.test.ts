import { renderHook } from '@testing-library/react';
import { useUrlParams } from './useUrlParams';
import { useLocation } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('useUrlParams', () => {
  const mockUseLocation = useLocation as jest.MockedFunction<
    typeof useLocation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic param extraction', () => {
    it('should extract single parameter from URL', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2, // index 2 = '123'
        })
      );

      expect(result.current.subjectId).toBe('123');
    });

    it('should extract multiple parameters from URL', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123/subtemas/456',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2, // index 2 = '123'
          topicId: 4, // index 4 = '456'
        })
      );

      expect(result.current.subjectId).toBe('123');
      expect(result.current.topicId).toBe('456');
    });

    it('should extract three parameters from URL', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123/subtemas/456/aulas/789',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2, // index 2 = '123'
          topicId: 4, // index 4 = '456'
          subtopicId: 6, // index 6 = '789'
        })
      );

      expect(result.current.subjectId).toBe('123');
      expect(result.current.topicId).toBe('456');
      expect(result.current.subtopicId).toBe('789');
    });
  });

  describe('edge cases', () => {
    it('should return undefined for parameters not in URL', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
          topicId: 4, // This index does not exist in the URL
        })
      );

      expect(result.current.subjectId).toBe('123');
      expect(result.current.topicId).toBeUndefined();
    });

    it('should handle root path', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 0,
        })
      );

      expect(result.current.subjectId).toBeUndefined();
    });

    it('should handle empty path segments', () => {
      mockUseLocation.mockReturnValue({
        pathname: '///',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          param: 0,
        })
      );

      expect(result.current.param).toBeUndefined();
    });

    it('should handle path with trailing slash', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
        })
      );

      expect(result.current.subjectId).toBe('123');
    });

    it('should handle path with query parameters', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '?filter=active&sort=name',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
        })
      );

      expect(result.current.subjectId).toBe('123');
    });

    it('should handle path with hash', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '#section',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
        })
      );

      expect(result.current.subjectId).toBe('123');
    });
  });

  describe('param index handling', () => {
    it('should handle index 0 correctly', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/first/second/third',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          param: 0,
        })
      );

      expect(result.current.param).toBe('first');
    });

    it('should handle last index correctly', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/first/second/third',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          param: 2,
        })
      );

      expect(result.current.param).toBe('third');
    });

    it('should handle out of bounds index', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/first/second',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          param: 10,
        })
      );

      expect(result.current.param).toBeUndefined();
    });
  });

  describe('complex URL patterns', () => {
    it('should handle numeric and alphanumeric segments', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/users/abc123/posts/456def/comments/789',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          userId: 1,
          postId: 3,
          commentId: 5,
        })
      );

      expect(result.current.userId).toBe('abc123');
      expect(result.current.postId).toBe('456def');
      expect(result.current.commentId).toBe('789');
    });

    it('should handle UUID-like segments', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/api/users/550e8400-e29b-41d4-a716-446655440000/profile',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          userId: 2,
          section: 3,
        })
      );

      expect(result.current.userId).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
      expect(result.current.section).toBe('profile');
    });

    it('should handle paths with special characters in segments', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/products/item-123/reviews/review-456',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          productId: 1,
          reviewId: 3,
        })
      );

      expect(result.current.productId).toBe('item-123');
      expect(result.current.reviewId).toBe('review-456');
    });
  });

  describe('memoization behavior', () => {
    it('should return same result when pathname does not change', () => {
      const location = {
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      };

      mockUseLocation.mockReturnValue(location);

      const { result, rerender } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
        })
      );

      const firstResult = result.current;

      rerender();

      expect(result.current).toStrictEqual(firstResult);
    });

    it('should return new result when pathname changes', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result, rerender } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
        })
      );

      const firstResult = result.current;

      // Change pathname
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/456',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      rerender();

      expect(result.current).not.toBe(firstResult);
      expect(result.current.subjectId).toBe('456');
    });
  });

  describe('empty configuration', () => {
    it('should handle empty config object', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() => useUrlParams({}));

      expect(result.current).toEqual({});
    });
  });

  describe('real-world scenarios', () => {
    it('should extract params from performance navigation URL', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123/subtemas/456/aulas/789',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
          topicId: 4,
          subtopicId: 6,
        })
      );

      expect(result.current).toEqual({
        subjectId: '123',
        topicId: '456',
        subtopicId: '789',
      });
    });

    it('should handle partial navigation', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/desempenho/lista-temas/123/subtemas',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          subjectId: 2,
          section: 3,
        })
      );

      expect(result.current.subjectId).toBe('123');
      expect(result.current.section).toBe('subtemas');
    });

    it('should handle settings navigation', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/settings/profile/notifications',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const { result } = renderHook(() =>
        useUrlParams({
          section: 1,
          subsection: 2,
        })
      );

      expect(result.current.section).toBe('profile');
      expect(result.current.subsection).toBe('notifications');
    });
  });
});
