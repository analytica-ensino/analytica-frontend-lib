import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccordionGroup,
  Badge,
  CardAccordation,
  CheckBox,
  cn,
  Text,
  Divider,
} from '../../';
import {
  areSelectedIdsEqual,
  isCategoryEnabled as isCategoryEnabledHelper,
  getBadgeText as getBadgeTextHelper,
  handleAccordionValueChange as handleAccordionValueChangeHelper,
  calculateFormattedItemsForAutoSelection,
} from './CheckBoxGroup.helpers';

export type Item = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type CategoryConfig = {
  key: string;
  label: string;
  selectedIds?: string[];
  dependsOn?: string[];
  itens?: Item[];
  filteredBy?: { key: string; internalField: string }[];
};

export const CheckboxGroup = ({
  categories,
  onCategoriesChange,
  compactSingleItem = true,
  showDivider = true,
  showSingleItem = false,
}: {
  categories: CategoryConfig[];
  onCategoriesChange: (categories: CategoryConfig[]) => void;
  compactSingleItem?: boolean;
  showDivider?: boolean;
  showSingleItem?: boolean;
}) => {
  const [openAccordion, setOpenAccordion] = useState<string>('');

  // Refs to prevent infinite loops and track auto-selection state
  const onCategoriesChangeRef = useRef(onCategoriesChange);
  const previousCategoriesRef = useRef<CategoryConfig[]>(categories);
  // Track which categories have had auto-selection applied (by stringified selectedIds)
  const appliedAutoSelectionRef = useRef<string>('');

  // Update ref when onCategoriesChange changes
  useEffect(() => {
    onCategoriesChangeRef.current = onCategoriesChange;
  }, [onCategoriesChange]);

  // Use helper function for comparing selectedIds arrays

  // Auto-seleciona categorias com apenas um item (considerando itens filtrados)
  const categoriesWithAutoSelection = useMemo(() => {
    return categories.map((category) => {
      // Get filtered/visible items for this category
      const filteredItems = calculateFormattedItemsForAutoSelection(
        category,
        categories
      );

      // Se tem apenas um item filtrado/visível e nenhum está selecionado, auto-seleciona
      if (
        filteredItems.length === 1 &&
        (!category.selectedIds || category.selectedIds.length === 0)
      ) {
        return {
          ...category,
          selectedIds: [filteredItems[0].id],
        };
      }
      return category;
    });
  }, [categories]);

  // Aplica a auto-seleção se necessário
  // Note: onCategoriesChange should be memoized by the parent component to prevent re-renders
  useEffect(() => {
    // Check if categories have actually changed by comparing with previous reference
    const categoriesChanged = categories !== previousCategoriesRef.current;
    previousCategoriesRef.current = categories;

    // Check for auto-selection changes using efficient comparison
    const hasAutoSelectionChanges = categoriesWithAutoSelection.some(
      (cat, index) => {
        const originalCat = categories[index];
        return !areSelectedIdsEqual(cat.selectedIds, originalCat.selectedIds);
      }
    );

    if (!hasAutoSelectionChanges) {
      // No auto-selection needed, reset tracking if categories changed
      if (categoriesChanged) {
        appliedAutoSelectionRef.current = '';
      }
      return;
    }

    // Create a signature of the auto-selection to prevent duplicate notifications
    const autoSelectionSignature = JSON.stringify(
      categoriesWithAutoSelection.map((c) => c.selectedIds)
    );

    // Only notify if this exact auto-selection hasn't been applied yet
    if (appliedAutoSelectionRef.current !== autoSelectionSignature) {
      appliedAutoSelectionRef.current = autoSelectionSignature;
      onCategoriesChangeRef.current(categoriesWithAutoSelection);
    }
  }, [categoriesWithAutoSelection, categories]);

  const isCheckBoxIsSelected = (categoryKey: string, itemId: string) => {
    const category = categories.find((c) => c.key === categoryKey);
    if (!category) return false;
    return category.selectedIds?.includes(itemId) || false;
  };

  const isMinimalOneCheckBoxIsSelected = (categoryKey: string) => {
    const category = categories.find((c) => c.key === categoryKey);
    if (!category) return false;

    // Obtém apenas os itens filtrados (visíveis)
    const formattedItems = getFormattedItems(categoryKey);
    const filteredItems = formattedItems.flatMap((group) => group.itens || []);
    const filteredItemIds = filteredItems.map((item) => item.id);

    // Verifica se pelo menos um item filtrado está selecionado
    return filteredItemIds.some((itemId) =>
      category.selectedIds?.includes(itemId)
    );
  };

  // Helper function to create combination of two arrays
  const createCombinations = (
    acc: string[][],
    currentArray: string[]
  ): string[][] => {
    const combinations: string[][] = [];
    for (const existingCombo of acc) {
      for (const item of currentArray) {
        combinations.push([...existingCombo, item]);
      }
    }
    return combinations;
  };

  // Helper function to calculate cartesian product of arrays
  const cartesian = (arr: string[][]): string[][] => {
    return arr.reduce(createCombinations, [[]] as string[][]);
  };

  // Helper function to get selected IDs for filters
  const getSelectedIdsForFilters = (
    filters: { key: string; internalField: string; label?: string }[]
  ) => {
    return filters.map((f) => {
      const parentCat = categories.find((c) => c.key === f.key);
      if (!parentCat?.selectedIds?.length) {
        return [];
      }
      return parentCat.selectedIds;
    });
  };

  // Helper function to generate group label for single filter
  const generateSingleFilterLabel = (
    filter: { key: string; internalField: string },
    comboId: string
  ) => {
    const cat = categories.find((c) => c.key === filter.key);
    return cat?.itens?.find((i) => i.id === comboId)?.name || comboId;
  };

  // Helper function to generate group label for multiple filters
  const generateMultipleFiltersLabel = (
    filters: { key: string; internalField: string }[],
    comboIds: string[]
  ) => {
    const firstCat = categories.find((c) => c.key === filters[0].key);
    const firstVal =
      firstCat?.itens?.find((i) => i.id === comboIds[0])?.name || comboIds[0];

    const labelParts: string[] = [firstVal];

    for (let idx = 1; idx < filters.length; idx++) {
      const f = filters[idx];
      const cat = categories.find((c) => c.key === f.key);
      const val =
        cat?.itens?.find((i) => i.id === comboIds[idx])?.name || comboIds[idx];
      labelParts.push(`(${val})`);
    }
    return labelParts.join(' ');
  };

  // Helper function to process combination and add to grouped map
  const processCombination = (
    comboIds: string[],
    filters: { key: string; internalField: string; label?: string }[],
    category: CategoryConfig,
    groupedMap: Record<string, { groupLabel?: string; itens: Item[] }>
  ) => {
    const filteredItems = (category?.itens || []).filter((item) =>
      filters.every((f, idx) => item[f.internalField] === comboIds[idx])
    );

    if (filteredItems.length === 0) return;

    let groupLabel: string | undefined = undefined;

    if (filters.length === 1) {
      groupLabel = generateSingleFilterLabel(filters[0], comboIds[0]);
    } else if (filters.length > 1) {
      groupLabel = generateMultipleFiltersLabel(filters, comboIds);
    }

    const key = groupLabel || '';
    if (!groupedMap[key]) {
      groupedMap[key] = groupLabel ? { groupLabel, itens: [] } : { itens: [] };
    }
    groupedMap[key].itens.push(...filteredItems);
  };

  // Helper function to calculate formatted items for a category
  const calculateFormattedItems = (categoryKey: string) => {
    const category = categories.find((c) => c.key === categoryKey);

    if (!category?.dependsOn || category.dependsOn.length === 0) {
      return [{ itens: category?.itens || [] }];
    }

    // Check if category is enabled based on dependencies (inline to avoid stale closure)
    const isEnabled = category.dependsOn.every((depKey) => {
      const depCat = categories.find((c) => c.key === depKey);
      return depCat?.selectedIds && depCat.selectedIds.length > 0;
    });

    // If category is disabled, return empty items array to hide all items
    if (!isEnabled) {
      return [{ itens: [] }];
    }

    const filters =
      (category.filteredBy as {
        key: string;
        internalField: string;
        label?: string;
      }[]) || [];

    if (filters.length === 0) {
      return [{ itens: category?.itens || [] }];
    }

    const selectedIdsArr = getSelectedIdsForFilters(filters);

    if (selectedIdsArr.some((arr) => arr.length === 0)) {
      return [{ itens: [] }];
    }

    const combinations = cartesian(selectedIdsArr);
    const groupedMap: Record<string, { groupLabel?: string; itens: Item[] }> =
      {};

    for (const comboIds of combinations) {
      processCombination(comboIds, filters, category, groupedMap);
    }

    const groupedItems = Object.values(groupedMap).filter(
      (g) => g.itens.length
    );

    return groupedItems.length ? groupedItems : [{ itens: [] }];
  };

  const formattedItemsMap = useMemo(() => {
    const formattedItemsMap: Record<
      string,
      { groupLabel?: string; itens: Item[] }[]
    > = {};

    for (const category of categories) {
      const formattedItems = calculateFormattedItems(category.key);
      formattedItemsMap[category.key] = formattedItems;
    }

    return formattedItemsMap;
  }, [categories]);

  const getFormattedItems = (categoryKey: string) => {
    return formattedItemsMap[categoryKey] || [{ itens: [] }];
  };

  // Helper function to get badge text for category
  const getBadgeText = (category: CategoryConfig): string => {
    const formattedItems = getFormattedItems(category.key);
    return getBadgeTextHelper(category, formattedItems);
  };

  // Helper function to check if category is enabled
  const isCategoryEnabled = (category: CategoryConfig): boolean => {
    return isCategoryEnabledHelper(category, categories);
  };

  // Helper function to handle accordion value change
  const handleAccordionValueChange = (value: string | string[] | undefined) => {
    const newValue = handleAccordionValueChangeHelper(
      value,
      categories,
      isCategoryEnabled
    );
    if (newValue !== null) {
      setOpenAccordion(newValue);
    }
  };

  const getDependentCategories = (categoryKey: string): string[] => {
    return categories
      .filter((cat) => cat.dependsOn?.includes(categoryKey))
      .map((cat) => cat.key);
  };

  // Helper function to find items to remove from dependent category
  const findItemsToRemove = (
    depCategory: CategoryConfig,
    relevantFilter: { key: string; internalField: string },
    deselectedItemId: string
  ): string[] => {
    return (
      depCategory.itens
        ?.filter(
          (item) => item[relevantFilter.internalField] === deselectedItemId
        )
        .map((item) => item.id) || []
    );
  };

  // Helper function to process dependent category for deselection
  const processDependentCategory = (
    depCategoryKey: string,
    categoryKey: string,
    deselectedItemId: string,
    itemsToDeselect: Record<string, string[]>
  ) => {
    const depCategory = categories.find((c) => c.key === depCategoryKey);
    if (!depCategory?.filteredBy) return;

    const relevantFilter = depCategory.filteredBy.find(
      (f) => f.key === categoryKey
    );
    if (!relevantFilter) return;

    const itemsToRemove = findItemsToRemove(
      depCategory,
      relevantFilter,
      deselectedItemId
    );
    if (itemsToRemove.length > 0) {
      itemsToDeselect[depCategoryKey] = itemsToRemove;
    }
  };

  const getItemsToDeselect = (
    categoryKey: string,
    deselectedItemId: string
  ) => {
    const deselectedItem = categories
      .find((c) => c.key === categoryKey)
      ?.itens?.find((item) => item.id === deselectedItemId);
    if (!deselectedItem) return {};

    const itemsToDeselect: Record<string, string[]> = {};
    const dependentCategories = getDependentCategories(categoryKey);

    for (const depCategoryKey of dependentCategories) {
      processDependentCategory(
        depCategoryKey,
        categoryKey,
        deselectedItemId,
        itemsToDeselect
      );
    }

    return itemsToDeselect;
  };

  // Helper function to update category with new selected IDs
  const updateCategorySelectedIds = (
    updatedCategories: CategoryConfig[],
    depCategoryIndex: number,
    depCategory: CategoryConfig,
    itemIds: string[]
  ): CategoryConfig[] => {
    const newSelectedIds =
      depCategory.selectedIds?.filter((id) => !itemIds.includes(id)) || [];

    updatedCategories[depCategoryIndex] = {
      ...depCategory,
      selectedIds: newSelectedIds,
    };

    return updatedCategories;
  };

  // Helper function to apply recursive cascade deselection
  const applyRecursiveCascade = (
    depCategoryKey: string,
    itemIds: string[],
    updatedCategories: CategoryConfig[]
  ): CategoryConfig[] => {
    let result = updatedCategories;
    for (const itemId of itemIds) {
      result = applyCascadeDeselection(depCategoryKey, itemId, result);
    }
    return result;
  };

  const applyCascadeDeselection = (
    categoryKey: string,
    deselectedItemId: string,
    currentCategories: CategoryConfig[]
  ): CategoryConfig[] => {
    const itemsToDeselect = getItemsToDeselect(categoryKey, deselectedItemId);
    let updatedCategories = [...currentCategories];

    for (const [depCategoryKey, itemIds] of Object.entries(itemsToDeselect)) {
      const depCategoryIndex = updatedCategories.findIndex(
        (c) => c.key === depCategoryKey
      );

      if (depCategoryIndex !== -1) {
        const depCategory = updatedCategories[depCategoryIndex];
        updatedCategories = updateCategorySelectedIds(
          updatedCategories,
          depCategoryIndex,
          depCategory,
          itemIds
        );
        updatedCategories = applyRecursiveCascade(
          depCategoryKey,
          itemIds,
          updatedCategories
        );
      }
    }

    return updatedCategories;
  };

  const toggleAllInCategory = (categoryKey: string) => {
    const category = categories.find((c) => c.key === categoryKey);
    if (!category) return;

    // Obtém apenas os itens filtrados (visíveis)
    const formattedItems = getFormattedItems(categoryKey);
    const filteredItems = formattedItems.flatMap((group) => group.itens || []);
    const filteredItemIds = filteredItems.map((item) => item.id);

    // Verifica quantos itens filtrados estão selecionados
    const selectedFilteredCount = filteredItemIds.filter((itemId) =>
      category.selectedIds?.includes(itemId)
    ).length;

    // Se NENHUM item filtrado está selecionado OU pelo menos um está selecionado mas não todos,
    // então seleciona todos os itens filtrados
    // Se TODOS os itens filtrados estão selecionados, então deseleciona todos os filtrados
    const allFilteredSelected =
      selectedFilteredCount === filteredItemIds.length;

    const newSelection = allFilteredSelected
      ? category.selectedIds?.filter((id) => !filteredItemIds.includes(id)) ||
        []
      : [
          ...(category.selectedIds || []),
          ...filteredItemIds.filter(
            (id) => !category.selectedIds?.includes(id)
          ),
        ];

    let updatedCategories = categories.map((c) =>
      c.key === categoryKey ? { ...c, selectedIds: newSelection } : c
    );

    // Se está deselecionando, aplica cascata para os itens que foram deselecionados
    if (allFilteredSelected) {
      for (const itemId of filteredItemIds) {
        updatedCategories = applyCascadeDeselection(
          categoryKey,
          itemId,
          updatedCategories
        );
      }
    }

    onCategoriesChange(updatedCategories);
  };

  const toggleItem = (categoryKey: string, itemId: string) => {
    const category = categories.find((c) => c.key === categoryKey);
    if (!category) return;
    const isCurrentlySelected = category.selectedIds?.includes(itemId);
    const newSelection = isCurrentlySelected
      ? category.selectedIds?.filter((id) => id !== itemId)
      : [...(category.selectedIds || []), itemId];

    let updatedCategories = categories.map((c) =>
      c.key === categoryKey ? { ...c, selectedIds: newSelection } : c
    );

    // Se está deselecionando, aplica cascata
    if (isCurrentlySelected) {
      updatedCategories = applyCascadeDeselection(
        categoryKey,
        itemId,
        updatedCategories
      );
    }

    onCategoriesChange(updatedCategories);
  };

  // Helper component to render individual checkbox item
  const renderCheckboxItem = (item: Item, categoryKey: string) => {
    // Generate unique ID by combining category key and item id to avoid conflicts
    const uniqueId = `${categoryKey}-${item.id}`;

    return (
      <div key={item.id} className="flex items-center gap-3 px-2">
        <CheckBox
          id={uniqueId}
          checked={isCheckBoxIsSelected(categoryKey, item.id)}
          onChange={() => toggleItem(categoryKey, item.id)}
        />
        <label
          htmlFor={uniqueId}
          className="text-sm text-text-950 cursor-pointer select-none"
        >
          {item.name}
        </label>
      </div>
    );
  };

  // Helper component to render formatted group
  const renderFormattedGroup = (
    formattedGroup: { groupLabel?: string; itens: Item[] },
    idx: number,
    categoryKey: string
  ) => (
    <div
      key={formattedGroup.groupLabel || `group-${idx}`}
      className="flex flex-col gap-3"
    >
      {'groupLabel' in formattedGroup && formattedGroup.groupLabel && (
        <Text size="sm" className="mt-2" weight="semibold">
          {formattedGroup.groupLabel}
        </Text>
      )}
      {formattedGroup.itens?.map((item: Item) =>
        renderCheckboxItem(item, categoryKey)
      )}
    </div>
  );

  // Helper component to render accordion trigger
  const renderAccordionTrigger = (
    category: CategoryConfig,
    isEnabled: boolean
  ) => (
    <div className="flex items-center justify-between w-full p-2">
      <div className="flex items-center gap-3">
        <CheckBox
          checked={isMinimalOneCheckBoxIsSelected(category.key)}
          disabled={!isEnabled}
          indeterminate={isMinimalOneCheckBoxIsSelected(category.key)}
          onChange={() => toggleAllInCategory(category.key)}
        />
        <Text
          size="sm"
          weight="medium"
          className={cn('text-text-800', !isEnabled && 'opacity-40')}
        >
          {category.label}
        </Text>
      </div>
      {(openAccordion === category.key || isEnabled) && (
        <Badge variant="solid" action="info">
          {getBadgeText(category)}
        </Badge>
      )}
    </div>
  );

  // Helper component to render compact single item view
  const renderCompactSingleItem = (category: CategoryConfig) => {
    const formattedItems = getFormattedItems(category.key);
    const allItems = formattedItems.flatMap((group) => group.itens || []);

    if (allItems.length !== 1) {
      return null;
    }

    const singleItem = allItems[0];

    return (
      <div
        key={category.key}
        className="flex items-center justify-between w-full px-3 py-2"
      >
        <Text size="sm" weight="bold" className="text-text-800">
          {category.label}
        </Text>
        <Text size="sm" className="text-text-950">
          {singleItem.name}
        </Text>
      </div>
    );
  };

  // Helper component to render category accordion
  const renderCategoryAccordion = (category: CategoryConfig) => {
    // Check if category is enabled based on dependencies
    const isEnabled = isCategoryEnabled(category);
    const hasOnlyOneItem = category.itens?.length === 1;

    if (hasOnlyOneItem && !compactSingleItem && !showSingleItem) {
      return null;
    }

    const formattedItems = getFormattedItems(category.key);
    const allItems = formattedItems.flatMap((group) => group.itens || []);
    const hasOnlyOneAvailableItem = allItems.length === 1;

    // If compactSingleItem is enabled and there's only one available item, render compact version
    if (compactSingleItem && hasOnlyOneAvailableItem && isEnabled) {
      return (
        <div key={category.key}>
          {renderCompactSingleItem(category)}
          {showDivider && <Divider />}
        </div>
      );
    }

    const hasNoItems = formattedItems.every(
      (group) => !group.itens || group.itens.length === 0
    );

    return (
      <div key={category.key}>
        <CardAccordation
          value={category.key}
          disabled={!isEnabled}
          className={cn(
            'bg-transparent border-0',
            openAccordion === category.key && 'bg-background-50 border-none'
          )}
          trigger={renderAccordionTrigger(category, isEnabled)}
        >
          <div className="flex flex-col gap-3 pt-2">
            {hasNoItems && isEnabled ? (
              <div className="px-2 py-4">
                <Text size="sm" className="text-text-500 text-center">
                  Sem dados
                </Text>
              </div>
            ) : (
              formattedItems.map((formattedGroup, idx) =>
                renderFormattedGroup(formattedGroup, idx, category.key)
              )
            )}
          </div>
        </CardAccordation>
        {openAccordion !== category.key && showDivider && <Divider />}
      </div>
    );
  };

  // Auto-collapse accordion when category becomes disabled
  useEffect(() => {
    if (!openAccordion) return;

    const category = categories.find((c) => c.key === openAccordion);
    if (!category) return;

    // Check if the open category is now disabled
    const isEnabled = isCategoryEnabled(category);

    // If category is disabled, close it
    if (!isEnabled) {
      // Use setTimeout to ensure this runs after any other state updates
      setTimeout(() => {
        setOpenAccordion('');
      }, 0);
    }
  }, [categories, openAccordion]);

  return (
    <AccordionGroup
      type="single"
      collapsible
      value={openAccordion}
      onValueChange={handleAccordionValueChange}
    >
      {categories.map(renderCategoryAccordion)}
    </AccordionGroup>
  );
};
