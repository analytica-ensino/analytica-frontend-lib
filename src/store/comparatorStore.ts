import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ComparisonItem, ComparatorStoreState } from '../types/comparator';
import { COMPARATOR_CHART_COLORS } from '../types/comparator';

export interface CreateComparatorStoreConfig {
  storageKey?: string;
  chartColors?: string[];
}

export function createComparatorStore(
  config: CreateComparatorStoreConfig = {}
) {
  const {
    storageKey = 'comparator-storage',
    chartColors = COMPARATOR_CHART_COLORS,
  } = config;

  return create<ComparatorStoreState>()(
    persist(
      (set, get) => ({
        comparisonType: null,
        selectedItems: [],

        setComparisonType: (type) => set({ comparisonType: type }),

        setSelectedItems: (items) => set({ selectedItems: items }),

        addItem: (item) => {
          const { selectedItems } = get();
          if (selectedItems.length >= 5) return;
          if (selectedItems.some((i) => i.id === item.id)) return;

          const newItem: ComparisonItem = {
            ...item,
            color: chartColors[selectedItems.length],
          };

          set({ selectedItems: [...selectedItems, newItem] });
        },

        removeItem: (itemId) => {
          const { selectedItems } = get();
          const newItems = selectedItems
            .filter((i) => i.id !== itemId)
            .map((item, idx) => ({
              ...item,
              color: chartColors[idx],
            }));

          set({ selectedItems: newItems });
        },

        clearSelection: () =>
          set({
            comparisonType: null,
            selectedItems: [],
          }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
}

// Default store instance
export const useComparatorStore = createComparatorStore();
