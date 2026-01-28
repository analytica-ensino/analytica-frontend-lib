import { useEffect, useRef } from 'react';
import type { CategoryConfig } from '../../../CheckBoxGroup/CheckBoxGroup';
import { applyChainedAutoSelection } from '../utils/applyChainedAutoSelection';

export interface UseCategoryInitializationProps {
  isOpen: boolean;
  initialCategories: CategoryConfig[];
  setCategories: (categories: CategoryConfig[]) => void;
  onCategoriesChange?: (categories: CategoryConfig[]) => void;
}

/**
 * Hook to handle category initialization with auto-selection
 * when modal opens.
 *
 * This hook:
 * - Applies chained auto-selection when modal opens
 * - Triggers onCategoriesChange callback after auto-selection
 * - Resets initialization flag when modal closes
 *
 * @returns Object with categoriesInitialized ref for external access
 */
export function useCategoryInitialization({
  isOpen,
  initialCategories,
  setCategories,
  onCategoriesChange,
}: UseCategoryInitializationProps) {
  const categoriesInitialized = useRef(false);

  /**
   * Initialize categories when modal opens
   */
  useEffect(() => {
    if (
      isOpen &&
      initialCategories.length > 0 &&
      !categoriesInitialized.current
    ) {
      const autoSelectedCategories =
        applyChainedAutoSelection(initialCategories);
      setCategories(autoSelectedCategories);
      // Trigger onCategoriesChange to allow parent to fetch students if needed
      // This is important when auto-selection happens (e.g., single school/series/class)
      if (onCategoriesChange) {
        onCategoriesChange(autoSelectedCategories);
      }
      categoriesInitialized.current = true;
    }
  }, [isOpen, initialCategories, setCategories, onCategoriesChange]);

  /**
   * Reset initialization flag when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      categoriesInitialized.current = false;
    }
  }, [isOpen]);

  return {
    categoriesInitializedRef: categoriesInitialized,
  };
}
