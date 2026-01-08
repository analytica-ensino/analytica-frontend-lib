import { buildGoalModelsFiltersFromParams } from './filterBuilders';
import type { TableParams } from '../../TableProvider/TableProvider';

describe('filterBuilders', () => {
  describe('buildGoalModelsFiltersFromParams', () => {
    it('should return basic pagination filters', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
      };

      const result = buildGoalModelsFiltersFromParams(params);

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

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'test query',
      });
    });

    it('should include subjectId when subject array is provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-123'],
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        subjectId: 'subject-123',
      });
    });

    it('should use first subject when multiple are provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-1', 'subject-2', 'subject-3'],
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result.subjectId).toBe('subject-1');
    });

    it('should not include subjectId when subject is empty array', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: [],
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result.subjectId).toBeUndefined();
    });

    it('should not include subjectId when subject is undefined', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: undefined,
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result.subjectId).toBeUndefined();
    });

    it('should not include search when empty string', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        search: '',
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result.search).toBeUndefined();
    });

    it('should handle all filters combined', () => {
      const params: TableParams = {
        page: 3,
        limit: 25,
        search: 'aula de matemática',
        subject: ['math-uuid'],
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 3,
        limit: 25,
        search: 'aula de matemática',
        subjectId: 'math-uuid',
      });
    });

    it('should handle subject as non-array type gracefully', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: 'not-an-array' as unknown as string[],
      };

      const result = buildGoalModelsFiltersFromParams(params);

      expect(result.subjectId).toBeUndefined();
    });
  });
});
