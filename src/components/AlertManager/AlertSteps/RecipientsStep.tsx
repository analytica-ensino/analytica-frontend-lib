import { useEffect, useMemo } from 'react';
import { Text } from '../../..';
import { CheckboxGroup } from '../../CheckBoxGroup/CheckBoxGroup';
import { useAlertFormStore } from '../useAlertForm';
import type { CategoryConfig, LabelsConfig } from '../types';

interface RecipientsStepProps {
  categories: CategoryConfig[];
  labels?: LabelsConfig;
  onCategoriesChange?: (categories: CategoryConfig[]) => void;
}

export const RecipientsStep = ({
  categories,
  labels,
  onCategoriesChange,
}: RecipientsStepProps) => {
  const { recipientCategories, initializeCategory } = useAlertFormStore();

  // Initialize categories on mount
  useEffect(() => {
    for (const category of categories) {
      const existingCategory = recipientCategories[category.key];
      if (!existingCategory) {
        initializeCategory({
          key: category.key,
          label: category.label,
          availableItems: category.itens || [],
          selectedIds: category.selectedIds || [],
          allSelected: false,
        });
      }
    }
  }, [categories, recipientCategories, initializeCategory]);

  // Handle categories change from CheckboxGroup
  const handleCategoriesChange = (updatedCategories: CategoryConfig[]) => {
    // Update store for each category
    for (const category of updatedCategories) {
      const selectedIds = category.selectedIds || [];
      const allSelected = selectedIds.length === (category.itens?.length || 0);

      initializeCategory({
        key: category.key,
        label: category.label,
        availableItems: category.itens || [],
        selectedIds,
        allSelected,
      });
    }

    // Call parent callback if provided
    if (onCategoriesChange) {
      onCategoriesChange(updatedCategories);
    }
  };

  // Sync categories with store state
  const syncedCategories = useMemo(() => {
    return categories.map((category) => {
      const storeCategory = recipientCategories[category.key];
      if (storeCategory) {
        return {
          ...category,
          selectedIds: storeCategory.selectedIds,
        };
      }
      return category;
    });
  }, [categories, recipientCategories]);

  return (
    <section className="flex flex-col gap-4">
      <Text size="lg" weight="medium" className="text-text-950">
        {labels?.recipientsDescription || 'Para quem você vai enviar o aviso?'}
      </Text>

      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <CheckboxGroup
          categories={syncedCategories}
          onCategoriesChange={handleCategoriesChange}
        />
      </div>
    </section>
  );
};
