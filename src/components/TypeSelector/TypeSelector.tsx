import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import {
  type ActivityCategory,
  type ActiveTab,
  type TypeConfig,
  getTabPath,
} from './TypeSelector.types';
import { useModules } from '../../hooks/useModules';

/**
 * Props for the TypeSelector component
 */
export interface TypeSelectorProps {
  /** Current activity type selected */
  value: ActivityCategory;
  /** Current active tab (to preserve when switching types) */
  currentTab: ActiveTab;
  /** Configuration for activity types (routes and labels) */
  config: Record<ActivityCategory, TypeConfig>;
  /**
   * Optional filter to include only specific categories.
   * If not provided, automatically calculated based on hasExams flag from useModules.
   * Only use this prop for special cases where you need to override the default behavior.
   */
  allowedCategories?: ActivityCategory[];
}

/**
 * Type selector dropdown for switching between Atividades and Provas
 * Navigates to the corresponding route while preserving the current tab
 */
export const TypeSelector = ({
  value,
  currentTab,
  config,
  allowedCategories: allowedCategoriesProp,
}: TypeSelectorProps) => {
  const navigate = useNavigate();
  const { hasExams } = useModules();

  // Calculate allowed categories based on exams module
  const allowedCategories = useMemo(() => {
    // If prop is explicitly provided, use it
    if (allowedCategoriesProp) {
      return allowedCategoriesProp;
    }

    // Otherwise, calculate based on hasExams flag
    const categories: ActivityCategory[] = ['ATIVIDADE'];
    if (hasExams) {
      categories.push('PROVA');
    }
    return categories;
  }, [hasExams, allowedCategoriesProp]);

  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType === value) return;

      const typeConfig = config[newType as ActivityCategory];
      const tabPath = getTabPath(currentTab);
      navigate(`${typeConfig.routes.base}${tabPath}`);
    },
    [value, currentTab, navigate, config]
  );

  const selectItems = allowedCategories.map((category) => (
    <SelectItem key={category} value={category}>
      {config[category].labels.selectorLabel}
    </SelectItem>
  ));

  return (
    <Select value={value} onValueChange={handleTypeChange} size="small">
      <SelectTrigger className="w-[160px] h-8 bg-background" variant="outlined">
        <SelectValue placeholder="Tipo" />
      </SelectTrigger>
      <SelectContent>{selectItems}</SelectContent>
    </Select>
  );
};

export default TypeSelector;
