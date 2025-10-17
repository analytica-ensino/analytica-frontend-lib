import { useEffect, useMemo } from 'react';
import {
  Text,
  CheckBox,
  AccordionGroup,
  CardAccordation,
  Badge,
  Divider,
  cn,
} from '../../..';
import { useAlertFormStore } from '../useAlertForm';
import type { CategoryConfig, LabelsConfig } from '../types';
import type { RecipientItem } from '../useAlertForm';

interface RecipientsStepProps {
  categories: CategoryConfig[];
  labels?: LabelsConfig;
}

export const RecipientsStep = ({ categories, labels }: RecipientsStepProps) => {
  const { recipientCategories, initializeCategory, updateCategorySelection } =
    useAlertFormStore();

  // Initialize categories on mount
  useEffect(() => {
    categories.forEach((category) => {
      const existingCategory = recipientCategories[category.key];
      if (!existingCategory) {
        initializeCategory({
          key: category.key,
          label: category.label,
          availableItems: category.itens || [],
          selectedIds: [],
          allSelected: false,
        });
      }
    });
  }, [categories, recipientCategories, initializeCategory]);

  // Get total selected count across all categories
  const totalSelected = useMemo(() => {
    return Object.values(recipientCategories).reduce(
      (total, category) => total + category.selectedIds.length,
      0
    );
  }, [recipientCategories]);

  // Get total available count across all categories
  const totalAvailable = useMemo(() => {
    return Object.values(recipientCategories).reduce(
      (total, category) => total + category.availableItems.length,
      0
    );
  }, [recipientCategories]);

  // Format selection count text
  const getSelectionText = (count: number, total: number) => {
    if (count === 1) {
      return `${count} de ${total} selecionado`;
    }
    return `${count} de ${total} selecionados`;
  };

  // Handle individual item selection
  const handleItemToggle = (categoryKey: string, itemId: string) => {
    const category = recipientCategories[categoryKey];
    if (!category) return;

    const isSelected = category.selectedIds.includes(itemId);
    const newSelectedIds = isSelected
      ? category.selectedIds.filter((id) => id !== itemId)
      : [...category.selectedIds, itemId];

    const allSelected =
      newSelectedIds.length === category.availableItems.length;

    updateCategorySelection(categoryKey, newSelectedIds, allSelected);
  };

  // Handle select all toggle for category
  const handleCategoryToggle = (categoryKey: string) => {
    const category = recipientCategories[categoryKey];
    if (!category) return;

    const newSelectedIds = category.allSelected
      ? []
      : category.availableItems.map((item) => item.id);
    const allSelected = !category.allSelected;

    updateCategorySelection(categoryKey, newSelectedIds, allSelected);
  };

  // Check if category is enabled based on dependencies
  const isCategoryEnabled = (category: CategoryConfig) => {
    if (!category.dependsOn || category.dependsOn.length === 0) {
      return true;
    }

    return category.dependsOn.every((depKey) => {
      const depCategory = recipientCategories[depKey];
      return depCategory && depCategory.selectedIds.length > 0;
    });
  };

  // Get filtered items for dependent categories
  const getFilteredItems = (category: CategoryConfig): RecipientItem[] => {
    if (!category.dependsOn || category.dependsOn.length === 0) {
      return category.itens || [];
    }

    const isEnabled = isCategoryEnabled(category);
    if (!isEnabled) {
      return [];
    }

    // For dependent categories, filter items based on parent selections
    const dependentItems = category.itens?.filter((item) => {
      if (!item.parentId) return true;
      return category.dependsOn?.some((depKey) => {
        const depCategory = recipientCategories[depKey];
        return depCategory?.selectedIds.includes(item.parentId as string);
      });
    });

    return dependentItems || [];
  };

  // Render individual checkbox item
  const renderItem = (item: RecipientItem, categoryKey: string) => (
    <div key={item.id} className="flex items-center gap-3 px-2">
      <CheckBox
        id={item.id}
        checked={
          recipientCategories[categoryKey]?.selectedIds.includes(item.id) ||
          false
        }
        onChange={() => handleItemToggle(categoryKey, item.id)}
      />
      <label
        htmlFor={item.id}
        className="text-sm text-text-950 cursor-pointer select-none"
      >
        {item.name}
      </label>
    </div>
  );

  // Render category accordion trigger
  const renderCategoryTrigger = (category: CategoryConfig) => {
    const categoryData = recipientCategories[category.key];
    const isEnabled = isCategoryEnabled(category);
    const hasSelection = categoryData?.selectedIds.length > 0;

    return (
      <div className="flex items-center justify-between w-full p-2">
        <div className="flex items-center gap-3">
          <CheckBox
            checked={hasSelection}
            disabled={!isEnabled}
            indeterminate={hasSelection && !categoryData?.allSelected}
            onChange={() => handleCategoryToggle(category.key)}
          />
          <Text
            size="sm"
            weight="medium"
            className={cn('text-text-800', !isEnabled && 'opacity-40')}
          >
            {category.label}
          </Text>
        </div>
        <Badge variant="solid" action="info">
          {getSelectionText(
            categoryData?.selectedIds.length || 0,
            categoryData?.availableItems.length || 0
          )}
        </Badge>
      </div>
    );
  };

  // Render category accordion
  const renderCategory = (category: CategoryConfig) => {
    const isEnabled = isCategoryEnabled(category);
    const filteredItems = getFilteredItems(category);

    return (
      <div key={category.key}>
        <CardAccordation
          value={category.key}
          disabled={!isEnabled}
          className="bg-transparent border-0"
          trigger={renderCategoryTrigger(category)}
        >
          <div className="flex flex-col gap-3 pt-2">
            {filteredItems.map((item) => renderItem(item, category.key))}
          </div>
        </CardAccordation>
        <Divider />
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <Text size="lg" weight="medium" className="text-text-950">
        {labels?.recipientsDescription || 'Para quem você vai enviar o aviso?'}
      </Text>

      <AccordionGroup type="single" value="">
        {categories.map(renderCategory)}
      </AccordionGroup>

      <div className="mt-4 p-3 bg-background-50 rounded-lg">
        <Text size="sm" weight="medium" className="text-text-700">
          Total: {getSelectionText(totalSelected, totalAvailable)}
        </Text>
      </div>
    </section>
  );
};
