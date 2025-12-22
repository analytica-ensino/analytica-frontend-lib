import { createModelsFiltersConfig } from './modelsFiltersConfig';
import type { ActivityUserFilterData } from '../../../types/activitiesHistory';

describe('modelsFiltersConfig', () => {
  describe('createModelsFiltersConfig', () => {
    it('should return 1 filter configuration', () => {
      const config = createModelsFiltersConfig(undefined);
      expect(config).toHaveLength(1);
    });

    it('should create content filter with correct structure', () => {
      const config = createModelsFiltersConfig(undefined);
      const contentFilter = config[0];

      expect(contentFilter.key).toBe('content');
      expect(contentFilter.label).toBe('CONTEÚDO');
      expect(contentFilter.categories).toHaveLength(1);
      expect(contentFilter.categories[0].key).toBe('subject');
      expect(contentFilter.categories[0].label).toBe('Matéria');
      expect(contentFilter.categories[0].selectedIds).toEqual([]);
    });

    it('should return empty subject options when data is undefined', () => {
      const config = createModelsFiltersConfig(undefined);

      expect(config[0].categories[0].itens).toEqual([]);
    });

    it('should populate subject options from user data', () => {
      const userData: ActivityUserFilterData = {
        subjects: [
          { id: 'math-1', name: 'Matemática' },
          { id: 'port-2', name: 'Português' },
          { id: 'sci-3', name: 'Ciências' },
        ],
      };

      const config = createModelsFiltersConfig(userData);

      expect(config[0].categories[0].itens).toEqual([
        { id: 'math-1', name: 'Matemática' },
        { id: 'port-2', name: 'Português' },
        { id: 'sci-3', name: 'Ciências' },
      ]);
    });

    it('should return empty subject options when subjects is undefined', () => {
      const userData: ActivityUserFilterData = {
        schools: [{ id: 's1', name: 'School' }],
      };

      const config = createModelsFiltersConfig(userData);

      expect(config[0].categories[0].itens).toEqual([]);
    });

    it('should return empty subject options when subjects is empty', () => {
      const userData: ActivityUserFilterData = {
        subjects: [],
      };

      const config = createModelsFiltersConfig(userData);

      expect(config[0].categories[0].itens).toEqual([]);
    });
  });
});
