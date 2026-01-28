import { MutableRefObject, useEffect } from 'react';
import type { CategoryConfig } from '../../../CheckBoxGroup/CheckBoxGroup';

export interface UseCategorySyncProps {
  isOpen: boolean;
  initialCategories: CategoryConfig[];
  storeCategories: CategoryConfig[];
  setCategories: (categories: CategoryConfig[]) => void;
  categoriesInitializedRef: MutableRefObject<boolean>;
}

/**
 * Hook to sync categories from parent when they change (e.g., after fetching students)
 * This ensures the store is updated when parent updates categories
 */
export function useCategorySync({
  isOpen,
  initialCategories,
  storeCategories,
  setCategories,
  categoriesInitializedRef,
}: UseCategorySyncProps) {
  useEffect(() => {
    if (
      isOpen &&
      initialCategories.length > 0 &&
      categoriesInitializedRef.current
    ) {
      // Only sync if categories have students (indicates they were fetched)
      const studentsCategory = initialCategories.find(
        (c) => c.key === 'students'
      );
      const storeStudentsCategory = storeCategories.find(
        (c) => c.key === 'students'
      );

      // If parent has students but store doesn't, or vice versa, sync
      const parentHasStudents =
        studentsCategory?.itens && studentsCategory.itens.length > 0;
      const storeHasStudents =
        storeStudentsCategory?.itens && storeStudentsCategory.itens.length > 0;

      if (parentHasStudents !== storeHasStudents || parentHasStudents) {
        // Update store with parent categories to sync students
        setCategories(initialCategories);
      }
    }
  }, [
    isOpen,
    initialCategories,
    storeCategories,
    setCategories,
    categoriesInitializedRef,
  ]);
}
