import { useState } from 'react';
import { Text } from '../../..';
import {
  CheckboxGroup,
  type CategoryConfig as CheckboxCategoryConfig,
} from '../../CheckBoxGroup/CheckBoxGroup';
import { LabelsConfig } from '../types';

interface RecipientsStepProps {
  // Recebe diretamente as categorias no formato do CheckboxGroup
  categories: CheckboxCategoryConfig[];
  labels?: LabelsConfig;
  // Callback para mudanças nas categorias (opcional)
  onCategoriesChange?: (categories: CheckboxCategoryConfig[]) => void;
}

export const RecipientsStep = ({
  categories,
  labels,
  onCategoriesChange,
}: RecipientsStepProps) => {
  // Estado local para as categorias (se não houver callback externo)
  const [localCategories, setLocalCategories] =
    useState<CheckboxCategoryConfig[]>(categories);

  // Usa o callback externo se fornecido, senão usa o estado local
  const handleCategoriesChange = (
    updatedCategories: CheckboxCategoryConfig[]
  ) => {
    if (onCategoriesChange) {
      onCategoriesChange(updatedCategories);
    } else {
      setLocalCategories(updatedCategories);
    }
  };

  // Usa as categorias externas se callback for fornecido, senão usa as locais
  const currentCategories = onCategoriesChange ? categories : localCategories;

  return (
    <section className="flex flex-col gap-4">
      <Text size="sm" weight="medium">
        {labels?.recipientsDescription || 'Para quem você vai enviar o aviso?'}
      </Text>

      <CheckboxGroup
        categories={currentCategories}
        onCategoriesChange={handleCategoriesChange}
      />
    </section>
  );
};
