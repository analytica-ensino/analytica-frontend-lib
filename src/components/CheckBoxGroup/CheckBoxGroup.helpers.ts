import type { CategoryConfig, Item } from './CheckBoxGroup';

/**
 * Helper function to efficiently compare selectedIds arrays
 */
export const areSelectedIdsEqual = (
  ids1?: string[],
  ids2?: string[]
): boolean => {
  if (ids1 === ids2) return true;
  if (!ids1 || !ids2) return ids1 === ids2;
  if (ids1.length !== ids2.length) return false;

  for (let i = 0; i < ids1.length; i++) {
    if (ids1[i] !== ids2[i]) return false;
  }
  return true;
};

/**
 * Helper function to check if category is enabled based on dependencies
 */
export const isCategoryEnabled = (
  category: CategoryConfig,
  allCategories: CategoryConfig[]
): boolean => {
  if (!category.dependsOn || category.dependsOn.length === 0) {
    return true;
  }
  return category.dependsOn.every((depKey) => {
    const depCat = allCategories.find((c) => c.key === depKey);
    return depCat?.selectedIds && depCat.selectedIds.length > 0;
  });
};

/**
 * Helper function to check if an item matches a filter
 */
export const isItemMatchingFilter = (
  item: Item,
  filter: { key: string; internalField: string },
  allCategories: CategoryConfig[]
): boolean => {
  const parentCat = allCategories.find((c) => c.key === filter.key);
  const parentSelectedIds = parentCat?.selectedIds || [];
  const itemFieldValue = item[filter.internalField];
  return parentSelectedIds.includes(String(itemFieldValue));
};

/**
 * Helper function to get badge text for category
 */
export const getBadgeText = (
  category: CategoryConfig,
  formattedItems: { groupLabel?: string; itens: Item[] }[]
): string => {
  const visibleIds = formattedItems
    .flatMap((group) => group.itens || [])
    .map((i) => i.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    category.selectedIds?.includes(id)
  ).length;
  const totalVisible = visibleIds.length;
  return `${selectedVisibleCount} de ${totalVisible} ${
    selectedVisibleCount === 1 ? 'selecionado' : 'selecionados'
  }`;
};

/**
 * Helper function to handle accordion value change logic
 * Returns the new accordion value or null if should not change
 */
export const handleAccordionValueChange = (
  value: string | string[] | undefined,
  categories: CategoryConfig[],
  isCategoryEnabledFn: (category: CategoryConfig) => boolean
): string | null => {
  if (typeof value !== 'string') {
    if (!value) {
      return '';
    }
    return null; // Don't change for array values
  }

  if (!value) {
    return '';
  }

  // Prevent opening disabled categories
  const category = categories.find((c) => c.key === value);
  if (!category) {
    return null; // Category not found, don't change
  }

  const isEnabled = isCategoryEnabledFn(category);
  if (!isEnabled) {
    return null; // Don't allow opening disabled accordions
  }

  return value;
};

