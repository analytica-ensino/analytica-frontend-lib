import type { CategoryConfig } from '../../../CheckBoxGroup/CheckBoxGroup';
import { calculateFormattedItemsForAutoSelection } from '../../../CheckBoxGroup/CheckBoxGroup.helpers';

/**
 * Apply the same "single visible option" auto-selection behavior that the CheckboxGroup
 * applies internally, but during initialization.
 *
 * This fixes the scenario where the first category (e.g. Escola) is rendered in compact
 * mode (single item) and therefore has no UI affordance to manually select it, leaving
 * dependent categories disabled.
 *
 * @param categories - Array of category configurations
 * @returns Array of category configurations with auto-selected items
 */
export function applyChainedAutoSelection(
  categories: CategoryConfig[]
): CategoryConfig[] {
  let current = categories;
  let safety = 0;
  let changed = true;

  while (changed && safety < categories.length + 2) {
    safety += 1;
    changed = false;

    const next = current.map((category) => {
      const filteredItems = calculateFormattedItemsForAutoSelection(
        category,
        current
      );

      const hasNoSelection =
        !category.selectedIds || category.selectedIds.length === 0;

      if (filteredItems.length === 1 && hasNoSelection) {
        changed = true;
        return { ...category, selectedIds: [filteredItems[0].id] };
      }

      return category;
    });

    current = next;
  }

  return current;
}
