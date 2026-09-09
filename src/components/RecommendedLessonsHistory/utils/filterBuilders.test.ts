import { buildRecommendedClassModelsFiltersFromParams } from './filterBuilders';
import type { TableParams } from '../../TableProvider/TableProvider';

describe('filterBuilders', () => {
  describe('buildRecommendedClassModelsFiltersFromParams', () => {
    it('should return basic pagination filters', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should include search when provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        search: 'test query',
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'test query',
      });
    });

    it('should include subjectIds when subject array is provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-123'],
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        subjectIds: ['subject-123'],
      });
    });

    it('should keep every subject when multiple are provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-1', 'subject-2', 'subject-3'],
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result.subjectIds).toEqual([
        'subject-1',
        'subject-2',
        'subject-3',
      ]);
    });

    it('should not include subjectIds when subject is empty array', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: [],
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result.subjectIds).toBeUndefined();
    });

    it('should not include subjectIds when subject is undefined', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: undefined,
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result.subjectIds).toBeUndefined();
    });

    it('should not include search when empty string', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        search: '',
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result.search).toBeUndefined();
    });

    it('should handle all filters combined', () => {
      const params: TableParams = {
        page: 3,
        limit: 25,
        search: 'aula de matemática',
        subject: ['math-uuid'],
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 3,
        limit: 25,
        search: 'aula de matemática',
        subjectIds: ['math-uuid'],
      });
    });

    it('should handle subject as non-array type gracefully', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: 'not-an-array' as unknown as string[],
      };

      const result = buildRecommendedClassModelsFiltersFromParams(params);

      expect(result.subjectIds).toBeUndefined();
    });
  });
});
