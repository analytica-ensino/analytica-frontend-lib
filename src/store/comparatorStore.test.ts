import { act, renderHook } from '@testing-library/react';
import { createComparatorStore, useComparatorStore } from './comparatorStore';
import { COMPARATOR_CHART_COLORS } from '../types/comparator';
import type { ComparisonItem } from '../types/comparator';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('comparatorStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('createComparatorStore', () => {
    it('should create a store with default config', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      expect(result.current.comparisonType).toBeNull();
      expect(result.current.selectedItems).toEqual([]);
    });

    it('should create a store with custom storage key', () => {
      const customKey = 'custom-comparator-key';
      const useStore = createComparatorStore({ storageKey: customKey });
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
      });

      // Verify localStorage was called with custom key
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const calls = localStorageMock.setItem.mock.calls;
      const hasCustomKey = calls.some(
        (call: [string, string]) => call[0] === customKey
      );
      expect(hasCustomKey).toBe(true);
    });

    it('should create a store with custom chart colors', () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
      const useStore = createComparatorStore({ chartColors: customColors });
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      expect(result.current.selectedItems[0].color).toBe('#FF0000');
    });
  });

  describe('setComparisonType', () => {
    it('should set comparison type to school', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
      });

      expect(result.current.comparisonType).toBe('school');
    });

    it('should set comparison type to schoolYear', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('schoolYear');
      });

      expect(result.current.comparisonType).toBe('schoolYear');
    });

    it('should allow setting comparison type to null', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
      });

      act(() => {
        result.current.setComparisonType(null);
      });

      expect(result.current.comparisonType).toBeNull();
    });
  });

  describe('setSelectedItems', () => {
    it('should set selected items', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      const items: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
        { id: '2', name: 'Item 2', color: '#F59E0B' },
      ];

      act(() => {
        result.current.setSelectedItems(items);
      });

      expect(result.current.selectedItems).toEqual(items);
    });

    it('should replace existing items', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      const initialItems: ComparisonItem[] = [
        { id: '1', name: 'Item 1', color: '#1E40AF' },
      ];

      const newItems: ComparisonItem[] = [
        { id: '2', name: 'Item 2', color: '#F59E0B' },
        { id: '3', name: 'Item 3', color: '#10B981' },
      ];

      act(() => {
        result.current.setSelectedItems(initialItems);
      });

      act(() => {
        result.current.setSelectedItems(newItems);
      });

      expect(result.current.selectedItems).toEqual(newItems);
    });

    it('should allow setting empty array', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setSelectedItems([
          { id: '1', name: 'Item 1', color: '#1E40AF' },
        ]);
      });

      act(() => {
        result.current.setSelectedItems([]);
      });

      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add an item with correct color', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      expect(result.current.selectedItems).toHaveLength(1);
      expect(result.current.selectedItems[0]).toEqual({
        id: '1',
        name: 'Item 1',
        color: COMPARATOR_CHART_COLORS[0],
      });
    });

    it('should assign colors in order', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      act(() => {
        result.current.addItem({ id: '2', name: 'Item 2', color: '' });
      });

      act(() => {
        result.current.addItem({ id: '3', name: 'Item 3', color: '' });
      });

      expect(result.current.selectedItems[0].color).toBe(COMPARATOR_CHART_COLORS[0]);
      expect(result.current.selectedItems[1].color).toBe(COMPARATOR_CHART_COLORS[1]);
      expect(result.current.selectedItems[2].color).toBe(COMPARATOR_CHART_COLORS[2]);
    });

    it('should not add more than 5 items', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      // Add 5 items
      for (let i = 1; i <= 5; i++) {
        act(() => {
          result.current.addItem({ id: `${i}`, name: `Item ${i}`, color: '' });
        });
      }

      expect(result.current.selectedItems).toHaveLength(5);

      // Try to add 6th item
      act(() => {
        result.current.addItem({ id: '6', name: 'Item 6', color: '' });
      });

      expect(result.current.selectedItems).toHaveLength(5);
      expect(result.current.selectedItems.some((i) => i.id === '6')).toBe(false);
    });

    it('should not add duplicate items', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1 Duplicate', color: '' });
      });

      expect(result.current.selectedItems).toHaveLength(1);
      expect(result.current.selectedItems[0].name).toBe('Item 1');
    });

    it('should preserve existing item data except color', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      const itemWithExtraData = {
        id: '1',
        name: 'Item 1',
        color: '#CUSTOM',
      };

      act(() => {
        result.current.addItem(itemWithExtraData);
      });

      expect(result.current.selectedItems[0].id).toBe('1');
      expect(result.current.selectedItems[0].name).toBe('Item 1');
      // Color should be overwritten by chart color
      expect(result.current.selectedItems[0].color).toBe(COMPARATOR_CHART_COLORS[0]);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by id', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
        result.current.addItem({ id: '2', name: 'Item 2', color: '' });
      });

      act(() => {
        result.current.removeItem('1');
      });

      expect(result.current.selectedItems).toHaveLength(1);
      expect(result.current.selectedItems[0].id).toBe('2');
    });

    it('should reassign colors after removal', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
        result.current.addItem({ id: '2', name: 'Item 2', color: '' });
        result.current.addItem({ id: '3', name: 'Item 3', color: '' });
      });

      // Before removal: Item 1 = color[0], Item 2 = color[1], Item 3 = color[2]
      expect(result.current.selectedItems[1].color).toBe(COMPARATOR_CHART_COLORS[1]);

      act(() => {
        result.current.removeItem('1');
      });

      // After removal: Item 2 = color[0], Item 3 = color[1]
      expect(result.current.selectedItems[0].id).toBe('2');
      expect(result.current.selectedItems[0].color).toBe(COMPARATOR_CHART_COLORS[0]);
      expect(result.current.selectedItems[1].id).toBe('3');
      expect(result.current.selectedItems[1].color).toBe(COMPARATOR_CHART_COLORS[1]);
    });

    it('should handle removing non-existent item', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      act(() => {
        result.current.removeItem('non-existent');
      });

      expect(result.current.selectedItems).toHaveLength(1);
    });

    it('should handle removing from empty list', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.removeItem('1');
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should allow adding new item after removal (respects 5 limit)', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      // Add 5 items
      for (let i = 1; i <= 5; i++) {
        act(() => {
          result.current.addItem({ id: `${i}`, name: `Item ${i}`, color: '' });
        });
      }

      // Remove one
      act(() => {
        result.current.removeItem('3');
      });

      // Now we should be able to add another
      act(() => {
        result.current.addItem({ id: '6', name: 'Item 6', color: '' });
      });

      expect(result.current.selectedItems).toHaveLength(5);
      expect(result.current.selectedItems.some((i) => i.id === '6')).toBe(true);
    });
  });

  describe('clearSelection', () => {
    it('should clear comparison type and selected items', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
        result.current.addItem({ id: '2', name: 'Item 2', color: '' });
      });

      expect(result.current.comparisonType).toBe('school');
      expect(result.current.selectedItems).toHaveLength(2);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.comparisonType).toBeNull();
      expect(result.current.selectedItems).toEqual([]);
    });

    it('should work when already empty', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.comparisonType).toBeNull();
      expect(result.current.selectedItems).toEqual([]);
    });
  });

  describe('Default Store Instance', () => {
    it('should export a default store instance', () => {
      const { result } = renderHook(() => useComparatorStore());

      expect(result.current.comparisonType).toBeNull();
      expect(result.current.selectedItems).toBeDefined();
      expect(typeof result.current.setComparisonType).toBe('function');
      expect(typeof result.current.setSelectedItems).toBe('function');
      expect(typeof result.current.addItem).toBe('function');
      expect(typeof result.current.removeItem).toBe('function');
      expect(typeof result.current.clearSelection).toBe('function');
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', () => {
      const useStore = createComparatorStore({ storageKey: 'test-persist' });
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should use default storage key when not specified', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setComparisonType('school');
      });

      const calls = localStorageMock.setItem.mock.calls;
      const hasDefaultKey = calls.some(
        (call: [string, string]) => call[0] === 'comparator-storage'
      );
      expect(hasDefaultKey).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding item with empty id', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '', name: 'Empty ID', color: '' });
      });

      expect(result.current.selectedItems).toHaveLength(1);
      expect(result.current.selectedItems[0].id).toBe('');
    });

    it('should handle rapid state changes', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({ id: '1', name: 'Item 1', color: '' });
        result.current.addItem({ id: '2', name: 'Item 2', color: '' });
        result.current.removeItem('1');
        result.current.addItem({ id: '3', name: 'Item 3', color: '' });
        result.current.setComparisonType('schoolYear');
      });

      expect(result.current.selectedItems).toHaveLength(2);
      expect(result.current.selectedItems[0].id).toBe('2');
      expect(result.current.selectedItems[1].id).toBe('3');
      expect(result.current.comparisonType).toBe('schoolYear');
    });

    it('should handle item with special characters in name', () => {
      const useStore = createComparatorStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addItem({
          id: '1',
          name: 'Escola "São Paulo" & Cia.',
          color: '',
        });
      });

      expect(result.current.selectedItems[0].name).toBe(
        'Escola "São Paulo" & Cia.'
      );
    });
  });
});
