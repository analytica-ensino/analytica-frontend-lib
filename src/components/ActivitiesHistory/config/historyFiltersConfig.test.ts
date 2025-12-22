import { createHistoryFiltersConfig } from './historyFiltersConfig';
import { ACTIVITY_FILTER_STATUS_OPTIONS } from '../../../types/activitiesHistory';
import type { ActivityUserFilterData } from '../../../types/activitiesHistory';

describe('historyFiltersConfig', () => {
  describe('createHistoryFiltersConfig', () => {
    it('should return 3 filter configurations', () => {
      const config = createHistoryFiltersConfig(undefined);
      expect(config).toHaveLength(3);
    });

    it('should create status filter with correct structure', () => {
      const config = createHistoryFiltersConfig(undefined);
      const statusFilter = config[0];

      expect(statusFilter.key).toBe('status');
      expect(statusFilter.label).toBe('STATUS');
      expect(statusFilter.categories).toHaveLength(1);
      expect(statusFilter.categories[0].key).toBe('status');
      expect(statusFilter.categories[0].label).toBe('Status da Atividade');
      expect(statusFilter.categories[0].selectedIds).toEqual([]);
      expect(statusFilter.categories[0].itens).toEqual(
        ACTIVITY_FILTER_STATUS_OPTIONS
      );
    });

    it('should create academic filter with correct structure', () => {
      const config = createHistoryFiltersConfig(undefined);
      const academicFilter = config[1];

      expect(academicFilter.key).toBe('academic');
      expect(academicFilter.label).toBe('DADOS ACADÊMICOS');
      expect(academicFilter.categories).toHaveLength(1);
      expect(academicFilter.categories[0].key).toBe('school');
      expect(academicFilter.categories[0].label).toBe('Escola');
      expect(academicFilter.categories[0].selectedIds).toEqual([]);
    });

    it('should create content filter with correct structure', () => {
      const config = createHistoryFiltersConfig(undefined);
      const contentFilter = config[2];

      expect(contentFilter.key).toBe('content');
      expect(contentFilter.label).toBe('CONTEÚDO');
      expect(contentFilter.categories).toHaveLength(1);
      expect(contentFilter.categories[0].key).toBe('subject');
      expect(contentFilter.categories[0].label).toBe('Matéria');
      expect(contentFilter.categories[0].selectedIds).toEqual([]);
    });

    it('should populate school options from user data', () => {
      const userData: ActivityUserFilterData = {
        schools: [
          { id: 's1', name: 'School 1' },
          { id: 's2', name: 'School 2' },
        ],
      };

      const config = createHistoryFiltersConfig(userData);
      const academicFilter = config[1];

      expect(academicFilter.categories[0].itens).toEqual([
        { id: 's1', name: 'School 1' },
        { id: 's2', name: 'School 2' },
      ]);
    });

    it('should populate subject options from user data', () => {
      const userData: ActivityUserFilterData = {
        subjects: [
          { id: 'sub1', name: 'Math' },
          { id: 'sub2', name: 'Science' },
        ],
      };

      const config = createHistoryFiltersConfig(userData);
      const contentFilter = config[2];

      expect(contentFilter.categories[0].itens).toEqual([
        { id: 'sub1', name: 'Math' },
        { id: 'sub2', name: 'Science' },
      ]);
    });

    it('should return empty arrays when user data has no schools or subjects', () => {
      const userData: ActivityUserFilterData = {};

      const config = createHistoryFiltersConfig(userData);

      expect(config[1].categories[0].itens).toEqual([]);
      expect(config[2].categories[0].itens).toEqual([]);
    });

    it('should handle complete user data', () => {
      const userData: ActivityUserFilterData = {
        schools: [{ id: 's1', name: 'School A' }],
        subjects: [{ id: 'sub1', name: 'Subject A' }],
      };

      const config = createHistoryFiltersConfig(userData);

      expect(config[1].categories[0].itens).toHaveLength(1);
      expect(config[2].categories[0].itens).toHaveLength(1);
    });
  });
});
