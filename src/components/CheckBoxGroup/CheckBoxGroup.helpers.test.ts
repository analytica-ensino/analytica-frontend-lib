import {
  areSelectedIdsEqual,
  isCategoryEnabled,
  isItemMatchingFilter,
  getBadgeText,
  handleAccordionValueChange,
} from './CheckBoxGroup.helpers';
import type { CategoryConfig, Item } from './CheckBoxGroup';

describe('CheckBoxGroup Helpers', () => {
  describe('areSelectedIdsEqual', () => {
    it('returns true for identical arrays', () => {
      expect(areSelectedIdsEqual(['1', '2'], ['1', '2'])).toBe(true);
    });

    it('returns true for same reference', () => {
      const arr = ['1', '2'];
      expect(areSelectedIdsEqual(arr, arr)).toBe(true);
    });

    it('returns false for different arrays', () => {
      expect(areSelectedIdsEqual(['1', '2'], ['1', '3'])).toBe(false);
    });

    it('returns false for different lengths', () => {
      expect(areSelectedIdsEqual(['1', '2'], ['1'])).toBe(false);
    });

    it('returns true for both undefined', () => {
      expect(areSelectedIdsEqual(undefined, undefined)).toBe(true);
    });

    it('returns false for one undefined', () => {
      expect(areSelectedIdsEqual(['1'], undefined)).toBe(false);
      expect(areSelectedIdsEqual(undefined, ['1'])).toBe(false);
    });

    it('returns true for both empty arrays', () => {
      expect(areSelectedIdsEqual([], [])).toBe(true);
    });
  });

  describe('isCategoryEnabled', () => {
    it('returns true for category without dependencies', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
      };
      const allCategories: CategoryConfig[] = [category];

      expect(isCategoryEnabled(category, allCategories)).toBe(true);
    });

    it('returns true when all dependencies are satisfied', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: ['item-1'],
      };
      const child: CategoryConfig = {
        key: 'child',
        label: 'Child',
        dependsOn: ['parent'],
        itens: [],
      };
      const allCategories: CategoryConfig[] = [parent, child];

      expect(isCategoryEnabled(child, allCategories)).toBe(true);
    });

    it('returns false when dependency is not satisfied', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: [],
      };
      const child: CategoryConfig = {
        key: 'child',
        label: 'Child',
        dependsOn: ['parent'],
        itens: [],
      };
      const allCategories: CategoryConfig[] = [parent, child];

      expect(isCategoryEnabled(child, allCategories)).toBe(false);
    });

    it('returns false when one of multiple dependencies is not satisfied', () => {
      const parent1: CategoryConfig = {
        key: 'parent1',
        label: 'Parent 1',
        itens: [],
        selectedIds: ['item-1'],
      };
      const parent2: CategoryConfig = {
        key: 'parent2',
        label: 'Parent 2',
        itens: [],
        selectedIds: [],
      };
      const child: CategoryConfig = {
        key: 'child',
        label: 'Child',
        dependsOn: ['parent1', 'parent2'],
        itens: [],
      };
      const allCategories: CategoryConfig[] = [parent1, parent2, child];

      expect(isCategoryEnabled(child, allCategories)).toBe(false);
    });

    it('returns true when all multiple dependencies are satisfied', () => {
      const parent1: CategoryConfig = {
        key: 'parent1',
        label: 'Parent 1',
        itens: [],
        selectedIds: ['item-1'],
      };
      const parent2: CategoryConfig = {
        key: 'parent2',
        label: 'Parent 2',
        itens: [],
        selectedIds: ['item-2'],
      };
      const child: CategoryConfig = {
        key: 'child',
        label: 'Child',
        dependsOn: ['parent1', 'parent2'],
        itens: [],
      };
      const allCategories: CategoryConfig[] = [parent1, parent2, child];

      expect(isCategoryEnabled(child, allCategories)).toBe(true);
    });
  });

  describe('isItemMatchingFilter', () => {
    it('returns true when item matches filter', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: ['parent-1'],
      };
      const item: Item = {
        id: 'item-1',
        name: 'Item 1',
        parentId: 'parent-1',
      };
      const filter = {
        key: 'parent',
        internalField: 'parentId',
      };
      const allCategories: CategoryConfig[] = [parent];

      expect(isItemMatchingFilter(item, filter, allCategories)).toBe(true);
    });

    it('returns false when item does not match filter', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: ['parent-1'],
      };
      const item: Item = {
        id: 'item-1',
        name: 'Item 1',
        parentId: 'parent-2',
      };
      const filter = {
        key: 'parent',
        internalField: 'parentId',
      };
      const allCategories: CategoryConfig[] = [parent];

      expect(isItemMatchingFilter(item, filter, allCategories)).toBe(false);
    });

    it('returns false when parent category has no selected IDs', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: [],
      };
      const item: Item = {
        id: 'item-1',
        name: 'Item 1',
        parentId: 'parent-1',
      };
      const filter = {
        key: 'parent',
        internalField: 'parentId',
      };
      const allCategories: CategoryConfig[] = [parent];

      expect(isItemMatchingFilter(item, filter, allCategories)).toBe(false);
    });

    it('converts item field value to string for comparison', () => {
      const parent: CategoryConfig = {
        key: 'parent',
        label: 'Parent',
        itens: [],
        selectedIds: ['123'],
      };
      const item: Item = {
        id: 'item-1',
        name: 'Item 1',
        parentId: 123, // Number instead of string
      };
      const filter = {
        key: 'parent',
        internalField: 'parentId',
      };
      const allCategories: CategoryConfig[] = [parent];

      expect(isItemMatchingFilter(item, filter, allCategories)).toBe(true);
    });
  });

  describe('getBadgeText', () => {
    it('returns correct text for no selections', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
        selectedIds: [],
      };
      const formattedItems = [
        {
          itens: [
            { id: 'item-1', name: 'Item 1' },
            { id: 'item-2', name: 'Item 2' },
          ],
        },
      ];

      expect(getBadgeText(category, formattedItems)).toBe(
        '0 de 2 selecionados'
      );
    });

    it('returns correct text for one selection', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
        selectedIds: ['item-1'],
      };
      const formattedItems = [
        {
          itens: [
            { id: 'item-1', name: 'Item 1' },
            { id: 'item-2', name: 'Item 2' },
          ],
        },
      ];

      expect(getBadgeText(category, formattedItems)).toBe(
        '1 de 2 selecionado'
      );
    });

    it('returns correct text for multiple selections', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
        selectedIds: ['item-1', 'item-2'],
      };
      const formattedItems = [
        {
          itens: [
            { id: 'item-1', name: 'Item 1' },
            { id: 'item-2', name: 'Item 2' },
            { id: 'item-3', name: 'Item 3' },
          ],
        },
      ];

      expect(getBadgeText(category, formattedItems)).toBe(
        '2 de 3 selecionados'
      );
    });

    it('handles grouped items correctly', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
        selectedIds: ['item-1'],
      };
      const formattedItems = [
        {
          groupLabel: 'Group 1',
          itens: [{ id: 'item-1', name: 'Item 1' }],
        },
        {
          groupLabel: 'Group 2',
          itens: [{ id: 'item-2', name: 'Item 2' }],
        },
      ];

      expect(getBadgeText(category, formattedItems)).toBe(
        '1 de 2 selecionado'
      );
    });

    it('handles empty formatted items', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
        selectedIds: [],
      };
      const formattedItems: { itens: Item[] }[] = [];

      expect(getBadgeText(category, formattedItems)).toBe(
        '0 de 0 selecionados'
      );
    });
  });

  describe('handleAccordionValueChange', () => {
    const mockIsCategoryEnabled = jest.fn((category: CategoryConfig) => {
      return !category.dependsOn || category.dependsOn.length === 0;
    });

    beforeEach(() => {
      mockIsCategoryEnabled.mockClear();
    });

    it('returns empty string for undefined value', () => {
      const categories: CategoryConfig[] = [];
      const result = handleAccordionValueChange(
        undefined,
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBe('');
      expect(mockIsCategoryEnabled).not.toHaveBeenCalled();
    });

    it('returns empty string for empty string value', () => {
      const categories: CategoryConfig[] = [];
      const result = handleAccordionValueChange('', categories, mockIsCategoryEnabled);

      expect(result).toBe('');
      expect(mockIsCategoryEnabled).not.toHaveBeenCalled();
    });

    it('returns null for array value', () => {
      const categories: CategoryConfig[] = [];
      const result = handleAccordionValueChange(
        ['cat1', 'cat2'],
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBeNull();
      expect(mockIsCategoryEnabled).not.toHaveBeenCalled();
    });

    it('returns null when category is not found', () => {
      const categories: CategoryConfig[] = [
        {
          key: 'cat1',
          label: 'Category 1',
          itens: [],
        },
      ];
      const result = handleAccordionValueChange(
        'nonexistent',
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBeNull();
      expect(mockIsCategoryEnabled).not.toHaveBeenCalled();
    });

    it('returns null when category is disabled', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        dependsOn: ['parent'],
        itens: [],
      };
      const categories: CategoryConfig[] = [category];

      mockIsCategoryEnabled.mockReturnValue(false);

      const result = handleAccordionValueChange(
        'cat1',
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBeNull();
      expect(mockIsCategoryEnabled).toHaveBeenCalledWith(category);
    });

    it('returns value when category is enabled', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
      };
      const categories: CategoryConfig[] = [category];

      mockIsCategoryEnabled.mockReturnValue(true);

      const result = handleAccordionValueChange(
        'cat1',
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBe('cat1');
      expect(mockIsCategoryEnabled).toHaveBeenCalledWith(category);
    });

    it('returns value for category without dependencies', () => {
      const category: CategoryConfig = {
        key: 'cat1',
        label: 'Category 1',
        itens: [],
      };
      const categories: CategoryConfig[] = [category];

      const result = handleAccordionValueChange(
        'cat1',
        categories,
        mockIsCategoryEnabled
      );

      expect(result).toBe('cat1');
      expect(mockIsCategoryEnabled).toHaveBeenCalledWith(category);
    });
  });
});

