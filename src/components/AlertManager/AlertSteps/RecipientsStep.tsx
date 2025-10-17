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
    categories.forEach((category) => {
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
    });
  }, [categories, recipientCategories, initializeCategory]);

  // Get total selected count across all categories
  const totalSelected = useMemo(() => {
    return categories.reduce((total, category) => {
      return total + (category.selectedIds?.length || 0);
    }, 0);
  }, [categories]);

  // Get total available count across all categories
  const totalAvailable = useMemo(() => {
    return categories.reduce((total, category) => {
      return total + (category.itens?.length || 0);
    }, 0);
  }, [categories]);

  // Format selection count text
  const getSelectionText = (count: number, total: number) => {
    if (count === 1) {
      return `${count} de ${total} selecionado`;
    }
    return `${count} de ${total} selecionados`;
  };

  // Handle categories change from CheckboxGroup
  const handleCategoriesChange = (updatedCategories: CategoryConfig[]) => {
    // Update store for each category
    updatedCategories.forEach((category) => {
      const selectedIds = category.selectedIds || [];
      const allSelected = selectedIds.length === (category.itens?.length || 0);

      initializeCategory({
        key: category.key,
        label: category.label,
        availableItems: category.itens || [],
        selectedIds,
        allSelected,
      });
    });

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

      <CheckboxGroup
        categories={syncedCategories}
        onCategoriesChange={handleCategoriesChange}
      />

      <div className="mt-4 p-3 bg-background-50 rounded-lg">
        <Text size="sm" weight="medium" className="text-text-700">
          Total: {getSelectionText(totalSelected, totalAvailable)}
        </Text>
      </div>
    </section>
  );
};
