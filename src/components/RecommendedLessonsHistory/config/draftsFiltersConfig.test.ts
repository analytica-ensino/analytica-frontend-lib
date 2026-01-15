import { createRecommendedClassDraftsFiltersConfig } from './draftsFiltersConfig';
import type { RecommendedClassUserFilterData } from '../../../types/recommendedLessons';

describe('draftsFiltersConfig', () => {
  describe('createRecommendedClassDraftsFiltersConfig', () => {
    it('should return filter config with subject category', () => {
      const userData: RecommendedClassUserFilterData = {
        schools: [],
        classes: [],
        subjects: [
          { id: 'subject-1', name: 'Matemática' },
          { id: 'subject-2', name: 'Português' },
        ],
      };

      const result = createRecommendedClassDraftsFiltersConfig(userData);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('content');
      expect(result[0].label).toBe('CONTEÚDO');
      expect(result[0].categories).toHaveLength(1);
      expect(result[0].categories[0].key).toBe('subject');
      expect(result[0].categories[0].label).toBe('Matéria');
      expect(result[0].categories[0].selectedIds).toEqual([]);
      expect(result[0].categories[0].itens).toHaveLength(2);
    });

    it('should map subjects to filter options correctly', () => {
      const userData: RecommendedClassUserFilterData = {
        schools: [],
        classes: [],
        subjects: [
          { id: 'math-123', name: 'Matemática' },
          { id: 'port-456', name: 'Português' },
        ],
      };

      const result = createRecommendedClassDraftsFiltersConfig(userData);
      const subjectItems = result[0].categories[0].itens;

      expect(subjectItems).toEqual([
        { id: 'math-123', name: 'Matemática' },
        { id: 'port-456', name: 'Português' },
      ]);
    });

    it('should handle undefined userData', () => {
      const result = createRecommendedClassDraftsFiltersConfig(undefined);

      expect(result).toHaveLength(1);
      expect(result[0].categories[0].itens).toEqual([]);
    });

    it('should handle userData with undefined subjects', () => {
      const userData: RecommendedClassUserFilterData = {
        schools: [],
        classes: [],
        subjects:
          undefined as unknown as RecommendedClassUserFilterData['subjects'],
      };

      const result = createRecommendedClassDraftsFiltersConfig(userData);

      expect(result[0].categories[0].itens).toEqual([]);
    });

    it('should handle empty subjects array', () => {
      const userData: RecommendedClassUserFilterData = {
        schools: [],
        classes: [],
        subjects: [],
      };

      const result = createRecommendedClassDraftsFiltersConfig(userData);

      expect(result[0].categories[0].itens).toEqual([]);
    });

    it('should always return empty selectedIds', () => {
      const userData: RecommendedClassUserFilterData = {
        schools: [],
        classes: [],
        subjects: [{ id: 'subject-1', name: 'Test' }],
      };

      const result = createRecommendedClassDraftsFiltersConfig(userData);

      expect(result[0].categories[0].selectedIds).toEqual([]);
    });
  });
});
