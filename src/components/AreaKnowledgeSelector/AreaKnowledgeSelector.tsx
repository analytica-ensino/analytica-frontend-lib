import { useMemo } from 'react';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { GridFour } from 'phosphor-react';
import type { AreaKnowledgeSelectorProps } from './types';
import type { AreaKnowledgePerformance } from '../GeneralOverviewSection/types';
import { ESSAY_AREA_ID } from './types';

interface SelectItemData {
  id: string;
  name: string;
  color?: string;
}

/**
 * AreaKnowledgeSelector - Select dropdown for knowledge areas
 *
 * Allows filtering by area of knowledge (Área de Conhecimento).
 * Shows "Todos" option plus all available areas from the general overview.
 * Optionally includes "Redação" (essay) option at the end.
 *
 * @example
 * ```tsx
 * <AreaKnowledgeSelector
 *   areas={generalOverviewData?.areas || []}
 *   selectedAreaId={selectedAreaKnowledgeId}
 *   onAreaChange={handleAreaKnowledgeChange}
 *   loading={generalOverviewLoading}
 * />
 * ```
 */
export function AreaKnowledgeSelector({
  areas,
  selectedAreaId,
  onAreaChange,
  loading = false,
  label = 'Área de conhecimento',
  includeEssay = true,
}: AreaKnowledgeSelectorProps) {
  // Build select items with "Todos" option and optionally "Redação" at the end
  const selectItems = useMemo((): SelectItemData[] => {
    const allOption: SelectItemData = {
      id: 'all',
      name: 'Todos',
    };

    const areaItems: SelectItemData[] = areas.map(
      (area: AreaKnowledgePerformance) => ({
        id: area.id,
        name: area.name,
        color: area.color,
      })
    );

    const items = [allOption, ...areaItems];

    if (includeEssay) {
      const essayOption: SelectItemData = {
        id: ESSAY_AREA_ID,
        name: 'Redação',
      };
      items.push(essayOption);
    }

    return items;
  }, [areas, includeEssay]);

  // Handle value change
  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onAreaChange(null);
    } else {
      onAreaChange(value);
    }
  };

  const effectiveValue = selectedAreaId || 'all';

  return (
    <div className="space-y-2">
      <Text size="sm" weight="medium" className="text-text-700">
        {label}
      </Text>
      <div className="relative">
        <Select
          defaultValue="all"
          value={effectiveValue}
          onValueChange={handleValueChange}
        >
          <SelectTrigger
            className={cn('w-full', loading && 'opacity-50')}
            disabled={loading}
          >
            <SelectValue placeholder="Selecione uma área" />
          </SelectTrigger>
          <SelectContent>
            {selectItems.map((item: SelectItemData) => {
              let itemIcon = null;

              if (item.id === 'all') {
                itemIcon = (
                  <span className="w-[21px] h-[21px] flex items-center justify-center">
                    <GridFour
                      size={17}
                      weight="bold"
                      className="text-gray-600"
                    />
                  </span>
                );
              } else if (item.color) {
                itemIcon = (
                  <span
                    className="w-[21px] h-[21px] flex items-center justify-center rounded-sm"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </span>
                );
              }

              return (
                <SelectItem key={item.id} value={item.id} disabled={loading}>
                  <div className="flex items-center gap-2">
                    {itemIcon}
                    <span className="whitespace-nowrap">{item.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default AreaKnowledgeSelector;
