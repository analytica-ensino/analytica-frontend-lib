import { useEffect, useState, useCallback } from 'react';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

export type FilterConfig = {
  key: string;
  label: string;
  categories: CategoryConfig[];
};

export type UseTableFilterOptions = {
  syncWithUrl?: boolean;
};

export type UseTableFilterReturn = {
  filterConfigs: FilterConfig[];
  activeFilters: Record<string, string[]>;
  hasActiveFilters: boolean;
  updateFilters: (configs: FilterConfig[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
};

/**
 * Hook for managing table filters with URL synchronization
 *
 * @param initialConfigs - Initial filter configurations
 * @param options - Hook options including URL sync
 * @returns Filter state and management functions
 *
 * @example
 * ```tsx
 * const { filterConfigs, activeFilters, updateFilters, applyFilters } = useTableFilter(
 *   [
 *     {
 *       key: 'academic',
 *       label: 'Dados Acadêmicos',
 *       categories: [...]
 *     }
 *   ],
 *   { syncWithUrl: true }
 * );
 * ```
 */
export const useTableFilter = (
  initialConfigs: FilterConfig[],
  options: UseTableFilterOptions = {}
): UseTableFilterReturn => {
  const { syncWithUrl = false } = options;

  // Get initial state from URL if syncWithUrl is enabled
  const getInitialState = useCallback((): FilterConfig[] => {
    if (!syncWithUrl || globalThis.window === undefined) {
      return initialConfigs;
    }

    const params = new URLSearchParams(globalThis.window.location.search);
    const configsWithUrlState = initialConfigs.map((config) => ({
      ...config,
      categories: config.categories.map((category) => {
        const urlValue = params.get(`filter_${category.key}`);
        const selectedIds = urlValue ? urlValue.split(',').filter(Boolean) : [];
        return {
          ...category,
          selectedIds,
        };
      }),
    }));

    return configsWithUrlState;
  }, [initialConfigs, syncWithUrl]);

  const [filterConfigs, setFilterConfigs] =
    useState<FilterConfig[]>(getInitialState);

  // Calculate active filters (only categories with selections)
  const activeFilters: Record<string, string[]> = {};
  let hasActiveFilters = false;

  for (const config of filterConfigs) {
    for (const category of config.categories) {
      if (category.selectedIds && category.selectedIds.length > 0) {
        activeFilters[category.key] = category.selectedIds;
        hasActiveFilters = true;
      }
    }
  }

  /**
   * Update filter configs (temporary state, not applied to URL yet)
   */
  const updateFilters = useCallback((configs: FilterConfig[]) => {
    setFilterConfigs(configs);
  }, []);

  /**
   * Apply filters to URL (commit the changes)
   */
  const applyFilters = useCallback(() => {
    if (!syncWithUrl || globalThis.window === undefined) {
      return;
    }

    const url = new URL(globalThis.window.location.href);
    const params = url.searchParams;

    // Update URL parameters for each category
    for (const config of filterConfigs) {
      for (const category of config.categories) {
        const paramKey = `filter_${category.key}`;

        if (category.selectedIds && category.selectedIds.length > 0) {
          params.set(paramKey, category.selectedIds.join(','));
        } else {
          params.delete(paramKey);
        }
      }
    }

    // Update URL without page reload
    globalThis.window.history.replaceState({}, '', url.toString());
  }, [filterConfigs, syncWithUrl]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    const clearedConfigs = filterConfigs.map((config) => ({
      ...config,
      categories: config.categories.map((category) => ({
        ...category,
        selectedIds: [],
      })),
    }));

    setFilterConfigs(clearedConfigs);

    // If syncWithUrl, also clear URL parameters
    if (syncWithUrl && globalThis.window !== undefined) {
      const url = new URL(globalThis.window.location.href);
      const params = url.searchParams;

      for (const config of filterConfigs) {
        for (const category of config.categories) {
          params.delete(`filter_${category.key}`);
        }
      }

      globalThis.window.history.replaceState({}, '', url.toString());
    }
  }, [filterConfigs, syncWithUrl]);

  // Sync with URL on mount and when URL changes externally
  useEffect(() => {
    if (!syncWithUrl || globalThis.window === undefined) {
      return;
    }

    const handlePopState = () => {
      setFilterConfigs(getInitialState());
    };

    globalThis.window.addEventListener('popstate', handlePopState);
    return () =>
      globalThis.window.removeEventListener('popstate', handlePopState);
  }, [syncWithUrl, getInitialState]);

  return {
    filterConfigs,
    activeFilters,
    hasActiveFilters,
    updateFilters,
    applyFilters,
    clearFilters,
  };
};
