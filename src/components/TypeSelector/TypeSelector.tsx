import { useCallback } from 'react';
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
}

/**
 * Type selector dropdown for switching between Atividades and Provas
 * Navigates to the corresponding route while preserving the current tab
 */
export const TypeSelector = ({
  value,
  currentTab,
  config,
}: TypeSelectorProps) => {
  const navigate = useNavigate();

  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType === value) return;

      const typeConfig = config[newType as ActivityCategory];
      const tabPath = getTabPath(currentTab);
      navigate(`${typeConfig.routes.base}${tabPath}`);
    },
    [value, currentTab, navigate, config]
  );

  return (
    <Select value={value} onValueChange={handleTypeChange} size="small">
      <SelectTrigger className="w-[160px] h-8 bg-background" variant="outlined">
        <SelectValue placeholder="Tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ATIVIDADE">
          {config.ATIVIDADE.labels.selectorLabel}
        </SelectItem>
        <SelectItem value="PROVA">
          {config.PROVA.labels.selectorLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TypeSelector;
