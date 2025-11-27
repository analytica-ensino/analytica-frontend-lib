import {
  getSelectedIdsFromCategories,
  toggleArrayItem,
  toggleSingleValue,
} from './activityFilters';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

describe('activityFilters utils', () => {
  describe('getSelectedIdsFromCategories', () => {
    const mockCategories: CategoryConfig[] = [
      {
        key: 'tema',
        label: 'Tema',
        itens: [
          { id: 'tema-1', name: 'Álgebra' },
          { id: 'tema-2', name: 'Geometria' },
        ],
        selectedIds: ['tema-1'],
      },
      {
        key: 'subtema',
        label: 'Subtema',
        itens: [
          { id: 'subtema-1', name: 'Equações' },
          { id: 'subtema-2', name: 'Triângulos' },
        ],
        selectedIds: ['subtema-1', 'subtema-2'],
      },
      {
        key: 'assunto',
        label: 'Assunto',
        itens: [{ id: 'assunto-1', name: 'Resolução' }],
        selectedIds: [],
      },
    ];

    it('should extract selected IDs for specified keys', () => {
      const result = getSelectedIdsFromCategories(mockCategories, {
        topicIds: 'tema',
        subtopicIds: 'subtema',
        contentIds: 'assunto',
      });

      expect(result.topicIds).toEqual(['tema-1']);
      expect(result.subtopicIds).toEqual(['subtema-1', 'subtema-2']);
      expect(result.contentIds).toEqual([]);
    });

    it('should return empty arrays for non-existent categories', () => {
      const result = getSelectedIdsFromCategories(mockCategories, {
        topicIds: 'nonexistent',
      });

      expect(result.topicIds).toEqual([]);
    });

    it('should return empty arrays for categories without selectedIds', () => {
      const categoriesWithoutSelected: CategoryConfig[] = [
        {
          key: 'tema',
          label: 'Tema',
          itens: [],
        },
      ];

      const result = getSelectedIdsFromCategories(categoriesWithoutSelected, {
        topicIds: 'tema',
      });

      expect(result.topicIds).toEqual([]);
    });

    it('should handle empty categories array', () => {
      const result = getSelectedIdsFromCategories([], {
        topicIds: 'tema',
      });

      expect(result.topicIds).toEqual([]);
    });

    it('should handle multiple output keys', () => {
      const result = getSelectedIdsFromCategories(mockCategories, {
        first: 'tema',
        second: 'subtema',
        third: 'assunto',
      });

      expect(result.first).toEqual(['tema-1']);
      expect(result.second).toEqual(['subtema-1', 'subtema-2']);
      expect(result.third).toEqual([]);
    });
  });

  describe('toggleArrayItem', () => {
    it('should add item when not present', () => {
      const array = ['a', 'b', 'c'];
      const result = toggleArrayItem(array, 'd');

      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should remove item when present', () => {
      const array = ['a', 'b', 'c'];
      const result = toggleArrayItem(array, 'b');

      expect(result).toEqual(['a', 'c']);
    });

    it('should handle empty array', () => {
      const result = toggleArrayItem([], 'a');

      expect(result).toEqual(['a']);
    });

    it('should handle array with single item', () => {
      const result = toggleArrayItem(['a'], 'a');

      expect(result).toEqual([]);
    });

    it('should work with numbers', () => {
      const array = [1, 2, 3];
      const result = toggleArrayItem(array, 2);

      expect(result).toEqual([1, 3]);
    });

    it('should work with objects using reference equality', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const array = [obj1, obj2];

      const result = toggleArrayItem(array, obj1);

      expect(result).toEqual([obj2]);
    });

    it('should not modify original array', () => {
      const array = ['a', 'b', 'c'];
      const originalArray = [...array];

      toggleArrayItem(array, 'd');

      expect(array).toEqual(originalArray);
    });
  });

  describe('toggleSingleValue', () => {
    it('should return null when toggling current value', () => {
      expect(toggleSingleValue('current', 'current')).toBeNull();
      expect(toggleSingleValue(123, 123)).toBeNull();
      expect(toggleSingleValue(true, true)).toBeNull();
    });

    it('should return new value when different from current', () => {
      expect(toggleSingleValue('current', 'new')).toBe('new');
      expect(toggleSingleValue(123, 456)).toBe(456);
      expect(toggleSingleValue(true, false)).toBe(false);
    });

    it('should return new value when current is null', () => {
      expect(toggleSingleValue(null, 'new')).toBe('new');
      expect(toggleSingleValue(null, 123)).toBe(123);
    });

    it('should handle string values', () => {
      expect(toggleSingleValue('a', 'b')).toBe('b');
      expect(toggleSingleValue('b', 'a')).toBe('a');
    });

    it('should handle number values', () => {
      expect(toggleSingleValue(1, 2)).toBe(2);
      expect(toggleSingleValue(2, 1)).toBe(1);
    });

    it('should handle boolean values', () => {
      expect(toggleSingleValue(true, false)).toBe(false);
      expect(toggleSingleValue(false, true)).toBe(true);
    });
  });
});
