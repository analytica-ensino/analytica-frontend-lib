import { RefObject, useEffect } from 'react';
import type { CategoryConfig } from '../../../CheckBoxGroup/CheckBoxGroup';

export interface UseCategorySyncProps {
  isOpen: boolean;
  initialCategories: CategoryConfig[];
  storeCategories: CategoryConfig[];
  setCategories: (categories: CategoryConfig[]) => void;
  categoriesInitializedRef: RefObject<boolean>;
}

/** Categories whose itens are loaded dynamically (async) by the parent. */
const DYNAMIC_KEYS = ['turma', 'students'] as const;

/** Signature of the dynamically-loaded categories' item ids, to detect changes
 *  the store hasn't picked up yet (robust to same-length, different-content). */
function dynamicItemsSignature(categories: CategoryConfig[]): string {
  return DYNAMIC_KEYS.map((key) => {
    const category = categories.find((c) => c.key === key);
    const ids = (category?.itens ?? []).map((item) => item.id).join(',');
    return `${key}:${ids}`;
  }).join('|');
}

/**
 * Hook to sync categories from parent when they change (e.g., after fetching
 * turmas or alunos). This ensures the store is updated when the parent updates
 * the dynamically-loaded categories.
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
      // Sync only when the dynamic categories (turma/students) actually differ
      // from the store, comparing item ids so same-length content changes count.
      if (
        dynamicItemsSignature(initialCategories) !==
        dynamicItemsSignature(storeCategories)
      ) {
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
