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
import type { AreaKnowledgeSelectorProps, AreaKnowledgeItem } from './types';
import { ESSAY_AREA_ID } from './types';

/**
 * Area colors based on area name patterns
 */
const AREA_COLORS: Record<string, string> = {
  linguagens: '#3B82F6', // blue-500
  humanas: '#F59E0B', // amber-500
  natureza: '#22C55E', // green-500
  matemática: '#8B5CF6', // purple-500
  redação: '#F43F5E', // rose-500
};

/**
 * Get color for an area based on its name
 */
function getAreaColor(areaName: string): string {
  const nameLower = areaName.toLowerCase();

  if (nameLower.includes('linguagens') || nameLower.includes('códigos')) {
    return AREA_COLORS.linguagens;
  }
  if (nameLower.includes('humanas') || nameLower.includes('sociais')) {
    return AREA_COLORS.humanas;
  }
  if (nameLower.includes('natureza') || nameLower.includes('ciências da nat')) {
    return AREA_COLORS.natureza;
  }
  if (nameLower.includes('matemática')) {
    return AREA_COLORS.matemática;
  }
  if (nameLower.includes('redação')) {
    return AREA_COLORS.redação;
  }

  return '#6B7280'; // gray-500
}

interface SelectItemData {
  id: string;
  name: string;
  color: string;
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
      color: '#6B7280',
    };

    const areaItems: SelectItemData[] = areas.map((area: AreaKnowledgeItem) => ({
      id: area.id,
      name: area.name,
      color: getAreaColor(area.name),
    }));

    const items = [allOption, ...areaItems];

    if (includeEssay) {
      const essayOption: SelectItemData = {
        id: ESSAY_AREA_ID,
        name: 'Redação',
        color: AREA_COLORS.redação,
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
          disabled={loading}
        >
          <SelectTrigger className={cn('w-full', loading && 'opacity-50')}>
            <SelectValue placeholder="Selecione uma área" />
          </SelectTrigger>
          <SelectContent>
            {selectItems.map((item: SelectItemData) => (
              <SelectItem key={item.id} value={item.id}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-[21px] h-[21px] flex items-center justify-center rounded-sm'
                    )}
                    style={{
                      backgroundColor: `${item.color}20`,
                    }}
                  >
                    {item.id === 'all' ? (
                      <GridFour
                        size={17}
                        weight="bold"
                        className="text-gray-600"
                      />
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </span>
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default AreaKnowledgeSelector;
