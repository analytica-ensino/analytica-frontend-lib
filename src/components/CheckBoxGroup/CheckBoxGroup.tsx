import { useEffect, useMemo, useState } from 'react';
import {
  AccordionGroup,
  Badge,
  CardAccordation,
  CheckBox,
  cn,
  Text,
  Divider,
} from '../../';

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
}: {
  categories: CategoryConfig[];
  onCategoriesChange: (categories: CategoryConfig[]) => void;
}) => {
  const [openAccordion, setOpenAccordion] = useState<string>('');

  // Auto-seleciona categorias com apenas um item
  const categoriesWithAutoSelection = useMemo(() => {
    return categories.map((category) => {
      // Se tem apenas um item e nenhum está selecionado, auto-seleciona
      if (
        category.itens?.length === 1 &&
        (!category.selectedIds || category.selectedIds.length === 0)
      ) {
        return {
          ...category,
          selectedIds: [category.itens[0].id],
        };
      }
      return category;
    });
  }, [categories]);

  // Aplica a auto-seleção se necessário
  useEffect(() => {
    const hasChanges = categoriesWithAutoSelection.some(
      (cat, index) =>
        JSON.stringify(cat.selectedIds) !==
        JSON.stringify(categories[index].selectedIds)
    );

    if (hasChanges) {
      onCategoriesChange(categoriesWithAutoSelection);
    }
  }, [categoriesWithAutoSelection, categories, onCategoriesChange]);

  const isEnabledCategory = (categoryKey: string, dependsOn: string[]) => {
    const category = categories.find((c) => c.key === categoryKey);
    if (!category?.dependsOn || category.dependsOn.length === 0) {
      return true;
    }
    let isEnabled = true;
    for (const d of dependsOn) {
      const categorySelectedMinimalOne = categories.find((c) => c.key === d)
        ?.selectedIds?.length;
      if (!categorySelectedMinimalOne) {
        isEnabled = false;
      }
    }
    return isEnabled;
  };

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

  // Helper function to calculate cartesian product of arrays
  const cartesian = (arr: string[][]): string[][] => {
    return arr.reduce(
      (a, b) =>
        a
          .map((x) => b.map((y) => x.concat([y])))
          .reduce((a, b) => a.concat(b), []),
      [[]] as string[][]
    );
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

    const key = groupLabel ? groupLabel : '';
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

    if (!isEnabledCategory(categoryKey, category.dependsOn || [])) {
      return [{ itens: category?.itens || [] }];
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
      return [{ itens: category?.itens || [] }];
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

    return groupedItems.length
      ? groupedItems
      : [{ itens: category?.itens || [] }];
  };

  const { formattedItemsMap, filteredItemsCountMap } = useMemo(() => {
    const formattedItemsMap: Record<
      string,
      { groupLabel?: string; itens: Item[] }[]
    > = {};
    const filteredItemsCountMap: Record<string, number> = {};

    for (const category of categories) {
      const formattedItems = calculateFormattedItems(category.key);
      formattedItemsMap[category.key] = formattedItems;
      filteredItemsCountMap[category.key] = formattedItems.reduce(
        (total, group) => total + (group.itens?.length || 0),
        0
      );
    }

    return { formattedItemsMap, filteredItemsCountMap };
  }, [categories]);

  const getFormattedItems = (categoryKey: string) => {
    return formattedItemsMap[categoryKey] || [{ itens: [] }];
  };

  const getFilteredItemsCount = (categoryKey: string) => {
    return filteredItemsCountMap[categoryKey] || 0;
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

    // Verifica se todos os itens filtrados estão selecionados
    const allFilteredSelected = filteredItemIds.every((itemId) =>
      category.selectedIds?.includes(itemId)
    );

    // Se todos os itens filtrados estão selecionados, deseleciona todos os filtrados
    // Caso contrário, seleciona todos os itens filtrados
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

  return (
    <AccordionGroup
      type="single"
      value={openAccordion}
      onValueChange={(value) => {
        if (typeof value === 'string') {
          setOpenAccordion(value);
        }
      }}
    >
      {categories.map((category) => {
        const isEnabled = isEnabledCategory(
          category.key,
          category.dependsOn || []
        );
        const hasOnlyOneItem = category.itens?.length === 1;

        // Se tem apenas um item, não mostra o accordion
        if (hasOnlyOneItem) {
          return null;
        }

        return (
          <div key={category.key}>
            <CardAccordation
              value={category.key}
              disabled={!isEnabled}
              className={cn(
                'bg-transparent border-0',
                openAccordion === category.key && 'bg-background-50 border-none'
              )}
              trigger={
                <div className="flex items-center justify-between w-full p-2">
                  <div className="flex items-center gap-3">
                    <CheckBox
                      checked={isMinimalOneCheckBoxIsSelected(category.key)}
                      disabled={!isEnabled}
                      indeterminate={isMinimalOneCheckBoxIsSelected(
                        category.key
                      )}
                      onChange={() => toggleAllInCategory(category.key)}
                    />
                    <Text
                      size="sm"
                      weight="medium"
                      className={cn(
                        'text-text-800',
                        !isEnabled && 'opacity-40'
                      )}
                    >
                      {category.label}
                    </Text>
                  </div>
                  {(openAccordion === category.key || isEnabled) && (
                    <Badge variant="solid" action="info">
                      {category.selectedIds?.length || 0} de{' '}
                      {getFilteredItemsCount(category.key) || 0} selecionado
                    </Badge>
                  )}
                </div>
              }
            >
              <div className="flex flex-col gap-3 pt-2">
                {getFormattedItems(category.key).map((formattedGroup, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    {'groupLabel' in formattedGroup &&
                      formattedGroup.groupLabel && (
                        <Text size="sm" className="mt-2" weight="semibold">
                          {formattedGroup.groupLabel}
                        </Text>
                      )}
                    {formattedGroup.itens?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-2"
                      >
                        <CheckBox
                          id={item.id}
                          checked={isCheckBoxIsSelected(category.key, item.id)}
                          onChange={() => toggleItem(category.key, item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className="text-sm text-text-950 cursor-pointer select-none"
                        >
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardAccordation>
            {openAccordion !== category.key && <Divider />}
          </div>
        );
      })}
    </AccordionGroup>
  );
};
