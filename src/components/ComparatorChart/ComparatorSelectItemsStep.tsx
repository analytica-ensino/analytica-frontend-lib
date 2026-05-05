import { X } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import SearchSelect from '../SearchSelect/SearchSelect';
import type { SearchSelectOption } from '../SearchSelect/SearchSelect';
import type {
  ComparisonType,
  ComparisonItem,
  ComparatorLabels,
} from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

export interface ComparatorSelectItemsStepProps {
  readonly options: SearchSelectOption[];
  readonly selectedItems: ComparisonItem[];
  readonly onSelectItem: (value: string) => void;
  readonly onRemoveItem: (itemId: string) => void;
  readonly comparisonType: ComparisonType;
  readonly labels?: Partial<ComparatorLabels>;
}

export function ComparatorSelectItemsStep({
  options,
  selectedItems,
  onSelectItem,
  onRemoveItem,
  comparisonType,
  labels: customLabels,
}: ComparatorSelectItemsStepProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };
  const isMaxReached = selectedItems.length >= 5;
  const placeholder =
    comparisonType === 'school' ? labels.schools : labels.schoolYears;
  const itemTypeName =
    comparisonType === 'school'
      ? labels.schools.toLowerCase()
      : labels.schoolYears.toLowerCase();
  const singularItemTypeName =
    comparisonType === 'school' ? labels.school : labels.schoolYear;

  return (
    <div className="flex flex-col gap-4">
      <Text size="sm" className="text-text-600">
        {labels.selectItemInstruction.replace('{item}', singularItemTypeName)}
      </Text>

      <SearchSelect
        options={options}
        placeholder={placeholder}
        searchPlaceholder={`${labels.search} ${placeholder.toLowerCase()}...`}
        onValueChange={onSelectItem}
        disabled={isMaxReached}
        emptyText="Nenhum resultado encontrado"
        size="medium"
        variant="outlined"
      />

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-secondary-50 rounded-xl border border-border-100">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="outlined"
              action="info"
              size="medium"
              className="flex items-center gap-1 pr-1"
            >
              <span
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-[200px]">{item.name}</span>
              <Button
                variant="raw"
                onClick={() => onRemoveItem(item.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-secondary-200 transition-colors"
                aria-label={`Remover ${item.name}`}
              >
                <X size={14} />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {isMaxReached && (
        <Text size="xs" className="text-warning-600">
          {labels.maxLimitWarning}
        </Text>
      )}

      <Text size="xs" className="text-text-500">
        {selectedItems.length} de 5 {itemTypeName} {labels.ofSelected}
      </Text>
    </div>
  );
}
