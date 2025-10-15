import { useState, useEffect } from 'react';
import {
  Text,
  CheckBox,
  AccordionGroup,
  CardAccordation,
  cn,
  Divider,
  Badge,
} from '../../..';
import { useAlertFormStore, RecipientItem } from '../useAlertForm';
import { CategoryConfig, LabelsConfig } from '../types';

interface RecipientsStepProps {
  categories: CategoryConfig[];
  labels?: LabelsConfig;
}

interface FormattedGroup {
  groupLabel?: string;
  checkboxList: RecipientItem[];
}

interface MockDataItem extends RecipientItem {
  parentId?: string;
}

export const RecipientsStep = ({ categories, labels }: RecipientsStepProps) => {
  const [openAccordion, setOpenAccordion] = useState<string>('');

  const recipientCategories = useAlertFormStore(
    (state) => state.recipientCategories
  );
  const initializeCategory = useAlertFormStore(
    (state) => state.initializeCategory
  );
  const updateCategoryItems = useAlertFormStore(
    (state) => state.updateCategoryItems
  );
  const updateCategorySelection = useAlertFormStore(
    (state) => state.updateCategorySelection
  );

  // Inicializa as categorias
  useEffect(() => {
    categories.forEach((cat) => {
      if (!recipientCategories[cat.key]) {
        initializeCategory({
          key: cat.key,
          label: cat.label,
          availableItems: cat.initialItems || [],
          selectedIds: [],
          allSelected: false,
          dependsOn: cat.dependsOn,
          formatGroupLabel: cat.formatGroupLabel,
        });
      }
    });
  }, []);

  // Carrega items quando dependências são selecionadas
  useEffect(() => {
    categories.forEach((cat) => {
      if (cat.loadItems && cat.dependsOn && cat.dependsOn.length > 0) {
        const parentKey = cat.dependsOn[0];
        const parentCategory = recipientCategories[parentKey];

        if (parentCategory && parentCategory.selectedIds.length > 0) {
          cat.loadItems(parentCategory.selectedIds).then((items) => {
            updateCategoryItems(cat.key, items);
          });
        }
      }
    });
  }, [
    categories.map((cat) => recipientCategories[cat.key]?.selectedIds).flat(),
  ]);

  // Obtém os itens filtrados com base nas seleções anteriores
  const getFilteredItems = (categoryKey: string): RecipientItem[] => {
    const category = recipientCategories[categoryKey];
    if (!category) return [];

    const catConfig = categories.find((c) => c.key === categoryKey);
    if (!catConfig?.dependsOn || catConfig.dependsOn.length === 0) {
      return category.availableItems;
    }

    const parentKey = catConfig.dependsOn[0];
    const parentCategory = recipientCategories[parentKey];

    if (!parentCategory || parentCategory.selectedIds.length === 0) {
      return [];
    }

    // Filtra itens que pertencem aos pais selecionados
    const itemsToFilter = category.availableItems as MockDataItem[];
    return itemsToFilter.filter((item) =>
      parentCategory.selectedIds.includes(item.parentId || '')
    );
  };

  // Agrupa itens para renderização
  const getFormattedItems = (categoryKey: string): FormattedGroup[] => {
    const filteredItems = getFilteredItems(categoryKey);
    const category = recipientCategories[categoryKey];
    const catConfig = categories.find((c) => c.key === categoryKey);

    if (!catConfig?.dependsOn || catConfig.dependsOn.length === 0) {
      return [{ checkboxList: filteredItems }];
    }

    const parentKey = catConfig.dependsOn[0];
    const parentCategory = recipientCategories[parentKey];

    // Se há mais de 1 pai selecionado, agrupa por pai
    if (parentCategory && parentCategory.selectedIds.length > 1) {
      const grouped: Record<string, RecipientItem[]> = {};

      (filteredItems as MockDataItem[]).forEach((item) => {
        const parentId = item.parentId || 'default';
        const parent = parentCategory.availableItems.find(
          (p) => p.id === parentId
        );

        // Usa a função customizada se existir
        let groupName: string;
        if (category?.formatGroupLabel && parent) {
          groupName = category.formatGroupLabel({
            parentItem: parent,
            allParentItems: parentCategory.availableItems,
            categoryKey,
          });
        } else {
          groupName = parent?.name || 'Sem grupo';
        }

        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(item);
      });

      return Object.entries(grouped).map(([groupLabel, checkboxList]) => ({
        groupLabel,
        checkboxList,
      }));
    }

    return [{ checkboxList: filteredItems }];
  };

  // Verifica se uma categoria está habilitada
  const isCategoryEnabled = (categoryKey: string): boolean => {
    const catConfig = categories.find((c) => c.key === categoryKey);
    if (!catConfig?.dependsOn || catConfig.dependsOn.length === 0) {
      return true;
    }

    const parentKey = catConfig.dependsOn[0];
    const parentCategory = recipientCategories[parentKey];
    return !!parentCategory && parentCategory.selectedIds.length > 0;
  };

  // Alterna seleção de todos os itens
  const toggleAllInCategory = (categoryKey: string) => {
    const category = recipientCategories[categoryKey];
    const filteredItems = getFilteredItems(categoryKey);

    if (!category) return;

    const allSelected = category.selectedIds.length === filteredItems.length;
    const newSelection = allSelected
      ? []
      : filteredItems.map((item) => item.id);

    updateCategorySelection(categoryKey, newSelection, !allSelected);
  };

  // Alterna seleção de um item individual
  const toggleItem = (categoryKey: string, itemId: string) => {
    const category = recipientCategories[categoryKey];
    if (!category) return;

    const isSelected = category.selectedIds.includes(itemId);
    const newSelection = isSelected
      ? category.selectedIds.filter((id) => id !== itemId)
      : [...category.selectedIds, itemId];

    const filteredItems = getFilteredItems(categoryKey);
    const allSelected = newSelection.length === filteredItems.length;

    updateCategorySelection(categoryKey, newSelection, allSelected);
  };

  // Obtém o estado do checkbox
  const getCheckboxState = (categoryKey: string): boolean => {
    const category = recipientCategories[categoryKey];
    if (!category) return false;
    return category.selectedIds.length > 0;
  };

  // Obtém o texto de seleção
  const getSelectionText = (categoryKey: string): string => {
    const category = recipientCategories[categoryKey];
    const filteredItems = getFilteredItems(categoryKey);
    const count = category?.selectedIds.length || 0;

    return `${count} de ${filteredItems.length} selecionado${count !== 1 ? 's' : ''}`;
  };

  // Ordena as categorias
  const orderedCategories = categories
    .map((cat) => recipientCategories[cat.key])
    .filter(Boolean);

  return (
    <section className="flex flex-col gap-4">
      <Text size="sm" weight="medium">
        {labels?.recipientsDescription || 'Para quem você vai enviar o aviso?'}
      </Text>

      <AccordionGroup
        type="single"
        value={openAccordion}
        onValueChange={(value) => {
          if (typeof value === 'string') {
            setOpenAccordion(value);
          }
        }}
      >
        {orderedCategories.map((category) => {
          const isEnabled = isCategoryEnabled(category.key);
          const checkboxState = getCheckboxState(category.key);
          const selectionText = getSelectionText(category.key);
          const formattedItems = getFormattedItems(category.key);

          return (
            <div key={category.key}>
              <CardAccordation
                value={category.key}
                disabled={!isEnabled}
                className={cn(
                  'bg-transparent border-0',
                  openAccordion === category.key &&
                    'bg-background-50 border-none'
                )}
                trigger={
                  <div className="flex items-center justify-between w-full p-2">
                    <div
                      className="flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CheckBox
                        checked={checkboxState}
                        disabled={!isEnabled}
                        indeterminate={checkboxState}
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
                        {selectionText}
                      </Badge>
                    )}
                  </div>
                }
              >
                <div className="flex flex-col gap-3 pt-2">
                  {formattedItems.map((formattedGroup, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      {formattedGroup.groupLabel && (
                        <Text size="sm" className="mt-2" weight="semibold">
                          {formattedGroup.groupLabel}
                        </Text>
                      )}
                      {formattedGroup.checkboxList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-2"
                        >
                          <CheckBox
                            id={item.id}
                            checked={category.selectedIds.includes(item.id)}
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
    </section>
  );
};
